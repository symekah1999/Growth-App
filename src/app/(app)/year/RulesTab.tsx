import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, BookOpenCheck, Flame, Lightbulb, RotateCcw, Sparkles, Square, Trophy } from "lucide-react";
import { db } from "@/db";
import { growthTrials, ruleReflections } from "@/db/schema-life";
import { HACKS, SENTENCES, SENTENCE_INTRO, SENTENCE_PRACTICE, TRIALS, hackForDay, sentenceForDay, type Hack, type Trial } from "@/db/seed-data/rules-to-live";
import { attempt, addDaysISO, formatDate } from "@/lib/utils";
import { daysBetween } from "@/lib/challenge";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { Folder, groupBy, monthLabel } from "@/components/Folders";
import { saveReflection, restartTrial, startTrial, stopTrial } from "./rules-actions";

type Reflection = typeof ruleReflections.$inferSelect;
type TrialRow = typeof growthTrials.$inferSelect;

const VIEWS = [
  { key: "reflect", label: "Reflect" },
  { key: "sentences", label: "27 sentences" },
  { key: "hacks", label: "14 life hacks" },
  { key: "challenges", label: "Challenges" },
  { key: "summary", label: "Quick reference" },
] as const;

const KES = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const LIVED: Record<string, { label: string; cls: string }> = {
  yes: { label: "Lived it", cls: "bg-emerald-500/15 text-emerald-300" },
  partly: { label: "Partly", cls: "bg-amber-500/15 text-amber-300" },
  no: { label: "Not today", cls: "bg-rose-500/15 text-rose-300" },
};

function Practice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-r-lg border-l-4 border-rose-500/70 bg-neutral-800/50 px-3 py-2 text-xs leading-relaxed text-neutral-300"><span className="font-semibold text-neutral-100">Put it into practice: </span>{children}</p>;
}

function Reflect({ q }: { q: string }) {
  return <p className="flex gap-2 text-xs italic leading-relaxed text-indigo-200"><Sparkles size={13} className="mt-0.5 shrink-0" /> Reflect: {q}</p>;
}

function MiniTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-800">
      <table className="w-full min-w-[18rem] text-xs">
        <thead><tr className="bg-indigo-950/60 text-left text-indigo-200">{head.map((h) => <th key={h} className="px-3 py-1.5 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-neutral-800 text-neutral-300">{r.map((c, j) => <td key={j} className="px-3 py-1.5">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/** Hidden fields that keep a GET tool form on this tab. */
function Keep({ age, hack }: { age: number; hack: string }) {
  return (
    <>
      <input type="hidden" name="age" value={age} />
      <input type="hidden" name="tab" value="rules" />
      <input type="hidden" name="v" value="hacks" />
      <input type="hidden" name="h" value={hack} />
    </>
  );
}

const minus = (hhmm: string, h: number) => {
  const [a, b] = hhmm.split(":").map(Number);
  const t = (((a * 60 + b - h * 60) % 1440) + 1440) % 1440;
  const hh = Math.floor(t / 60);
  return `${((hh + 11) % 12) + 1}:${String(t % 60).padStart(2, "0")} ${hh < 12 ? "am" : "pm"}`;
};

function HackTool({ hack, age, bed, inc }: { hack: Hack; age: number; bed: string; inc: number }) {
  if (hack.tool === "sleep") {
    return (
      <form className="rounded-lg border border-neutral-800 p-3" action="/year">
        <Keep age={age} hack={hack.key} />
        <p className="text-xs font-semibold text-neutral-200">Your cut-offs</p>
        <div className="mt-2 flex items-end gap-2">
          <label className="text-xs text-neutral-400">Bedtime<Input name="bed" type="time" defaultValue={bed} className="mt-1 w-32" /></label>
          <Button type="submit" variant="ghost" className="h-10">Work it out</Button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-neutral-900 py-2"><p className="text-sm font-semibold text-neutral-50">{minus(bed, 3)}</p><p className="text-neutral-500">last food</p></div>
          <div className="rounded-lg bg-neutral-900 py-2"><p className="text-sm font-semibold text-neutral-50">{minus(bed, 2)}</p><p className="text-neutral-500">last drink</p></div>
          <div className="rounded-lg bg-neutral-900 py-2"><p className="text-sm font-semibold text-neutral-50">{minus(bed, 1)}</p><p className="text-neutral-500">screens off</p></div>
        </div>
      </form>
    );
  }
  if (hack.tool === "budget") {
    return (
      <form className="rounded-lg border border-neutral-800 p-3" action="/year">
        <Keep age={age} hack={hack.key} />
        <p className="text-xs font-semibold text-neutral-200">Split your income</p>
        <div className="mt-2 flex items-end gap-2">
          <label className="text-xs text-neutral-400">Monthly income (KES)<Input name="inc" type="number" inputMode="numeric" min={0} defaultValue={inc} className="mt-1 w-40" /></label>
          <Button type="submit" variant="ghost" className="h-10">Split</Button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-neutral-900 py-2"><p className="text-sm font-semibold text-neutral-50">{KES(inc * 0.5)}</p><p className="text-neutral-500">50% needs</p></div>
          <div className="rounded-lg bg-neutral-900 py-2"><p className="text-sm font-semibold text-neutral-50">{KES(inc * 0.3)}</p><p className="text-neutral-500">30% wants</p></div>
          <div className="rounded-lg bg-emerald-950/40 py-2"><p className="text-sm font-semibold text-emerald-200">{KES(inc * 0.2)}</p><p className="text-neutral-500">20% savings, first</p></div>
        </div>
      </form>
    );
  }
  if (hack.tool === "decide") {
    return (
      <div className="grid gap-2 sm:grid-cols-3">
        {["In 10 minutes I will feel…", "In 10 months I will feel…", "In 10 years this will…"].map((p) => (
          <div key={p} className="rounded-lg border border-dashed border-neutral-700 p-2.5 text-xs text-neutral-400">{p}</div>
        ))}
        <p className="text-[11px] text-neutral-500 sm:col-span-3">Write the three answers in the reflection on the Reflect tab or in your <Link href="/journal" className="underline">journal</Link>.</p>
      </div>
    );
  }
  if (hack.tool === "plan333") {
    return (
      <div className="rounded-lg border border-neutral-800 p-3 font-mono text-xs leading-relaxed text-neutral-300">
        Deep work (3h): ________<br />Short tasks: ____ · ____ · ____<br />Maintenance: ____ · ____ · ____
        <p className="mt-2 font-sans text-[11px] text-neutral-500">Put the deep-work line into your morning ritual&apos;s decisive task, and the rest into <Link href="/todos" className="underline">To-Dos</Link>.</p>
      </div>
    );
  }
  if (hack.tool === "razor") {
    return (
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-neutral-900 py-2"><p className="text-sm font-semibold text-neutral-50">52</p><p className="text-neutral-500">sessions weekly</p></div>
        <div className="rounded-lg bg-neutral-900 py-2"><p className="text-sm font-semibold text-neutral-50">365</p><p className="text-neutral-500">sessions daily (7×)</p></div>
        <div className="rounded-lg bg-indigo-950/40 py-2"><p className="text-sm font-semibold text-indigo-200">≈38×</p><p className="text-neutral-500">1.01³⁶⁵, daily +1%</p></div>
      </div>
    );
  }
  return null;
}

/** "Day 5 of 21" or, for weekly challenges, "Week 2 of 52". */
const progressLabel = (t: Trial, n: number) =>
  t.unit === "week" ? `Week ${Math.min(Math.floor((n - 1) / 7) + 1, t.days / 7)} of ${t.days / 7}` : `Day ${Math.min(n, t.days)} of ${t.days}`;

/** Day number (1-based) within a running trial, and the concrete instruction for today. */
function trialToday(t: Trial, start: string, today: string) {
  const n = daysBetween(start, today) + 1;
  const w = Math.floor((n - 1) / 7) + 1;
  switch (t.key) {
    case "minimalism":
      return { n, line: `Today: let go of ${Math.min(n, 30)} item${n === 1 ? "" : "s"}. On track: ${Math.min(465, (Math.min(n, 30) * (Math.min(n, 30) + 1)) / 2)} of 465 gone.` };
    case "52-week":
      return { n, line: `Put away ${KES(100 * Math.min(w, 52))} this week. On track: ${KES((100 * Math.min(w, 52) * (Math.min(w, 52) + 1)) / 2)} of ${KES(137800)}.` };
    case "tech-free": {
      const dow = new Date(today + "T00:00:00Z").getUTCDay();
      const sat = dow === 6 ? today : addDaysISO(today, (6 - dow + 7) % 7);
      return { n, line: `${sat === today ? "Today is the screen-free day." : `Next screen-free day: ${formatDate(sat, { weekday: "long", day: "numeric", month: "short" })}.`}` };
    }
    case "75-hard":
      return { n, line: "Today: clean diet · 3.8 L of water · 10 pages · progress photo · two 45-min workouts (one outside)." };
    case "no-complaint":
      return { n, line: "Today: no complaining, criticising or gossip. Turn each complaint into a request or a solution." };
    case "morning-pages":
      return { n, line: "Today: three handwritten pages, straight after waking. No editing." };
    case "charger":
      return { n, line: "Tonight: the phone charges outside the bedroom." };
    case "90-90-1":
      return { n, line: "Today: the first 90 minutes go to the goal, phone and email closed." };
    case "30-for-30":
      return { n, line: `Today: 30 focused minutes. ${Math.min(n, 30) * 30} of 900 minutes so far.` };
    default:
      return { n, line: "" };
  }
}

export async function RulesTab({ userId, age, yearDay, today, v, saved, h, bed, inc }: { userId: string; age: number; yearDay: number; today: string; v: string; saved: boolean; h?: string; bed: string; inc: number }) {
  const [reflections, trials] = await Promise.all([
    attempt(db.select().from(ruleReflections).where(eq(ruleReflections.userId, userId)).orderBy(desc(ruleReflections.day)), null as Reflection[] | null),
    attempt(db.select().from(growthTrials).where(eq(growthTrials.userId, userId)), null as TrialRow[] | null),
  ]);
  const view = VIEWS.some((x) => x.key === v) ? v : "reflect";
  const tabHref = (k: string) => `/year?age=${age}&tab=rules&v=${k}`;

  const nav = (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {VIEWS.map((x) => (
        <Link key={x.key} href={tabHref(x.key)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${view === x.key ? "border-indigo-500/60 bg-indigo-600/15 text-indigo-100" : "border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"}`}>{x.label}</Link>
      ))}
    </div>
  );

  if (!reflections || !trials) {
    return (
      <div>
        {nav}
        <Card className="mb-4 border-amber-700/50">
          <p className="text-sm font-semibold text-amber-200">One-time setup for reflections and challenges</p>
          <p className="mt-1 text-sm text-neutral-300">Run <code className="rounded bg-neutral-800 px-1">drizzle/manual/life-3.sql</code> in the Neon SQL editor, then refresh. Reading works already; saving needs the tables.</p>
        </Card>
        {view !== "reflect" && view !== "challenges" ? renderContent() : null}
      </div>
    );
  }

  return (
    <div>
      {nav}
      {renderContent()}
    </div>
  );

  // ---------------------------------------------------------------------------
  function renderContent() {
    const refl = reflections ?? [];
    const tr = trials ?? [];
    const dayNo = Math.max(1, yearDay);
    const sentence = sentenceForDay(dayNo);
    const hack = hackForDay(dayNo);
    const round = Math.floor((dayNo - 1) / 27) + 1;
    const mine = refl.find((r) => r.day === today);
    const livedCount = (n: number) => refl.filter((r) => r.sentence === n && r.lived === "yes").length;

    if (view === "reflect") {
      let streak = 0;
      const set = new Set(refl.map((r) => r.day));
      for (let d = set.has(today) ? today : addDaysISO(today, -1); set.has(d); d = addDaysISO(d, -1)) streak++;
      const running = tr.filter((t) => t.active);
      return (
        <div className="space-y-4">
          {saved && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">Reflection saved ✓</p>}

          <Card className="border-indigo-800/40 bg-gradient-to-br from-indigo-950/40 to-transparent">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-300">Sentence {sentence.n} of 27 · round {round} · {sentence.theme}</p>
            <p className="mt-2 text-lg font-medium leading-snug text-neutral-50">&ldquo;{sentence.text}&rdquo;</p>
            <p className="mt-3 text-sm text-neutral-300"><span className="font-semibold text-amber-200">Live it today: </span>{sentence.act}</p>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300"><Lightbulb size={16} /></span>
              <div className="min-w-0 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-300">Hack of the day · {hack.area}</p>
                <p className="text-sm font-semibold text-neutral-100">{hack.n}. {hack.title}</p>
                <p className="text-sm text-neutral-300">{hack.oneLine}</p>
                <Practice>{hack.practice}</Practice>
                <Link href={`${tabHref("hacks")}&h=${hack.key}#h-${hack.key}`} className="inline-flex items-center gap-1 text-xs text-neutral-400 underline">Open the full hack <ArrowRight size={12} /></Link>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-neutral-100">Today&apos;s reflection</h3>
            <p className="mt-0.5 text-xs text-neutral-500">Two minutes. Set the intention in the morning, come back in the evening to answer the rest.</p>
            <form action={saveReflection} className="mt-3 space-y-3">
              <input type="hidden" name="age" value={age} />
              <input type="hidden" name="sentence" value={sentence.n} />
              <input type="hidden" name="hack" value={hack.n} />
              <label className="block text-xs text-neutral-400">Morning: how will I live sentence {sentence.n} today?
                <Textarea name="action" rows={2} maxLength={1000} defaultValue={mine?.action ?? ""} placeholder={sentence.act} className="mt-1" />
              </label>
              <fieldset>
                <legend className="text-xs text-neutral-400">Evening: did I live it?</legend>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(["yes", "partly", "no"] as const).map((k) => (
                    <label key={k} className="cursor-pointer">
                      <input type="radio" name="lived" value={k} defaultChecked={mine?.lived === k} className="peer sr-only" />
                      <span className="flex min-h-11 items-center justify-center rounded-lg border border-neutral-800 text-sm text-neutral-300 peer-checked:border-indigo-500 peer-checked:bg-indigo-600/20 peer-checked:text-indigo-100 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500">{LIVED[k].label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="flex min-h-11 items-center gap-3 text-sm text-neutral-200">
                <input type="checkbox" name="applied" defaultChecked={mine?.applied} className="h-5 w-5 accent-amber-500" /> I applied today&apos;s hack: {hack.title}
              </label>
              <label className="block text-xs text-neutral-400">1% better: what did I do 1% better today?
                <Input name="better" maxLength={1000} defaultValue={mine?.better ?? ""} className="mt-1" />
              </label>
              <label className="block text-xs text-neutral-400">{hack.reflect}
                <Textarea name="note" rows={3} maxLength={4000} defaultValue={mine?.note ?? ""} className="mt-1" />
              </label>
              <Button type="submit" className="h-11 w-full justify-center sm:w-auto">{mine ? "Update reflection" : "Save reflection"}</Button>
            </form>
          </Card>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 py-2.5"><p className="flex items-center justify-center gap-1 text-lg font-semibold text-neutral-50"><Flame size={15} className="text-amber-400" />{streak}</p><p className="text-neutral-500">day streak</p></div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 py-2.5"><p className="text-lg font-semibold text-neutral-50">{refl.length}</p><p className="text-neutral-500">reflections</p></div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 py-2.5"><p className="text-lg font-semibold text-emerald-300">{refl.filter((r) => r.lived === "yes").length}</p><p className="text-neutral-500">days lived it</p></div>
          </div>

          {running.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-neutral-100">Challenges running</h3>
              <div className="mt-2 space-y-2">
                {running.map((r) => {
                  const t = TRIALS.find((x) => x.key === r.key);
                  if (!t) return null;
                  const { n, line } = trialToday(t, r.startDate, today);
                  return (
                    <Link key={r.key} href={`${tabHref("challenges")}#t-${r.key}`} className="block rounded-lg border border-neutral-800 px-3 py-2 hover:bg-neutral-800/50">
                      <p className="flex justify-between gap-2 text-sm text-neutral-100"><span className="truncate">{t.title}</span><span className="shrink-0 text-xs text-indigo-300">{progressLabel(t, n).toLowerCase()}</span></p>
                      <p className="truncate text-xs text-neutral-500">{line}</p>
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}

          {refl.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-neutral-100">Past reflections</h3>
              <div className="space-y-2">
                {groupBy(refl, (r) => r.day.slice(0, 7)).map(([m, rows], i) => (
                  <Folder key={m} title={monthLabel(rows[0].day)} count={rows.length} latest={rows[0].better || rows[0].action || SENTENCES[rows[0].sentence - 1]?.text} open={i === 0}>
                    <div className="space-y-2">
                      {rows.map((r) => (
                        <div key={r.day} className="rounded-lg border border-neutral-800 p-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium text-neutral-300">{formatDate(r.day, { weekday: "short", day: "numeric", month: "short" })}</span>
                            <span className="text-neutral-600">#{r.sentence} {SENTENCES[r.sentence - 1]?.theme}</span>
                            {r.lived && <span className={`rounded-full px-2 py-0.5 ${LIVED[r.lived]?.cls}`}>{LIVED[r.lived]?.label}</span>}
                            {r.applied && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-300">hack ✓</span>}
                          </div>
                          {r.action && <p className="mt-1.5 text-sm text-neutral-300"><span className="text-neutral-500">Intention:</span> {r.action}</p>}
                          {r.better && <p className="mt-1 text-sm text-neutral-300"><span className="text-neutral-500">1% better:</span> {r.better}</p>}
                          {r.note && <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-400">{r.note}</p>}
                        </div>
                      ))}
                    </div>
                  </Folder>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (view === "sentences") {
      return (
        <div className="space-y-3">
          <Card>
            <p className="text-sm italic text-neutral-200">&ldquo;{SENTENCE_INTRO}&rdquo;</p>
            <div className="mt-3"><Practice>{SENTENCE_PRACTICE}</Practice></div>
            <p className="mt-2 text-xs text-neutral-500">The Reflect tab follows this rhythm for you: day {dayNo} of your year is sentence {sentence.n}.</p>
          </Card>
          <ol className="space-y-2">
            {SENTENCES.map((s) => {
              const on = s.n === sentence.n;
              const c = livedCount(s.n);
              return (
                <li key={s.n} className={`rounded-xl border p-3 ${on ? "border-indigo-500/60 bg-indigo-600/10" : "border-neutral-800 bg-neutral-900/40"}`}>
                  <div className="flex gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${on ? "bg-indigo-600 text-white" : "bg-neutral-800 text-neutral-300"}`}>{s.n}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-neutral-100">{s.text}</p>
                      <p className="mt-1 text-xs text-neutral-400"><span className="text-amber-300/90">Live it:</span> {s.act}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                        <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-neutral-400">{s.theme}</span>
                        {on && <span className="rounded-full bg-indigo-600/30 px-2 py-0.5 text-indigo-200">today</span>}
                        {c > 0 && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300">lived {c}×</span>}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      );
    }

    if (view === "hacks") {
      return (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">Fourteen simple rules for time, focus, money, sleep and decisions. Today&apos;s is open; the Reflect tab rotates through them.</p>
          {HACKS.map((x) => {
            const isToday = x.key === hack.key;
            const applied = refl.filter((r) => r.hack === x.n && r.applied).length;
            return (
              <Folder key={x.key} id={`h-${x.key}`} title={`${x.n}. ${x.title}`} count={applied} latest={`${x.area} · ${x.oneLine}`} open={h ? h === x.key : isToday} tint={isToday ? "bg-amber-500/20 text-amber-200" : applied ? "bg-emerald-500/15 text-emerald-200" : "bg-neutral-800 text-neutral-400"}>
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">{x.area}{isToday ? " · hack of the day" : ""}{applied ? ` · applied ${applied}×` : ""}</p>
                  {x.body.map((p) => <p key={p} className="text-sm leading-relaxed text-neutral-200">{p}</p>)}
                  {x.table && <MiniTable head={x.table.head} rows={x.table.rows} />}
                  <Practice>{x.practice}</Practice>
                  <HackTool hack={x} age={age} bed={bed} inc={inc} />
                  <Reflect q={x.reflect} />
                  {x.trial && <Link href={`${tabHref("challenges")}#t-${x.trial}`} className="inline-flex items-center gap-1 text-xs text-indigo-300 underline">Run it as a tracked challenge <ArrowRight size={12} /></Link>}
                </div>
              </Folder>
            );
          })}
        </div>
      );
    }

    if (view === "challenges") {
      const row = (k: string) => tr.find((t) => t.key === k);
      const sorted = [...TRIALS].sort((a, b) => Number(!!row(b.key)?.active) - Number(!!row(a.key)?.active));
      return (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">Time-boxed experiments to build discipline, simplicity and better habits. Start one, check it here each day, and restart from day 1 if you slip. Your best run is kept.</p>
          {sorted.map((t) => {
            const r = row(t.key);
            const active = !!r?.active;
            const info = active && r ? trialToday(t, r.startDate, today) : null;
            const finished = !!info && info.n > t.days;
            const pct = info ? Math.min(100, Math.round((Math.min(info.n, t.days) / t.days) * 100)) : 0;
            return (
              <Folder
                key={t.key}
                id={`t-${t.key}`}
                title={t.title}
                count={info ? (t.unit === "week" ? Math.floor((Math.min(info.n, t.days) - 1) / 7) + 1 : Math.min(info.n, t.days)) : r?.completed ?? 0}
                latest={info ? `${progressLabel(t, info.n)}${r?.focus ? ` · ${r.focus}` : ""}` : t.oneLine}
                open={active}
                tint={active ? "bg-indigo-600/30 text-indigo-100" : r?.completed ? "bg-emerald-500/15 text-emerald-200" : "bg-neutral-800 text-neutral-400"}
              >
                <div className="space-y-3">
                  {info && r && (
                    <div className="rounded-lg border border-indigo-800/50 bg-indigo-950/30 p-3">
                      <div className="flex items-end justify-between gap-2">
                        <p className="text-sm font-semibold text-neutral-50">{finished ? "Finished!" : progressLabel(t, info.n)}</p>
                        <p className="text-[11px] text-neutral-500">since {formatDate(r.startDate, { day: "numeric", month: "short" })} · attempt {r.attempts}{r.best ? ` · best ${r.best} days` : ""}</p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-800"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{ width: `${pct}%` }} /></div>
                      {r.focus && <p className="mt-2 text-xs text-neutral-300"><span className="text-neutral-500">Focus:</span> {r.focus}</p>}
                      {!finished && <p className="mt-2 text-sm text-neutral-200">{info.line}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {finished ? (
                          <form action={stopTrial}><input type="hidden" name="age" value={age} /><input type="hidden" name="key" value={t.key} /><input type="hidden" name="done" value="1" /><Button type="submit" className="h-10"><Trophy size={15} /> Mark complete</Button></form>
                        ) : (
                          <form action={restartTrial}><input type="hidden" name="age" value={age} /><input type="hidden" name="key" value={t.key} /><Button type="submit" variant="ghost" className="h-10"><RotateCcw size={15} /> I slipped: back to day 1</Button></form>
                        )}
                        <form action={stopTrial}><input type="hidden" name="age" value={age} /><input type="hidden" name="key" value={t.key} /><Button type="submit" variant="ghost" className="h-10 text-neutral-400"><Square size={14} /> Stop</Button></form>
                      </div>
                    </div>
                  )}
                  {t.body.map((p) => <p key={p} className="text-sm leading-relaxed text-neutral-200">{p}</p>)}
                  {t.key === "52-week" && <MiniTable head={["Version", "Week 1", "Week 52", "Year total"]} rows={[["Standard ($)", "$1", "$52", "$1,378"], ["Doubled ($)", "$2", "$104", "$2,756"], ["KES version", "KES 100", "KES 5,200", "KES 137,800"]]} />}
                  <Practice>{t.practice}</Practice>
                  <Reflect q={t.reflect} />
                  {!active && (
                    <form action={startTrial} className="flex flex-wrap items-end gap-2">
                      <input type="hidden" name="age" value={age} />
                      <input type="hidden" name="key" value={t.key} />
                      {t.focusLabel && <label className="min-w-0 flex-1 text-xs text-neutral-400">{t.focusLabel}<Input name="focus" maxLength={200} defaultValue={r?.focus ?? ""} className="mt-1" /></label>}
                      <Button type="submit" className="h-10">{r ? "Start again today" : "Start today"}</Button>
                      {r && <span className="w-full text-[11px] text-neutral-500">Completed {r.completed}× · best run {r.best} days · {r.attempts} attempt{r.attempts === 1 ? "" : "s"}</span>}
                    </form>
                  )}
                </div>
              </Folder>
            );
          })}
        </div>
      );
    }

    // quick reference
    const rows: [string, string, string][] = [
      ...HACKS.map((x) => [x.area, x.title.replace(/^(Adopt the |The |Build a |Embrace |Leverage the )/, ""), x.oneLine] as [string, string, string]),
      ...TRIALS.filter((t) => !t.fromHack).map((t) => ["Challenge", t.title.replace(/^\d+-(Day|Week) /, ""), t.oneLine] as [string, string, string]),
    ];
    return (
      <Card className="!p-0">
        <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
          <BookOpenCheck size={16} className="text-indigo-300" />
          <p className="text-sm font-semibold text-neutral-100">The whole notebook on one page</p>
        </div>
        <ul className="divide-y divide-neutral-800">
          {rows.map(([area, rule, line]) => (
            <li key={rule} className="grid gap-0.5 px-4 py-2.5 sm:grid-cols-[7rem_13rem_1fr] sm:items-center sm:gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{area}</span>
              <span className="text-sm font-medium text-neutral-100">{rule}</span>
              <span className="text-sm text-neutral-400">{line}</span>
            </li>
          ))}
        </ul>
      </Card>
    );
  }
}
