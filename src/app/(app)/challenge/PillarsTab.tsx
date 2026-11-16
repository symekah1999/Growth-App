import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { ARC, DAY_FLOW, FLOOR, PILLARS, pillarForDay } from "@/db/seed-data/pillars";
import { RULES } from "@/db/seed-data/challenge";
import { addDaysISO, formatDate } from "@/lib/utils";
import type { PillarRow } from "@/lib/challenge";
import { savePillarsDay } from "./actions";

const label = (n: number) => PILLARS[n - 1];

function Detail({ k, month, started }: { k: string; month: number; started: boolean }) {
  const i = PILLARS.findIndex((p) => p.key === k);
  const p = PILLARS[i];
  const prev = PILLARS[(i + 9) % 10];
  const next = PILLARS[(i + 1) % 10];
  const focus = new Set(started ? RULES.filter((r) => r.months.includes(month)).map((r) => r.n) : []);
  const fits = p.ruleNums.some((n) => focus.has(n));
  return (
    <div className="space-y-4">
      <Link href="/challenge?tab=pillars" className="inline-flex h-10 items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-100"><ArrowLeft size={15} /> All ten pillars</Link>
      <Card className="border-indigo-800/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Pillar {p.n} of 10</p>
        <h2 className="mt-0.5 text-xl font-semibold text-neutral-50">{p.line}</h2>
        <p className="mt-1 text-sm text-neutral-300">{p.essence}</p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
          <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-neutral-300">{p.rules}</span>
          <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-neutral-300">Animal: {p.animal}</span>
          {fits && <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 font-semibold uppercase text-indigo-200">Fits this month</span>}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">{p.why}</p>
        <blockquote className="mt-3 border-l-2 border-amber-600/60 pl-3">
          <p className="text-sm italic leading-relaxed text-neutral-100">&ldquo;{p.verse.text}&rdquo;</p>
          <p className="mt-0.5 text-xs text-neutral-500">{p.verse.ref} (KJV)</p>
        </blockquote>
      </Card>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-neutral-100">The principles</h3>
        <div className="space-y-2">
          {p.principles.map((x, idx) => (
            <Card key={x.t} className="!p-3">
              <p className="text-sm font-semibold text-neutral-50"><span className="mr-1.5 text-indigo-300">{idx + 1}.</span>{x.t}</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-300">{x.b}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <h3 className="text-sm font-semibold text-neutral-100">Daily practice</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-neutral-300">{p.daily.map((d) => <li key={d} className="flex gap-2"><span className="text-emerald-400">•</span>{d}</li>)}</ul>
        <p className="mt-3 rounded-lg bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200"><span className="font-semibold text-indigo-300">Minimum for a bad day: </span>{p.minimum}</p>
        <h3 className="mt-4 text-sm font-semibold text-neutral-100">Weekly practice</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-neutral-300">{p.weekly.map((d) => <li key={d} className="flex gap-2"><span className="text-emerald-400">•</span>{d}</li>)}</ul>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-neutral-100">Common mistakes</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-neutral-300">{p.mistakes.map((d) => <li key={d} className="flex gap-2"><span className="text-red-400">•</span>{d}</li>)}</ul>
        <h3 className="mt-4 text-sm font-semibold text-neutral-100">How to measure it</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-neutral-300">{p.measure.map((d) => <li key={d} className="flex gap-2"><span className="text-amber-400">•</span>{d}</li>)}</ul>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-neutral-100">Go deeper</h3>
        <ul className="mt-2 space-y-1 text-sm text-neutral-300">{p.reading.map((r) => <li key={r.t}>{r.t} <span className="text-neutral-500">· {r.by}</span></li>)}</ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {p.links.map((l) => <Link key={l.href} href={l.href} className="inline-flex h-10 items-center rounded-lg border border-neutral-700 px-3 text-sm text-neutral-200 hover:bg-neutral-800">{l.label}</Link>)}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Link href={`/challenge?tab=pillars&p=${prev.key}`} className="rounded-xl border border-neutral-800 p-3 text-xs text-neutral-400 active:bg-neutral-800"><ArrowLeft size={14} className="mb-1" />{prev.line}</Link>
        <Link href={`/challenge?tab=pillars&p=${next.key}`} className="rounded-xl border border-neutral-800 p-3 text-right text-xs text-neutral-400 active:bg-neutral-800"><ArrowRight size={14} className="mb-1 ml-auto" />{next.line}</Link>
      </div>
    </div>
  );
}

export function PillarsTab({ rows, today, pillar, month, started, saved }: { rows: PillarRow[]; today: string; pillar?: string; month: number; started: boolean; saved: boolean }) {
  if (pillar && PILLARS.some((p) => p.key === pillar)) return <Detail k={pillar} month={month} started={started} />;

  const set = new Set(rows.map((r) => `${r.day}:${r.pillar}`));
  const has = (d: string, n: number) => set.has(`${d}:${n}`);
  const doneToday = PILLARS.filter((p) => has(today, p.n)).length;
  const last7 = Array.from({ length: 7 }, (_, i) => addDaysISO(today, -i));
  const days14 = Array.from({ length: 14 }, (_, i) => addDaysISO(today, -(13 - i)));
  const pct7 = (n: number) => Math.round((last7.filter((d) => has(d, n)).length / 7) * 100);
  const overall = Math.round(PILLARS.reduce((s, p) => s + pct7(p.n), 0) / 10);
  const weakest = [...PILLARS].sort((a, b) => pct7(a.n) - pct7(b.n))[0];
  const strongest = [...PILLARS].sort((a, b) => pct7(b.n) - pct7(a.n))[0];
  const potd = pillarForDay(today);
  const focus = new Set(started ? RULES.filter((r) => r.months.includes(month)).map((r) => r.n) : []);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-semibold text-neutral-100">&ldquo;An athlete&apos;s body. A Stoic&apos;s mind. A soldier&apos;s discipline. A strategist&apos;s vision. A farmer&apos;s patience. A lion&apos;s confidence. A poet&apos;s heart. A monk&apos;s concentration. A legend&apos;s aura. God&apos;s wisdom.&rdquo;</p>
        <p className="mt-2 text-xs text-neutral-500">Ten pillars, each with principles, daily practices and a one-line minimum. Check off what you did today; the page shows which pillar is falling behind.</p>
      </Card>

      <Card className="border-indigo-800/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Today · {doneToday}/10</p>
            <p className="text-sm text-neutral-300">Pillar of the day: <Link className="font-semibold text-neutral-50 underline decoration-indigo-500/60" href={`/challenge?tab=pillars&p=${potd.key}`}>{potd.line}</Link></p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-neutral-50">{overall}%</p>
            <p className="text-[11px] text-neutral-500">last 7 days</p>
          </div>
        </div>
        {saved && <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">Saved ✓</p>}
        <form action={savePillarsDay} className="mt-3 space-y-1.5" key={`${today}-${doneToday}`}>
          <input type="hidden" name="day" value={today} />
          {PILLARS.map((p) => (
            <label key={p.key} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-neutral-800 px-3 py-2 active:bg-neutral-800">
              <input type="checkbox" name={`p${p.n}`} defaultChecked={has(today, p.n)} className="h-5 w-5 shrink-0 accent-indigo-500" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-neutral-100">{p.n}. {p.line}</span>
                <span className="block text-xs text-neutral-500">{p.minimum}</span>
              </span>
            </label>
          ))}
          <Button type="submit" className="mt-2 h-11 w-full justify-center"><Check size={15} /> Save today</Button>
        </form>
        {overall > 0 && pct7(weakest.n) < 100 && (
          <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            Focus this week: <Link href={`/challenge?tab=pillars&p=${weakest.key}`} className="font-semibold underline">{weakest.line}</Link> ({pct7(weakest.n)}% in the last 7 days). Strongest: {strongest.line} ({pct7(strongest.n)}%).
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-100">Last 14 days</h2>
        <p className="mb-3 mt-0.5 text-xs text-neutral-500">Each dot is a day, oldest on the left. The right column is the last 7 days.</p>
        <div className="space-y-1.5">
          {PILLARS.map((p) => (
            <Link key={p.key} href={`/challenge?tab=pillars&p=${p.key}`} className="flex items-center gap-2 text-xs">
              <span className="w-4 shrink-0 text-right text-neutral-500">{p.n}</span>
              <span className="w-16 shrink-0 truncate text-neutral-300">{p.title}</span>
              <span className="flex min-w-0 flex-1 justify-between">
                {days14.map((d) => <span key={d} title={formatDate(d)} className={`h-3 w-3 rounded-full ${has(d, p.n) ? "bg-indigo-500" : "bg-neutral-800"}`} />)}
              </span>
              <span className="w-9 shrink-0 text-right tabular-nums text-neutral-400">{pct7(p.n)}%</span>
            </Link>
          ))}
        </div>
      </Card>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">The ten pillars</h2>
        <div className="space-y-2">
          {PILLARS.map((p) => {
            const fits = p.ruleNums.some((n) => focus.has(n));
            return (
              <Link key={p.key} href={`/challenge?tab=pillars&p=${p.key}`} className="flex items-start justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3 active:bg-neutral-800">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-50"><span className="mr-1.5 text-indigo-300">{p.n}.</span>{p.line}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">{p.essence}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {fits && <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-200">This month</span>}
                  <span className="text-[10px] text-neutral-500">{p.rules}</span>
                  <ArrowRight size={14} className="text-neutral-600" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold text-neutral-100">How the ten fit together</h2>
        <div className="space-y-2">
          {ARC.map((a) => (
            <Card key={a.pair} className="!p-3">
              <p className="text-sm font-semibold text-neutral-50">{a.pair}: <span className="font-normal text-neutral-300">{a.pillars.map((n) => label(n).title).join(" + ")}</span></p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-300">{a.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold text-neutral-100">A day that uses all ten</h2>
        <div className="space-y-2">
          {DAY_FLOW.map((b) => (
            <Card key={b.time} className="!p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{b.time}</p>
              <ul className="mt-1.5 space-y-1.5 text-sm text-neutral-300">
                {b.items.map((it) => <li key={it.what} className="flex gap-2"><span className="w-5 shrink-0 text-right text-indigo-300">{it.p}</span>{it.what}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <Card className="border-emerald-800/40">
        <h2 className="text-sm font-semibold text-emerald-200">The ten-minute floor</h2>
        <p className="mt-0.5 text-xs text-neutral-500">For days when everything is going wrong. Do just this and the chain survives.</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-neutral-300">{FLOOR.map((f) => <li key={f}>{f}</li>)}</ol>
      </Card>
    </div>
  );
}
