import { Check } from "lucide-react";
import { Card } from "@/components/ui";
import { PHASES, RULES } from "@/db/seed-data/challenge";
import { toggleRuleCheck } from "./actions";

export function RulesTab({ checks, month, started }: { checks: { rule: number; month: number }[]; month: number; started: boolean }) {
  const done = new Set(checks.map((c) => `${c.rule}:${c.month}`));
  const total = checks.length;
  return (
    <div className="space-y-5">
      <p className="text-sm text-neutral-400">
        Rules 1 to 10 are inputs you control daily. Rules 11 to 15 are outputs that show up only if the inputs hold. Tick a month when you have the proof for that rule.
        {started ? ` You are in month ${month}; its focus rules are highlighted.` : ""} <span className="text-neutral-500">{total} checks so far.</span>
      </p>
      {[1, 2, 3].map((ph) => (
        <section key={ph}>
          <h2 className="text-base font-semibold text-neutral-50">Phase {ph}: {PHASES[ph].name}</h2>
          <p className="mb-2 text-xs text-neutral-500">{PHASES[ph].blurb}</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {RULES.filter((r) => r.phase === ph).map((r) => {
              const focus = r.months.includes(month) && started;
              return (
                <Card key={r.n} className={focus ? "border-indigo-600/70" : ""}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-neutral-50"><span className="mr-1.5 text-neutral-500">{r.n}.</span>{r.slogan}</p>
                      <p className="mt-1 text-sm text-neutral-300">{r.means}</p>
                    </div>
                    {focus && <span className="shrink-0 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-200">Focus now</span>}
                  </div>
                  <p className="mt-2 text-xs text-neutral-400"><span className="font-medium text-neutral-300">Proof:</span> {r.proof}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((m) => {
                      const on = done.has(`${r.n}:${m}`);
                      return (
                        <form action={toggleRuleCheck} key={m}>
                          <input type="hidden" name="rule" value={r.n} />
                          <input type="hidden" name="month" value={m} />
                          <button
                            type="submit"
                            aria-pressed={on}
                            title={`Month ${m}`}
                            className={`flex h-7 w-9 items-center justify-center rounded-md border text-[11px] ${
                              on ? "border-emerald-700 bg-emerald-500/20 text-emerald-200" : m === month && started ? "border-indigo-700 text-indigo-200 hover:bg-indigo-500/10" : "border-neutral-800 text-neutral-500 hover:bg-neutral-800"
                            }`}
                          >
                            {on ? <Check size={12} /> : `M${m}`}
                          </button>
                        </form>
                      );
                    })}
                  </div>
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-200">How to do it</summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral-300">
                      {r.tips.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                  </details>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
