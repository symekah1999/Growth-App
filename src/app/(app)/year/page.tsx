import Link from "next/link";
import { Cake, Check, Lock, Mail, Plus, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { nairobiToday } from "@/lib/challenge";
import { addDaysISO, formatDate } from "@/lib/utils";
import { photoUrl } from "@/lib/images";
import { Button, Card, Input, PageHeader, Textarea } from "@/components/ui";
import { Folder } from "@/components/Folders";
import { TabFooter, TabNav, type TabItem } from "@/components/TabNav";
import { RulesTab } from "./RulesTab";
import { QUARTER_HINTS, THEME_WORDS, YEAR_AREAS, affirmationForDay } from "@/db/seed-data/life";
import { currentPlan, loadYear, yearInfo } from "@/lib/year";
import { addBucketItem, createYearPlan, removeBucketItem, saveQuarterFocus, saveYearGoal, saveYearReview, saveYearVision, toggleBucketItem } from "./actions";

export const dynamic = "force-dynamic";

const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
const lastDay = (to: string) => addDaysISO(to, -1);

const LETTER_GUIDE: { title: string; body: string }[] = [
  { title: "Where you are right now", body: "Describe your life today plainly: work, money, health, faith, the people closest to you, what a normal day looks like. If you are at a turning point, say so. A year from now these details will be the most surprising part to reread, because you will have forgotten how today felt. A list of goals is not enough, since the Goals tab already holds those. Think of this as a time capsule." },
  { title: "What you are carrying", body: "Write down what worries you, what you are unsure about, what you are quietly afraid of and what you are struggling with. You will only reread this once, so be honest. Reading it later shows which fears came true and which never did, and that is one of the most useful things the letter can teach you." },
  { title: "What you hope for", body: "These are hopes, not targets: who you hope to have become, what you hope you have learned, and where you would like to be in your walk with God. Write it as \"I hope by now you...\". Hopes are softer than goals and often more revealing." },
  { title: "Promises to yourself", body: "Choose two or three things you are committing to this year: how you will treat people, what you will stop tolerating, what you will show up for every day. Keep them few so they carry weight." },
  { title: "Questions for the man reading this", body: "Ask him things you can only answer in a year. Did you keep going when it got hard? Did the job come, and was it what you wanted? Are you closer to God? Who turned out to matter? These make the opening feel like a real conversation." },
  { title: "Gratitude for the year behind you", body: "Name what the last year gave you, including the hard parts and what they taught you. It gives the letter perspective and reminds the reader how far he has come." },
  { title: "A blessing or verse", body: "End with something you would want to hear on a hard day: a prayer, a verse that matters to you now, or simply \"I am proud of you for...\"." },
];

const LETTER_TIPS = [
  "Write by hand first if that helps, then type it in. One sitting of 20 to 40 minutes is enough.",
  "Write in your own voice. It is not meant to be impressive; it is meant to be true.",
  "Leave out passwords, account numbers and anything you would be uncomfortable seeing on a screen later.",
  "Only seal it when you are happy with it. After that you cannot read or edit it until your next birthday.",
];

function LetterGuide({ age, empty }: { age: number; empty: boolean }) {
  return (
    <details open={empty} className="mt-3 rounded-lg border border-amber-800/30 bg-neutral-950/40 p-3">
      <summary className="cursor-pointer text-sm font-medium text-amber-200">How to write it: 7 parts to cover</summary>
      <p className="mt-2 text-xs text-neutral-400">Write to the man reading this on your {ord(age + 1)} birthday. Be honest and specific about where you are now. Work through the parts in order, or in any order that flows.</p>
      <ol className="mt-3 space-y-2.5">
        {LETTER_GUIDE.map((g, i) => (
          <li key={g.title} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-xs font-semibold text-amber-200">{i + 1}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-100">{g.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">{g.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">Tips</p>
      <ul className="mt-1.5 space-y-1.5">
        {LETTER_TIPS.map((t) => (
          <li key={t} className="text-xs leading-relaxed text-neutral-400">• {t}</li>
        ))}
      </ul>
    </details>
  );
}

function Saved() {
  return <p className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">Saved ✓</p>;
}

function ReviewForm({ age, kind, period, existing, label }: { age: number; kind: "month" | "quarter"; period: number; existing?: { rating: number | null; wins: string; lessons: string; adjust: string }; label: string }) {
  return (
    <form action={saveYearReview} className="space-y-2.5">
      <input type="hidden" name="age" value={age} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="period" value={period} />
      <label className="block text-xs text-neutral-400">{label}: how did it go? (1 to 10)
        <Input name="rating" type="number" inputMode="numeric" min={1} max={10} defaultValue={existing?.rating ?? ""} className="mt-1 max-w-[6rem]" />
      </label>
      <label className="block text-xs text-neutral-400">Wins
        <Textarea name="wins" rows={2} maxLength={2000} defaultValue={existing?.wins ?? ""} className="mt-1" />
      </label>
      <label className="block text-xs text-neutral-400">Lessons
        <Textarea name="lessons" rows={2} maxLength={2000} defaultValue={existing?.lessons ?? ""} className="mt-1" />
      </label>
      <label className="block text-xs text-neutral-400">What I&apos;ll adjust
        <Textarea name="adjust" rows={2} maxLength={2000} defaultValue={existing?.adjust ?? ""} className="mt-1" />
      </label>
      <Button type="submit" className="h-11 w-full justify-center sm:w-auto">Save {kind === "quarter" ? "review" : "check-in"}</Button>
    </form>
  );
}

export default async function YearPage({ searchParams }: { searchParams: Promise<{ age?: string; tab?: string; saved?: string; v?: string; h?: string; bed?: string; inc?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const today = nairobiToday();
  const saved = sp.saved === "1";
  const data = await loadYear(user.id);

  if (!data) {
    return (
      <div>
        <PageHeader image={photoUrl("progress")} eyebrow="My year" title="Program the year" subtitle="One year, from birthday to birthday." />
        <Card className="border-amber-700/50">
          <p className="text-sm font-semibold text-amber-200">One-time setup needed</p>
          <p className="mt-1 text-sm text-neutral-300">Run <code className="rounded bg-neutral-800 px-1">drizzle/manual/life.sql</code> in the Neon SQL editor, then refresh.</p>
        </Card>
      </div>
    );
  }

  const plan = (sp.age && data.plans.find((p) => p.age === Number(sp.age))) || currentPlan(data.plans, today);

  if (!plan) {
    return (
      <div>
        <PageHeader image={photoUrl("progress")} eyebrow="My year" title="Program your new year" subtitle="Plan one year of life, birthday to birthday: a theme, a vision, goals for every area, four quarters and monthly check-ins." />
        <Card className="border-indigo-800/40">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-100"><Cake size={16} className="text-amber-300" /> Start your year</h2>
          <p className="mt-1 text-xs text-neutral-500">Enter the age you are turning and your birthday. The year runs until your next birthday.</p>
          <form action={createYearPlan} className="mt-3 grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end">
            <label className="text-xs text-neutral-400">Turning
              <Input name="age" type="number" min={1} max={120} inputMode="numeric" defaultValue={27} className="mt-1" />
            </label>
            <label className="text-xs text-neutral-400">Birthday (the day the year starts)
              <Input name="startDate" type="date" defaultValue={addDaysISO(today, 1)} className="mt-1" />
            </label>
            <Button type="submit" className="h-10">Create my year</Button>
          </form>
        </Card>
      </div>
    );
  }

  const info = yearInfo(plan.startDate, today);
  const tab = ["vision", "goals", "quarters", "bucket", "checkins", "rules"].includes(sp.tab ?? "") ? sp.tab! : "vision";
  const tabs: TabItem[] = ([
    { key: "vision", label: "Vision", icon: "vision", hint: "Theme, vision, what you leave behind and the letter to yourself." },
    { key: "goals", label: "Goals", icon: "goals", hint: "One goal per life area, with a measure and quarterly milestones." },
    { key: "quarters", label: "Quarters", icon: "quarters", hint: "A focus for each quarter and a review when it ends." },
    { key: "bucket", label: `${plan.age} for ${plan.age}`, icon: "bucket", hint: `${plan.age} things to do, see or try before you turn ${plan.age + 1}.` },
    { key: "checkins", label: "Check-ins", icon: "checkins", hint: "A short monthly check-in to keep the year on track." },
    { key: "rules", label: "Rules to live by", icon: "live", hint: "Your notebook: a sentence and a hack each day to reflect on, 14 life hacks, growth challenges and a quick reference." },
  ] satisfies Omit<TabItem, "href">[]).map((t) => ({ ...t, href: `/year?age=${plan.age}&tab=${t.key}` }));
  const goals = plan.goals ?? {};
  const setGoals = YEAR_AREAS.filter((a) => goals[a.key]?.goal);
  const avgProgress = setGoals.length ? Math.round(setGoals.reduce((s, a) => s + (goals[a.key]?.progress ?? 0), 0) / setGoals.length) : 0;
  const bucket = plan.bucket ?? [];
  const bucketDone = bucket.filter((b) => b.done).length;
  const reviews = data.reviews.filter((r) => r.age === plan.age);
  const rev = (kind: string, period: number) => reviews.find((r) => r.kind === kind && r.period === period);
  const letterOpen = !plan.sealed || today >= info.end;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader image={photoUrl("progress")} eyebrow="My year" title={`Year ${plan.age}`} subtitle={plan.theme ? `Theme: ${plan.theme}` : "Birthday to birthday. Program it on purpose."} />

      {info.isBirthday && (
        <Card className="mb-4 border-amber-600/60 bg-gradient-to-br from-amber-500/20 to-rose-500/10">
          <p className="flex items-center gap-2 text-lg font-semibold text-amber-100"><Cake size={20} /> Happy {ord(plan.age)} birthday, Shadrack!</p>
          <p className="mt-1 text-sm text-neutral-200">Year {plan.age} starts today. Thank God for the last year, then set the theme and vision below.</p>
          <p className="mt-2 text-sm italic text-neutral-300">&ldquo;{affirmationForDay(today).text}&rdquo;</p>
        </Card>
      )}

      <Card className="mb-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">{info.started ? (info.finished ? "Year complete" : `Day ${info.day} of ${info.total}`) : `Starts in ${Math.abs(info.day - 1)} day${Math.abs(info.day - 1) === 1 ? "" : "s"}`}</p>
            <p className="mt-0.5 text-sm text-neutral-300">{formatDate(info.start)} to {formatDate(lastDay(info.end))}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-neutral-50">{info.daysLeft}</p>
            <p className="text-[11px] text-neutral-500">days to {plan.age + 1}</p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-800"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-indigo-500" style={{ width: `${info.pct}%` }} /></div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-neutral-900 py-2"><p className="text-base font-semibold text-neutral-50">Q{info.quarter}</p><p className="text-neutral-500">quarter</p></div>
          <div className="rounded-lg bg-neutral-900 py-2"><p className="text-base font-semibold text-neutral-50">{avgProgress}%</p><p className="text-neutral-500">goal progress</p></div>
          <div className="rounded-lg bg-neutral-900 py-2"><p className="text-base font-semibold text-neutral-50">{bucketDone}/{Math.max(bucket.length, plan.age)}</p><p className="text-neutral-500">{plan.age} for {plan.age}</p></div>
        </div>
        <Link href={`/year/recap?age=${plan.age}`} className="mt-3 inline-block text-xs text-amber-300 underline">{info.finished ? `Your Year ${plan.age} recap` : "See the recap so far"}</Link>
        {data.plans.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {data.plans.map((p) => <Link key={p.age} href={`/year?age=${p.age}`} className={`rounded-full border px-2.5 py-0.5 ${p.age === plan.age ? "border-indigo-500 text-indigo-200" : "border-neutral-800 text-neutral-400"}`}>Year {p.age}</Link>)}
          </div>
        )}
      </Card>

      <TabNav tabs={tabs} active={tab} />

      {tab === "vision" && (
        <Card>
          {saved && <Saved />}
          <form action={saveYearVision} className="space-y-4">
            <input type="hidden" name="age" value={plan.age} />
            <label className="block text-xs text-neutral-400">One-word theme for year {plan.age}
              <Input name="theme" maxLength={60} defaultValue={plan.theme} placeholder="e.g. Build" className="mt-1 sm:max-w-xs" />
              <span className="mt-1 block text-[11px] text-neutral-500">Ideas: {THEME_WORDS.join(" · ")}</span>
            </label>
            <label className="block text-xs text-neutral-400">The vision: write it as if today is your {ord(plan.age + 1)} birthday. Who are you, what did you build, how do you feel?
              <Textarea name="vision" rows={7} maxLength={4000} defaultValue={plan.vision} placeholder={`It's my ${ord(plan.age + 1)} birthday. This year I…`} className="mt-1" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-neutral-400">Leaving behind at {plan.age - 1} (one per line)
                <Textarea name="stop" rows={4} maxLength={2000} defaultValue={plan.stop} placeholder={"Late nights on the phone\nWaiting to feel ready"} className="mt-1" />
              </label>
              <label className="block text-xs text-neutral-400">Starting at {plan.age} (one per line)
                <Textarea name="start" rows={4} maxLength={2000} defaultValue={plan.start} placeholder={"Morning ritual every day\nShipping one project a quarter"} className="mt-1" />
              </label>
            </div>

            <div className="rounded-xl border border-amber-800/40 bg-amber-950/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-100"><Mail size={15} /> Letter to myself at {plan.age + 1}</p>
              {plan.sealed && !letterOpen ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-neutral-300"><Lock size={14} className="text-amber-300" /> Sealed. It opens on {formatDate(info.end)}, your {ord(plan.age + 1)} birthday.</p>
              ) : plan.sealed ? (
                <>
                  <p className="mt-1 text-xs text-amber-300">Opened on your {ord(plan.age + 1)} birthday. Here is what you wrote a year ago:</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-100">{plan.letter}</p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-xs text-neutral-500">Write to the man you will be in a year: your hopes, fears, promises and questions. Seal it and it stays hidden until your next birthday.</p>
                  <LetterGuide age={plan.age} empty={!plan.letter} />
                  <Textarea name="letter" rows={14} maxLength={8000} defaultValue={plan.letter} className="mt-3" />
                  <label className="mt-2 flex min-h-11 items-center gap-3 text-sm text-neutral-200">
                    <input type="checkbox" name="seal" className="h-5 w-5 accent-amber-500" /> Seal it until {formatDate(info.end)} (can&apos;t be read or edited until then)
                  </label>
                </>
              )}
            </div>
            <Button type="submit" className="h-11 w-full justify-center sm:w-auto">Save vision</Button>
          </form>
        </Card>
      )}

      {tab === "goals" && (
        <div className="space-y-2.5">
          {saved && <Saved />}
          <p className="text-xs text-neutral-500">One goal per area, with a measure and a milestone for each quarter. Update the progress whenever you review.</p>
          {YEAR_AREAS.map((a, i) => {
            const g = goals[a.key];
            return (
              <Folder key={a.key} id={`g-${a.key}`} title={a.label} count={g?.progress ?? 0} latest={g?.goal ? g.goal : a.prompt} open={i === 0 && !g?.goal} tint={g?.goal ? "bg-emerald-500/15 text-emerald-200" : "bg-neutral-800 text-neutral-400"}>
                <form action={saveYearGoal} className="space-y-2.5">
                  <input type="hidden" name="age" value={plan.age} />
                  <input type="hidden" name="area" value={a.key} />
                  <label className="block text-xs text-neutral-400">{a.prompt}
                    <Textarea name="goal" rows={2} maxLength={500} defaultValue={g?.goal ?? ""} placeholder={a.example} className="mt-1" />
                  </label>
                  <label className="block text-xs text-neutral-400">How I&apos;ll measure it
                    <Input name="measure" maxLength={300} defaultValue={g?.measure ?? ""} className="mt-1" />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[0, 1, 2, 3].map((q) => (
                      <label key={q} className="block text-xs text-neutral-400">Q{q + 1} milestone (by {formatDate(lastDay(info.quarters[q].to))})
                        <Input name={`q${q + 1}`} maxLength={300} defaultValue={g?.q?.[q] ?? ""} className="mt-1" />
                      </label>
                    ))}
                  </div>
                  <label className="block text-xs text-neutral-400">Progress (0 to 100%)
                    <Input name="progress" type="number" min={0} max={100} inputMode="numeric" defaultValue={g?.progress ?? 0} className="mt-1 max-w-[7rem]" />
                  </label>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${g?.progress ?? 0}%` }} /></div>
                  <Button type="submit" className="h-10 w-full justify-center sm:w-auto">Save {a.label.toLowerCase()} goal</Button>
                </form>
              </Folder>
            );
          })}
          <p className="text-[11px] text-neutral-500">The number on each folder is its progress %.</p>
        </div>
      )}

      {tab === "quarters" && (
        <div className="space-y-2.5">
          {saved && <Saved />}
          {info.quarters.map((q, i) => {
            const r = rev("quarter", q.n);
            const isNow = info.started && !info.finished && info.quarter === q.n;
            return (
              <Folder key={q.n} id={`q${q.n}`} title={`Q${q.n}${isNow ? " · now" : ""} · ${formatDate(q.from)} to ${formatDate(lastDay(q.to))}`} count={r?.rating ?? 0} latest={plan.quarters?.[i] || QUARTER_HINTS[i]} open={isNow || (!info.started && i === 0)} tint={isNow ? "bg-indigo-500/20 text-indigo-200" : "bg-neutral-800 text-neutral-400"}>
                <form action={saveQuarterFocus} className="space-y-2">
                  <input type="hidden" name="age" value={plan.age} />
                  <input type="hidden" name="quarter" value={q.n} />
                  <label className="block text-xs text-neutral-400">Focus for this quarter
                    <Textarea name="focus" rows={2} maxLength={500} defaultValue={plan.quarters?.[i] ?? ""} placeholder={QUARTER_HINTS[i]} className="mt-1" />
                  </label>
                  <Button type="submit" variant="ghost" className="h-10">Save focus</Button>
                </form>
                <div className="mt-2 border-t border-neutral-800 pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Quarter review</p>
                  <ReviewForm age={plan.age} kind="quarter" period={q.n} existing={r} label={`Q${q.n}`} />
                </div>
              </Folder>
            );
          })}
          <p className="text-[11px] text-neutral-500">The number on each folder is your 1 to 10 rating for that quarter.</p>
        </div>
      )}

      {tab === "bucket" && (
        <Card>
          <h2 className="text-sm font-semibold text-neutral-100">{plan.age} for {plan.age}</h2>
          <p className="mt-0.5 text-xs text-neutral-500">{plan.age} things to do, learn, see or finish before you turn {plan.age + 1}. Big and small: a trip, a skill, a book, a conversation, a fear faced.</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-800"><div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.round((bucketDone / Math.max(plan.age, bucket.length || 1)) * 100)}%` }} /></div>
          <p className="mt-1 text-xs text-neutral-400">{bucketDone} done · {bucket.length} of {plan.age} written</p>
          <form action={addBucketItem} className="mt-3 flex gap-2">
            <input type="hidden" name="age" value={plan.age} />
            <Input name="text" required maxLength={200} placeholder="Add one (e.g. Run a half marathon)" />
            <Button type="submit" className="h-10 shrink-0"><Plus size={15} /> Add</Button>
          </form>
          {bucket.length > 0 && (
            <ol className="mt-3 divide-y divide-neutral-800">
              {bucket.map((b, i) => (
                <li key={i} className="flex items-center gap-2 py-1.5">
                  <form action={toggleBucketItem}>
                    <input type="hidden" name="age" value={plan.age} />
                    <input type="hidden" name="i" value={i} />
                    <button type="submit" aria-label={b.done ? "Mark not done" : "Mark done"} className={`flex h-9 w-9 items-center justify-center rounded-lg border ${b.done ? "border-emerald-600 bg-emerald-500/25 text-emerald-200" : "border-neutral-700 text-neutral-600"}`}><Check size={15} /></button>
                  </form>
                  <span className="w-6 shrink-0 text-right text-xs text-neutral-500">{i + 1}</span>
                  <p className={`min-w-0 flex-1 text-sm ${b.done ? "text-neutral-500 line-through" : "text-neutral-100"}`}>{b.text}</p>
                  <form action={removeBucketItem}>
                    <input type="hidden" name="age" value={plan.age} />
                    <input type="hidden" name="i" value={i} />
                    <button type="submit" aria-label="Remove" className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-red-400"><Trash2 size={14} /></button>
                  </form>
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}

      {tab === "checkins" && (
        <div className="space-y-4">
          <Card>
            {saved && <Saved />}
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Month {info.month} of 12 · {formatDate(info.months[info.month - 1].from)} to {formatDate(lastDay(info.months[info.month - 1].to))}</p>
            <p className="mb-3 mt-0.5 text-sm text-neutral-300">Once a month, ask: is this year going the way I programmed it?</p>
            <ReviewForm key={info.month} age={plan.age} kind="month" period={info.month} existing={rev("month", info.month)} label={`Month ${info.month}`} />
          </Card>
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-neutral-100">The year so far</h2>
            <div className="grid grid-cols-6 gap-1.5">
              {info.months.map((m) => {
                const r = rev("month", m.n);
                const shade = r?.rating ? (r.rating >= 8 ? "bg-emerald-500/70" : r.rating >= 5 ? "bg-amber-500/60" : "bg-red-500/60") : "bg-neutral-800";
                return (
                  <div key={m.n} title={formatDate(m.from)} className={`flex h-12 flex-col items-center justify-center rounded-lg ${shade} ${m.n === info.month ? "ring-2 ring-indigo-400" : ""}`}>
                    <span className="text-[10px] text-neutral-200">M{m.n}</span>
                    <span className="text-sm font-semibold text-white">{r?.rating ?? "–"}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 space-y-2.5">
              {reviews.filter((r) => r.kind === "month" && r.period !== info.month).sort((a, b) => b.period - a.period).map((r) => (
                <Folder key={r.period} title={`Month ${r.period}`} count={r.rating ?? 0} latest={r.wins || r.lessons} tint="bg-neutral-800 text-neutral-300">
                  {r.wins && <p className="text-sm text-neutral-300"><span className="text-neutral-500">Wins:</span> {r.wins}</p>}
                  {r.lessons && <p className="text-sm text-neutral-300"><span className="text-neutral-500">Lessons:</span> {r.lessons}</p>}
                  {r.adjust && <p className="text-sm text-neutral-300"><span className="text-neutral-500">Adjust:</span> {r.adjust}</p>}
                </Folder>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "rules" && (
        <RulesTab
          userId={user.id}
          age={plan.age}
          yearDay={info.day}
          today={today}
          v={sp.v ?? "reflect"}
          saved={saved}
          h={sp.h}
          bed={/^\d{2}:\d{2}$/.test(sp.bed ?? "") ? sp.bed! : "22:30"}
          inc={Math.min(100_000_000, Math.max(0, Math.round(Number(sp.inc) || 60000)))}
        />
      )}
      <TabFooter tabs={tabs} active={tab} />
    </div>
  );
}
