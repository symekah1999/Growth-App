import { Card } from "@/components/ui";
import { MONTHS, SAMPLE_DAY, TRAPS, WARNING_SIGNS } from "@/db/seed-data/challenge";

export function GuideTab() {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">The six months in order</h2>
        <p className="mb-3 text-xs text-neutral-500">Do not start all 15 rules on day 1. Remove first, build second, measure last. Rules 2 and 3 run through all six months.</p>
        <ol className="space-y-2.5 text-sm">
          {MONTHS.map((m) => (
            <li key={m.n}><span className="font-medium text-neutral-100">Month {m.n}: {m.title}.</span> <span className="text-indigo-300">{m.rules}.</span> <span className="text-neutral-300">{m.focus}</span></li>
          ))}
        </ol>
      </Card>
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">A sample weekday</h2>
        <p className="mb-2 text-xs text-neutral-500">Adjust the times to your job; keep the order.</p>
        <table className="w-full text-sm">
          <tbody>
            {SAMPLE_DAY.map((r) => (
              <tr key={r.time} className="border-t border-neutral-800">
                <td className="whitespace-nowrap py-1.5 pr-3 text-neutral-400">{r.time}</td>
                <td className="py-1.5 pr-3 text-neutral-200">{r.block}</td>
                <td className="py-1.5 text-right text-xs text-neutral-500">R {r.rules}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">Where the slogans go wrong</h2>
        <div className="space-y-3 text-sm">
          {TRAPS.map((t) => (
            <div key={t.line}>
              <p className="font-medium text-neutral-100">{t.line}</p>
              <p className="text-neutral-400"><span className="text-red-300/80">Trap:</span> {t.trap}</p>
              <p className="text-neutral-300"><span className="text-emerald-300/80">Better:</span> {t.better}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="border-amber-800/40">
        <h2 className="mb-2 text-sm font-semibold text-amber-200">Ease off and talk to someone you trust if…</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-300">
          {WARNING_SIGNS.map((w) => <li key={w}>{w}</li>)}
        </ul>
      </Card>
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">The whole thing in five lines</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-300">
          <li>Pick one target and an end date.</li>
          <li>Remove the noise and the vices before adding anything.</li>
          <li>Run the same day six days a week: hard task first, train, eat to plan, sleep.</li>
          <li>Review every Sunday and never miss twice.</li>
          <li>Ship the work, measure the change, then reappear with results.</li>
        </ol>
      </Card>
    </div>
  );
}
