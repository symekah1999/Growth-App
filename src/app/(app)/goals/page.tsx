import { db } from "@/db";
import { goals } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, desc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Input, Textarea, Button, Badge } from "@/components/ui";
import { createGoal, updateGoalStatus, deleteGoal } from "./actions";
import { formatDate, todayISO, toISODate } from "@/lib/utils";
import { daysLeftLabel, goalPacing, PACING_COLOR, pacingSortKey } from "@/lib/pacing";
import { PacingBadge, PacedProgressBar } from "@/components/PacingBadge";
import { GoalsTimeline } from "@/components/charts/GoalsTimeline";
import Link from "next/link";

const CATEGORIES = ["general", "career", "health", "finance", "spiritual", "relationships", "learning"];

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const { status } = await searchParams;
  const today = todayISO();

  const conditions = [eq(goals.userId, user.id)];
  if (status) conditions.push(eq(goals.status, status));

  const rows = await db
    .select()
    .from(goals)
    .where(and(...conditions))
    .orderBy(desc(goals.createdAt));

  const withPacing = rows
    .map((g) => ({ goal: g, pacing: goalPacing(g, today) }))
    .sort((a, b) => pacingSortKey(a.pacing) - pacingSortKey(b.pacing));

  const counts = {
    onTrack: withPacing.filter((x) => x.pacing.status === "on-track").length,
    behind: withPacing.filter((x) => x.pacing.status === "behind").length,
    atRisk: withPacing.filter((x) => x.pacing.status === "at-risk").length,
    overdue: withPacing.filter((x) => x.pacing.status === "overdue").length,
    noDeadline: withPacing.filter((x) => x.pacing.status === "no-deadline").length,
  };

  const timelineGoals = withPacing
    .filter((x) => x.goal.targetDate && x.goal.status === "active")
    .map((x) => ({
      id: x.goal.id,
      title: x.goal.title,
      start: toISODate(x.goal.createdAt),
      end: x.goal.targetDate!,
      progress: x.goal.progress,
      expected: x.pacing.expected,
      statusLabel: x.pacing.label,
      statusColor: PACING_COLOR[x.pacing.status],
    }));

  return (
    <div>
      <PageHeader title="Goals" subtitle="What you're building toward, with deadlines that keep you honest." />

      <Card className="mb-6">
        <form action={createGoal} className="space-y-3">
          <Input name="title" placeholder="Goal title" required />
          <Textarea name="description" placeholder="Why this matters / what done looks like" rows={2} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Life area</label>
              <select
                name="category"
                defaultValue="general"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Deadline</label>
              <Input type="date" name="targetDate" min={today} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add goal</Button>
          </div>
        </form>
      </Card>

      {withPacing.length > 0 && !status && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "On track", n: counts.onTrack, color: PACING_COLOR["on-track"] },
            { label: "Slightly behind", n: counts.behind, color: PACING_COLOR.behind },
            { label: "At risk", n: counts.atRisk, color: PACING_COLOR["at-risk"] },
            { label: "Overdue", n: counts.overdue, color: PACING_COLOR.overdue },
            { label: "No deadline", n: counts.noDeadline, color: PACING_COLOR["no-deadline"] },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3">
              <p className="text-2xl font-semibold text-neutral-50">{s.n}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {timelineGoals.length > 0 && !status && (
        <Card className="mb-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-neutral-300">Timeline</h2>
            <span className="text-xs text-neutral-500">start → deadline, filled to progress</span>
          </div>
          <GoalsTimeline goals={timelineGoals} today={today} />
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {["", "active", "paused", "completed", "abandoned"].map((s) => (
          <Link
            key={s || "all"}
            href={s ? `/goals?status=${s}` : "/goals"}
            className={`rounded-full border px-3 py-1 text-xs ${
              (status ?? "") === s
                ? "border-indigo-600 bg-indigo-600/15 text-indigo-300"
                : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
            }`}
          >
            {s || "all"}
          </Link>
        ))}
      </div>

      {withPacing.length === 0 ? (
        <EmptyState title="No goals yet" subtitle="Add your first goal above — give it a deadline to track your pace." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {withPacing.map(({ goal: g, pacing }) => {
            const left = daysLeftLabel(pacing.daysLeft);
            return (
              <Card key={g.id}>
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/goals/${g.id}`} className="font-medium text-neutral-100 hover:underline">
                    {g.title}
                  </Link>
                  <PacingBadge pacing={pacing} className="shrink-0" />
                </div>
                {g.description && <p className="mt-1.5 line-clamp-2 text-sm text-neutral-400">{g.description}</p>}

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1">
                    <PacedProgressBar progress={g.progress} expected={pacing.expected} />
                  </div>
                  <span className="w-9 text-right text-xs text-neutral-400">{g.progress}%</span>
                </div>
                {pacing.expected !== null && pacing.status !== "overdue" && (
                  <p className="mt-1 text-[11px] text-neutral-500">
                    tick = where you&apos;d be today on a steady pace ({pacing.expected}%)
                  </p>
                )}

                <p className="mt-2 text-xs text-neutral-400">{pacing.message}</p>

                <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-neutral-800">{g.category}</Badge>
                    {g.targetDate && (
                      <span className={pacing.status === "overdue" ? "text-[#f07070]" : pacing.daysLeft !== null && pacing.daysLeft <= 14 ? "text-[#fab219]" : ""}>
                        {left ? `${left} · ` : ""}due {formatDate(g.targetDate)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <form action={updateGoalStatus}>
                      <input type="hidden" name="id" value={g.id} />
                      <input type="hidden" name="status" value={g.status === "completed" ? "active" : "completed"} />
                      <button className="hover:text-neutral-200" type="submit">
                        {g.status === "completed" ? "reopen" : "mark done"}
                      </button>
                    </form>
                    <form action={deleteGoal}>
                      <input type="hidden" name="id" value={g.id} />
                      <button className="text-red-500 hover:text-red-400" type="submit">
                        delete
                      </button>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
