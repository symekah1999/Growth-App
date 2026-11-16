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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-500">
                <th className="pb-2 pr-3 font-medium">Measure</th>
                <th className="pb-2 pr-2 font-medium">Baseline</th>
                <th className="pb-2 pr-2 font-medium">Month 3</th>
                <th className="pb-2 pr-2 font-medium">Month 6</th>
                <th className="pb-2 font-medium">Now</th>
              </tr>
            </thead>
            <tbody>
              {SCORECARD.map((m) => {
                const r = by.get(m.key);
                return (
                  <tr key={m.key} className="border-t border-neutral-800 align-middle">
                    <td className="py-1.5 pr-3 text-neutral-300">{m.label}</td>
                    {(["baseline", "month3", "month6"] as const).map((f) => (
                      <td key={f} className="py-1.5 pr-2">
                        <Input name={`${m.key}.${f}`} defaultValue={r?.[f] ?? ""} maxLength={200} className="!py-1" />
                      </td>
                    ))}
                    <td className="py-1.5 text-neutral-400">{m.auto ? live[m.auto] : "–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Button type="submit" className="mt-4">Save scorecard</Button>
      </form>
    </Card>
  );
}
