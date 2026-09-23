import { db } from "@/db";
import { todos } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { asc, eq } from "drizzle-orm";
import { PageHeader, Card, EmptyState, Input, Button, Select } from "@/components/ui";
import { createTodo, toggleTodo, deleteTodo } from "./actions";
import { formatDate, todayISO } from "@/lib/utils";
import type { TodoScope } from "@/db/schema";

const SCOPES: { key: TodoScope; label: string; placeholder: string }[] = [
  { key: "daily", label: "Daily", placeholder: "Today" },
  { key: "monthly", label: "Monthly", placeholder: "This month" },
  { key: "yearly", label: "Yearly", placeholder: "This year" },
];

export default async function TodosPage() {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, user.id))
    .orderBy(asc(todos.done), asc(todos.dueDate));

  return (
    <div>
      <PageHeader title="To-Dos" subtitle="Daily, monthly, and yearly — one place to see it all." />

      <Card className="mb-6">
        <form action={createTodo} className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <Input name="title" placeholder="What needs doing?" required />
          <Select name="scope" defaultValue="daily">
            {SCOPES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </Select>
          <Input type="date" name="dueDate" defaultValue={todayISO()} />
          <Button type="submit">Add</Button>
        </form>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {SCOPES.map(({ key, label }) => {
          const items = rows.filter((t) => t.scope === key);
          return (
            <div key={key}>
              <h2 className="mb-3 text-sm font-medium text-neutral-300">{label}</h2>
              {items.length === 0 ? (
                <EmptyState title={`No ${label.toLowerCase()} to-dos`} />
              ) : (
                <ul className="space-y-2">
                  {items.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2"
                    >
                      <form action={toggleTodo}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="done" value={String(t.done)} />
                        <button type="submit" aria-label="toggle">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              t.done ? "border-indigo-500 bg-indigo-500 text-white" : "border-neutral-600"
                            }`}
                          >
                            {t.done && "✓"}
                          </span>
                        </button>
                      </form>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm ${t.done ? "text-neutral-500 line-through" : "text-neutral-200"}`}>
                          {t.title}
                        </p>
                        {t.dueDate && <p className="text-xs text-neutral-500">{formatDate(t.dueDate)}</p>}
                      </div>
                      <form action={deleteTodo}>
                        <input type="hidden" name="id" value={t.id} />
                        <button type="submit" className="text-xs text-red-500 hover:text-red-400">
                          ×
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
