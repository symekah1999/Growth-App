import { db } from "@/db";
import { habitLogs, habits, journalEntries, todos } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/utils";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import Link from "next/link";
import { Button, Card, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { photoUrl } from "@/lib/images";
import { getQuoteOfTheDay } from "@/lib/daily";
import { getSystemOfTheDay } from "@/db/seed-data/life-systems";
import { getGratitudePrompt } from "@/db/schema-gratitude";
import { loadGratitude } from "@/lib/gratitude";
import { checkinAddTodo, checkinToggleHabit, checkinToggleTodo, saveCheckin } from "./actions";
import { CheckCircle2, Circle, Moon, Sparkles, Sun } from "lucide-react";

const MOODS = ["grateful", "energized", "hopeful", "neutral", "reflective", "anxious", "low"];

export default async function CheckinPage({ searchParams }: { searchParams: Promise<{ mode?: string; saved?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const today = todayISO();
  // Nairobi time (UTC+3): morning until 3pm, evening after.
  const hour = (new Date().getUTCHours() + 3) % 24;
  const mode: "morning" | "evening" = sp.mode === "evening" ? "evening" : sp.mode === "morning" ? "morning" : hour < 15 ? "morning" : "evening";

  const [habitRows, todoRows, savedToday, quote, gratitudeRows] = await Promise.all([
    db.select().from(habits).where(and(eq(habits.userId, user.id), eq(habits.archived, false))).orderBy(desc(habits.createdAt)),
    db.select().from(todos).where(and(eq(todos.userId, user.id), eq(todos.scope, "daily"), eq(todos.dueDate, today))).orderBy(todos.createdAt),
    db
      .select({ tags: journalEntries.tags })
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, user.id), eq(journalEntries.entryDate, today), sql`'check-in' = ANY(${journalEntries.tags})`)),
    getQuoteOfTheDay(user.id),
    loadGratitude(user.id, 60),
  ]);

  const ids = habitRows.map((h) => h.id);
  const logsToday = ids.length
    ? await db.select({ habitId: habitLogs.habitId }).from(habitLogs).where(and(inArray(habitLogs.habitId, ids), eq(habitLogs.logDate, today)))
    : [];
  const loggedSet = new Set(logsToday.map((l) => l.habitId));

  const habitsDone = habitRows.filter((h) => loggedSet.has(h.id)).length;
  const todosDone = todoRows.filter((t) => t.done).length;
  const gratitudeToday = (gratitudeRows ?? []).filter((g) => g.entryDate === today).length;
  const savedMorning = savedToday.some((r) => r.tags.includes("morning"));
  const savedEvening = savedToday.some((r) => r.tags.includes("evening"));
  const system = getSystemOfTheDay(today);

  const Row = ({ done, children }: { done: boolean; children: React.ReactNode }) => (
    <span className="flex items-center gap-3">
      {done ? <CheckCircle2 size={20} className="shrink-0 text-emerald-400" /> : <Circle size={20} className="shrink-0 text-neutral-600" />}
      <span className={done ? "text-neutral-500 line-through" : "text-neutral-100"}>{children}</span>
    </span>
  );

  return (
    <div>
      <PageHeader
        image={photoUrl(mode === "morning" ? "dashboard" : "recovery")}
        eyebrow={mode === "morning" ? "Morning check-in" : "Evening check-in"}
        title={mode === "morning" ? "Start the day on purpose" : "Close the day well"}
        subtitle={mode === "morning" ? "Two minutes: set your focus, line up your habits and tasks." : "Two minutes: tick off the day, give thanks, keep one lesson."}
        action={
          <div className="flex gap-1 rounded-lg bg-neutral-950/60 p-1 text-xs">
            <Link
              href="/checkin?mode=morning"
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 ${mode === "morning" ? "bg-amber-500 font-medium text-neutral-950" : "text-neutral-300 hover:bg-neutral-800"}`}
            >
              <Sun size={13} /> Morning
            </Link>
            <Link
              href="/checkin?mode=evening"
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 ${mode === "evening" ? "bg-indigo-500 font-medium text-white" : "text-neutral-300 hover:bg-neutral-800"}`}
            >
              <Moon size={13} /> Evening
            </Link>
          </div>
        }
      />

      {sp.saved && (
        <Card className="mb-4 border-emerald-800/60 bg-emerald-950/20">
          <p className="text-sm text-emerald-200">Saved. Well done — small daily check-ins are how big change happens.</p>
        </Card>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Habits", value: `${habitsDone}/${habitRows.length}` },
          { label: "To-dos", value: `${todosDone}/${todoRows.length}` },
          { label: "Gratitude", value: String(gratitudeToday) },
          { label: mode === "morning" ? "Intention" : "Reflection", value: (mode === "morning" ? savedMorning : savedEvening) ? "Saved" : "—" },
        ].map((s) => (
          <Card key={s.label} className="p-3 text-center">
            <p className="text-xl font-semibold text-neutral-50">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wide text-neutral-500">{s.label} today</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-neutral-100">Habits</h2>
              <Link href="/habits" className="text-xs text-neutral-500 hover:text-neutral-300">
                Manage
              </Link>
            </div>
            {habitRows.length === 0 ? (
              <p className="text-sm text-neutral-500">No habits yet. Add one on the Habits page.</p>
            ) : (
              <ul className="space-y-0.5">
                {habitRows.map((h) => {
                  const on = loggedSet.has(h.id);
                  return (
                    <li key={h.id}>
                      <form action={checkinToggleHabit}>
                        <input type="hidden" name="habitId" value={h.id} />
                        <input type="hidden" name="isLogged" value={String(on)} />
                        <button type="submit" className="flex w-full items-center rounded-lg px-2 py-2 text-left text-sm transition hover:bg-neutral-800/60">
                          <Row done={on}>{h.name}</Row>
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-neutral-100">Today&apos;s to-dos</h2>
              <Link href="/todos" className="text-xs text-neutral-500 hover:text-neutral-300">
                All to-dos
              </Link>
            </div>
            {todoRows.length > 0 && (
              <ul className="mb-2 space-y-0.5">
                {todoRows.map((t) => (
                  <li key={t.id}>
                    <form action={checkinToggleTodo}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="done" value={String(t.done)} />
                      <button type="submit" className="flex w-full items-center rounded-lg px-2 py-2 text-left text-sm transition hover:bg-neutral-800/60">
                        <Row done={t.done}>{t.title}</Row>
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
            <form action={checkinAddTodo} className="flex gap-2">
              <Input name="title" placeholder={mode === "morning" ? "Add a priority for today…" : "Add something for today…"} maxLength={200} />
              <Button type="submit" variant="ghost">
                Add
              </Button>
            </form>
          </Card>
        </div>

        <Card className={mode === "morning" ? "border-amber-900/40 bg-amber-950/10" : "border-indigo-900/40 bg-indigo-950/10"}>
          <form action={saveCheckin} className="space-y-4">
            <input type="hidden" name="mode" value={mode} />
            {mode === "morning" ? (
              <>
                <div>
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300">
                    <Sparkles size={12} /> Thought for the day
                  </p>
                  {quote ? (
                    <p className="text-sm italic text-neutral-200">
                      &ldquo;{quote.text}&rdquo;
                      {quote.author && <span className="not-italic text-neutral-500"> — {quote.author}</span>}
                    </p>
                  ) : (
                    <p className="text-sm italic text-neutral-300">&ldquo;{system.title}&rdquo;</p>
                  )}
                  <p className="mt-2 rounded-lg bg-neutral-950/50 px-3 py-2 text-xs text-neutral-300">
                    <span className="font-semibold text-neutral-100">Try today ({system.title}):</span> {system.tryToday}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-neutral-300">My focus today</label>
                  <Textarea
                    name="intention"
                    rows={4}
                    placeholder="What is the one thing that would make today a good day? How do I want to show up?"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-sm text-neutral-300">Thankful for (one per line)</label>
                  <Textarea name="gratitude" rows={3} placeholder={getGratitudePrompt(today)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-neutral-300">One lesson from today</label>
                  <Input name="lesson" placeholder="What did today teach me?" maxLength={500} />
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-300">How did today go?</label>
                    <Textarea name="reflection" rows={3} placeholder="A few honest lines about the day…" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-300">Mood</label>
                    <Select name="mood" defaultValue="">
                      <option value="">—</option>
                      {MOODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </>
            )}
            <Button type="submit">{mode === "morning" ? "Save intention" : "Save evening check-in"}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
