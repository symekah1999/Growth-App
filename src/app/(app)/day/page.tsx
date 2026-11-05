import { db } from "@/db";
import { habitLogs, habits, journalEntries, todos } from "@/db/schema";
import { lifeLessons } from "@/db/schema-lessons";
import { gratitudeEntries } from "@/db/schema-gratitude";
import { requireUser } from "@/lib/auth";
import { addDaysISO, todayISO } from "@/lib/utils";
import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { photoUrl } from "@/lib/images";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Heart, Lightbulb, NotebookPen, Flame } from "lucide-react";

const long = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function DayPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const user = await requireUser();
  const { d } = await searchParams;
  const today = todayISO();
  const day = d && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)) ? d : today;

  const [journal, gratitude, lessons, habitDone, dayTodos] = await Promise.all([
    db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, user.id), eq(journalEntries.entryDate, day)))
      .orderBy(asc(journalEntries.createdAt)),
    db
      .select()
      .from(gratitudeEntries)
      .where(and(eq(gratitudeEntries.userId, user.id), eq(gratitudeEntries.entryDate, day)))
      .orderBy(asc(gratitudeEntries.createdAt))
      .catch(() => []),
    db
      .select()
      .from(lifeLessons)
      .where(and(eq(lifeLessons.userId, user.id), eq(lifeLessons.learnedOn, day)))
      .orderBy(asc(lifeLessons.createdAt))
      .catch(() => []),
    db
      .select({ name: habits.name })
      .from(habitLogs)
      .innerJoin(habits, eq(habitLogs.habitId, habits.id))
      .where(and(eq(habits.userId, user.id), eq(habitLogs.logDate, day))),
    db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, user.id), eq(todos.scope, "daily"), eq(todos.dueDate, day)))
      .orderBy(asc(todos.createdAt)),
  ]);

  const total = journal.length + gratitude.length + lessons.length + habitDone.length + dayTodos.length;
  const prev = addDaysISO(day, -1);
  const next = addDaysISO(day, 1);

  return (
    <div>
      <PageHeader
        image={photoUrl("journal")}
        eyebrow={day === today ? "Today" : "Look back"}
        title={long(day)}
        subtitle="Everything you recorded on this day, in one place."
        action={
          <div className="flex items-center gap-1 text-xs">
            <Link href={`/day?d=${prev}`} className="flex items-center rounded-lg bg-neutral-950/60 px-2.5 py-1.5 text-neutral-200 hover:bg-neutral-900" aria-label="Previous day">
              <ChevronLeft size={14} /> Prev
            </Link>
            {day !== today && (
              <Link href="/day" className="rounded-lg bg-neutral-950/60 px-2.5 py-1.5 text-neutral-200 hover:bg-neutral-900">
                Today
              </Link>
            )}
            {day < today && (
              <Link href={`/day?d=${next}`} className="flex items-center rounded-lg bg-neutral-950/60 px-2.5 py-1.5 text-neutral-200 hover:bg-neutral-900" aria-label="Next day">
                Next <ChevronRight size={14} />
              </Link>
            )}
          </div>
        }
      />

      <form action="/day" className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
        <label htmlFor="d">Jump to</label>
        <input
          id="d"
          type="date"
          name="d"
          defaultValue={day}
          max={today}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-50 outline-none focus:border-indigo-500"
        />
        <button type="submit" className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800">
          Go
        </button>
      </form>

      {total === 0 ? (
        <EmptyState title="Nothing recorded on this day" subtitle="Check-ins, journal entries, gratitude, lessons and habits all appear here." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {journal.length > 0 && (
            <Card className="lg:col-span-2">
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-100">
                <NotebookPen size={14} className="text-sky-400" /> Journal · {journal.length}
              </h2>
              <div className="space-y-3">
                {journal.map((e) => (
                  <div key={e.id} className="rounded-lg bg-neutral-950/40 p-3">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-neutral-100">{e.title || "Untitled"}</p>
                      {e.mood && <Badge>{e.mood}</Badge>}
                      {e.tags.map((t) => (
                        <span key={t} className="text-[11px] text-neutral-500">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{e.body}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {gratitude.length > 0 && (
            <Card className="border-rose-900/40 bg-rose-950/10">
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-100">
                <Heart size={14} className="text-rose-400" /> Thankful for · {gratitude.length}
              </h2>
              <ul className="space-y-1.5 text-sm text-neutral-200">
                {gratitude.map((g) => (
                  <li key={g.id}>• {g.text}</li>
                ))}
              </ul>
            </Card>
          )}

          {lessons.length > 0 && (
            <Card className="border-amber-900/40 bg-amber-950/10">
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-100">
                <Lightbulb size={14} className="text-amber-300" /> Lessons · {lessons.length}
              </h2>
              <ul className="space-y-2 text-sm text-neutral-200">
                {lessons.map((l) => (
                  <li key={l.id}>
                    {l.lesson}
                    {l.context && <span className="block text-xs text-neutral-500">{l.context}</span>}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {habitDone.length > 0 && (
            <Card>
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-100">
                <Flame size={14} className="text-orange-400" /> Habits done · {habitDone.length}
              </h2>
              <ul className="space-y-1.5 text-sm text-neutral-200">
                {habitDone.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" /> {h.name}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {dayTodos.length > 0 && (
            <Card>
              <h2 className="mb-2 text-sm font-semibold text-neutral-100">
                To-dos · {dayTodos.filter((t) => t.done).length}/{dayTodos.length} done
              </h2>
              <ul className="space-y-1.5 text-sm">
                {dayTodos.map((t) => (
                  <li key={t.id} className="flex items-center gap-2">
                    {t.done ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Circle size={14} className="text-neutral-600" />}
                    <span className={t.done ? "text-neutral-500 line-through" : "text-neutral-200"}>{t.title}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
