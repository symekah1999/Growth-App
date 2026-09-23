import { db } from "@/db";
import { goals, habitLogs, habits, mantras, todos, bibleBooks, recoveryTrackers, recoveryResets, recoveryCheckins } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, desc, eq, gte } from "drizzle-orm";
import { Card, ButtonLink, Badge } from "@/components/ui";
import { getPrayerOfTheDay, getQuoteOfTheDay, getVerseOfTheDay } from "@/lib/daily";
import { streakDayCount, todayISO } from "@/lib/utils";
import { computeStreaks } from "@/lib/streaks";
import { HabitConsistencyChart } from "@/components/charts/HabitConsistencyChart";
import { QuickLinks } from "@/components/QuickLinks";
import { ProgressRing } from "@/components/ProgressRing";
import { PacingBadge, PacedProgressBar } from "@/components/PacingBadge";
import { daysLeftLabel, goalPacing, pacingSortKey } from "@/lib/pacing";
import { headlineInsight, RECOVERY_MILESTONES } from "@/lib/recovery-insights";
import { achievements, lifeScore, loadProgressData } from "@/lib/progress";
import { getRealityOfTheDay } from "@/db/seed-data/realities";
import { ArrowRight, Bot, Trophy } from "lucide-react";
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
  const reality = getRealityOfTheDay(today);

  const progressData = await loadProgressData(user.id);
  const score = lifeScore(progressData, today);
  const badges = achievements(progressData, today);
  const earnedCount = badges.filter((b) => b.earned).length;

  const pacedGoals = activeGoals
    .map((g) => ({ goal: g, pacing: goalPacing(g, today) }))
    .sort((a, b) => pacingSortKey(a.pacing) - pacingSortKey(b.pacing));

  const recoveryCards = await Promise.all(
    activeRecovery.map(async (t) => {
      const [resets, checkins] = await Promise.all([
        db.select({ d: recoveryResets.streakDaysAtReset }).from(recoveryResets).where(eq(recoveryResets.trackerId, t.id)),
        db
          .select({ checkinDate: recoveryCheckins.checkinDate, cravingLevel: recoveryCheckins.cravingLevel })
          .from(recoveryCheckins)
          .where(eq(recoveryCheckins.trackerId, t.id))
          .orderBy(desc(recoveryCheckins.checkinDate))
          .limit(14),
      ]);
      const days = streakDayCount(t.startDate);
      const insight = headlineInsight({
        name: t.name,
        currentDays: days,
        targetDays: t.targetDays,
        pastStreaks: resets.map((r) => r.d),
        checkins,
        checkedInToday: checkins[0]?.checkinDate === today,
      });
      return { tracker: t, days, insight };
    }),
  );

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
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/progress"
              className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 transition hover:border-neutral-700"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wide text-neutral-500">Life score</p>
                <p className="text-xl font-semibold text-neutral-50">
                  {score.score ?? "—"}
                  {score.delta !== null && score.delta !== 0 && (
                    <span className={`ml-1.5 text-xs font-medium ${score.delta > 0 ? "text-[#4ade4a]" : "text-[#ec835a]"}`}>
                      {score.delta > 0 ? "▲" : "▼"} {Math.abs(score.delta)}
                    </span>
                  )}
                </p>
              </div>
              <div className="h-8 w-px bg-neutral-800" />
              <div className="flex items-center gap-1.5 text-sm text-neutral-300">
                <Trophy size={15} className="text-yellow-300" />
                {earnedCount}/{badges.length}
              </div>
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-xl border border-indigo-800/60 bg-indigo-600/10 px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-600/20"
            >
              <Bot size={16} />
              Ask your assistant
            </Link>
          </div>
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

      <Card className="mb-6 border-orange-900/40 bg-orange-950/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-orange-300">Reality of the day</p>
            <p className="mt-1.5 text-lg font-semibold leading-snug text-neutral-50">{reality.truth}</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-400">{reality.detail}</p>
            <p className="mt-2 flex items-start gap-1.5 text-sm text-neutral-200">
              <ArrowRight size={14} className="mt-1 shrink-0 text-orange-300" />
              {reality.action}
            </p>
          </div>
          <Link href="/realities" className="shrink-0 text-xs text-neutral-500 hover:text-neutral-300">
            All realities →
          </Link>
        </div>
      </Card>

      {randomMantra && (
        <Card className="mb-6 text-center">
          <p className="text-sm italic text-neutral-300">&ldquo;{randomMantra.text}&rdquo;</p>
        </Card>
      )}

      {recoveryCards.length > 0 && (
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          {recoveryCards.map(({ tracker: t, days, insight }) => (
            <Card key={t.id}>
              <div className="flex items-center gap-4">
                <ProgressRing value={days} target={t.targetDays} milestones={RECOVERY_MILESTONES} size={108} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/recovery/${t.id}`} className="truncate text-sm font-medium text-neutral-200 hover:underline">
                      {t.name}
                    </Link>
                    <span className="shrink-0 text-xs text-neutral-500">recovery</span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-neutral-100">{insight.title}</p>
                  <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-neutral-400">{insight.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          {pacedGoals.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No active goals</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {pacedGoals.slice(0, 4).map(({ goal: g, pacing }) => (
                <li key={g.id}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <Link href={`/goals/${g.id}`} className="truncate text-neutral-300 hover:underline">
                      {g.title}
                    </Link>
                    <PacingBadge pacing={pacing} className="shrink-0 !px-1.5 !py-0 !text-[10px]" />
                  </div>
                  <div className="mt-1.5">
                    <PacedProgressBar progress={g.progress} expected={pacing.expected} />
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {g.progress}%{pacing.daysLeft !== null ? ` · ${daysLeftLabel(pacing.daysLeft)}` : ""}
                  </p>
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
