import Link from "next/link";
import { and, count, eq, gte, lt } from "drizzle-orm";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { gratitudeEntries } from "@/db/schema-gratitude";
import { lifeLessons } from "@/db/schema-lessons";
import { challengeDays, challengeRituals } from "@/db/schema-challenge";
import { todontLogs } from "@/db/schema-life";
import { YEAR_AREAS } from "@/db/seed-data/life";
import { requireUser } from "@/lib/auth";
import { nairobiToday } from "@/lib/challenge";
import { currentPlan, loadYear, yearInfo } from "@/lib/year";
import { addDaysISO, attempt, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui";
import { Bar, Slide, Stat } from "@/components/Recap";

export const dynamic = "force-dynamic";

const ord = (x: number) => `${x}${x % 100 >= 11 && x % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][x % 10] ?? "th"}`;
const n = async (p: PromiseLike<{ c: number }[]>) => {
  const r = await attempt(p, null);
  return r ? Number(r[0]?.c ?? 0) : null;
};

export default async function YearRecap({ searchParams }: { searchParams: Promise<{ age?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const today = nairobiToday();
  const data = await loadYear(user.id);
  const plan = data ? (sp.age && data.plans.find((p) => p.age === Number(sp.age))) || currentPlan(data.plans, today) : null;
  if (!data || !plan) {
    return <Card><p className="text-sm text-neutral-300">Create your year first. <Link href="/year" className="underline">Go to My year</Link></p></Card>;
  }
  const info = yearInfo(plan.startDate, today);
  const from = plan.startDate;
  const to = info.end; // exclusive

  const [journal, gratitude, lessons, logged, rituals] = await Promise.all([
    n(db.select({ c: count() }).from(journalEntries).where(and(eq(journalEntries.userId, user.id), gte(journalEntries.entryDate, from), lt(journalEntries.entryDate, to)))),
    n(db.select({ c: count() }).from(gratitudeEntries).where(and(eq(gratitudeEntries.userId, user.id), gte(gratitudeEntries.entryDate, from), lt(gratitudeEntries.entryDate, to)))),
    n(db.select({ c: count() }).from(lifeLessons).where(and(eq(lifeLessons.userId, user.id), gte(lifeLessons.learnedOn, from), lt(lifeLessons.learnedOn, to)))),
    n(db.select({ c: count() }).from(challengeDays).where(and(eq(challengeDays.userId, user.id), gte(challengeDays.day, from), lt(challengeDays.day, to)))),
    n(db.select({ c: count() }).from(challengeRituals).where(and(eq(challengeRituals.userId, user.id), gte(challengeRituals.day, from), lt(challengeRituals.day, to)))),
  ]);
  const td = await db.select({ held: todontLogs.held }).from(todontLogs).where(and(eq(todontLogs.userId, user.id), gte(todontLogs.day, from), lt(todontLogs.day, to))).catch(() => []);
  const holdPct = td.length ? Math.round((td.filter((t) => t.held).length / td.length) * 100) : null;

  const goals = plan.goals ?? {};
  const areas = YEAR_AREAS.filter((a) => goals[a.key]?.goal);
  const avgGoal = areas.length ? Math.round(areas.reduce((s, a) => s + (goals[a.key]?.progress ?? 0), 0) / areas.length) : null;
  const bucket = plan.bucket ?? [];
  const bucketDone = bucket.filter((b) => b.done);
  const reviews = data.reviews.filter((r) => r.age === plan.age);
  const months = reviews.filter((r) => r.kind === "month" && r.rating);
  const avgMonth = months.length ? (months.reduce((s, r) => s + (r.rating ?? 0), 0) / months.length).toFixed(1) : null;
  const bestMonth = [...months].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
  const letterOpen = plan.sealed && today >= info.end;

  return (
    <div className="space-y-4">
      <Link href={`/year?age=${plan.age}`} className="inline-flex h-10 items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-100"><ArrowLeft size={15} /> Back to Year {plan.age}</Link>

      <Slide kicker={info.finished ? `Year ${plan.age}, complete` : `Year ${plan.age} so far · day ${Math.max(0, info.day)} of ${info.total}`} title={plan.theme ? `The year of ${plan.theme}` : `Year ${plan.age}`} tint="from-fuchsia-500/20">
        <p className="text-sm text-neutral-300">{formatDate(from)} to {formatDate(addDaysISO(to, -1))}{info.finished ? "" : `. The full recap completes on your ${ord(plan.age + 1)} birthday.`}</p>
        {plan.vision && <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm italic text-neutral-200">&ldquo;{plan.vision}&rdquo;</p>}
      </Slide>

      {areas.length > 0 && (
        <Slide kicker="Goals by life area" title={`${avgGoal}% of the way`} tint="from-emerald-500/15">
          <div className="space-y-2.5">
            {areas.map((a) => <Bar key={a.key} label={`${a.label}: ${goals[a.key]!.goal}`} pct={goals[a.key]!.progress} />)}
          </div>
        </Slide>
      )}

      <Slide kicker={`${plan.age} for ${plan.age}`} title={`${bucketDone.length} of ${Math.max(plan.age, bucket.length)} done`} tint="from-amber-500/15">
        {bucketDone.length > 0 ? (
          <ul className="space-y-1 text-sm text-neutral-200">{bucketDone.map((b, i) => <li key={i}>✓ {b.text}</li>)}</ul>
        ) : (
          <p className="text-sm text-neutral-400">Nothing ticked off yet. Pick one this month.</p>
        )}
      </Slide>

      <Slide kicker="How the year felt" title={avgMonth ? `${avgMonth} / 10 on average` : "No monthly check-ins yet"}>
        <div className="grid grid-cols-6 gap-1.5">
          {info.months.map((m) => {
            const r = reviews.find((x) => x.kind === "month" && x.period === m.n);
            const shade = r?.rating ? (r.rating >= 8 ? "bg-emerald-500/70" : r.rating >= 5 ? "bg-amber-500/60" : "bg-red-500/60") : "bg-neutral-800";
            return (
              <div key={m.n} className={`flex h-12 flex-col items-center justify-center rounded-lg ${shade}`}>
                <span className="text-[10px] text-neutral-200">M{m.n}</span>
                <span className="text-sm font-semibold text-white">{r?.rating ?? "–"}</span>
              </div>
            );
          })}
        </div>
        {bestMonth?.wins && <p className="mt-3 text-sm text-neutral-300">Best month (M{bestMonth.period}): {bestMonth.wins}</p>}
      </Slide>

      <Slide kicker="Everything you logged" title="The year in numbers" tint="from-sky-500/15">
        <div className="grid grid-cols-3 gap-2">
          <Stat value={journal ?? "–"} label="journal entries" />
          <Stat value={gratitude ?? "–"} label="things you were grateful for" />
          <Stat value={lessons ?? "–"} label="lessons learned" />
          <Stat value={logged ?? "–"} label="challenge days logged" />
          <Stat value={rituals ?? "–"} label="rituals completed" />
          <Stat value={holdPct === null ? "–" : `${holdPct}%`} label="to-don'ts held" />
        </div>
      </Slide>

      <Slide kicker="Letter to yourself" title={letterOpen ? "Read what you wrote a year ago" : plan.sealed ? "Still sealed" : "No sealed letter"} tint="from-amber-500/20">
        {letterOpen ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-100">{plan.letter}</p>
        ) : plan.sealed ? (
          <p className="flex items-center gap-2 text-sm text-neutral-300"><Lock size={14} className="text-amber-300" /> Opens on {formatDate(info.end)}.</p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-neutral-300"><Mail size={14} /> Write and seal one on the <Link href={`/year?age=${plan.age}&tab=vision`} className="underline">Vision tab</Link>.</p>
        )}
      </Slide>
    </div>
  );
}
