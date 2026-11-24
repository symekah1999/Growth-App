import Link from "next/link";
import { and, eq, gte, lte } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { todontLogs } from "@/db/schema-life";
import { PILLARS } from "@/db/seed-data/pillars";
import { RULES, SCORECARD } from "@/db/seed-data/challenge";
import { requireUser } from "@/lib/auth";
import { DEFAULT_END, DEFAULT_START, loadChallenge, nairobiToday, phaseInfo, stats } from "@/lib/challenge";
import { addDaysISO, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui";
import { Bar, Slide, Stat } from "@/components/Recap";

export const dynamic = "force-dynamic";

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export default async function ChallengeRecap() {
  const user = await requireUser();
  const today = nairobiToday();
  const data = await loadChallenge(user.id);
  if (!data) {
    return <Card><p className="text-sm text-neutral-300">Set up the challenge first. <Link href="/challenge" className="underline">Go to the challenge</Link></p></Card>;
  }
  const plan = data.plan ?? { startDate: DEFAULT_START, endDate: DEFAULT_END, headline: "", why: "" };
  const phase = phaseInfo(plan, today);
  const until = today < plan.endDate ? today : plan.endDate;
  const inRange = (d: string) => d >= plan.startDate && d <= until;
  const days = data.days.filter((d) => inRange(d.day));
  const logged = days.filter((d) => d.score > 0);
  const st = stats(data.days, until, plan.startDate);

  // longest run of consecutive logged days
  const loggedSet = new Set(logged.map((d) => d.day));
  let best = 0;
  let run = 0;
  for (let d = plan.startDate; d <= until; d = addDaysISO(d, 1)) {
    run = loggedSet.has(d) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  const avgScore = avg(logged.map((d) => d.score));
  const deep = days.reduce((s, d) => s + (d.deepBlocks ?? 0), 0);
  const trained = days.filter((d) => (d.checks as Record<string, boolean>)?.trained).length;
  const sleep = avg(days.map((d) => Number(d.sleepHours)).filter((x) => Number.isFinite(x) && x > 0));
  const social = avg(days.map((d) => d.socialMinutes).filter((x): x is number => x !== null && x !== undefined));

  const rituals = (data.rituals ?? []).filter((r) => inRange(r.day));
  const mornings = rituals.filter((r) => r.kind === "morning").length;
  const evenings = rituals.filter((r) => r.kind === "evening").length;
  const proverbs = (data.proverbs ?? []).filter((p) => inRange(p.day));
  const wild = (data.wild ?? []).filter((w) => inRange(w.day));
  const pillars = (data.pillars ?? []).filter((p) => inRange(p.day));
  const pillarDays = new Set(pillars.map((p) => p.day)).size;
  const perPillar = PILLARS.map((p) => ({ p, n: pillars.filter((x) => x.pillar === p.n).length })).sort((a, b) => b.n - a.n);
  const ruleWeeks = (data.ruleWeeks ?? []).filter((r) => r.weekStart >= addDaysISO(plan.startDate, -6) && r.weekStart <= until);
  const keptPct = ruleWeeks.length ? Math.round((ruleWeeks.reduce((s, r) => s + (r.status === "kept" ? 1 : r.status === "partly" ? 0.5 : 0), 0) / ruleWeeks.length) * 100) : null;
  const perRule = RULES.map((r) => {
    const rows = ruleWeeks.filter((x) => x.rule === r.n);
    return { r, pct: rows.length ? Math.round((rows.reduce((s, x) => s + (x.status === "kept" ? 1 : x.status === "partly" ? 0.5 : 0), 0) / rows.length) * 100) : null };
  }).filter((x) => x.pct !== null) as { r: (typeof RULES)[number]; pct: number }[];
  const td = await db.select({ held: todontLogs.held }).from(todontLogs).where(and(eq(todontLogs.userId, user.id), gte(todontLogs.day, plan.startDate), lte(todontLogs.day, until))).catch(() => []);
  const holdPct = td.length ? Math.round((td.filter((t) => t.held).length / td.length) * 100) : null;
  const setbacks = data.setbacks.filter((s) => inRange(s.day));
  const reviews = data.reviews.filter((r) => inRange(r.weekEnding));

  const reflections = [
    ...proverbs.filter((p) => p.reflection).map((p) => ({ day: p.day, text: p.reflection, src: `Proverbs ${p.chapter}` })),
    ...wild.filter((w) => w.reflection).map((w) => ({ day: w.day, text: w.reflection, src: "Apex" })),
    ...rituals.filter((r) => r.kind === "evening" && r.answers?.aarFix).map((r) => ({ day: r.day, text: r.answers.aarFix, src: "Evening fix" })),
  ].sort((a, b) => (a.day < b.day ? -1 : 1));
  const picks = reflections.length <= 4 ? reflections : [0, 1, 2, 3].map((i) => reflections[Math.floor((i * (reflections.length - 1)) / 3)]);

  const scoreRows = SCORECARD.map((m) => ({ m, row: data.scorecard.find((s) => s.measure === m.key) })).filter((x) => x.row && (x.row.baseline || x.row.month3 || x.row.month6));

  return (
    <div className="space-y-4">
      <Link href="/challenge" className="inline-flex h-10 items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-100"><ArrowLeft size={15} /> Back to the challenge</Link>

      <Slide kicker={phase.finished ? "Six months, complete" : `Recap so far · day ${Math.max(0, phase.dayNo)} of ${phase.total}`} title={phase.finished ? "You disappeared, and you came back different." : "Here is what you have built so far."} tint="from-amber-500/20">
        <p className="text-sm text-neutral-300">{formatDate(plan.startDate)} to {formatDate(plan.endDate)}{phase.finished ? "" : `. The full recap completes on ${formatDate(plan.endDate)}.`}</p>
        {plan.headline && <p className="mt-2 text-sm text-neutral-200"><span className="text-neutral-500">Headline target:</span> {plan.headline}</p>}
      </Slide>

      <Slide kicker="Showing up" title={`${logged.length} days logged`}>
        <div className="grid grid-cols-3 gap-2">
          <Stat value={best} label="longest logged streak" />
          <Stat value={avgScore === null ? "–" : avgScore.toFixed(1)} label="average score / 7" />
          <Stat value={st.missedDates.length} label="days missed" tone="text-red-300" />
        </div>
      </Slide>

      <Slide kicker="The engine" title={`${deep} deep-work blocks`} tint="from-emerald-500/15">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat value={trained} label="days trained" />
          <Stat value={st.longestClean} label="longest clean streak" />
          <Stat value={sleep === null ? "–" : sleep.toFixed(1)} label="average sleep (h)" />
          <Stat value={social === null ? "–" : Math.round(social)} label="avg social min / day" />
        </div>
      </Slide>

      <Slide kicker="Rituals and the inner life" title={`${mornings + evenings} rituals completed`} tint="from-fuchsia-500/15">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat value={mornings} label="mornings" />
          <Stat value={evenings} label="evenings" />
          <Stat value={proverbs.length} label="Proverbs days" />
          <Stat value={wild.length} label="apex lessons" />
        </div>
        {holdPct !== null && <p className="mt-3 text-sm text-neutral-300">To-don&apos;ts: held the line {holdPct}% of the time across {td.length} logs.</p>}
      </Slide>

      {pillarDays > 0 && (
        <Slide kicker="The ten pillars" title={`Strongest: ${perPillar[0].p.line}`}>
          <div className="space-y-2.5">
            {perPillar.map(({ p, n }) => <Bar key={p.key} label={p.line} pct={Math.round((n / pillarDays) * 100)} />)}
          </div>
          <p className="mt-3 text-xs text-neutral-500">Share of the {pillarDays} days you scored pillars.</p>
        </Slide>
      )}

      {perRule.length > 0 && (
        <Slide kicker="The 15 rules" title={keptPct === null ? "Rules" : `${keptPct}% kept`} tint="from-sky-500/15">
          <div className="space-y-2.5">
            {perRule.sort((a, b) => b.pct - a.pct).map(({ r, pct }) => <Bar key={r.n} label={`${r.n}. ${r.slogan}`} pct={pct} />)}
          </div>
        </Slide>
      )}

      {scoreRows.length > 0 && (
        <Slide kicker="Before and after" title="Your scorecard" tint="from-amber-500/15">
          <div className="space-y-2">
            {scoreRows.map(({ m, row }) => (
              <div key={m.key} className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-3 text-sm">
                <p className="font-medium text-neutral-100">{m.label}</p>
                <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                  <p><span className="block text-neutral-500">Baseline</span><span className="text-neutral-200">{row!.baseline || "–"}</span></p>
                  <p><span className="block text-neutral-500">Month 3</span><span className="text-neutral-200">{row!.month3 || "–"}</span></p>
                  <p><span className="block text-neutral-500">Month 6</span><span className="text-neutral-200">{row!.month6 || "–"}</span></p>
                </div>
              </div>
            ))}
          </div>
        </Slide>
      )}

      {picks.length > 0 && (
        <Slide kicker="In your own words" title="Things you wrote along the way" tint="from-rose-500/15">
          <div className="space-y-3">
            {picks.map((p, i) => (
              <blockquote key={i} className="border-l-2 border-amber-500/60 pl-3">
                <p className="text-base italic leading-relaxed text-neutral-100">&ldquo;{p.text}&rdquo;</p>
                <p className="mt-0.5 text-xs text-neutral-500">{formatDate(p.day)} · {p.src}</p>
              </blockquote>
            ))}
          </div>
        </Slide>
      )}

      <Slide kicker="Falling and rising" title={`${setbacks.length} setback${setbacks.length === 1 ? "" : "s"} logged, ${reviews.length} weekly review${reviews.length === 1 ? "" : "s"}`}>
        {setbacks.length > 0 && setbacks[0].nextTime && <p className="text-sm text-neutral-300">Latest lesson: &ldquo;{setbacks[0].nextTime}&rdquo;</p>}
        <p className="mt-2 text-sm text-neutral-400">A just man falleth seven times, and riseth up again (Proverbs 24:16).</p>
      </Slide>
    </div>
  );
}
