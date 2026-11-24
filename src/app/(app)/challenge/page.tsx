import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { photoUrl } from "@/lib/images";
import { addDaysISO } from "@/lib/utils";
import { DEFAULT_END, DEFAULT_START, loadChallenge, nairobiToday, phaseInfo, ritualStreak, stats, weekStartOf } from "@/lib/challenge";
import { loadProgressData, weeklyReview } from "@/lib/progress";
import { TodayTab } from "./TodayTab";
import { RulesTab } from "./RulesTab";
import { PlanTab } from "./PlanTab";
import { ReviewTab } from "./ReviewTab";
import { ScoreTab } from "./ScoreTab";
import { GuideTab } from "./GuideTab";
import { chapterForDay } from "@/db/seed-data/proverbs";
import { PillarsTab } from "./PillarsTab";
import { WildTab } from "./WildTab";
import { KeepUpTab } from "./KeepUpTab";
import { ProverbsTab } from "./ProverbsTab";
import { TabFooter, TabNav, type TabItem } from "@/components/TabNav";

export const dynamic = "force-dynamic";

const TABS: Omit<TabItem, "href">[] = [
  { key: "today", label: "Today", icon: "today", group: "Every day", hint: "Rituals, today's verse and your 7 points for the day." },
  { key: "keepup", label: "Keep-up", icon: "keepup", group: "Every day", hint: "This week at a glance: which rules you kept and where you slipped." },
  { key: "rules", label: "15 rules", icon: "rules", group: "Every day", hint: "The 15 rules by phase. Tick a month once you have the proof." },
  { key: "proverbs", label: "Proverbs", icon: "proverbs", group: "Wisdom", hint: "Today's verse, what it teaches, and one thing to try." },
  { key: "pillars", label: "10 Pillars", icon: "pillars", group: "Wisdom", hint: "Check the ten pillars you lived today and see which is falling behind." },
  { key: "wild", label: "Apex", icon: "wild", group: "Wisdom", hint: "Longevity and life principles from apex animals, one a day." },
  { key: "review", label: "Review", icon: "review", group: "Track", hint: "Weekly reviews and setbacks, filed by month." },
  { key: "scorecard", label: "Scorecard", icon: "scorecard", group: "Track", hint: "Baseline, midpoint and final numbers side by side." },
  { key: "plan", label: "My terms", icon: "plan", group: "Setup", hint: "Your dates, your why and the headline you are working towards." },
  { key: "guide", label: "Guide", icon: "guide", group: "Setup", hint: "How the challenge works and how to use each section." },
];

