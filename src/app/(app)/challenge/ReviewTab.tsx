import { Trash2 } from "lucide-react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { SUNDAY_STEPS } from "@/db/seed-data/challenge";
import { formatDate } from "@/lib/utils";
import type { ReviewRow, SetbackRow, stats as statsFn } from "@/lib/challenge";
import { addSetback, deleteSetback, saveReview } from "./actions";

const PACE: Record<string, string> = { ahead: "Ahead", on: "On pace", behind: "Behind" };

export function ReviewTab({ reviews, setbacks, st, today, saved }: { reviews: ReviewRow[]; setbacks: SetbackRow[]; st: ReturnType<typeof statsFn>; today: string; saved: boolean }) {
  const f = (v: number | null, d = 1) => (v === null ? "–" : v.toFixed(d));
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">Sunday review · 30 minutes</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-300">
          {SUNDAY_STEPS.map((s) => <li key={s}>{s}</li>)}
        </ol>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">The last 7 days, added up</h2>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
          <p className="text-neutral-300"><span className="block text-xs text-neutral-500">Average score</span>{f(st.week.score)} / 7</p>
          <p className="text-neutral-300"><span className="block text-xs text-neutral-500">Deep-work blocks</span>{st.week.deep}</p>
          <p className="text-neutral-300"><span className="block text-xs text-neutral-500">Training days</span>{st.week.training}</p>
          <p className="text-neutral-300"><span className="block text-xs text-neutral-500">Days clean (now)</span>{st.currentClean}</p>
          <p className="text-neutral-300"><span className="block text-xs text-neutral-500">Avg social minutes</span>{f(st.week.social, 0)}</p>
        </div>
      </Card>

      <Card>
        {saved && <p className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">Review saved ✓</p>}
        <form action={saveReview} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-neutral-400">Week ending
              <Input type="date" name="weekEnding" defaultValue={today} max={today} className="mt-1" />
            </label>
            <label className="text-xs text-neutral-400">Against the headline target
              <Select name="pace" defaultValue="on" className="mt-1">
                <option value="ahead">Ahead</option>
                <option value="on">On pace</option>
                <option value="behind">Behind</option>
              </Select>
            </label>
          </div>
          <label className="block text-xs text-neutral-400">One thing that worked (keep it)
            <Textarea name="worked" rows={2} className="mt-1" />
          </label>
          <label className="block text-xs text-neutral-400">One thing that failed, and my part in it
            <Textarea name="failed" rows={2} className="mt-1" />
          </label>
          <label className="block text-xs text-neutral-400">The one condition I will change so it can&apos;t fail the same way
            <Textarea name="change" rows={2} className="mt-1" />
          </label>
          <label className="block text-xs text-neutral-400">Next week: deep-work and training blocks first
            <Textarea name="nextPlan" rows={2} className="mt-1" />
          </label>
          <Button type="submit">Save review</Button>
        </form>
      </Card>

      {reviews.length > 0 && (
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Past reviews</h2>
          <ul className="divide-y divide-neutral-800">
            {reviews.map((r) => (
              <li key={r.id} className="py-3 text-sm">
                <p className="font-medium text-neutral-100">Week ending {formatDate(r.weekEnding)} <span className="ml-2 rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300">{PACE[r.pace] ?? r.pace}</span></p>
                {r.worked && <p className="mt-1 text-neutral-300"><span className="text-neutral-500">Worked:</span> {r.worked}</p>}
                {r.failed && <p className="mt-0.5 text-neutral-300"><span className="text-neutral-500">Failed:</span> {r.failed}</p>}
                {r.change && <p className="mt-0.5 text-neutral-300"><span className="text-neutral-500">Change:</span> {r.change}</p>}
                {r.nextPlan && <p className="mt-0.5 text-neutral-300"><span className="text-neutral-500">Next:</span> {r.nextPlan}</p>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="scroll-mt-4" >
        <div id="setbacks" />
        <h2 className="mb-1 text-sm font-semibold text-neutral-100">Setback log · make it your fault</h2>
        <p className="mb-3 text-xs text-neutral-500">Control, not guilt. Three lines: what happened, what was in my control, what I will do next time.</p>
        <form action={addSetback} className="space-y-2">
          <Input name="what" placeholder="What happened" maxLength={500} required />
          <Input name="control" placeholder="What was in my control" maxLength={500} />
          <Input name="nextTime" placeholder="Next time I will…" maxLength={500} />
          <Button type="submit" variant="ghost">Add to log</Button>
        </form>
        {setbacks.length > 0 && (
          <ul className="mt-4 divide-y divide-neutral-800">
            {setbacks.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0 text-neutral-300">
                  <p className="text-xs text-neutral-500">{formatDate(s.day)}</p>
                  <p>{s.what}</p>
                  {s.control && <p className="text-neutral-400"><span className="text-neutral-500">In my control:</span> {s.control}</p>}
                  {s.nextTime && <p className="text-neutral-400"><span className="text-neutral-500">Next time:</span> {s.nextTime}</p>}
                </div>
                <form action={deleteSetback}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" aria-label="Delete" className="text-neutral-600 hover:text-red-400"><Trash2 size={14} /></button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
