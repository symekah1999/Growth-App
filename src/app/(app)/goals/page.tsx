import { db } from "@/db";
import { goals } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, desc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Input, Textarea, Button, Badge, ProgressBar } from "@/components/ui";
import { createGoal, updateGoalStatus, deleteGoal } from "./actions";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const CATEGORIES = ["general", "career", "health", "finance", "spiritual", "relationships", "learning"];
const STATUS_COLORS: Record<string, string> = {
  active: "text-indigo-300 border-indigo-800",
  paused: "text-amber-300 border-amber-800",
  completed: "text-emerald-300 border-emerald-800",
  abandoned: "text-neutral-500 border-neutral-800",
};

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const { status } = await searchParams;

  const conditions = [eq(goals.userId, user.id)];
  if (status) conditions.push(eq(goals.status, status));

  const rows = await db
    .select()
    .from(goals)
    .where(and(...conditions))
    .orderBy(desc(goals.createdAt));

  return (
    <div>
      <PageHeader title="Goals" subtitle="What you're actually building toward, and how far along you are." />

      <Card className="mb-6">
        <form action={createGoal} className="space-y-3">
          <Input name="title" placeholder="Goal title" required />
          <Textarea name="description" placeholder="Why this matters / what done looks like" rows={2} />
          <div className="grid gap-3 sm:grid-cols-2">
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
            <Input type="date" name="targetDate" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add goal</Button>
          </div>
        </form>
      </Card>

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

      {rows.length === 0 ? (
        <EmptyState title="No goals yet" subtitle="Add your first goal above." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((g) => (
            <Card key={g.id}>
              <div className="flex items-start justify-between gap-2">
                <Link href={`/goals/${g.id}`} className="font-medium text-neutral-100 hover:underline">
                  {g.title}
                </Link>
                <Badge className={STATUS_COLORS[g.status]}>{g.status}</Badge>
              </div>
              {g.description && <p className="mt-1.5 text-sm text-neutral-400">{g.description}</p>}
              <div className="mt-3 flex items-center gap-2">
                <ProgressBar value={g.progress} className="flex-1" />
                <span className="text-xs text-neutral-500">{g.progress}%</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                <div className="flex gap-2">
                  <Badge className="border-neutral-800">{g.category}</Badge>
                  {g.targetDate && <span>due {formatDate(g.targetDate)}</span>}
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
          ))}
        </div>
      )}
    </div>
  );
}
