import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { ArrowRight, Ban, Cake, Check, CheckCircle2, Circle, Moon, Plus, Sun, Sunrise, X } from "lucide-react";
import { db } from "@/db";
import { habitLogs, habits, todos } from "@/db/schema";
import { todontLogs, todonts } from "@/db/schema-life";
import { DAILY_CHECKS } from "@/db/seed-data/challenge";
import { affirmationForDay } from "@/db/seed-data/life";
import { dailyProverb } from "@/db/seed-data/proverbs-daily";
import { requireUser } from "@/lib/auth";
import { DEFAULT_END, DEFAULT_START, loadChallenge, nairobiHour, nairobiToday, phaseInfo, ritualStreak } from "@/lib/challenge";
import { currentPlan, loadYear, yearInfo } from "@/lib/year";
import { addDaysISO, formatDate, todayISO } from "@/lib/utils";
import { Card, Input } from "@/components/ui";
import { addTodoToday, logTodontToday, toggleCheckToday, toggleHabitToday, toggleTodoToday } from "./actions";

export const dynamic = "force-dynamic";

const H2 = ({ children, href, linkLabel }: { children: React.ReactNode; href?: string; linkLabel?: string }) => (
  <div className="mb-2 flex items-center justify-between gap-2">
    <h2 className="text-sm font-semibold text-neutral-100">{children}</h2>
    {href && <Link href={href} className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-200">{linkLabel ?? "Open"} <ArrowRight size={12} /></Link>}
  </div>
);

export default async function TodayPage() {
  const user = await requireUser();
  const today = nairobiToday();
  const utcToday = todayISO();
  const hour = nairobiHour();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [data, year, habitRows, todoRows, tdItems, tdLogs] = await Promise.all([
    loadChallenge(user.id),
    loadYear(user.id),
    db.select().from(habits).where(and(eq(habits.userId, user.id), eq(habits.archived, false))).orderBy(desc(habits.createdAt)).catch(() => []),
    db.select().from(todos).where(and(eq(todos.userId, user.id), eq(todos.scope, "daily"), eq(todos.dueDate, utcToday))).orderBy(todos.createdAt).catch(() => []),
    db.select().from(todonts).where(and(eq(todonts.userId, user.id), eq(todonts.active, true))).orderBy(desc(todonts.createdAt)).catch(() => null),
    db.select().from(todontLogs).where(and(eq(todontLogs.userId, user.id), eq(todontLogs.day, today))).catch(() => []),
  ]);
  const habitIds = habitRows.map((h) => h.id);
  const logged = new Set(
    habitIds.length
      ? (await db.select({ habitId: habitLogs.habitId }).from(habitLogs).where(and(inArray(habitLogs.habitId, habitIds), eq(habitLogs.logDate, utcToday))).catch(() => [])).map((l) => l.habitId)
      : [],
  );

  const plan = data?.plan ?? { startDate: DEFAULT_START, endDate: DEFAULT_END };
  const phase = phaseInfo(plan, today);
  const dayRow = data?.days.find((d) => d.day === today);
  const checks = (dayRow?.checks ?? {}) as Record<string, boolean>;
  const score = DAILY_CHECKS.filter((c) => checks[c.key]).length;
  const rituals = data?.rituals ?? null;
  const mDone = !!rituals?.some((r) => r.day === today && r.kind === "morning");
  const eDone = !!rituals?.some((r) => r.day === today && r.kind === "evening");
  const morningAns = rituals?.find((r) => r.day === today && r.kind === "morning")?.answers ?? {};
  const yesterdayRow = data?.days.find((d) => d.day === addDaysISO(today, -1));
  const oneThing = morningAns.task1 || yesterdayRow?.tomorrowTask || "";
  const also = [morningAns.task2, morningAns.task3].filter(Boolean) as string[];
  const streak = rituals ? ritualStreak(rituals, today) : 0;
  const pillarsToday = data?.pillars?.filter((p) => p.day === today).length ?? null;

  const yplan = year ? currentPlan(year.plans, today) : null;
  const yi = yplan ? yearInfo(yplan.startDate, today) : null;
  const birthday = year?.plans.find((p) => p.startDate === today) ?? null;

  const affirmation = affirmationForDay(today);
  const verse = dailyProverb(today);
  const tdState = new Map(tdLogs.map((l) => [l.todontId, l.held]));
  const habitsDone = habitRows.filter((h) => logged.has(h.id)).length;
  const todosDone = todoRows.filter((t) => t.done).length;

  return (
    <div className="space-y-4">
      <div className="pt-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{formatDate(today, { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-50">{greeting}, Shadrack.</h1>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          {data && phase.started && !phase.finished && <Link href="/challenge" className="rounded-full bg-indigo-500/15 px-2.5 py-1 text-indigo-200">Challenge day {phase.dayNo} of {phase.total}</Link>}
          {yplan && yi?.started && !yi.finished && <Link href="/year" className="rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-fuchsia-200">Year {yplan.age} · day {yi.day}</Link>}
          {streak > 0 && <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-amber-200">{streak}-day ritual streak</span>}
        </div>
      </div>

      {birthday && (
        <Card className="border-amber-600/60 bg-gradient-to-br from-amber-500/20 to-rose-500/10">
          <p className="flex items-center gap-2 text-base font-semibold text-amber-100"><Cake size={18} /> Happy birthday! Year {birthday.age} starts today.</p>
          <Link href="/year" className="mt-1 inline-block text-sm text-neutral-200 underline">Set your theme, vision and letter</Link>
        </Card>
      )}

      {rituals !== null && (
        <div className="grid grid-cols-2 gap-2">
          <Link href="/challenge/ritual?mode=morning" className={`flex min-h-16 flex-col justify-center rounded-xl border px-4 py-3 active:opacity-80 ${mDone ? "border-emerald-800/60 bg-emerald-500/5" : "border-amber-700/50 bg-amber-500/10"}`}>
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300"><Sunrise size={13} /> Morning</span>
            <span className="mt-0.5 text-sm text-neutral-100">{mDone ? "Done ✓" : "Start ritual"}</span>
          </Link>
          <Link href="/challenge/ritual?mode=evening" className={`flex min-h-16 flex-col justify-center rounded-xl border px-4 py-3 active:opacity-80 ${eDone ? "border-emerald-800/60 bg-emerald-500/5" : "border-indigo-700/50 bg-indigo-500/10"}`}>
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-300"><Moon size={13} /> Evening</span>
            <span className="mt-0.5 text-sm text-neutral-100">{eDone ? "Done ✓" : "Close the day"}</span>
          </Link>
        </div>
      )}

      <Card>
        <H2 href="/challenge/ritual?mode=morning" linkLabel={oneThing ? "Change" : "Set it"}>Your one thing</H2>
        {oneThing ? (
          <>
            <p className="text-lg font-semibold leading-snug text-neutral-50">{oneThing}</p>
            {also.length > 0 && <p className="mt-1 text-sm text-neutral-400">Also: {also.join(" · ")}</p>}
          </>
        ) : (
          <p className="text-sm text-neutral-400">No decisive task yet. Set it in the morning ritual, before anything else.</p>
        )}
      </Card>

      <Card className="border-amber-800/30">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300"><Sun size={13} /> Today&apos;s word</p>
        <p className="mt-1.5 text-base font-semibold leading-snug text-neutral-50">{affirmation.text}</p>
        <blockquote className="mt-3 border-l-2 border-amber-600/60 pl-3">
          <p className="text-sm italic leading-relaxed text-neutral-200">&ldquo;{verse.text}&rdquo;</p>
          <p className="mt-0.5 text-xs text-neutral-500">Proverbs {verse.chapter}:{verse.verse} · <Link href="/challenge?tab=proverbs" className="underline">what it teaches</Link></p>
        </blockquote>
      </Card>

      {data && (
        <Card>
          <H2 href="/challenge?tab=today" linkLabel={`${score}/7`}>The 7 points</H2>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {DAILY_CHECKS.map((c) => (
              <form key={c.key} action={toggleCheckToday}>
                <input type="hidden" name="key" value={c.key} />
                <button type="submit" aria-pressed={!!checks[c.key]} className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm active:bg-neutral-800 ${checks[c.key] ? "border-emerald-800/60 bg-emerald-500/10 text-neutral-200" : "border-neutral-800 text-neutral-200"}`}>
                  {checks[c.key] ? <CheckCircle2 size={19} className="shrink-0 text-emerald-400" /> : <Circle size={19} className="shrink-0 text-neutral-600" />}
                  <span className="flex-1">{c.label}</span>
                </button>
              </form>
            ))}
          </div>
        </Card>
      )}

      {tdItems && tdItems.length > 0 && (
        <Card>
          <H2 href="/todont" linkLabel={`${[...tdState.values()].filter(Boolean).length}/${tdItems.length} held`}><span className="flex items-center gap-1.5"><Ban size={14} className="text-red-400" /> To-don&apos;ts</span></H2>
          <ul className="space-y-1.5">
            {tdItems.map((t) => {
              const st = tdState.get(t.id);
              return (
                <li key={t.id} className="flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-1.5">
                  <p className={`min-w-0 flex-1 text-sm ${st === true ? "text-neutral-400" : "text-neutral-100"}`}>{t.text}</p>
                  {(["held", "slipped"] as const).map((s) => {
                    const on = s === "held" ? st === true : st === false;
                    return (
                      <form key={s} action={logTodontToday}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="status" value={s} />
                        <button type="submit" aria-label={s === "held" ? "Held the line" : "Slipped"} aria-pressed={on} className={`flex h-10 w-10 items-center justify-center rounded-lg border ${on ? (s === "held" ? "border-emerald-600 bg-emerald-500/25 text-emerald-100" : "border-red-700 bg-red-500/25 text-red-100") : "border-neutral-800 text-neutral-500"}`}>
                          {s === "held" ? <Check size={16} /> : <X size={16} />}
                        </button>
                      </form>
                    );
                  })}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {habitRows.length > 0 && (
        <Card>
          <H2 href="/habits" linkLabel={`${habitsDone}/${habitRows.length}`}>Habits</H2>
          <ul className="space-y-1.5">
            {habitRows.map((h) => {
              const done = logged.has(h.id);
              return (
                <li key={h.id}>
                  <form action={toggleHabitToday}>
                    <input type="hidden" name="habitId" value={h.id} />
                    <input type="hidden" name="isLogged" value={String(done)} />
                    <button type="submit" aria-pressed={done} className="flex min-h-11 w-full items-center gap-3 rounded-lg border border-neutral-800 px-3 py-2 text-left text-sm active:bg-neutral-800">
                      {done ? <CheckCircle2 size={19} className="shrink-0 text-emerald-400" /> : <Circle size={19} className="shrink-0 text-neutral-600" />}
                      <span className={done ? "text-neutral-500 line-through" : "text-neutral-100"}>{h.name}</span>
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card>
        <H2 href="/todos" linkLabel={todoRows.length ? `${todosDone}/${todoRows.length}` : "All to-dos"}>To-dos today</H2>
        {todoRows.length > 0 && (
          <ul className="mb-2 space-y-1.5">
            {todoRows.map((t) => (
              <li key={t.id}>
                <form action={toggleTodoToday}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="done" value={String(t.done)} />
                  <button type="submit" aria-pressed={t.done} className="flex min-h-11 w-full items-center gap-3 rounded-lg border border-neutral-800 px-3 py-2 text-left text-sm active:bg-neutral-800">
                    {t.done ? <CheckCircle2 size={19} className="shrink-0 text-emerald-400" /> : <Circle size={19} className="shrink-0 text-neutral-600" />}
                    <span className={t.done ? "text-neutral-500 line-through" : "text-neutral-100"}>{t.title}</span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <form action={addTodoToday} className="flex gap-2">
          <Input name="title" maxLength={200} placeholder="Add a to-do for today" />
          <button type="submit" aria-label="Add" className="flex h-10 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900"><Plus size={17} /></button>
        </form>
      </Card>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {pillarsToday !== null && <Link href="/challenge?tab=pillars" className="rounded-xl border border-neutral-800 px-4 py-3 text-neutral-300 active:bg-neutral-800"><span className="block text-lg font-semibold text-neutral-50">{pillarsToday}/10</span>pillars today</Link>}
        {yplan && yi && <Link href="/year" className="rounded-xl border border-neutral-800 px-4 py-3 text-neutral-300 active:bg-neutral-800"><span className="block text-lg font-semibold text-neutral-50">{yi.daysLeft}</span>days to {yplan.age + 1}</Link>}
        <Link href="/entries" className="rounded-xl border border-neutral-800 px-4 py-3 text-neutral-300 active:bg-neutral-800"><span className="block font-semibold text-neutral-50">Entries</span>everything logged</Link>
        <Link href="/dashboard" className="rounded-xl border border-neutral-800 px-4 py-3 text-neutral-300 active:bg-neutral-800"><span className="block font-semibold text-neutral-50">Overview</span>stats and insights</Link>
      </div>
    </div>
  );
}
