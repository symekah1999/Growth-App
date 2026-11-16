import { Check, Circle } from "lucide-react";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { TERMS } from "@/db/seed-data/challenge";
import { DEFAULT_END, DEFAULT_START, type PlanRow, type ScoreRow } from "@/lib/challenge";
import { savePlan } from "./actions";

export function PlanTab({ plan, scorecard, saved }: { plan: PlanRow | null; scorecard: ScoreRow[]; saved: boolean }) {
  const p = plan;
  const done: Record<string, boolean> = {
    headline: !!p?.headline,
    support: !!(p?.support1 && p?.support2),
    vices: !!p?.vices?.length,
    people: (p?.people?.length ?? 0) >= 3,
    baseline: scorecard.some((s) => s.baseline.trim()),
  };
  const excusesText = (p?.excuses ?? []).map((e) => `${e.excuse} => ${e.plan}`).join("\n");

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">Before day 1: set the terms</h2>
        <p className="mb-3 text-xs text-neutral-500">A disappearance without a target is just hiding. Settle these five things in writing.</p>
        <ul className="space-y-1.5">
          {TERMS.map((t) => (
            <li key={t.key} className="flex items-start gap-2 text-sm">
              {done[t.key] ? <Check size={15} className="mt-0.5 text-emerald-400" /> : <Circle size={15} className="mt-0.5 text-neutral-600" />}
              <span className={done[t.key] ? "text-neutral-300" : "text-neutral-200"}>
                {t.label} <span className="text-xs text-neutral-500">· {t.hint}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-neutral-500">Test for the headline target: if it happened and nothing else did, would the six months have been worth it? If not, pick again.</p>
      </Card>

      <Card>
        {saved && <p className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">Saved ✓</p>}
        <form action={savePlan} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-neutral-400">Start date
              <Input type="date" name="startDate" defaultValue={p?.startDate ?? DEFAULT_START} className="mt-1" />
            </label>
            <label className="text-xs text-neutral-400">End date
              <Input type="date" name="endDate" defaultValue={p?.endDate ?? DEFAULT_END} className="mt-1" />
            </label>
          </div>
          <label className="block text-xs text-neutral-400">Headline target (a result with a number and a date)
            <Input name="headline" maxLength={300} defaultValue={p?.headline ?? ""} placeholder="e.g. Job offer in data science by 16 May" className="mt-1" />
          </label>
          <label className="block text-xs text-neutral-400">Headline target date
            <Input type="date" name="headlineBy" defaultValue={p?.headlineBy ?? ""} className="mt-1 sm:max-w-xs" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-neutral-400">Supporting target 1 (body)
              <Input name="support1" maxLength={300} defaultValue={p?.support1 ?? ""} className="mt-1" />
            </label>
            <label className="text-xs text-neutral-400">Supporting target 2 (money or skill)
              <Input name="support2" maxLength={300} defaultValue={p?.support2 ?? ""} className="mt-1" />
            </label>
          </div>
          <label className="block text-xs text-neutral-400">Your why (three sentences: what you want, who it is for, what staying the same costs in five years)
            <Textarea name="why" rows={4} maxLength={1500} defaultValue={p?.why ?? ""} className="mt-1" />
          </label>
          <label className="block text-xs text-neutral-400">Vice list (1 to 3, one per line; name the app, place or hour)
            <Textarea name="vices" rows={3} defaultValue={(p?.vices ?? []).join("\n")} className="mt-1" />
          </label>
          <label className="block text-xs text-neutral-400">Who stays in the loop (3 to 5 people, one per line)
            <Textarea name="people" rows={4} defaultValue={(p?.people ?? []).join("\n")} className="mt-1" />
          </label>
          <label className="block text-xs text-neutral-400">Excuses and if-then plans (one per line, written as: excuse =&gt; plan)
            <Textarea name="excuses" rows={5} defaultValue={excusesText} placeholder={"It rains => I train at home with the 20-minute routine\nI work late => I do 25 minutes instead of 90"} className="mt-1" />
          </label>
          <Button type="submit">Save terms</Button>
        </form>
      </Card>

      {(p?.excuses?.length ?? 0) > 0 && (
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Your if-then plans</h2>
          <ul className="space-y-1.5 text-sm text-neutral-300">
            {p!.excuses.map((e, i) => (
              <li key={i}><span className="text-neutral-400">If</span> {e.excuse} <span className="text-neutral-400">then</span> {e.plan}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-neutral-500">Minimum version of every habit: 10 minutes, one set, one page. A bad day gets the minimum, never zero.</p>
        </Card>
      )}
    </div>
  );
}
