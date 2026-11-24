import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { ChevronRight, Cpu, Radar } from "lucide-react";
import { db } from "@/db";
import { habitLogs, habits, journalEntries, todos } from "@/db/schema";
import { todontLogs, todonts } from "@/db/schema-life";
import { DAILY_CHECKS } from "@/db/seed-data/challenge";
import { requireUser } from "@/lib/auth";
import { DEFAULT_END, DEFAULT_START, loadChallenge, nairobiHour, nairobiToday, phaseInfo, ritualStreak } from "@/lib/challenge";
import { currentPlan, loadYear, yearInfo } from "@/lib/year";
import { attempt, daysBetween, formatDate, todayISO } from "@/lib/utils";
import { NAV_SECTIONS } from "@/components/nav-data";

export const dynamic = "force-dynamic";

type State = "done" | "active" | "idle" | "alert";
type Status = { state: State; text: string; pct?: number };

const DOT: Record<State, string> = {
  done: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]",
  active: "bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]",
  alert: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]",
  idle: "bg-neutral-600",
};
const TEXT: Record<State, string> = { done: "text-emerald-300", active: "text-cyan-200", alert: "text-amber-300", idle: "text-neutral-500" };
const pad = (n: number) => String(n).padStart(2, "0");

export default async function SystemMapPage() {
  const user = await requireUser();
  const today = nairobiToday();
  const utcToday = todayISO();
  const hour = nairobiHour();

  const [data, year, habitRows, todoRows, tdItems, tdLogs, lastJournal] = await Promise.all([
    loadChallenge(user.id).catch(() => null),
    loadYear(user.id).catch(() => null),
    attempt(db.select().from(habits).where(and(eq(habits.userId, user.id), eq(habits.archived, false))), []),
    attempt(db.select().from(todos).where(and(eq(todos.userId, user.id), eq(todos.scope, "daily"), eq(todos.dueDate, utcToday))), []),
    attempt(db.select().from(todonts).where(and(eq(todonts.userId, user.id), eq(todonts.active, true))), []),
    attempt(db.select().from(todontLogs).where(and(eq(todontLogs.userId, user.id), eq(todontLogs.day, today))), []),
    attempt(db.select({ d: journalEntries.entryDate }).from(journalEntries).where(eq(journalEntries.userId, user.id)).orderBy(desc(journalEntries.entryDate)).limit(1), []),
  ]);
  const ids = habitRows.map((h) => h.id);
  const logged = ids.length
    ? new Set((await attempt(db.select({ id: habitLogs.habitId }).from(habitLogs).where(and(inArray(habitLogs.habitId, ids), eq(habitLogs.logDate, utcToday))), [])).map((l) => l.id))
    : new Set<string>();

  // ---- live readings -------------------------------------------------------
  const plan = data?.plan ?? { startDate: DEFAULT_START, endDate: DEFAULT_END };
  const phase = phaseInfo(plan, today);
  const checks = ((data?.days.find((d) => d.day === today)?.checks ?? {}) as Record<string, boolean>);
  const score = DAILY_CHECKS.filter((c) => checks[c.key]).length;
  const rituals = data?.rituals ?? null;
  const mDone = !!rituals?.some((r) => r.day === today && r.kind === "morning");
  const eDone = !!rituals?.some((r) => r.day === today && r.kind === "evening");
  const streak = rituals ? ritualStreak(rituals, today) : 0;
  const pillars = data?.pillars?.filter((p) => p.day === today).length ?? 0;
  const habitsDone = habitRows.filter((h) => logged.has(h.id)).length;
  const todosDone = todoRows.filter((t) => t.done).length;
  const held = tdLogs.filter((l) => l.held).length;
  const yplan = year ? currentPlan(year.plans, today) : null;
  const yi = yplan ? yearInfo(yplan.startDate, today) : null;
  const journalGap = lastJournal[0]?.d ? daysBetween(lastJournal[0].d, today) : null;

  const ratio = (done: number, total: number, unit: string): Status =>
    total === 0 ? { state: "idle", text: `no ${unit} set` } : { state: done >= total ? "done" : done > 0 ? "active" : hour >= 17 ? "alert" : "idle", text: `${done}/${total} ${unit}`, pct: Math.round((done / total) * 100) };

  const status: Record<string, Status> = {
    "/challenge/ritual": {
      state: mDone && eDone ? "done" : mDone ? (hour >= 17 ? "alert" : "active") : hour >= 10 ? "alert" : "idle",
      text: `AM ${mDone ? "✓" : "–"} · PM ${eDone ? "✓" : "–"}${streak ? ` · ${streak}d streak` : ""}`,
    },
    "/challenge": data
      ? phase.started && !phase.finished
        ? { state: score >= 7 ? "done" : score > 0 ? "active" : "idle", text: `day ${phase.dayNo}/${phase.total} · ${score}/7`, pct: phase.pct }
        : { state: "idle", text: phase.finished ? "complete" : "not started" }
      : { state: "idle", text: "setup needed" },
    "/habits": ratio(habitsDone, habitRows.length, "habits"),
    "/todos": ratio(todosDone, todoRows.length, "done"),
    "/todont": tdItems.length ? { state: held >= tdItems.length ? "done" : tdLogs.some((l) => !l.held) ? "alert" : held ? "active" : "idle", text: `${held}/${tdItems.length} held` } : { state: "idle", text: "none set" },
    "/year": yplan && yi ? { state: "active", text: `year ${yplan.age} · day ${Math.max(yi.day, 0)}`, pct: yi.pct } : { state: "idle", text: "not created" },
    "/journal": journalGap === null ? { state: "idle", text: "no entries" } : { state: journalGap === 0 ? "done" : journalGap > 2 ? "alert" : "active", text: journalGap === 0 ? "written today" : `${journalGap}d since last` },
  };

  const core = [mDone, eDone, score >= 7, habitRows.length > 0 && habitsDone >= habitRows.length, tdItems.length > 0 && held >= tdItems.length, pillars >= 10];
  const power = Math.round((core.filter(Boolean).length / core.length) * 100);
  const nodes = NAV_SECTIONS.flatMap((s) => s.links).length;
  const alerts = Object.values(status).filter((s) => s.state === "alert").length;

  const directive = !mDone && hour < 17
    ? { href: "/challenge/ritual?mode=morning", label: "Run the morning ritual", why: "Boot sequence not run yet today." }
    : score < 7 && !eDone
      ? { href: "/challenge?tab=today", label: `Finish your 7 points (${score}/7)`, why: "Daily non-negotiables still open." }
      : habitRows.length > habitsDone
        ? { href: "/habits", label: `Log habits (${habitsDone}/${habitRows.length})`, why: "Habit circuits not closed." }
        : !eDone
          ? { href: "/challenge/ritual?mode=evening", label: "Run the evening ritual", why: "Shutdown sequence pending." }
          : { href: "/today", label: "All systems green. Rest well.", why: "Every core circuit closed today." };

  return (
    <div className="mx-auto max-w-5xl font-mono">
      {/* HUD header */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-[linear-gradient(135deg,rgba(8,47,73,0.55),rgba(10,10,10,0.9))] p-4 sm:p-5">
        <div className="hud-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-cyan-400/80"><Radar size={13} className="animate-spin [animation-duration:6s]" /> Growth OS // System map</p>
          <h1 className="mt-2 font-sans text-2xl font-semibold text-neutral-50">Control stem</h1>
          <p className="mt-1 text-xs text-neutral-400">{formatDate(today, { weekday: "long", day: "numeric", month: "long" })} · {pad(hour)}:00 EAT</p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-cyan-500/20 bg-black/30 p-2.5">
              <p className="text-xl font-semibold text-cyan-200">{power}%</p>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">Core power</p>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-black/30 p-2.5">
              <p className="text-xl font-semibold text-emerald-300">{nodes}</p>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">Nodes online</p>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-black/30 p-2.5">
              <p className={`text-xl font-semibold ${alerts ? "text-amber-300" : "text-neutral-300"}`}>{alerts}</p>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">Alerts</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-800">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]" style={{ width: `${power}%` }} />
          </div>

          <Link href={directive.href} className="group mt-4 flex items-center gap-3 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-3 hover:bg-cyan-500/20">
            <Cpu size={18} className="shrink-0 text-cyan-300" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-cyan-400">Next directive &gt;</span>
              <span className="block font-sans text-sm font-semibold text-neutral-50">{directive.label}</span>
              <span className="block text-[11px] text-neutral-400">{directive.why}</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-cyan-300 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* sector jump bar */}
      <nav aria-label="Sectors" className="tabbar-sticky -mx-4 mt-4 flex gap-1.5 overflow-x-auto border-b border-cyan-500/10 bg-neutral-950/85 px-4 py-2 backdrop-blur [scrollbar-width:none] sm:mx-0 sm:rounded-xl sm:border sm:px-2">
        {NAV_SECTIONS.map((s, i) => (
          <a key={s.label} href={`#sector-${i}`} className="shrink-0 rounded-full border border-cyan-500/20 px-3 py-1 text-[11px] uppercase tracking-wider text-cyan-200/80 hover:bg-cyan-500/10">
            S-{pad(i + 1)} {s.label}
          </a>
        ))}
      </nav>

      {/* the stem */}
      <div className="relative mt-5 pb-4">
        <div className="stem-line absolute bottom-0 left-[15px] top-2 w-[3px] rounded-full md:left-1/2 md:-ml-[1.5px]" aria-hidden />
        {NAV_SECTIONS.map((s, i) => {
          const right = i % 2 === 0;
          const sectorStates = s.links.map((l) => status[l.href]?.state).filter(Boolean) as State[];
          const sState: State = sectorStates.includes("alert") ? "alert" : sectorStates.includes("active") ? "active" : sectorStates.length && sectorStates.every((x) => x === "done") ? "done" : "idle";
          return (
            <section key={s.label} id={`sector-${i}`} className="relative mb-6 scroll-mt-20 last:mb-0">
              {/* sector node on the stem */}
              <div className="relative z-10 flex items-center gap-3 md:justify-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/60 bg-neutral-950 text-[11px] font-semibold text-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.35)] md:h-10 md:w-10 md:rotate-45">
                  <span className="md:-rotate-45">{pad(i + 1)}</span>
                </span>
                <span className={`md:absolute ${right ? "md:left-[calc(50%+2rem)]" : "md:right-[calc(50%+2rem)] md:text-right"}`}>
                  <span className="block text-[10px] uppercase tracking-[0.25em] text-cyan-500/80">Sector {pad(i + 1)}</span>
                  <span className={`flex items-center gap-2 font-sans text-sm font-semibold text-neutral-100 ${right ? "" : "md:flex-row-reverse"}`}>
                    {s.label}
                    <span className={`h-2 w-2 rounded-full ${DOT[sState]}`} />
                  </span>
                </span>
              </div>

              {/* branch */}
              <div className={`relative ml-[40px] mt-3 md:ml-0 md:mt-4 md:w-[calc(50%-1.75rem)] ${right ? "md:ml-[calc(50%+1.75rem)]" : ""}`}>
                <div className={`absolute top-5 hidden h-px w-7 bg-cyan-500/40 md:block ${right ? "-left-7" : "-right-7"}`} aria-hidden />
                <div className="absolute -left-[25px] top-5 h-px w-[25px] bg-cyan-500/40 md:hidden" aria-hidden />
                <div className="grid gap-2 sm:grid-cols-2">
                  {s.links.map(({ href, label, icon: Icon }, j) => {
                    const st = status[href];
                    const state = st?.state ?? "idle";
                    return (
                      <Link
                        key={href}
                        href={href}
                        className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2.5 transition hover:border-cyan-400/50 hover:bg-cyan-500/5 hover:shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-black/40 text-cyan-300">
                          <Icon size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="text-[9px] text-neutral-600">{pad(i + 1)}.{pad(j + 1)}</span>
                            <span className="truncate font-sans text-sm font-medium text-neutral-100">{label}</span>
                          </span>
                          <span className={`block truncate text-[11px] ${TEXT[state]}`}>{st ? st.text : "online"}</span>
                        </span>
                        <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[state]} ${state === "alert" || state === "active" ? "animate-pulse" : ""}`} />
                        {st?.pct !== undefined && (
                          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-neutral-800">
                            <span className="block h-full bg-cyan-400/70" style={{ width: `${st.pct}%` }} />
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
        <div className="relative z-10 mt-6 flex items-center gap-3 md:justify-center">
          <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.9)] ml-[10px] md:ml-0" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">End of stem · all sectors mapped</span>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-neutral-600">
        <span className="mr-3"><span className={`mr-1 inline-block h-2 w-2 rounded-full ${DOT.done}`} />done</span>
        <span className="mr-3"><span className={`mr-1 inline-block h-2 w-2 rounded-full ${DOT.active}`} />in progress</span>
        <span className="mr-3"><span className={`mr-1 inline-block h-2 w-2 rounded-full ${DOT.alert}`} />needs you</span>
        <span><span className={`mr-1 inline-block h-2 w-2 rounded-full ${DOT.idle}`} />idle</span>
      </p>
    </div>
  );
}
