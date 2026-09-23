import { db } from "@/db";
import { recoveryCheckins, recoveryResets, recoveryTrackers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader, Card, Textarea, Button, ProgressBar, Badge, Select } from "@/components/ui";
import { addCheckin, logReset, updateTrackerNotes } from "../actions";
import { formatDate, streakDayCount, todayISO } from "@/lib/utils";

const MILESTONES = [1, 7, 30, 60, 90, 180, 365, 500, 730, 1000];
const CRAVING_LABELS = ["", "none", "mild", "moderate", "strong", "intense"];

export default async function RecoveryTrackerPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const [tracker] = await db
    .select()
    .from(recoveryTrackers)
    .where(and(eq(recoveryTrackers.id, id), eq(recoveryTrackers.userId, user.id)))
    .limit(1);

  if (!tracker) notFound();

  const [resets, checkins] = await Promise.all([
    db.select().from(recoveryResets).where(eq(recoveryResets.trackerId, id)).orderBy(desc(recoveryResets.resetDate)),
    db.select().from(recoveryCheckins).where(eq(recoveryCheckins.trackerId, id)).orderBy(desc(recoveryCheckins.checkinDate)).limit(30),
  ]);

  const currentDays = streakDayCount(tracker.startDate);
  const longest = Math.max(currentDays, ...resets.map((r) => r.streakDaysAtReset));
  const pct = Math.min(100, (currentDays / tracker.targetDays) * 100);
  const addCheckinWithId = addCheckin.bind(null, id);
  const todayCheckin = checkins.find((c) => c.checkinDate === todayISO());

  return (
    <div>
      <PageHeader title={tracker.name} subtitle={`Day one: ${formatDate(tracker.startDate)}`} />

      <Card className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-semibold text-neutral-50">
              {currentDays}
              <span className="text-lg font-normal text-neutral-500"> / {tracker.targetDays} days</span>
            </p>
            <p className="mt-1 text-sm text-neutral-500">longest streak: {longest} days</p>
          </div>
          <Badge>{pct.toFixed(1)}% to goal</Badge>
        </div>
        <ProgressBar value={pct} className="mt-4" />

        <div className="mt-5 flex flex-wrap gap-2">
          {MILESTONES.map((m) => (
            <Badge
              key={m}
              className={
                currentDays >= m
                  ? "border-indigo-700 bg-indigo-600/15 text-indigo-300"
                  : "border-neutral-800 text-neutral-600"
              }
            >
              {currentDays >= m ? "✓" : "—"} day {m}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-medium text-neutral-300">Today&apos;s check-in</h2>
          <form action={addCheckinWithId} className="space-y-3">
            <input type="hidden" name="checkinDate" value={todayISO()} />
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Craving level</label>
              <Select name="cravingLevel" defaultValue={todayCheckin?.cravingLevel ?? ""}>
                <option value="">Not tracked today</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} — {CRAVING_LABELS[n]}
                  </option>
                ))}
              </Select>
            </div>
            <Textarea name="note" defaultValue={todayCheckin?.note ?? ""} placeholder="How's today going? (optional)" rows={3} />
            <div className="flex justify-end">
              <Button type="submit">{todayCheckin ? "Update today" : "Log today"}</Button>
            </div>
          </form>

          <div className="mt-5 border-t border-neutral-800 pt-4">
            <p className="mb-2 text-xs font-medium text-neutral-500">Recent check-ins</p>
            {checkins.length === 0 ? (
              <p className="text-sm text-neutral-500">None logged yet — check-ins are optional, the day count above doesn&apos;t need them.</p>
            ) : (
              <ul className="space-y-2">
                {checkins.slice(0, 10).map((c) => (
                  <li key={c.id} className="rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">{formatDate(c.checkinDate)}</span>
                      {c.cravingLevel && <Badge>{CRAVING_LABELS[c.cravingLevel]} craving</Badge>}
                    </div>
                    {c.note && <p className="mt-1 text-neutral-500">{c.note}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-sm font-medium text-neutral-300">Notes</h2>
            <form action={updateTrackerNotes} className="space-y-3">
              <input type="hidden" name="id" value={tracker.id} />
              <Textarea name="notes" defaultValue={tracker.notes ?? ""} rows={4} placeholder="Why this matters, your plan, your reasons" />
              <div className="flex justify-end">
                <Button type="submit" variant="ghost">
                  Save
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-medium text-neutral-300">If today was a reset</h2>
            <p className="mb-3 text-xs text-neutral-500">
              This logs today as day one again and files the {currentDays}-day streak you just had into your history below — it still counts toward your longest streak.
            </p>
            <form action={logReset} className="space-y-3">
              <input type="hidden" name="trackerId" value={tracker.id} />
              <Textarea name="note" placeholder="What happened / what you'll do differently (optional)" rows={2} />
              <div className="flex justify-end">
                <Button type="submit" variant="danger">
                  Log reset &amp; restart at day 1
                </Button>
              </div>
            </form>

            {resets.length > 0 && (
              <div className="mt-4 border-t border-neutral-800 pt-4">
                <p className="mb-2 text-xs font-medium text-neutral-500">History</p>
                <ul className="space-y-2">
                  {resets.map((r) => (
                    <li key={r.id} className="rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-300">{formatDate(r.resetDate)}</span>
                        <Badge>{r.streakDaysAtReset}-day streak</Badge>
                      </div>
                      {r.note && <p className="mt-1 text-neutral-500">{r.note}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
