import Link from "next/link";
import { and, desc, eq, gte } from "drizzle-orm";
import { Ban, Check, Flame, Plus, X } from "lucide-react";
import { db } from "@/db";
import { todontLogs, todonts } from "@/db/schema-life";
import { TODONT_CATEGORIES, TODONT_SUGGESTIONS } from "@/db/seed-data/life";
import { requireUser } from "@/lib/auth";
import { nairobiToday } from "@/lib/challenge";
import { addDaysISO, attempt, formatDate } from "@/lib/utils";
import { photoUrl } from "@/lib/images";
import { Button, Card, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { Folder, groupBy, monthLabel } from "@/components/Folders";
import { challengePlan } from "@/db/schema-challenge";
import { addSuggestedTodont, addTodont, addViceTodont, deleteTodont, logTodont, toggleTodontActive } from "./actions";

export const dynamic = "force-dynamic";

type Todont = typeof todonts.$inferSelect;
type Log = typeof todontLogs.$inferSelect;
const catLabel = (k: string) => TODONT_CATEGORIES.find((c) => c.key === k)?.label ?? k;

function heldStreak(logs: Log[], today: string) {
  const by = new Map(logs.map((l) => [l.day, l.held]));
  let cur = by.get(today) === true ? today : addDaysISO(today, -1);
  let n = 0;
  while (by.get(cur) === true) {
    n++;
    cur = addDaysISO(cur, -1);
  }
  return n;
}

export default async function TodontPage() {
  const user = await requireUser();
  const today = nairobiToday();
  let items: Todont[] = [];
  let logs: Log[] = [];
  let missing = false;
  try {
    [items, logs] = await Promise.all([
      db.select().from(todonts).where(eq(todonts.userId, user.id)).orderBy(desc(todonts.createdAt)),
      db.select().from(todontLogs).where(and(eq(todontLogs.userId, user.id), gte(todontLogs.day, addDaysISO(today, -120)))).orderBy(desc(todontLogs.day)),
    ]);
  } catch {
    missing = true;
  }
  const vices = ((await attempt(db.select({ vices: challengePlan.vices }).from(challengePlan).where(eq(challengePlan.userId, user.id)), []))[0]?.vices ?? []) as string[];
  const active = items.filter((t) => t.active);
  const byItem = new Map<string, Log[]>();
  for (const l of logs) byItem.set(l.todontId, [...(byItem.get(l.todontId) ?? []), l]);
  const todayLog = (id: string) => byItem.get(id)?.find((l) => l.day === today);
  const heldToday = active.filter((t) => todayLog(t.id)?.held === true).length;
  const slippedToday = active.filter((t) => todayLog(t.id)?.held === false).length;
  const last7 = Array.from({ length: 7 }, (_, i) => addDaysISO(today, -(6 - i)));
  const week = logs.filter((l) => l.day >= last7[0] && active.some((t) => t.id === l.todontId));
  const holdRate = week.length ? Math.round((week.filter((l) => l.held).length / week.length) * 100) : null;
  const slips = logs.filter((l) => !l.held);
  const have = new Set(items.map((t) => t.text.toLowerCase()));
  const nameOf = (id: string) => items.find((t) => t.id === id)?.text ?? "Removed item";

  return (
    <div>
      <PageHeader image={photoUrl("recovery")} eyebrow="To-don't list" title="What I refuse to do" subtitle="Knowing what to avoid is half of discipline. Hold the line one day at a time." />

      {missing && (
        <Card className="mb-4 border-amber-700/50">
          <p className="text-sm font-semibold text-amber-200">One-time setup needed</p>
          <p className="mt-1 text-sm text-neutral-300">Run <code className="rounded bg-neutral-800 px-1">drizzle/manual/life.sql</code> in the Neon SQL editor, then refresh.</p>
        </Card>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <Card className="!p-3"><p className="text-2xl font-semibold text-emerald-300">{heldToday}</p><p className="text-[11px] text-neutral-500">held today</p></Card>
        <Card className="!p-3"><p className="text-2xl font-semibold text-red-300">{slippedToday}</p><p className="text-[11px] text-neutral-500">slipped today</p></Card>
        <Card className="!p-3"><p className="text-2xl font-semibold text-neutral-50">{holdRate === null ? "–" : `${holdRate}%`}</p><p className="text-[11px] text-neutral-500">held, last 7 days</p></Card>
      </div>

      <section id="today" className="mb-6 scroll-mt-20">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-100"><Ban size={15} className="text-red-400" /> Today · {formatDate(today)}</h2>
        {active.length === 0 ? (
          <Card><p className="text-sm text-neutral-300">No to-don&apos;ts yet. Add your own below, or pick from the suggestions.</p></Card>
        ) : (
          <div className="space-y-2">
            {active.map((t) => {
              const tl = todayLog(t.id);
              const mine = byItem.get(t.id) ?? [];
              const streak = heldStreak(mine, today);
              return (
                <Card key={t.id} className="scroll-mt-20 !p-3">
                  <div id={`t-${t.id}`} />
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-50">{t.text}</p>
                    {streak > 0 && <span className="flex shrink-0 items-center gap-1 text-xs text-orange-300"><Flame size={13} />{streak}</span>}
                  </div>
                  {t.why && <p className="mt-1 text-xs leading-relaxed text-neutral-400">{t.why}</p>}
                  {t.instead && <p className="mt-1 text-xs text-neutral-300"><span className="font-semibold text-emerald-300">Instead: </span>{t.instead}</p>}
                  <div className="mt-2 flex gap-1">
                    {last7.map((d) => {
                      const l = mine.find((x) => x.day === d);
                      return <span key={d} title={`${formatDate(d)}: ${l ? (l.held ? "held" : "slipped") : "not logged"}`} className={`h-2.5 flex-1 rounded-full ${l ? (l.held ? "bg-emerald-500" : "bg-red-500") : "bg-neutral-800"}`} />;
                    })}
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <form action={logTodont}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="status" value="held" />
                      <input type="hidden" name="toggle" value="1" />
                      <button type="submit" aria-pressed={tl?.held === true} className={`flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border text-sm font-medium ${tl?.held === true ? "border-emerald-600 bg-emerald-500/25 text-emerald-100" : "border-neutral-800 text-neutral-300 active:bg-neutral-800"}`}>
                        <Check size={15} /> Held the line
                      </button>
                    </form>
                    {tl?.held === false ? (
                      <form action={logTodont}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="status" value="slipped" />
                        <input type="hidden" name="toggle" value="1" />
                        <button type="submit" aria-pressed className="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-red-700 bg-red-500/25 text-sm font-medium text-red-100"><X size={15} /> Slipped</button>
                      </form>
                    ) : (
                      <details className="group">
                        <summary className="flex h-11 cursor-pointer list-none items-center justify-center gap-1.5 rounded-lg border border-neutral-800 text-sm font-medium text-neutral-300 active:bg-neutral-800 [&::-webkit-details-marker]:hidden"><X size={15} /> Slipped</summary>
                        <form action={logTodont} className="col-span-2 mt-2 space-y-2">
                          <input type="hidden" name="id" value={t.id} />
                          <input type="hidden" name="status" value="slipped" />
                          <Input name="note" maxLength={300} placeholder="What happened? (optional)" />
                          <button type="submit" className="h-10 w-full rounded-lg bg-red-600/80 text-sm font-semibold text-white">Log the slip</button>
                        </form>
                      </details>
                    )}
                  </div>
                  {tl?.held === false && tl.note && <p className="mt-2 text-xs text-neutral-500">Note: {tl.note}</p>}
                </Card>
              );
            })}
          </div>
        )}
        <p className="mt-2 text-xs text-neutral-500">A slip is information, not a verdict. Log it honestly, write what happened, and hold the line tomorrow.</p>
      </section>

      <Card className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-100"><Plus size={15} /> Add a to-don&apos;t</h2>
        <form action={addTodont} className="space-y-2.5">
          <Input name="text" required maxLength={200} placeholder="Don't… (e.g. Don't check email before 10am)" disabled={missing} />
          <Textarea name="why" rows={2} maxLength={500} placeholder="Why it matters (what it costs you)" disabled={missing} />
          <Input name="instead" maxLength={500} placeholder="What I'll do instead" disabled={missing} />
          <div className="flex gap-2">
            <Select name="category" defaultValue="life" disabled={missing}>
              {TODONT_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </Select>
            <Button type="submit" disabled={missing} className="h-10 shrink-0">Add</Button>
          </div>
        </form>
      </Card>

      {vices.length > 0 && (
        <Card className="mb-6 border-indigo-800/40">
          <h2 className="text-sm font-semibold text-neutral-100">From your challenge vice list</h2>
          <p className="mb-2 mt-0.5 text-xs text-neutral-500">Track your vices here too, so &ldquo;stayed clean&rdquo; has a daily Held / Slipped record.</p>
          <ul className="space-y-1.5">
            {vices.map((v) => {
              const added = items.some((t) => t.text.toLowerCase() === `don't: ${v}`.toLowerCase());
              return (
                <li key={v} className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-200">
                  <span className="min-w-0">{v}</span>
                  {added ? (
                    <span className="shrink-0 text-xs text-emerald-300">Tracking ✓</span>
                  ) : (
                    <form action={addViceTodont}>
                      <input type="hidden" name="vice" value={v} />
                      <button type="submit" disabled={missing} className="h-8 shrink-0 rounded-lg border border-neutral-700 px-3 text-xs text-neutral-200 hover:bg-neutral-800 disabled:opacity-40">Add</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <section id="suggestions" className="mb-6 scroll-mt-20">
        <h2 className="mb-1 text-sm font-semibold text-neutral-100">Suggested to-don&apos;ts</h2>
        <p className="mb-2 text-xs text-neutral-500">Tap Add on any that fit you. Each comes with its reason and a replacement.</p>
        <div className="space-y-2.5">
          {TODONT_CATEGORIES.map((c) => {
            const list = TODONT_SUGGESTIONS.filter((s) => s.category === c.key);
            if (!list.length) return null;
            return (
              <Folder key={c.key} title={c.label} count={list.length} latest={list[0].text} tint="bg-red-500/15 text-red-200">
                {list.map((s) => {
                  const added = have.has(s.text.toLowerCase());
                  return (
                    <div key={s.key} className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-neutral-100">{s.text}</p>
                        {added ? (
                          <span className="shrink-0 text-xs text-emerald-300">Added ✓</span>
                        ) : (
                          <form action={addSuggestedTodont}>
                            <input type="hidden" name="key" value={s.key} />
                            <button type="submit" disabled={missing} className="h-8 shrink-0 rounded-lg border border-neutral-700 px-3 text-xs text-neutral-200 hover:bg-neutral-800 disabled:opacity-40">Add</button>
                          </form>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-400">{s.why}</p>
                      <p className="mt-1 text-xs text-neutral-300"><span className="font-semibold text-emerald-300">Instead: </span>{s.instead}</p>
                    </div>
                  );
                })}
              </Folder>
            );
          })}
        </div>
      </section>

      {slips.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Slip log</h2>
          <div className="space-y-2.5">
            {groupBy(slips, (l) => l.day.slice(0, 7)).map(([k, list], i) => (
              <Folder key={k} title={monthLabel(list[0].day)} count={list.length} latest={nameOf(list[0].todontId)} open={i === 0} tint="bg-red-500/15 text-red-200">
                {list.map((l) => (
                  <div key={`${l.todontId}-${l.day}`} className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-3 text-sm">
                    <p className="text-xs text-neutral-500">{formatDate(l.day)}</p>
                    <p className="text-neutral-200">{nameOf(l.todontId)}</p>
                    {l.note && <p className="mt-0.5 text-neutral-400">{l.note}</p>}
                  </div>
                ))}
              </Folder>
            ))}
          </div>
        </section>
      )}

      {items.length > 0 && (
        <section id="manage" className="scroll-mt-20">
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">Manage my list</h2>
          <Card className="!p-0">
            <ul className="divide-y divide-neutral-800">
              {items.map((t) => (
                <li key={t.id} className="flex items-center gap-2 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${t.active ? "text-neutral-100" : "text-neutral-500 line-through"}`}>{t.text}</p>
                    <p className="text-[11px] text-neutral-500">{catLabel(t.category)}{t.active ? "" : " · paused"}</p>
                  </div>
                  <form action={toggleTodontActive}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="h-9 rounded-lg px-2 text-xs text-neutral-400 hover:text-neutral-100">{t.active ? "Pause" : "Resume"}</button>
                  </form>
                  <form action={deleteTodont}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="h-9 rounded-lg px-2 text-xs text-neutral-600 hover:text-red-400">Delete</button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>
          <p className="mt-2 text-xs text-neutral-500">Pausing keeps the history; deleting removes the item and its log. <Link href="/entries?s=todont" className="underline">See slips in Entries</Link></p>
        </section>
      )}
    </div>
  );
}
