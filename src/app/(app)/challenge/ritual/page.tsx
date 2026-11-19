import Link from "next/link";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { Card, Input, Textarea } from "@/components/ui";
import { DAILY_CHECKS, MONTHS } from "@/db/seed-data/challenge";
import { PILLARS, pillarForDay } from "@/db/seed-data/pillars";
import { animalForDay } from "@/db/seed-data/wild";
import { PROVERBS_BOOK_ID } from "@/db/seed-data/proverbs";
import { dailyProverb } from "@/db/seed-data/proverbs-daily";
import { DEFAULT_END, DEFAULT_START, loadChallenge, nairobiHour, nairobiToday, phaseInfo, ritualStreak } from "@/lib/challenge";
import { addDaysISO, formatDate } from "@/lib/utils";
import { completeEvening, completeMorning } from "../actions";
import { RitualFlow, type RitualStep } from "./RitualFlow";

export const dynamic = "force-dynamic";

const Title = ({ kicker, children }: { kicker?: string; children: ReactNode }) => (
  <div className="mb-4 pt-2">
    {kicker && <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{kicker}</p>}
    <h1 className="mt-1 text-3xl font-semibold leading-tight text-neutral-50">{children}</h1>
  </div>
);
const P = ({ children }: { children: ReactNode }) => <p className="mb-3 text-base leading-relaxed text-neutral-300">{children}</p>;
const Verse = ({ text, refLabel }: { text: string; refLabel: string }) => (
  <blockquote className="my-4 border-l-2 border-amber-500/60 pl-4">
    <p className="text-lg italic leading-relaxed text-neutral-100">&ldquo;{text}&rdquo;</p>
    <p className="mt-1 text-xs text-neutral-500">{refLabel} (KJV)</p>
  </blockquote>
);
const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="mb-4 block text-sm text-neutral-400">
    {label}
    <div className="mt-1.5">{children}</div>
  </label>
);

