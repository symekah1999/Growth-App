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
  let deepOn = true;
  try {
    const subs = await db.select({ id: pushSubscriptions.id }).from(pushSubscriptions).where(eq(pushSubscriptions.userId, user.id));
    devices = subs.length;
    const [prefs] = await db.select().from(reminderSettings).where(eq(reminderSettings.userId, user.id));
    if (prefs) {
      morningOn = prefs.morningOn;
      eveningOn = prefs.eveningOn;
      deepOn = prefs.deepOn;
    }
  } catch {
    missing = true;
  }
  const configured = pushConfigured();

  return (
    <div>
      <PageHeader image={photoUrl("habits")} title="Reminders" subtitle="Smart nudges built around your rituals, even when the app is closed." />

      {missing && (
        <Card className="mb-4 border-amber-700/50">
          <p className="text-sm font-semibold text-amber-200">One-time setup needed</p>
          <p className="mt-1 text-sm text-neutral-300">
            The reminders tables aren&apos;t set up yet. Run <code className="rounded bg-neutral-800 px-1">drizzle/manual/push.sql</code> and then <code className="rounded bg-neutral-800 px-1">drizzle/manual/life-2.sql</code> in the Neon SQL editor, then refresh.
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
        <p className="mb-3 text-xs text-neutral-500">Times are Nairobi time and can drift by up to an hour (Vercel&apos;s free cron timing). Each message is written from your own data that day.</p>
        <form action={saveReminderSettings} className="space-y-2">
          <label className="flex min-h-11 items-start gap-3 rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-200">
            <input type="checkbox" name="morningOn" defaultChecked={morningOn} className="mt-0.5 h-5 w-5 shrink-0 accent-indigo-500" />
            <span>About 08:00 · Morning ritual<span className="block text-xs text-neutral-500">Today&apos;s word, your to-don&apos;ts and habits, and a link straight into the ritual. Skipped once you&apos;ve done it.</span></span>
          </label>
          <label className="flex min-h-11 items-start gap-3 rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-200">
            <input type="checkbox" name="deepOn" defaultChecked={deepOn} className="mt-0.5 h-5 w-5 shrink-0 accent-indigo-500" />
            <span>About 09:30 · Deep-work block<span className="block text-xs text-neutral-500">Phone away; names the decisive task you set in the morning ritual.</span></span>
          </label>
          <label className="flex min-h-11 items-start gap-3 rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-200">
            <input type="checkbox" name="eveningOn" defaultChecked={eveningOn} className="mt-0.5 h-5 w-5 shrink-0 accent-indigo-500" />
            <span>About 20:00 · Evening ritual<span className="block text-xs text-neutral-500">What&apos;s still open today. If yesterday wasn&apos;t logged, it becomes a &ldquo;never miss twice&rdquo; alert. Skipped once the evening ritual is done.</span></span>
          </label>
          <Button type="submit" variant="ghost">Save</Button>
        </form>
      </Card>
    </div>
  );
}
