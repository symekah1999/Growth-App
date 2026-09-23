import { db } from "@/db";
import { goalMilestones, goals } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader, Card, Input, Button, ProgressBar, Badge } from "@/components/ui";
import { addMilestone, toggleMilestone, deleteMilestone, updateGoalProgress } from "../actions";
import { formatDate } from "@/lib/utils";

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

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
    .orderBy(asc(goalMilestones.sortOrder), asc(goalMilestones.createdAt));

  const addMilestoneWithId = addMilestone.bind(null, id);

  return (
    <div>
      <PageHeader
        title={goal.title}
        subtitle={goal.description ?? undefined}
        action={
          <div className="flex items-center gap-2">
            <Badge>{goal.category}</Badge>
            <Badge>{goal.status}</Badge>
            {goal.targetDate && <Badge>due {formatDate(goal.targetDate)}</Badge>}
          </div>
        }
      />

      <Card className="mb-6">
        <div className="flex items-center gap-3">
          <ProgressBar value={goal.progress} className="flex-1" />
          <span className="w-10 text-right text-sm text-neutral-400">{goal.progress}%</span>
        </div>
        <form action={updateGoalProgress} className="mt-3 flex items-center gap-2">
          <input type="hidden" name="id" value={goal.id} />
          <input
            type="range"
            name="progress"
            min={0}
            max={100}
            defaultValue={goal.progress}
            className="flex-1"
          />
          <Button type="submit" variant="ghost">
            Update %
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-neutral-300">Milestones</h2>
        <form action={addMilestoneWithId} className="mb-4 flex gap-2">
          <Input name="title" placeholder="Add a milestone / sub-task" required />
          <Button type="submit">Add</Button>
        </form>

        {milestones.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Break this goal into milestones — completing them auto-updates progress above.
          </p>
        ) : (
          <ul className="space-y-2">
            {milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-lg border border-neutral-800 px-3 py-2">
                <form action={toggleMilestone}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="goalId" value={id} />
                  <input type="hidden" name="done" value={String(m.done)} />
                  <button type="submit" aria-label="toggle">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        m.done ? "border-indigo-500 bg-indigo-500 text-white" : "border-neutral-600"
                      }`}
                    >
                      {m.done && "✓"}
                    </span>
                  </button>
                </form>
                <span className={`flex-1 text-sm ${m.done ? "text-neutral-500 line-through" : "text-neutral-200"}`}>
                  {m.title}
                </span>
                <form action={deleteMilestone}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="goalId" value={id} />
                  <button type="submit" className="text-xs text-red-500 hover:text-red-400">
                    remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
