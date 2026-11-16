import { Button, Card, Input } from "@/components/ui";
import { SCORECARD } from "@/db/seed-data/challenge";
import type { ScoreRow, stats as statsFn } from "@/lib/challenge";
import { saveScorecard } from "./actions";

export function ScoreTab({ rows, st, saved, start, mid, end }: { rows: ScoreRow[]; st: ReturnType<typeof statsFn>; saved: boolean; start: string; mid: string; end: string }) {
  const by = new Map(rows.map((r) => [r.measure, r]));
  const live: Record<string, string> = {
    deep: String(st.week.deep),
    training: String(st.week.training),
    sleep: st.week.sleep === null ? "–" : st.week.sleep.toFixed(1),
    social: st.week.social === null ? "–" : Math.round(st.week.social).toString(),
    clean: String(st.longestClean),
    score: st.avg30 === null ? "–" : st.avg30.toFixed(1),
  };
  return (
    <Card>
      <h2 className="text-sm font-semibold text-neutral-100">Scorecard</h2>
      <p className="mb-3 mt-1 text-xs text-neutral-500">
        Fill in the baseline on day 1 ({start}) before motivation edits your memory, then month 3 ({mid}) and month 6 ({end}). This table is the only honest answer to &quot;did it work?&quot;. The &quot;Now&quot; column is worked out from your daily log.
      </p>
      {saved && <p className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">Saved ✓</p>}
      <form action={saveScorecard}>
        <div className="space-y-3">
          {SCORECARD.map((m) => {
            const r = by.get(m.key);
            return (
              <div key={m.key} className="rounded-lg border border-neutral-800 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-100">{m.label}</p>
                  {m.auto && <p className="text-xs text-neutral-400">Now: <span className="font-semibold text-neutral-100">{live[m.auto]}</span></p>}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {([["baseline", "Baseline"], ["month3", "Month 3"], ["month6", "Month 6"]] as const).map(([f, l]) => (
                    <label key={f} className="text-[11px] text-neutral-500">{l}
                      <Input name={`${m.key}.${f}`} defaultValue={r?.[f] ?? ""} maxLength={200} className="mt-0.5 !h-10" />
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <Button type="submit" className="mt-4 h-11 w-full justify-center sm:w-auto">Save scorecard</Button>
      </form>
    </Card>
  );
}
