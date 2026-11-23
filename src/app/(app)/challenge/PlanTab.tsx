import { Check, Circle } from "lucide-react";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { TERMS } from "@/db/seed-data/challenge";
import { DEFAULT_END, DEFAULT_START, type PlanRow, type ScoreRow } from "@/lib/challenge";
import { restartChallenge, savePlan } from "./actions";
import { nairobiToday } from "@/lib/challenge";

export function PlanTab({ plan, scorecard, saved, restart }: { plan: PlanRow | null; scorecard: ScoreRow[]; saved: boolean; restart?: boolean }) {
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

      <Card className="border-red-900/40">
        <h2 className="text-sm font-semibold text-neutral-100">Restart the challenge</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Start the six months again from a new date. Your daily logs, reviews, reflections, rituals and terms are all kept; days before the new start date simply stop counting toward streaks and averages.
        </p>
        {restart && <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200" role="alert">Tick the confirmation box to restart.</p>}
        <form action={restartChallenge} className="mt-3 space-y-3">
          <label className="block text-xs text-neutral-400">New start date
            <Input type="date" name="newStart" defaultValue={nairobiToday()} className="mt-1 sm:max-w-xs" />
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-200">
            <input type="checkbox" name="clearRules" defaultChecked className="h-5 w-5 shrink-0 accent-indigo-500" />
            <span>Clear the 15-rule monthly ticks <span className="block text-xs text-neutral-500">Recommended: they belong to the old run&apos;s months.</span></span>
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-200">
            <input type="checkbox" name="clearScore" className="h-5 w-5 shrink-0 accent-indigo-500" />
            <span>Clear the scorecard <span className="block text-xs text-neutral-500">Wipes the baseline, month 3 and month 6 entries so you can record a fresh baseline.</span></span>
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-lg border border-red-900/50 px-3 py-2 text-sm text-neutral-100">
            <input type="checkbox" name="confirm" className="h-5 w-5 shrink-0 accent-red-500" />
            <span>Yes, restart my challenge from this date</span>
          </label>
          <Button type="submit" variant="danger" className="h-11 w-full justify-center sm:w-auto">Restart challenge</Button>
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