export default async function RitualPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const today = nairobiToday();
  const mode: "morning" | "evening" = sp.mode === "morning" || sp.mode === "evening" ? sp.mode : nairobiHour() < 14 ? "morning" : "evening";

  const data = await loadChallenge(user.id);
  if (!data || data.rituals === null || data.pillars === null || data.proverbs === null) {
    return (
      <Card className="border-amber-700/50">
        <p className="text-sm font-semibold text-amber-200">One-time setup needed</p>
        <p className="mt-1 text-sm text-neutral-300">
          Run <code className="rounded bg-neutral-800 px-1">challenge.sql</code>, <code className="rounded bg-neutral-800 px-1">challenge-2.sql</code>, <code className="rounded bg-neutral-800 px-1">challenge-4.sql</code> and{" "}
          <code className="rounded bg-neutral-800 px-1">challenge-5.sql</code> from <code className="rounded bg-neutral-800 px-1">drizzle/manual</code> in the Neon SQL editor, then refresh. <Link href="/challenge" className="underline">Back to the challenge</Link>
        </p>
      </Card>
    );
  }

  const plan = data.plan ?? { startDate: DEFAULT_START, endDate: DEFAULT_END };
  const phase = phaseInfo(plan, today);
  const streak = ritualStreak(data.rituals, today);
  const todayRow = data.days.find((d) => d.day === today);
  const yesterdayRow = data.days.find((d) => d.day === addDaysISO(today, -1));
  const mine = (kind: string) => data.rituals!.find((r) => r.day === today && r.kind === kind)?.answers ?? {};
  const morning = mine("morning");
  const evening = mine("evening");
  const dateLabel = formatDate(today);

  const month = phase.started && !phase.finished ? MONTHS[phase.month - 1] : null;
  const dayLine = phase.finished ? "The challenge is complete" : phase.started ? `Day ${phase.dayNo} of ${phase.total}` : `Starts in ${Math.abs(phase.dayNo - 1)} days`;

  let steps: RitualStep[];
  let action: (fd: FormData) => void | Promise<void>;
  let finishLabel: string;

  if (mode === "morning") {
    action = completeMorning;
    finishLabel = "Start the day";
    const vp = dailyProverb(today);
    const chapter = vp.chapter;
    const pillar = pillarForDay(today);
    const animal = animalForDay(today);
    const prefill = morning.task1 ?? todayRow?.tomorrowTask ?? yesterdayRow?.tomorrowTask ?? "";

    steps = [
      {
        key: "hello", label: "Good morning",
        node: (
          <>
            <Title kicker={`${dateLabel} · ${dayLine}`}>Good morning, Shadrack.</Title>
            {month && (
              <Card className="mb-3 !p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Month {month.n}: {month.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-300">{month.focus}</p>
              </Card>
            )}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-neutral-800 p-3">
                <p className="text-2xl font-semibold text-neutral-50">{yesterdayRow ? `${yesterdayRow.score}/7` : "–"}</p>
                <p className="text-xs text-neutral-500">yesterday</p>
              </div>
              <div className="rounded-xl border border-neutral-800 p-3">
                <p className="text-2xl font-semibold text-neutral-50">{streak}</p>
                <p className="text-xs text-neutral-500">day ritual streak</p>
              </div>
            </div>
            <p className="mt-5 text-sm text-neutral-500">Five minutes. Swipe or tap Next. Nothing else until this is done.</p>
          </>
        ),
      },
      {
        key: "pray", label: "Pray",
        node: (
          <>
            <Title kicker="1 minute">Start with God.</Title>
            <Verse text="If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him." refLabel="James 1:5" />
            <ul className="mb-4 space-y-2 text-base text-neutral-300">
              <li><span className="font-semibold text-amber-300">Thank</span> Him for three specific things.</li>
              <li><span className="font-semibold text-amber-300">Ask</span> for wisdom for today&apos;s decisions.</li>
              <li><span className="font-semibold text-amber-300">Surrender</span> what is not in your control.</li>
            </ul>
            <Field label="One line to Him (optional)"><Input name="prayer" maxLength={300} defaultValue={morning.prayer ?? ""} /></Field>
          </>
        ),
      },
      {
        key: "proverbs", label: `Proverbs ${vp.chapter}:${vp.verse}`,
        node: (
          <>
            <Title kicker="Today's verse">Proverbs {vp.chapter}:{vp.verse}</Title>
            <input type="hidden" name="chapter" value={chapter} />
            <Verse text={vp.text} refLabel={`Proverbs ${vp.chapter}:${vp.verse}`} />
            <div className="mb-3 rounded-xl border border-neutral-800 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">What it teaches</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-200">{vp.teaches}</p>
            </div>
            <div className="mb-3 rounded-xl border border-neutral-800 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Lessons to take</p>
              <ul className="mt-2 space-y-2 text-sm text-neutral-200">
                {vp.lessons.map((l) => <li key={l} className="flex gap-2"><span className="text-emerald-400">•</span>{l}</li>)}
              </ul>
            </div>
            <p className="mb-4 rounded-xl bg-neutral-900 px-4 py-3 text-sm text-neutral-200"><span className="font-semibold text-indigo-300">Try today: </span>{vp.tryToday}</p>
            <Field label="One line: how will I apply this today?"><Textarea name="reflection" rows={2} maxLength={500} defaultValue={morning.reflection ?? ""} /></Field>
            <p className="text-xs text-neutral-500"><Link className="underline" href={`/bible/${PROVERBS_BOOK_ID}/${chapter}`}>Read all of Proverbs {chapter}</Link> when you have time.</p>
          </>
        ),
      },
      {
        key: "mind", label: "Prepare the mind",
        node: (
          <>
            <Title kicker="Stoic premeditation · 2 minutes">Rehearse the day.</Title>
            <P>Only your choices and effort are up to you. Name what could go wrong, then decide now how you will respond well.</P>
            <Field label="What could go wrong or test me today?"><Input name="risk" maxLength={300} defaultValue={morning.risk ?? ""} /></Field>
            <Field label="How will I respond well?"><Input name="response" maxLength={300} defaultValue={morning.response ?? ""} /></Field>
          </>
        ),
      },
      {
        key: "pillar", label: "Pillar and animal",
        node: (
          <>
            <Title kicker="Today's focus">{pillar.line}</Title>
            <P>{pillar.essence}</P>
            <p className="mb-5 rounded-xl bg-neutral-900 px-4 py-3 text-sm text-neutral-200"><span className="font-semibold text-indigo-300">Minimum today: </span>{pillar.minimum}</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Animal of the day</p>
            <p className="mt-1 text-xl font-semibold text-neutral-50">{animal.name}</p>
            <p className="mb-2 text-sm text-neutral-400">{animal.tagline}</p>
            <p className="rounded-xl bg-neutral-900 px-4 py-3 text-sm text-neutral-200"><span className="font-semibold text-indigo-300">Do today: </span>{animal.practise}</p>
          </>
        ),
      },
      {
        key: "tasks", label: "The decisive task",
        node: (
          <>
            <Title kicker="Strategist's move">What matters most today?</Title>
            <P>One task that moves your target further than anything else. Do it first, before email, before feeds.</P>
            <Field label="The one decisive task"><Input name="task1" maxLength={300} defaultValue={prefill} /></Field>
            <Field label="Also today (optional)"><Input name="task2" maxLength={300} defaultValue={morning.task2 ?? ""} /></Field>
            <Field label="And (optional)"><Input name="task3" maxLength={300} defaultValue={morning.task3 ?? ""} /></Field>
          </>
        ),
      },
      {
        key: "go", label: "Go",
        node: (
          <>
            <Title kicker="Ready">Now go and do it.</Title>
            <P>Stand tall. Make the bed. Do the hard thing first. Come back tonight for the evening ritual.</P>
            <div className="rounded-xl border border-neutral-800 p-4 text-sm text-neutral-300">
              <p className="mb-2 font-semibold text-neutral-100">Your day at a glance</p>
              <ul className="space-y-1.5">
                <li>Training or walk</li>
                <li>Two deep-work blocks, phone away</li>
                <li>One small act of courage</li>
                <li>Social apps under 30 minutes</li>
                <li>Evening ritual before bed</li>
              </ul>
            </div>
          </>
        ),
      },
    ];
  } else {
    action = completeEvening;
    finishLabel = "Close the day";
    const doneSet = new Set(data.pillars.filter((p) => p.day === today).map((p) => p.pillar));
    const checks = (todayRow?.checks ?? {}) as Record<string, boolean>;
    const task = morning.task1;

    steps = [
      {
        key: "hello", label: "Evening",
        node: (
          <>
            <Title kicker={`${dateLabel} · ${dayLine}`}>Close the day well.</Title>
            {task ? (
              <Card className="mb-3 !p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">This morning you said</p>
                <p className="mt-1 text-base text-neutral-100">{task}</p>
                <p className="mt-1 text-xs text-neutral-500">Did it get done? Be honest in the next steps.</p>
              </Card>
            ) : (
              <P>You did not set a decisive task this morning. That is fine. Let tonight set up tomorrow.</P>
            )}
            <p className="text-sm text-neutral-500">Five minutes: score the day, review it, give thanks, plan tomorrow.</p>
          </>
        ),
      },
      {
        key: "seven", label: "The 7 points",
        node: (
          <>
            <Title kicker="Soldier's report">Score the day.</Title>
            <div className="mb-4 space-y-1.5">
              {DAILY_CHECKS.map((c) => (
                <label key={c.key} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 px-3 py-2 text-sm text-neutral-200 active:bg-neutral-800">
                  <input type="checkbox" name={c.key} defaultChecked={!!checks[c.key]} className="h-5 w-5 shrink-0 accent-indigo-500" />
                  <span className="flex-1">{c.label}</span>
                  <span className="text-[10px] text-neutral-600">R{c.rule}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-neutral-400">Deep blocks<Input name="deepBlocks" type="number" min={0} max={12} inputMode="numeric" defaultValue={todayRow?.deepBlocks ?? ""} className="mt-1" /></label>
              <label className="text-xs text-neutral-400">Social min<Input name="socialMinutes" type="number" min={0} max={1440} inputMode="numeric" defaultValue={todayRow?.socialMinutes ?? ""} className="mt-1" /></label>
              <label className="text-xs text-neutral-400">Sleep (h)<Input name="sleepHours" type="number" step="0.5" min={0} max={24} inputMode="decimal" defaultValue={todayRow?.sleepHours ?? ""} className="mt-1" /></label>
            </div>
          </>
        ),
      },
      {
        key: "pillars", label: "Ten pillars",
        node: (
          <>
            <Title kicker="The whole person">Which pillars did you live?</Title>
            <div className="space-y-1.5">
              {PILLARS.map((p) => (
                <label key={p.key} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 px-3 py-2 active:bg-neutral-800">
                  <input type="checkbox" name={`p${p.n}`} defaultChecked={doneSet.has(p.n)} className="h-5 w-5 shrink-0 accent-indigo-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-neutral-100">{p.n}. {p.line}</span>
                    <span className="block text-xs text-neutral-500">{p.minimum}</span>
                  </span>
                </label>
              ))}
            </div>
          </>
        ),
      },
      {
        key: "aar", label: "After-action review",
        node: (
          <>
            <Title kicker="Soldier's debrief">What happened?</Title>
            <P>Facts, not feelings. No self-hate. Find the fix.</P>
            <Field label="What was supposed to happen?"><Textarea name="aarPlan" rows={2} maxLength={500} defaultValue={evening.aarPlan ?? morning.task1 ?? ""} /></Field>
            <Field label="What actually happened?"><Textarea name="aarReality" rows={2} maxLength={500} defaultValue={evening.aarReality ?? ""} /></Field>
            <Field label="One fix for tomorrow"><Textarea name="aarFix" rows={2} maxLength={500} defaultValue={evening.aarFix ?? ""} /></Field>
          </>
        ),
      },
      {
        key: "stoic", label: "Stoic review",
        node: (
          <>
            <Title kicker="Seneca's evening questions">Judge the day gently.</Title>
            <Field label="What did I do well?"><Input name="stoicWell" maxLength={300} defaultValue={evening.stoicWell ?? ""} /></Field>
            <Field label="What did I do badly?"><Input name="stoicBad" maxLength={300} defaultValue={evening.stoicBad ?? ""} /></Field>
            <Field label="What did I leave undone?"><Input name="stoicLeft" maxLength={300} defaultValue={evening.stoicLeft ?? ""} /></Field>
          </>
        ),
      },
      {
        key: "thanks", label: "Gratitude",
        node: (
          <>
            <Title kicker="Poet's heart">Three things you are grateful for.</Title>
            <P>Be specific. &ldquo;Mama&apos;s call this afternoon&rdquo; beats &ldquo;family&rdquo;.</P>
            <Field label="1"><Input name="g1" maxLength={200} defaultValue={evening.g1 ?? ""} /></Field>
            <Field label="2"><Input name="g2" maxLength={200} defaultValue={evening.g2 ?? ""} /></Field>
            <Field label="3"><Input name="g3" maxLength={200} defaultValue={evening.g3 ?? ""} /></Field>
          </>
        ),
      },
      {
        key: "tomorrow", label: "Tomorrow",
        node: (
          <>
            <Title kicker="Farmer's habit">Set up tomorrow.</Title>
            <Field label="Tomorrow's first task"><Input name="tomorrowTask" maxLength={300} defaultValue={todayRow?.tomorrowTask ?? ""} /></Field>
            <P>Lay out your kit. Phone on the charger away from the bed. Lights out at your set time so you get 7 to 9 hours.</P>
            <p className="rounded-xl bg-neutral-900 px-4 py-3 text-sm text-neutral-300">Commit it to God: do your part, entrust the rest.</p>
          </>
        ),
      },
    ];
  }

  return <RitualFlow mode={mode} steps={steps} action={action} finishLabel={finishLabel} />;
}
