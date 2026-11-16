import { Check } from "lucide-react";
import { Button, Card, Textarea } from "@/components/ui";
import { ANIMALS, LONGEVITY, animalForDay } from "@/db/seed-data/wild";
import { RULES } from "@/db/seed-data/challenge";
import { addDaysISO, formatDate } from "@/lib/utils";
import { proverbsStreak, type WildRow } from "@/lib/challenge";
import { saveWildDay, unmarkWildDay } from "./actions";

export function WildTab({ rows, today, month, started, saved }: { rows: WildRow[]; today: string; month: number; started: boolean; saved: boolean }) {
  const animal = animalForDay(today);
  const todayRow = rows.find((r) => r.day === today);
  const streak = proverbsStreak(rows, today);
  const last7 = Array.from({ length: 7 }, (_, i) => addDaysISO(today, -(6 - i)));
  const have = new Set(rows.map((r) => r.day));
  const focus = new Set(started ? RULES.filter((r) => r.months.includes(month)).map((r) => r.n) : []);
  const fits = (nums: number[]) => nums.some((n) => focus.has(n));
  const name = (k: string) => ANIMALS.find((a) => a.key === k)?.name ?? k;
  const recent = rows.filter((r) => r.reflection).slice(0, 5);

  return (
    <div className="space-y-4">
      <Card className="border-emerald-800/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Animal of the day</p>
        <p className="mt-0.5 text-lg font-semibold text-neutral-50">{animal.name}</p>
        <p className="text-sm text-neutral-300">{animal.tagline}</p>
        <ul className="mt-3 space-y-1.5 text-sm text-neutral-300">
          {animal.lessons.map((l) => <li key={l} className="flex gap-2"><span className="text-emerald-400">•</span>{l}</li>)}
        </ul>
        <p className="mt-3 rounded-lg bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200"><span className="font-semibold text-indigo-300">Do today: </span>{animal.practise}</p>

        {saved && <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">Saved ✓</p>}
        <form action={saveWildDay} className="mt-4 space-y-2">
          <input type="hidden" name="day" value={today} />
          <input type="hidden" name="animal" value={animal.key} />
          <label className="block text-xs text-neutral-400">How I will apply it today
            <Textarea name="reflection" rows={2} maxLength={500} defaultValue={todayRow?.reflection ?? ""} className="mt-1" />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" className="h-11 flex-1 justify-center sm:flex-none"><Check size={15} /> {todayRow ? "Update" : "Done for today"}</Button>
            {todayRow && <button formAction={unmarkWildDay} className="h-11 rounded-lg px-3 text-xs text-neutral-500 hover:text-neutral-300" type="submit">Undo</button>}
          </div>
        </form>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {last7.map((d) => <span key={d} title={formatDate(d)} className={`h-5 w-5 rounded-md ${have.has(d) ? "bg-emerald-500" : "bg-neutral-800"}`} />)}
          </div>
          <p className="text-xs text-neutral-400">{streak} day{streak === 1 ? "" : "s"} in a row · {rows.length} total</p>
        </div>
      </Card>

      <div>
        <h2 className="mb-1 text-sm font-semibold text-neutral-100">Built to last</h2>
        <p className="mb-2 text-xs text-neutral-500">What the long-lived animals have in common, and the rules each one supports.</p>
        <div className="space-y-2">
          {LONGEVITY.map((p) => (
            <Card key={p.title} className="!p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-neutral-50">{p.title}</p>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {fits(p.ruleNums) && <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-200">Fits this month</span>}
                  <span className="text-[10px] text-neutral-500">{p.rules}</span>
                </div>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-neutral-300">{p.body}</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold text-neutral-100">The apex field guide</h2>
        <p className="mb-2 text-xs text-neutral-500">{ANIMALS.length} animals, each with what they do, what it teaches, and one action for today.</p>
        <div className="space-y-2">
          {ANIMALS.map((a) => (
            <details key={a.key} className="rounded-xl border border-neutral-800 bg-neutral-900/50 open:bg-neutral-900">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-50">{a.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">{a.tagline} · {a.realm}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {fits(a.ruleNums) && <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-200">Fits this month</span>}
                  <span className="text-[10px] text-neutral-500">{a.rules}</span>
                </div>
              </summary>
              <div className="space-y-3 border-t border-neutral-800 px-4 py-3 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">How it lives</p>
                  <ul className="mt-1 space-y-1 text-neutral-300">{a.facts.map((f) => <li key={f}>• {f}</li>)}</ul>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">What it teaches</p>
                  <ul className="mt-1 space-y-1 text-neutral-100">{a.lessons.map((f) => <li key={f}>• {f}</li>)}</ul>
                </div>
                <p className="rounded-lg bg-neutral-950/60 px-3 py-2 text-neutral-200"><span className="font-semibold text-indigo-300">Do today: </span>{a.practise}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Your recent reflections</h2>
          <ul className="space-y-2 text-sm">
            {recent.map((r) => <li key={r.day} className="text-neutral-300"><span className="text-xs text-neutral-500">{formatDate(r.day)} · {name(r.animal)}</span><br />{r.reflection}</li>)}
          </ul>
        </Card>
      )}
    </div>
  );
}
