import Link from "next/link";
import { AlertTriangle, ChevronLeft, ChevronRight, Flame, Quote } from "lucide-react";
import { Button, Card, Input, ProgressBar, Textarea } from "@/components/ui";
import { DayHeatmap, type HeatCell } from "@/components/charts/DayHeatmap";
import { DAILY_CHECKS } from "@/db/seed-data/challenge";
import { addDaysISO, formatDate } from "@/lib/utils";
import type { DayRow, PlanRow, stats as statsFn, phaseInfo as phaseFn } from "@/lib/challenge";
import { saveDay } from "./actions";

type Props = {
  plan: Pick<PlanRow, "startDate" | "endDate" | "why" | "headline" | "headlineBy">;
  hasPlan: boolean;
  days: DayRow[];
  day: string;
  today: string;
  phase: ReturnType<typeof phaseFn>;
  st: ReturnType<typeof statsFn>;
  saved: boolean;
  other: { habitPct: number | null; journalDays: number; recovery: { name: string; days: number }[] };
};

const fmt = (v: number | null, d = 1) => (v === null ? "–" : v.toFixed(d));

export function TodayTab({ plan, hasPlan, days, day, today, phase, st, saved, other }: Props) {
  const row = days.find((d) => d.day === day);
  const checks = row?.checks ?? {};
  const isToday = day === today;
  const from = addDaysISO(today, -83) < plan.startDate ? plan.startDate : addDaysISO(today, -83);
  const byDay = new Map(days.map((d) => [d.day, d]));
  const cells: HeatCell[] = [];
  for (let d = from; d <= today; d = addDaysISO(d, 1)) {
    const r = byDay.get(d);
    cells.push({ date: d, value: r ? r.score / 7 : 0, detail: r ? `${r.score} of 7` : "not logged" });
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
              {!phase.started ? "Starts soon" : phase.finished ? "Challenge complete" : `Month ${phase.month} of 6 · ${phase.monthInfo.title}`}
            </p>
            <p className="mt-0.5 text-lg font-semibold text-neutral-50">
              {!phase.started
                ? `Starts ${formatDate(plan.startDate)} (in ${-phase.dayNo + 1} day${-phase.dayNo + 1 === 1 ? "" : "s"})`
                : phase.finished
                  ? "Score your result in the Plan tab, then set the next target."
                  : `Day ${phase.dayNo} of ${phase.total} · ${phase.left} day${phase.left === 1 ? "" : "s"} left`}
            </p>
          </div>
          <p className="text-xs text-neutral-500">Ends {formatDate(plan.endDate)}</p>
        </div>
        <ProgressBar value={phase.pct} className="mt-3" />
        {phase.started && !phase.finished && (
          <p className="mt-3 text-sm leading-relaxed text-neutral-300">
            <span className="font-medium text-neutral-100">{phase.monthInfo.rules}.</span> {phase.monthInfo.focus}
          </p>
        )}
      </Card>

      {/* Why + headline */}
      {plan.why ? (
        <Card className="border-amber-800/40">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300">
            <Quote size={13} /> Reread your why
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-100">{plan.why}</p>
          {plan.headline && (
            <p className="mt-2 text-xs text-neutral-400">
              Target: <span className="text-neutral-200">{plan.headline}</span>
              {plan.headlineBy ? ` · by ${formatDate(plan.headlineBy)}` : ""}
            </p>
          )}
        </Card>
      ) : (
        !hasPlan && (
          <Card className="border-indigo-800/50">
            <p className="text-sm text-neutral-300">
              You haven&apos;t set your terms yet. Pick one headline target, your vice list and your why before you go further.{" "}
              <Link href="/challenge?tab=plan" className="text-indigo-300 underline">Set your terms</Link>
            </p>
          </Card>
        )
      )}

      {/* Warnings */}
      {phase.started && !phase.finished && isToday && st.missedTwice && (
        <Card className="border-red-800/60 bg-red-950/20">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-red-300"><AlertTriangle size={14} /> Two days missed in a row</p>
          <p className="mt-1 text-sm text-neutral-300">Never miss twice. Today you only need the minimum version: 10 minutes, one set, one page. Log something today to stop it becoming a habit.</p>
        </Card>
      )}
      {phase.started && !phase.finished && isToday && !st.missedTwice && st.missedYesterday && (
        <Card className="border-amber-800/60 bg-amber-950/20">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-300"><AlertTriangle size={14} /> Yesterday wasn&apos;t logged</p>
          <p className="mt-1 text-sm text-neutral-300">One missed day is an accident. Do today, even at the minimum, so it stays one.</p>
        </Card>
      )}

      {/* Daily form */}
      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-neutral-100">
            {isToday ? "Today" : formatDate(day)} · score {row?.score ?? 0}/7
          </h2>
          <div className="flex items-center gap-1 text-xs">
            <Link href={`/challenge?tab=today&d=${addDaysISO(day, -1)}`} className="rounded-lg border border-neutral-800 p-1.5 text-neutral-400 hover:bg-neutral-800" aria-label="Previous day"><ChevronLeft size={14} /></Link>
            {!isToday && <Link href="/challenge?tab=today" className="rounded-lg border border-neutral-800 px-2 py-1 text-neutral-300 hover:bg-neutral-800">Today</Link>}
            {!isToday && day < today && <Link href={`/challenge?tab=today&d=${addDaysISO(day, 1)}`} className="rounded-lg border border-neutral-800 p-1.5 text-neutral-400 hover:bg-neutral-800" aria-label="Next day"><ChevronRight size={14} /></Link>}
          </div>
        </div>
        {saved && <p className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">Saved ✓</p>}
        <form action={saveDay} className="space-y-4" key={day + (row?.updatedAt?.toString() ?? "")}>
          <input type="hidden" name="day" value={day} />
          <div className="grid gap-1.5 sm:grid-cols-2">
            {DAILY_CHECKS.map((c) => (
              <label key={c.key} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800/50">
                <input type="checkbox" name={c.key} defaultChecked={!!checks[c.key]} className="mt-0.5 h-4 w-4 accent-indigo-500" />
                <span className="flex-1">{c.label}</span>
                <span className="text-[10px] text-neutral-600">R{c.rule}</span>
              </label>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-neutral-400">Deep-work blocks
              <Input name="deepBlocks" type="number" min={0} max={12} inputMode="numeric" defaultValue={row?.deepBlocks ?? ""} className="mt-1" />
            </label>
            <label className="text-xs text-neutral-400">Social-app minutes
              <Input name="socialMinutes" type="number" min={0} max={1440} inputMode="numeric" defaultValue={row?.socialMinutes ?? ""} className="mt-1" />
            </label>
            <label className="text-xs text-neutral-400">Sleep last night (hours)
              <Input name="sleepHours" type="number" min={0} max={24} step={0.5} inputMode="decimal" defaultValue={row?.sleepHours ?? ""} className="mt-1" />
            </label>
          </div>
          <label className="block text-xs text-neutral-400">Tomorrow&apos;s first task
            <Input name="tomorrowTask" maxLength={300} defaultValue={row?.tomorrowTask ?? ""} placeholder="Write it before you stop today" className="mt-1" />
          </label>
          <label className="block text-xs text-neutral-400">Note (optional)
            <Textarea name="note" rows={2} maxLength={1000} defaultValue={row?.note ?? ""} className="mt-1" />
          </label>
          <Button type="submit">Save day</Button>
        </form>
        <p className="mt-3 text-xs text-neutral-500">Aim for an average of 6. A run of 4s means the plan is too big: shrink it rather than quit.</p>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { l: "7-day average", v: fmt(st.avg7), s: "out of 7" },
          { l: "30-day average", v: fmt(st.avg30), s: "target 6+" },
          { l: "Days logged", v: String(st.daysLogged), s: `streak ${st.loggedStreak}` },
          { l: "Missed (30 days)", v: String(st.missed30), s: "target 2 or fewer" },
          { l: "Days clean", v: String(st.currentClean), s: `best ${st.longestClean}` },
          { l: "This week", v: `${st.week.deep} blocks`, s: `${st.week.training} training days` },
        ].map((x) => (
          <Card key={x.l} className="!p-3">
            <p className="text-[11px] uppercase tracking-wide text-neutral-500">{x.l}</p>
            <p className="mt-0.5 text-xl font-semibold text-neutral-50">{x.v}</p>
            <p className="text-[11px] text-neutral-500">{x.s}</p>
          </Card>
        ))}
      </div>

      {/* Heatmap */}
      <Card>
        <h2 className="mb-1 text-sm font-semibold text-neutral-100">Daily score, last 12 weeks</h2>
        <p className="mb-3 text-xs text-neutral-500">Each square is a day. Brighter = higher score out of 7.</p>
        <DayHeatmap cells={cells} emptyLabel="not logged" fullLabel="7 of 7" />
      </Card>

      {/* Existing Growth OS data */}
      <Card>
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-100"><Flame size={14} className="text-orange-400" /> From the rest of Growth OS</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <p className="text-neutral-300"><span className="block text-xs text-neutral-500">Habits this week</span>{other.habitPct === null ? "No habits yet" : `${other.habitPct}% of check-ins`}</p>
          <p className="text-neutral-300"><span className="block text-xs text-neutral-500">Journal this week</span>{other.journalDays} of 7 days</p>
          <p className="text-neutral-300"><span className="block text-xs text-neutral-500">Recovery streaks</span>{other.recovery.length ? other.recovery.map((r) => `${r.name}: ${r.days}d`).join(" · ") : "None tracked"}</p>
        </div>
      </Card>
    </div>
  );
}
