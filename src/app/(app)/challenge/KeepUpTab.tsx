import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui";
import { PHASES, RULES } from "@/db/seed-data/challenge";
import { addDaysISO, formatDate } from "@/lib/utils";
import { weekKeepUp, ruleWeekHints, type DayRow, type RuleWeekRow } from "@/lib/challenge";
import { setRuleWeek } from "./actions";

const STATUS = [
  { key: "kept", label: "Kept", on: "border-emerald-600 bg-emerald-500/25 text-emerald-100", dot: "bg-emerald-500" },
  { key: "partly", label: "Partly", on: "border-amber-600 bg-amber-500/25 text-amber-100", dot: "bg-amber-400" },
  { key: "missed", label: "Missed", on: "border-red-700 bg-red-500/25 text-red-100", dot: "bg-red-500" },
] as const;

export function KeepUpTab({ rows, days, week, thisWeek, start }: { rows: RuleWeekRow[]; days: DayRow[]; week: string; thisWeek: string; start: string }) {
  const by = new Map(rows.map((r) => [`${r.rule}:${r.weekStart}`, r.status]));
  const sum = weekKeepUp(rows, week);
  const hints = ruleWeekHints(days, week);
  const isCurrent = week === thisWeek;
  const prev = addDaysISO(week, -7);
  const next = addDaysISO(week, 7);

  // Last 8 weeks, oldest to newest, for the history grid
  const weeks = Array.from({ length: 8 }, (_, i) => addDaysISO(thisWeek, -7 * (7 - i))).filter((w) => w >= addDaysISO(start, -6));
  const pctFor = (rule: number) => {
    const rated = weeks.map((w) => by.get(`${rule}:${w}`)).filter(Boolean) as string[];
    if (!rated.length) return null;
    const pts = rated.reduce((s, x) => s + (x === "kept" ? 1 : x === "partly" ? 0.5 : 0), 0);
    return Math.round((pts / rated.length) * 100);
  };
  const lagging = RULES.map((r) => ({ r, pct: pctFor(r.n) })).filter((x) => x.pct !== null && x.pct < 60).sort((a, b) => (a.pct as number) - (b.pct as number)).slice(0, 3);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-2">
          <Link href={`/challenge?tab=keepup&w=${prev}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:bg-neutral-800" aria-label="Previous week"><ChevronLeft size={18} /></Link>
          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-50">{isCurrent ? "This week" : "Week of"}</p>
            <p className="text-xs text-neutral-400">{formatDate(week)} to {formatDate(addDaysISO(week, 6))}</p>
          </div>
          {isCurrent ? (
            <span className="h-10 w-10" />
          ) : (
            <Link href={`/challenge?tab=keepup&w=${next}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:bg-neutral-800" aria-label="Next week"><ChevronRight size={18} /></Link>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-semibold text-neutral-50">{sum.pct}%</p>
            <p className="text-xs text-neutral-500">of the 15 rules kept (partly counts half)</p>
          </div>
          <p className="text-right text-xs text-neutral-400">{sum.kept} kept · {sum.partly} partly · {sum.missed} missed<br />{15 - sum.rated} not rated</p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${sum.pct}%` }} />
        </div>
        <p className="mt-3 text-xs text-neutral-500">Rate each rule once a week, ideally in your Sunday review. Tap a button again to clear it. Hints come from your daily log.</p>
      </Card>

      {lagging.length > 0 && (
        <Card className="border-amber-800/50">
          <p className="text-sm font-semibold text-amber-200">Rules slipping over the last 8 weeks</p>
          <ul className="mt-1.5 space-y-1 text-sm text-neutral-300">
            {lagging.map(({ r, pct }) => (
              <li key={r.n}>Rule {r.n}, {r.slogan}: {pct}% kept. <span className="text-neutral-500">{r.proof}</span></li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-neutral-500">Shrink the habit to its minimum version and attach it to something you already do.</p>
        </Card>
      )}

      {[1, 2, 3].map((ph) => (
        <section key={ph}>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Phase {ph}: {PHASES[ph].name}</h2>
          <div className="space-y-2">
            {RULES.filter((r) => r.phase === ph).map((r) => {
              const cur = by.get(`${r.n}:${week}`);
              return (
                <Card key={r.n} className="scroll-mt-20 !p-3">
                  <div id={`r${r.n}`} />
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-neutral-50"><span className="mr-1 text-neutral-500">{r.n}.</span>{r.slogan}</p>
                    {hints[r.n] && <p className="text-[11px] text-neutral-400">{hints[r.n]}</p>}
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500">{r.proof}</p>
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    {STATUS.map((s) => (
                      <form action={setRuleWeek} key={s.key}>
                        <input type="hidden" name="rule" value={r.n} />
                        <input type="hidden" name="week" value={week} />
                        <input type="hidden" name="status" value={s.key} />
                        <button
                          type="submit"
                          aria-pressed={cur === s.key}
                          className={`h-11 w-full rounded-lg border text-sm font-medium ${cur === s.key ? s.on : "border-neutral-800 text-neutral-400 active:bg-neutral-800"}`}
                        >
                          {s.label}
                        </button>
                      </form>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      <Card>
        <h2 className="mb-1 text-sm font-semibold text-neutral-100">Last 8 weeks</h2>
        <p className="mb-3 text-xs text-neutral-500">Each dot is a week, oldest on the left. Green kept, amber partly, red missed, grey not rated.</p>
        <div className="space-y-1.5">
          {RULES.map((r) => {
            const pct = pctFor(r.n);
            return (
              <div key={r.n} className="flex items-center gap-2 text-xs">
                <span className="w-5 shrink-0 text-right text-neutral-500">{r.n}</span>
                <span className="min-w-0 flex-1 truncate text-neutral-300">{r.slogan}</span>
                <span className="flex shrink-0 gap-1">
                  {weeks.map((w) => {
                    const st = by.get(`${r.n}:${w}`);
                    const dot = STATUS.find((s) => s.key === st)?.dot ?? "bg-neutral-800";
                    return <span key={w} title={`${formatDate(w)}: ${st ?? "not rated"}`} className={`h-3.5 w-3.5 rounded-full ${dot}`} />;
                  })}
                </span>
                <span className="w-9 shrink-0 text-right tabular-nums text-neutral-400">{pct === null ? "–" : `${pct}%`}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
