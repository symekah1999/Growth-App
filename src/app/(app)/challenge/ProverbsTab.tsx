import Link from "next/link";
import { BookOpen, Check } from "lucide-react";
import { Button, Card, Textarea } from "@/components/ui";
import { dailyProverb } from "@/db/seed-data/proverbs-daily";
import { MOMENTS, PROVERBS_BOOK_ID, PROVERBS_PATHS, VERSES, chapterForDay, refLabel } from "@/db/seed-data/proverbs";
import { RULES } from "@/db/seed-data/challenge";
import { addDaysISO, formatDate } from "@/lib/utils";
import { proverbsStreak, type ProverbRow } from "@/lib/challenge";
import { saveProverbsDay, unmarkProverbsDay } from "./actions";

export function ProverbsTab({ rows, today, month, started, saved }: { rows: ProverbRow[]; today: string; month: number; started: boolean; saved: boolean }) {
  const chapter = chapterForDay(today);
  const vp = dailyProverb(today);
  const todayRow = rows.find((r) => r.day === today);
  const streak = proverbsStreak(rows, today);
  const last7 = Array.from({ length: 7 }, (_, i) => addDaysISO(today, -(6 - i)));
  const have = new Set(rows.map((r) => r.day));
  const focusRules = new Set(started ? RULES.filter((r) => r.months.includes(month)).map((r) => r.n) : []);
  const recent = rows.filter((r) => r.reflection).slice(0, 5);

  return (
    <div className="space-y-4">
      <Card className="border-amber-800/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Proverbs for today</p>
        <p className="mt-0.5 text-lg font-semibold text-neutral-50">Proverbs {vp.chapter}:{vp.verse}</p>
        <blockquote className="mt-2 border-l-2 border-amber-600/60 pl-3">
          <p className="text-sm italic leading-relaxed text-neutral-100">&ldquo;{vp.text}&rdquo;</p>
        </blockquote>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">{vp.teaches}</p>
        <ul className="mt-2 space-y-1.5 text-sm text-neutral-300">{vp.lessons.map((l) => <li key={l} className="flex gap-2"><span className="text-emerald-400">•</span>{l}</li>)}</ul>
        <p className="mt-3 rounded-lg bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200"><span className="font-semibold text-indigo-300">Try today: </span>{vp.tryToday}</p>
        <p className="mt-3 text-xs text-neutral-500">One verse a day: day of the month = chapter. Read the whole chapter below when you can.</p>
        <Link href={`/bible/${PROVERBS_BOOK_ID}/${chapter}`} className="mt-3 inline-flex h-11 items-center gap-2 rounded-lg bg-amber-600/20 px-4 text-sm font-medium text-amber-100 hover:bg-amber-600/30">
          <BookOpen size={16} /> Read Proverbs {chapter}
        </Link>

        {saved && <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">Saved ✓</p>}
        <form action={saveProverbsDay} className="mt-4 space-y-2">
          <input type="hidden" name="day" value={today} />
          <input type="hidden" name="chapter" value={chapter} />
          <label className="block text-xs text-neutral-400">How I will apply it today
            <Textarea name="reflection" rows={2} maxLength={500} defaultValue={todayRow?.reflection ?? ""} className="mt-1" />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" className="h-11 flex-1 justify-center sm:flex-none">
              <Check size={15} /> {todayRow ? "Update" : "Mark as read"}
            </Button>
            {todayRow && (
              <button formAction={unmarkProverbsDay} className="h-11 rounded-lg px-3 text-xs text-neutral-500 hover:text-neutral-300" type="submit">Undo</button>
            )}
          </div>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {last7.map((d) => (
              <span key={d} title={formatDate(d)} className={`h-5 w-5 rounded-md ${have.has(d) ? "bg-amber-500" : "bg-neutral-800"}`} />
            ))}
          </div>
          <p className="text-xs text-neutral-400">{streak} day{streak === 1 ? "" : "s"} in a row · {rows.length} read in total</p>
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">When you feel…</h2>
        <div className="space-y-2">
          {MOMENTS.map((m) => (
            <details key={m.feel} className="rounded-lg border border-neutral-800 px-3 py-2.5">
              <summary className="cursor-pointer text-sm text-neutral-200">{m.feel}</summary>
              <p className="mt-2 text-sm italic leading-relaxed text-neutral-100">&ldquo;{VERSES[m.ref]}&rdquo;</p>
              <p className="mt-1 text-xs text-neutral-500">{refLabel(m.ref)}</p>
            </details>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="mb-1 text-sm font-semibold text-neutral-100">Paths of guidance</h2>
        <p className="mb-2 text-xs text-neutral-500">Fifteen themes from Proverbs (KJV) for doing life well, each tied to the rules. Paths that match this month&apos;s focus are marked.</p>
        <div className="space-y-2">
          {PROVERBS_PATHS.map((p) => {
            const fits = p.ruleNums.some((n) => focusRules.has(n));
            return (
              <details key={p.key} className="group rounded-xl border border-neutral-800 bg-neutral-900/50 open:bg-neutral-900">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-50">{p.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">{p.summary}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {fits && <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-200">Fits this month</span>}
                    <span className="text-[10px] text-neutral-500">{p.rules}</span>
                  </div>
                </summary>
                <div className="space-y-3 border-t border-neutral-800 px-4 py-3">
                  {p.verses.map((ref) => (
                    <blockquote key={ref} className="border-l-2 border-amber-600/60 pl-3">
                      <p className="text-sm italic leading-relaxed text-neutral-100">&ldquo;{VERSES[ref]}&rdquo;</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{refLabel(ref)}</p>
                    </blockquote>
                  ))}
                  <p className="rounded-lg bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200"><span className="font-semibold text-indigo-300">Do today: </span>{p.practise}</p>
                </div>
              </details>
            );
          })}
        </div>
      </div>

      {recent.length > 0 && (
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Your recent reflections</h2>
          <ul className="space-y-2 text-sm">
            {recent.map((r) => (
              <li key={r.day} className="text-neutral-300"><span className="text-xs text-neutral-500">{formatDate(r.day)} · Proverbs {r.chapter}</span><br />{r.reflection}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
