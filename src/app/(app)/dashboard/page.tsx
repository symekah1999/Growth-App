import { db } from "@/db";
import { goals, habitLogs, habits, mantras, todos, bibleBooks, recoveryTrackers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq, gte } from "drizzle-orm";
import { Card, ProgressBar, ButtonLink, Badge } from "@/components/ui";
import { getPrayerOfTheDay, getQuoteOfTheDay, getVerseOfTheDay } from "@/lib/daily";
import { streakDayCount, todayISO } from "@/lib/utils";
import { computeStreaks } from "@/lib/streaks";
import { HabitConsistencyChart } from "@/components/charts/HabitConsistencyChart";
import { QuickLinks } from "@/components/QuickLinks";
import { Bot } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireUser();
  const today = todayISO();

  const [
    activeGoals,
    activeHabits,
    dailyTodos,
    activeMantras,
    booksSeeded,
    verse,
    quote,
    activeRecovery,
  ] = await Promise.all([
    db.select().from(goals).where(and(eq(goals.userId, user.id), eq(goals.status, "active"))),
    db.select().from(habits).where(and(eq(habits.userId, user.id), eq(habits.archived, false))),
    db.select().from(todos).where(and(eq(todos.userId, user.id), eq(todos.scope, "daily"), eq(todos.dueDate, today))),
    db.select().from(mantras).where(and(eq(mantras.userId, user.id), eq(mantras.isActive, true))),
    db.select({ id: bibleBooks.id }).from(bibleBooks).limit(1),
    getVerseOfTheDay(),
    getQuoteOfTheDay(user.id),
    db.select().from(recoveryTrackers).where(and(eq(recoveryTrackers.userId, user.id), eq(recoveryTrackers.active, true))),
  ]);

  const prayer = getPrayerOfTheDay();

  const since = new Date();
  since.setDate(since.getDate() - 14);
  const sinceISO = since.toISOString().slice(0, 10);

  const dayCountByDate = new Map<string, number>();

  const habitStreaks = await Promise.all(
    activeHabits.map(async (h) => {
      const logs = await db
        .select()
        .from(habitLogs)
        .where(and(eq(habitLogs.habitId, h.id), gte(habitLogs.logDate, sinceISO)));
      const dates = [...new Set(logs.map((l) => l.logDate))].sort().reverse();
      for (const d of dates) dayCountByDate.set(d, (dayCountByDate.get(d) ?? 0) + 1);
      const { current } = computeStreaks(dates);
      const doneToday = dates.includes(today);
      return { habit: h, current, doneToday };
    }),
  );

  const chartData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { weekday: "narrow" });
    const pct = activeHabits.length > 0 ? ((dayCountByDate.get(iso) ?? 0) / activeHabits.length) * 100 : 0;
    return { label, pct };
  });

  const todosDone = dailyTodos.filter((t) => t.done).length;
  const randomMantra = activeMantras.length > 0 ? activeMantras[Math.floor(Math.random() * activeMantras.length)] : null;

  return (
    <div>
      <Card className="mb-6 overflow-hidden border-neutral-800 bg-gradient-to-br from-indigo-950/40 via-neutral-900/60 to-fuchsia-950/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">Welcome back</h1>
            <p className="mt-1 text-sm text-neutral-400">{formatToday()}</p>
          </div>
          <Link
            href="/chat"
            className="flex items-center gap-2 rounded-xl border border-indigo-800/60 bg-indigo-600/10 px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-600/20"
          >
            <Bot size={16} />
            Ask your assistant
          </Link>
        </div>
      </Card>

      <div className="mb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Jump to</p>
        <QuickLinks />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {verse ? (
          <Card className="border-indigo-900/60 bg-indigo-950/20">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">Verse of the day</p>
            <p className="mt-2 italic text-neutral-100">&ldquo;{verse.text}&rdquo;</p>
            <p className="mt-2 text-sm text-neutral-400">
              {verse.book} {verse.chapter}:{verse.verse}
            </p>

            {prayer && (
              <div className="mt-4 border-t border-indigo-900/40 pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">{prayer.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">{prayer.text}</p>
              </div>
            )}
          </Card>
        ) : (
          booksSeeded.length === 0 && (
            <Card>
              <p className="text-sm text-neutral-500">
                Seed the Bible (<code>npm run db:seed</code>) to see your verse of the day here.
              </p>
            </Card>
          )
        )}

        {quote ? (
          <Card className="border-amber-900/60 bg-amber-950/10">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-400">Quote of the day</p>
            <p className="mt-2 italic text-neutral-100">&ldquo;{quote.text}&rdquo;</p>
            {quote.author && <p className="mt-2 text-sm text-neutral-400">— {quote.author}</p>}
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-neutral-500">
              Add quotes on the <Link href="/quotes" className="text-indigo-400 hover:underline">Quotes page</Link> to see one here daily.
            </p>
          </Card>
        )}
      </div>

      {randomMantra && (
        <Card className="mb-6 text-center">
          <p className="text-sm italic text-neutral-300">&ldquo;{randomMantra.text}&rdquo;</p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {activeRecovery.length > 0 && (
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-300">Recovery</p>
              <ButtonLink href="/recovery" variant="ghost" className="!px-2 !py-1 text-xs">
                Open
              </ButtonLink>
            </div>
            <ul className="mt-3 space-y-2.5">
              {activeRecovery.map((t) => {
                const days = streakDayCount(t.startDate);
                return (
                  <li key={t.id}>
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="truncate">{t.name}</span>
                      <span>
                        {days}/{t.targetDays}
                      </span>
                    </div>
                    <ProgressBar value={(days / t.targetDays) * 100} className="mt-1" />
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-300">Today&apos;s to-dos</p>
            <ButtonLink href="/todos" variant="ghost" className="!px-2 !py-1 text-xs">
              Open
            </ButtonLink>
          </div>
          <p className="mt-3 text-2xl font-semibold text-neutral-50">
            {todosDone}/{dailyTodos.length}
          </p>
          <p className="text-xs text-neutral-500">completed today</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-300">Habits today</p>
            <ButtonLink href="/habits" variant="ghost" className="!px-2 !py-1 text-xs">
              Open
            </ButtonLink>
          </div>
          {habitStreaks.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No habits yet</p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {habitStreaks.map(({ habit, current, doneToday }) => (
                <li key={habit.id} className="flex items-center justify-between text-sm">
                  <span className={doneToday ? "text-neutral-200" : "text-neutral-500"}>{habit.name}</span>
                  <Badge className={doneToday ? "border-indigo-700 text-indigo-300" : ""}>
                    {doneToday ? "✓" : "—"} {current}d
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-300">Active goals</p>
            <ButtonLink href="/goals" variant="ghost" className="!px-2 !py-1 text-xs">
              Open
            </ButtonLink>
          </div>
          {activeGoals.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No active goals</p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {activeGoals.slice(0, 4).map((g) => (
                <li key={g.id}>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="truncate">{g.title}</span>
                    <span>{g.progress}%</span>
                  </div>
                  <ProgressBar value={g.progress} className="mt-1" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {activeHabits.length > 0 && (
        <Card className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-300">Habit consistency — last 14 days</p>
            <span className="text-xs text-neutral-500">% of habits done each day</span>
          </div>
          <HabitConsistencyChart data={chartData} />
        </Card>
      )}
    </div>
  );
}

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
