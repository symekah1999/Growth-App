import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { photoUrl } from "@/lib/images";
import { addDaysISO } from "@/lib/utils";
import { DEFAULT_END, DEFAULT_START, loadChallenge, nairobiToday, phaseInfo, stats } from "@/lib/challenge";
import { loadProgressData, weeklyReview } from "@/lib/progress";
import { TodayTab } from "./TodayTab";
import { RulesTab } from "./RulesTab";
import { PlanTab } from "./PlanTab";
import { ReviewTab } from "./ReviewTab";
import { ScoreTab } from "./ScoreTab";
import { GuideTab } from "./GuideTab";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "today", label: "Today" },
  { key: "rules", label: "15 rules" },
  { key: "plan", label: "My terms" },
  { key: "review", label: "Review" },
  { key: "scorecard", label: "Scorecard" },
  { key: "guide", label: "Guide" },
] as const;

export default async function ChallengePage({ searchParams }: { searchParams: Promise<{ tab?: string; d?: string; saved?: string }> }) {
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

  const mid = addDaysISO(plan.startDate, 91);

  return (
    <div>
      {header}
      <div className="-mx-4 mb-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/challenge?tab=${t.key}`}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${tab === t.key ? "bg-indigo-600/20 text-indigo-200" : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "today" && <TodayTab plan={plan} hasPlan={!!data.plan} days={data.days} day={day} today={today} phase={phase} st={st} saved={saved} other={other} />}
      {tab === "rules" && <RulesTab checks={data.ruleChecks} month={phase.month} started={phase.started && !phase.finished} />}
      {tab === "plan" && <PlanTab plan={data.plan} scorecard={data.scorecard} saved={saved} />}
      {tab === "review" && <ReviewTab reviews={data.reviews} setbacks={data.setbacks} st={st} today={today} saved={saved} />}
      {tab === "scorecard" && <ScoreTab rows={data.scorecard} st={st} saved={saved} start={plan.startDate} mid={mid} end={plan.endDate} />}
      {tab === "guide" && <GuideTab />}
    </div>
  );
}
