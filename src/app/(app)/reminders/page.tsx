import { db } from "@/db";
import { pushSubscriptions, reminderSettings } from "@/db/schema-push";
import { requireUser } from "@/lib/auth";
import { pushConfigured } from "@/lib/push";
import { eq } from "drizzle-orm";
import { Button, Card, PageHeader } from "@/components/ui";
import { PushControls } from "@/components/PushControls";
import { photoUrl } from "@/lib/images";
import { saveReminderSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const user = await requireUser();
  let missing = false;
  let devices = 0;
  let morningOn = true;
  let eveningOn = true;
  try {
    const subs = await db.select({ id: pushSubscriptions.id }).from(pushSubscriptions).where(eq(pushSubscriptions.userId, user.id));
    devices = subs.length;
    const [prefs] = await db.select().from(reminderSettings).where(eq(reminderSettings.userId, user.id));
    if (prefs) {
      morningOn = prefs.morningOn;
      eveningOn = prefs.eveningOn;
    }
  } catch {
    missing = true;
  }
  const configured = pushConfigured();

  return (
    <div>
      <PageHeader image={photoUrl("habits")} title="Reminders" subtitle="A gentle nudge each morning and evening, even when the app is closed." />

      {missing && (
        <Card className="mb-4 border-amber-700/50">
          <p className="text-sm font-semibold text-amber-200">One-time setup needed</p>
          <p className="mt-1 text-sm text-neutral-300">
            The reminders tables don&apos;t exist yet. Run <code className="rounded bg-neutral-800 px-1">drizzle/manual/push.sql</code> in the Neon SQL editor, then refresh.
          </p>
        </Card>
      )}
      {!configured && (
        <Card className="mb-4 border-amber-700/50">
          <p className="text-sm font-semibold text-amber-200">Push keys not set</p>
          <p className="mt-1 text-sm text-neutral-300">
            Add <code className="rounded bg-neutral-800 px-1">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code>, <code className="rounded bg-neutral-800 px-1">VAPID_PRIVATE_KEY</code>, <code className="rounded bg-neutral-800 px-1">VAPID_SUBJECT</code> and <code className="rounded bg-neutral-800 px-1">CRON_SECRET</code> in Vercel, then redeploy.
          </p>
        </Card>
      )}

      <Card className="mb-4">
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">This device</h2>
        {configured ? (
          <PushControls publicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!} />
        ) : (
          <p className="text-sm text-neutral-500">Available once the keys are set.</p>
        )}
        <p className="mt-3 text-xs text-neutral-500">{devices} device{devices === 1 ? "" : "s"} subscribed. Turn reminders on separately on your phone and your laptop.</p>
      </Card>

      <Card>
        <h2 className="mb-1 text-sm font-semibold text-neutral-100">Which reminders</h2>
        <p className="mb-3 text-xs text-neutral-500">Morning arrives around 08:00 and evening around 20:00 Nairobi time. Times are set by the schedule in vercel.json.</p>
        <form action={saveReminderSettings} className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-neutral-200">
            <input type="checkbox" name="morningOn" defaultChecked={morningOn} className="h-4 w-4 accent-indigo-500" />
            Morning: set your intention, see today&apos;s habits and to-dos
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-200">
            <input type="checkbox" name="eveningOn" defaultChecked={eveningOn} className="h-4 w-4 accent-indigo-500" />
            Evening: what&apos;s left, and a nudge to log gratitude
          </label>
          <Button type="submit" variant="ghost">Save</Button>
        </form>
      </Card>
    </div>
  );
}
