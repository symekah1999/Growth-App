import { db } from "@/db";
import { recoveryResets, recoveryTrackers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Input, Textarea, Button, ProgressBar, Badge } from "@/components/ui";
import { createTracker, archiveTracker, reactivateTracker, deleteTracker } from "./actions";
import { formatDate, streakDayCount } from "@/lib/utils";
import Link from "next/link";

const MILESTONES = [1, 7, 30, 60, 90, 180, 365, 500, 730, 1000];

export default async function RecoveryPage() {
  const user = await requireUser();

  const trackers = await db
    .select()
    .from(recoveryTrackers)
    .where(eq(recoveryTrackers.userId, user.id))
    .orderBy(desc(recoveryTrackers.active), desc(recoveryTrackers.createdAt));

  const withData = await Promise.all(
    trackers.map(async (t) => {
      const resets = await db
        .select()
        .from(recoveryResets)
        .where(eq(recoveryResets.trackerId, t.id))
        .orderBy(desc(recoveryResets.resetDate));
      const currentDays = streakDayCount(t.startDate);
      const longest = Math.max(currentDays, ...resets.map((r) => r.streakDaysAtReset));
      const nextMilestone = MILESTONES.find((m) => m > currentDays) ?? null;
      return { tracker: t, resets, currentDays, longest, nextMilestone };
    }),
  );

  return (
    <div>
      <PageHeader
        title="Recovery"
        subtitle="Every day counted, out of a 1,000-day horizon. A reset doesn't erase what came before it."
      />

      <Card className="mb-6">
        <form action={createTracker} className="space-y-3">
          <Input name="name" placeholder="What are you tracking? (e.g. Alcohol, Nicotine, Gambling)" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Streak start date</label>
              <Input type="date" name="startDate" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Target days</label>
              <Input type="number" name="targetDays" defaultValue={1000} min={1} />
            </div>
          </div>
          <Textarea name="notes" placeholder="Why this matters to you (optional — shown only to you)" rows={2} />
          <div className="flex justify-end">
            <Button type="submit">Start tracking</Button>
          </div>
        </form>
      </Card>

      {withData.length === 0 ? (
        <EmptyState title="Nothing tracked yet" subtitle="Add one above whenever you're ready." />
      ) : (
        <div className="space-y-4">
          {withData.map(({ tracker: t, currentDays, longest, nextMilestone, resets }) => {
            const pct = Math.min(100, (currentDays / t.targetDays) * 100);
            return (
              <Card key={t.id} className={!t.active ? "opacity-60" : undefined}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/recovery/${t.id}`} className="font-medium text-neutral-100 hover:underline">
                      {t.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-neutral-500">since {formatDate(t.startDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-neutral-50">
                      {currentDays}
                      <span className="text-sm font-normal text-neutral-500"> / {t.targetDays}</span>
                    </p>
                    <p className="text-xs text-neutral-500">days</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={pct} className="flex-1" />
                  <span className="whitespace-nowrap text-xs text-neutral-500">{pct.toFixed(1)}%</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <Badge>longest streak: {longest}d</Badge>
                  {nextMilestone && <Badge>next milestone: day {nextMilestone}</Badge>}
                  {resets.length > 0 && <Badge>{resets.length} reset{resets.length === 1 ? "" : "s"} logged</Badge>}
                  {!t.active && <Badge className="border-amber-800 text-amber-400">archived</Badge>}
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs">
                  <Link href={`/recovery/${t.id}`} className="text-indigo-400 hover:underline">
                    Open →
                  </Link>
                  {t.active ? (
                    <form action={archiveTracker}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" className="text-neutral-500 hover:text-neutral-300">
                        archive
                      </button>
                    </form>
                  ) : (
                    <form action={reactivateTracker}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" className="text-neutral-500 hover:text-neutral-300">
                        reactivate
                      </button>
                    </form>
                  )}
                  <form action={deleteTracker}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="text-red-500 hover:text-red-400">
                      delete
                    </button>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
