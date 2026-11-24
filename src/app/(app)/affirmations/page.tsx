import { desc, eq } from "drizzle-orm";
import { BookmarkCheck, BookmarkPlus, Mic, Sun, Trash2 } from "lucide-react";
import { db } from "@/db";
import { myAffirmations } from "@/db/schema-life";
import { AFFIRMATIONS, AFFIRMATION_CATEGORIES, affirmationForDay, affirmationSet } from "@/db/seed-data/life";
import { requireUser } from "@/lib/auth";
import { nairobiToday } from "@/lib/challenge";
import { photoUrl } from "@/lib/images";
import { Button, Card, PageHeader, Textarea } from "@/components/ui";
import { Folder } from "@/components/Folders";
import { ActionButton } from "@/components/ActionButton";
import { makeMantra } from "../links/actions";
import Link from "next/link";
import { addMyAffirmation, removeMyAffirmation, saveLibraryAffirmation } from "./actions";

export const dynamic = "force-dynamic";

const catLabel = (k: string) => (k === "mine" ? "My own" : AFFIRMATION_CATEGORIES.find((c) => c.key === k)?.label ?? k);

export default async function AffirmationsPage() {
  const user = await requireUser();
  const today = nairobiToday();
  let mine: (typeof myAffirmations.$inferSelect)[] = [];
  let missing = false;
  try {
    mine = await db.select().from(myAffirmations).where(eq(myAffirmations.userId, user.id)).orderBy(desc(myAffirmations.createdAt));
  } catch {
    missing = true;
  }
  const saved = new Set(mine.map((m) => m.libraryKey).filter(Boolean) as string[]);
  const daily = affirmationForDay(today);
  const set = affirmationSet(today, 5);

  const SaveBtn = ({ k, from }: { k: string; from?: string }) =>
    saved.has(k) ? (
      <span className="inline-flex h-8 items-center gap-1 text-xs text-emerald-300"><BookmarkCheck size={14} /> Saved</span>
    ) : (
      <form action={saveLibraryAffirmation}>
        <input type="hidden" name="key" value={k} />
        {from && <input type="hidden" name="from" value={from} />}
        <button type="submit" disabled={missing} className="inline-flex h-8 items-center gap-1 rounded-lg border border-neutral-700 px-2.5 text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-40"><BookmarkPlus size={14} /> Save</button>
      </form>
    );

  return (
    <div>
      <PageHeader image={photoUrl("mantras")} eyebrow="Affirmations" title="Words to live from" subtitle="Speak truth over yourself every day. Say them slowly, out loud, and mean them." />

      {missing && (
        <Card className="mb-4 border-amber-700/50">
          <p className="text-sm font-semibold text-amber-200">One-time setup needed</p>
          <p className="mt-1 text-sm text-neutral-300">Saving needs <code className="rounded bg-neutral-800 px-1">drizzle/manual/life.sql</code> to be run in Neon. Reading works already.</p>
        </Card>
      )}

      <div id="today" className="scroll-mt-20" />
      <Card className="mb-4 border-amber-800/40 bg-amber-950/10">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300"><Sun size={13} /> Today&apos;s affirmation · {catLabel(daily.category)}</p>
        <p className="mt-2 text-xl font-semibold leading-snug text-neutral-50">{daily.text}</p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">{daily.deeper}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2"><SaveBtn k={daily.key} from="today" /><ActionButton action={makeMantra} fields={{ text: daily.text }} label="Make mantra" doneLabel="In mantras" /></div>
      </Card>

      <Card className="mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-100"><Mic size={15} className="text-indigo-300" /> Read aloud today</h2>
        <p className="mb-3 mt-0.5 text-xs text-neutral-500">Five for today, changing daily. Stand tall, breathe slowly, say each one twice.</p>
        <ol className="space-y-3">
          {set.map((a, i) => (
            <li key={a.key} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-200">{i + 1}</span>
              <p className="text-base leading-relaxed text-neutral-100">{a.text}</p>
            </li>
          ))}
        </ol>
      </Card>

      <p className="mb-4 text-xs text-neutral-500">Your short daily mantras and core values live on <Link href="/mantras" className="underline">Mantras &amp; Values</Link>. Use &ldquo;Make mantra&rdquo; on any affirmation to add it there.</p>

      <section id="mine" className="mb-6 scroll-mt-20">
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">My affirmations <span className="font-normal text-neutral-500">{mine.length}</span></h2>
        <Card className="mb-3">
          <form action={addMyAffirmation} className="space-y-2">
            <Textarea name="text" rows={2} required maxLength={600} placeholder="Write your own: first person, present tense, true. e.g. I am calm under pressure and I finish what I start." disabled={missing} />
            <Button type="submit" disabled={missing} className="h-10 w-full justify-center sm:w-auto">Add affirmation</Button>
          </form>
        </Card>
        {mine.length === 0 ? (
          <p className="text-xs text-neutral-500">Save affirmations from the library below or write your own. They will be collected here.</p>
        ) : (
          <div className="space-y-2.5">
            {[...new Set(mine.map((m) => m.category))].map((c, i) => {
              const list = mine.filter((m) => m.category === c);
              return (
                <Folder key={c} title={catLabel(c)} count={list.length} latest={list[0].text} open={i === 0} tint="bg-amber-500/15 text-amber-200">
                  {list.map((m) => (
                    <div key={m.id} className="flex items-start justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950/50 p-3">
                      <p className="text-sm leading-relaxed text-neutral-100">{m.text}</p>
                      <form action={removeMyAffirmation}>
                        <input type="hidden" name="id" value={m.id} />
                        <button type="submit" aria-label="Remove" className="flex h-8 w-8 items-center justify-center text-neutral-600 hover:text-red-400"><Trash2 size={14} /></button>
                      </form>
                    </div>
                  ))}
                </Folder>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold text-neutral-100">The library</h2>
        <p className="mb-2 text-xs text-neutral-500">{AFFIRMATIONS.length} affirmations in {AFFIRMATION_CATEGORIES.length} areas. Each has a deeper meaning: read it once, then make the words yours.</p>
        <div className="space-y-2.5">
          {AFFIRMATION_CATEGORIES.map((c) => {
            const list = AFFIRMATIONS.filter((a) => a.category === c.key);
            return (
              <Folder key={c.key} id={`lib-${c.key}`} title={c.label} count={list.length} latest={list[0].text} tint="bg-indigo-500/15 text-indigo-200">
                {list.map((a) => (
                  <div key={a.key} className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-3">
                    <p className="text-sm font-medium leading-relaxed text-neutral-50">{a.text}</p>
                    <details className="mt-1.5">
                      <summary className="cursor-pointer select-none text-xs text-amber-300">Go deeper</summary>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-400">{a.deeper}</p>
                    </details>
                    <div className="mt-2 flex flex-wrap items-center gap-2"><SaveBtn k={a.key} /><ActionButton action={makeMantra} fields={{ text: a.text }} label="Make mantra" doneLabel="In mantras" /></div>
                  </div>
                ))}
              </Folder>
            );
          })}
        </div>
      </section>
    </div>
  );
}
