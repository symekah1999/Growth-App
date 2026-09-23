import { db } from "@/db";
import { goalMilestones, goals } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader, Card, Input, Button, Badge } from "@/components/ui";
import {
  addMilestone,
  toggleMilestone,
  deleteMilestone,
  updateGoalProgress,
  updateGoalDeadline,
  updateMilestoneDueDate,
} from "../actions";
import { daysBetween, formatDate, todayISO, toISODate } from "@/lib/utils";
import { daysLeftLabel, goalPacing } from "@/lib/pacing";
import { PacingBadge, PacedProgressBar } from "@/components/PacingBadge";

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const today = todayISO();

  const [goal] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)))
    .limit(1);

  if (!goal) notFound();

  const milestones = await db
    .select()
    .from(goalMilestones)
    .where(eq(goalMilestones.goalId, id))
    .orderBy(asc(goalMilestones.sortOrder), asc(goalMilestones.dueDate), asc(goalMilestones.createdAt));

  const pacing = goalPacing(goal, today);
  const addMilestoneWithId = addMilestone.bind(null, id);
  const nextMilestone = milestones
    .filter((m) => !m.done && m.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))[0];
  const overdueMilestones = milestones.filter((m) => !m.done && m.dueDate && m.dueDate < today).length;

  return (
    <div>
      <PageHeader
        title={goal.title}
        subtitle={goal.description ?? undefined}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{goal.category}</Badge>
            <Badge>{goal.status}</Badge>
            <PacingBadge pacing={pacing} />
          </div>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <PacedProgressBar progress={goal.progress} expected={pacing.expected} />
            </div>
            <span className="w-10 text-right text-sm text-neutral-400">{goal.progress}%</span>
          </div>
          <p className="mt-3 text-sm text-neutral-300">{pacing.message}</p>
          <form action={updateGoalProgress} className="mt-4 flex items-center gap-2">
            <input type="hidden" name="id" value={goal.id} />
            <input type="range" name="progress" min={0} max={100} defaultValue={goal.progress} className="flex-1 accent-indigo-500" />
            <Button type="submit" variant="ghost">
              Update %
            </Button>
          </form>
          {milestones.length > 0 && (
            <p className="mt-2 text-xs text-neutral-500">Ticking milestones below updates progress automatically.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-neutral-300">Deadline</h2>
          {goal.targetDate ? (
            <>
              <p className="mt-2 text-2xl font-semibold text-neutral-50">{daysLeftLabel(pacing.daysLeft) ?? "—"}</p>
              <p className="text-xs text-neutral-500">
                due {formatDate(goal.targetDate)} · started {formatDate(toISODate(goal.createdAt))}
              </p>
              {pacing.requiredPerWeek !== null && pacing.status !== "done" && (
                <p className="mt-2 text-xs text-neutral-400">
                  Needed pace: <span className="font-medium text-neutral-200">{pacing.requiredPerWeek}% / week</span>
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">No deadline yet — add one to track your pace.</p>
          )}
          <form action={updateGoalDeadline} className="mt-3 flex gap-2">
            <input type="hidden" name="id" value={goal.id} />
            <Input type="date" name="targetDate" defaultValue={goal.targetDate ?? ""} />
            <Button type="submit" variant="ghost">
              Save
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-neutral-300">Milestones</h2>
          <div className="flex gap-2 text-xs">
            {nextMilestone && (
              <span className="text-neutral-400">
                next checkpoint: <span className="text-neutral-200">{nextMilestone.title}</span> · {formatDate(nextMilestone.dueDate!)}
              </span>
            )}
            {overdueMilestones > 0 && <Badge className="border-[#d03b3b]/60 text-[#f07070]">{overdueMilestones} overdue</Badge>}
          </div>
        </div>
        <form action={addMilestoneWithId} className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Input name="title" placeholder="Add a milestone / checkpoint" required />
          <Input
            type="date"
            name="dueDate"
            className="sm:w-40"
            max={goal.targetDate ?? undefined}
            title="Checkpoint due date (optional)"
          />
          <Button type="submit">Add</Button>
        </form>

        {milestones.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Break this goal into dated checkpoints — completing them auto-updates progress above.
          </p>
        ) : (
          <ul className="space-y-2">
            {milestones.map((m) => {
              const dLeft = m.dueDate ? daysBetween(today, m.dueDate) : null;
              const overdue = !m.done && dLeft !== null && dLeft < 0;
              const soon = !m.done && dLeft !== null && dLeft >= 0 && dLeft <= 7;
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-800 px-3 py-2">
                  <form action={toggleMilestone}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="goalId" value={id} />
                    <input type="hidden" name="done" value={String(m.done)} />
                    <button type="submit" aria-label={m.done ? "Mark not done" : "Mark done"}>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                          m.done ? "border-indigo-500 bg-indigo-500 text-white" : "border-neutral-600"
                        }`}
                      >
                        {m.done && "✓"}
                      </span>
                    </button>
                  </form>
                  <span className={`min-w-0 flex-1 text-sm ${m.done ? "text-neutral-500 line-through" : "text-neutral-200"}`}>
                    {m.title}
                  </span>
                  {m.dueDate && (
                    <span
                      className={`text-xs ${
                        overdue ? "text-[#f07070]" : soon ? "text-[#fab219]" : "text-neutral-500"
                      }`}
                    >
                      {overdue ? `${Math.abs(dLeft!)}d overdue` : m.done ? formatDate(m.dueDate) : dLeft === 0 ? "due today" : `in ${dLeft}d`}
                    </span>
                  )}
                  <form action={updateMilestoneDueDate} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="goalId" value={id} />
                    <input
                      type="date"
                      name="dueDate"
                      defaultValue={m.dueDate ?? ""}
                      aria-label="Checkpoint due date"
                      className="rounded border border-neutral-800 bg-transparent px-1.5 py-0.5 text-xs text-neutral-400"
                    />
                    <button type="submit" className="text-xs text-neutral-500 hover:text-neutral-200">
                      set
                    </button>
                  </form>
                  <form action={deleteMilestone}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="goalId" value={id} />
                    <button type="submit" className="text-xs text-red-500 hover:text-red-400">
                      remove
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