export default async function ChallengePage({ searchParams }: { searchParams: Promise<{ tab?: string; d?: string; w?: string; p?: string; ritual?: string; restart?: string; restarted?: string; saved?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const tab = TABS.some((t) => t.key === sp.tab) ? sp.tab! : "today";
  const today = nairobiToday();
  const saved = sp.saved === "1";

  const data = await loadChallenge(user.id);

  const header = (
    <PageHeader
      image={photoUrl("progress")}
      title="6-Month Challenge"
      subtitle="Disappear for six months: remove the noise, build the engine, ship the proof. Based on your cheat sheet."
    />
  );

  if (!data) {
    return (
      <div>
        {header}
        <Card className="border-amber-700/50">
          <p className="text-sm font-semibold text-amber-200">One-time setup needed</p>
          <p className="mt-1 text-sm text-neutral-300">
            The challenge tables don&apos;t exist yet. Run <code className="rounded bg-neutral-800 px-1">drizzle/manual/challenge.sql</code> in the Neon SQL editor, then refresh this page.
          </p>
        </Card>
      </div>
    );
  }

  const plan = data.plan ?? { startDate: DEFAULT_START, endDate: DEFAULT_END, why: "", headline: "", headlineBy: null };
  const phase = phaseInfo(plan, today);
  const st = stats(data.days, today, plan.startDate);
  const day = sp.d && /^\d{4}-\d{2}-\d{2}$/.test(sp.d) && sp.d <= today ? sp.d : today;

  let other = { habitPct: null as number | null, journalDays: 0, recovery: [] as { name: string; days: number }[] };
  if (tab === "today") {
    try {
      const prog = await loadProgressData(user.id);
      const rev = weeklyReview(prog, today);
      const done = rev.habitWeek.reduce((s, h) => s + Math.min(h.done, h.target), 0);
      const target = rev.habitWeek.reduce((s, h) => s + h.target, 0);
      other = {
        habitPct: target ? Math.round((done / target) * 100) : null,
        journalDays: rev.journalDays,
        recovery: rev.recoveryDays.map((r) => ({ name: r.name, days: r.days })),
      };
    } catch {
      // other sections are optional context
    }
  }

  const thisWeek = weekStartOf(today);
  const week = sp.w && /^\d{4}-\d{2}-\d{2}$/.test(sp.w) && weekStartOf(sp.w) <= thisWeek ? weekStartOf(sp.w) : thisWeek;
  const part2 = data.ruleWeeks !== null && data.proverbs !== null;
  const setup2 = (
    <Card className="border-amber-700/50">
      <p className="text-sm font-semibold text-amber-200">One-time setup needed</p>
      <p className="mt-1 text-sm text-neutral-300">
        Run <code className="rounded bg-neutral-800 px-1">drizzle/manual/challenge-2.sql</code> in the Neon SQL editor, then refresh this page.
      </p>
    </Card>
  );
  const mid = addDaysISO(plan.startDate, 91);
  const nav: TabItem[] = [
    ...TABS.map((t) => ({ ...t, href: `/challenge?tab=${t.key}` })),
    { key: "recap", label: "Recap", icon: "recap", href: "/challenge/recap", group: "Track", hint: "The story of your challenge so far, in numbers.", accent: true },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {header}
      <TabNav tabs={nav} active={tab} />

      {tab === "today" && sp.restarted === "1" && <p className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">Challenge restarted. Day 1 is your new start date.</p>}
      {tab === "today" && data.rituals && (() => {
        const m = data.rituals.some((r) => r.day === today && r.kind === "morning");
        const e = data.rituals.some((r) => r.day === today && r.kind === "evening");
        const streak = ritualStreak(data.rituals, today);
        return (
          <div className="mb-4">
            {sp.ritual && <p className="mb-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">{sp.ritual === "morning" ? "Morning ritual complete. Go and win the day." : "Evening ritual complete. Rest well."}{streak > 0 ? ` ${streak}-day ritual streak.` : ""}</p>}
            <div className="grid grid-cols-2 gap-2">
              <Link href="/challenge/ritual?mode=morning" className={`rounded-xl border px-4 py-3 active:opacity-80 ${m ? "border-emerald-800/60 bg-emerald-500/5" : "border-amber-700/50 bg-amber-500/10"}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Morning ritual</p>
                <p className="mt-0.5 text-sm text-neutral-100">{m ? "Done ✓" : "Start (5 min)"}</p>
              </Link>
              <Link href="/challenge/ritual?mode=evening" className={`rounded-xl border px-4 py-3 active:opacity-80 ${e ? "border-emerald-800/60 bg-emerald-500/5" : "border-indigo-700/50 bg-indigo-500/10"}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Evening ritual</p>
                <p className="mt-0.5 text-sm text-neutral-100">{e ? "Done ✓" : "Start (5 min)"}</p>
              </Link>
            </div>
          </div>
        );
      })()}
      {tab === "today" && data.proverbs && (
        <Link href="/challenge?tab=proverbs" className="mb-4 flex min-h-14 items-center justify-between gap-3 rounded-xl border border-amber-800/40 bg-amber-500/5 px-4 py-3 active:bg-amber-500/10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Proverbs today</p>
            <p className="text-sm text-neutral-100">Chapter {chapterForDay(today)}</p>
          </div>
          <span className="text-xs text-neutral-400">{data.proverbs.some((r) => r.day === today) ? "Read ✓" : "Tap to read"}</span>
        </Link>
      )}
      {tab === "today" && <TodayTab plan={plan} hasPlan={!!data.plan} days={data.days} day={day} today={today} phase={phase} st={st} saved={saved} other={other} />}
      {tab === "rules" && <RulesTab checks={data.ruleChecks} month={phase.month} started={phase.started && !phase.finished} />}
      {tab === "plan" && <PlanTab plan={data.plan} scorecard={data.scorecard} saved={saved} restart={sp.restart === "confirm"} />}
      {tab === "review" && <ReviewTab reviews={data.reviews} setbacks={data.setbacks} st={st} today={today} saved={saved} />}
      {tab === "scorecard" && <ScoreTab rows={data.scorecard} st={st} saved={saved} start={plan.startDate} mid={mid} end={plan.endDate} />}
      {tab === "keepup" && (part2 ? <KeepUpTab rows={data.ruleWeeks!} days={data.days} week={week} thisWeek={thisWeek} start={plan.startDate} /> : setup2)}
      {tab === "proverbs" && (part2 ? <ProverbsTab rows={data.proverbs!} today={today} month={phase.month} started={phase.started && !phase.finished} saved={saved} /> : setup2)}
      {tab === "pillars" && (
        data.pillars ? (
          <PillarsTab rows={data.pillars} today={today} pillar={sp.p} month={phase.month} started={phase.started && !phase.finished} saved={saved} />
        ) : (
          <Card className="border-amber-700/50">
            <p className="text-sm font-semibold text-amber-200">One-time setup needed</p>
            <p className="mt-1 text-sm text-neutral-300">
              Run <code className="rounded bg-neutral-800 px-1">drizzle/manual/challenge-4.sql</code> in the Neon SQL editor, then refresh this page.
            </p>
          </Card>
        )
      )}
      {tab === "wild" && (
        data.wild ? (
          <WildTab rows={data.wild} today={today} month={phase.month} started={phase.started && !phase.finished} saved={saved} />
        ) : (
          <Card className="border-amber-700/50">
            <p className="text-sm font-semibold text-amber-200">One-time setup needed</p>
            <p className="mt-1 text-sm text-neutral-300">
              Run <code className="rounded bg-neutral-800 px-1">drizzle/manual/challenge-3.sql</code> in the Neon SQL editor, then refresh this page.
            </p>
          </Card>
        )
      )}
      {tab === "guide" && <GuideTab />}
      <TabFooter tabs={nav} active={tab} />
    </div>
  );
}
