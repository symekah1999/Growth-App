import { db } from "@/db";
import { ActionButton } from "@/components/ActionButton";
import { addTodoFromText, makeGoalFromSystem } from "../links/actions";
import { habits } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { Card, PageHeader, Badge } from "@/components/ui";
import {
  LIFE_SYSTEMS,
  SYSTEM_CATEGORIES,
  getSystemOfTheDay,
  type LifeSystem,
} from "@/db/seed-data/life-systems";
import { photoUrl } from "@/lib/images";
import { adoptSystemHabit } from "./actions";
import { ShowMore } from "@/components/ShowMore";
import { Check, Compass, NotebookPen, Plus, Search, Target } from "lucide-react";

const CAT_STYLE: Record<string, string> = {
  stoic: "border-slate-500/50 text-slate-200 bg-slate-500/10",
  habits: "border-orange-500/50 text-orange-200 bg-orange-500/10",
  productivity: "border-sky-500/50 text-sky-200 bg-sky-500/10",
  goals: "border-indigo-500/50 text-indigo-200 bg-indigo-500/10",
  mindset: "border-fuchsia-500/50 text-fuchsia-200 bg-fuchsia-500/10",
  decisions: "border-cyan-500/50 text-cyan-200 bg-cyan-500/10",
  learning: "border-violet-500/50 text-violet-200 bg-violet-500/10",
  health: "border-emerald-500/50 text-emerald-200 bg-emerald-500/10",
  finance: "border-teal-500/50 text-teal-200 bg-teal-500/10",
  relationships: "border-rose-500/50 text-rose-200 bg-rose-500/10",
  faith: "border-amber-500/50 text-amber-200 bg-amber-500/10",
  career: "border-lime-500/50 text-lime-200 bg-lime-500/10",
};

const catLabel = (key: string) => SYSTEM_CATEGORIES.find((c) => c.key === key)?.label ?? key;

function journalHref(s: LifeSystem) {
  return `/journal?prompt=${encodeURIComponent(`${s.title}: ${s.tryToday}`)}`;
}

function AdoptButton({ system, adopted }: { system: LifeSystem; adopted: boolean }) {
  if (!system.habit) return null;
  if (adopted) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800 px-3 py-1.5 text-xs font-medium text-emerald-300">
        <Check size={13} /> In your habits
      </span>
    );
  }
  return (
    <form action={adoptSystemHabit}>
      <input type="hidden" name="systemId" value={system.id} />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
      >
        <Plus size={13} /> Adopt as habit · {system.habit.targetPerWeek}×/week
      </button>
    </form>
  );
}

export default async function SystemsPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; q?: string }>;
}) {
  const user = await requireUser();
  const { c, q } = await searchParams;
  const today = getSystemOfTheDay();

  const myHabits = await db
    .select({ name: habits.name })
    .from(habits)
    .where(and(eq(habits.userId, user.id), eq(habits.archived, false)));
  const adoptedNames = new Set(myHabits.map((h) => h.name));
  const isAdopted = (s: LifeSystem) => !!s.habit && adoptedNames.has(s.habit.name);
  const adoptedCount = LIFE_SYSTEMS.filter(isAdopted).length;

  const query = (q ?? "").trim().toLowerCase();
  const visible = LIFE_SYSTEMS.filter(
    (s) =>
      (!c || s.category === c) &&
      (!query ||
        `${s.title} ${s.origin} ${s.summary} ${s.steps.join(" ")}`.toLowerCase().includes(query)),
  );

  return (
    <div>
      <PageHeader
        image={photoUrl("systems")}
        eyebrow="Life Systems"
        title="Systems for continuous progress"
        subtitle={`${LIFE_SYSTEMS.length} proven systems from Stoic philosophers, scripture, scientists and high performers. You don't rise to your goals — you fall to your systems.`}
        action={
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-neutral-400">Adopted as habits</p>
            <p className="text-xl font-semibold text-white">{adoptedCount}</p>
          </div>
        }
      />

      {/* System of the day */}
      <Card className="mb-8 overflow-hidden border-indigo-900/60 bg-gradient-to-br from-indigo-950/50 via-neutral-900/70 to-neutral-950 p-0">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
              <Compass size={14} /> System of the day
            </span>
            <Badge className={CAT_STYLE[today.category]}>{catLabel(today.category)}</Badge>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-50 sm:text-3xl">{today.title}</h2>
          <p className="mt-1 text-sm text-neutral-400">{today.origin}</p>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-neutral-200">{today.summary}</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <ol className="space-y-2.5">
              {today.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-neutral-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600/25 text-xs font-semibold text-indigo-200">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-indigo-800/50 bg-neutral-950/50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-300">
                  <Target size={13} /> Try it today
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-100">{today.tryToday}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AdoptButton system={today} adopted={isAdopted(today)} />
                <ActionButton action={addTodoFromText} fields={{ text: today.tryToday }} label="Add to to-dos" doneLabel="On today's list" />
                <ActionButton action={makeGoalFromSystem} fields={{ systemId: today.id }} label="Make it a goal" doneLabel="Goal created" />
                <Link
                  href={journalHref(today)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
                >
                  <NotebookPen size={13} /> Reflect in journal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3">
        <form action="/systems" className="relative max-w-md">
          {c && <input type="hidden" name="c" value={c} />}
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search systems (e.g. focus, money, prayer, stoic)"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2 pl-9 pr-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-indigo-600 focus:outline-none"
          />
        </form>
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={query ? `/systems?q=${encodeURIComponent(query)}` : "/systems"}
            className={`rounded-full border px-3 py-1 text-xs ${
              !c ? "border-indigo-500 bg-indigo-600/20 text-indigo-200" : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
            }`}
          >
            All · {LIFE_SYSTEMS.length}
          </Link>
          {SYSTEM_CATEGORIES.map((cat) => {
            const n = LIFE_SYSTEMS.filter((s) => s.category === cat.key).length;
            return (
              <Link
                key={cat.key}
                href={`/systems?c=${cat.key}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                title={cat.blurb}
                className={`rounded-full border px-3 py-1 text-xs ${
                  c === cat.key
                    ? "border-indigo-500 bg-indigo-600/20 text-indigo-200"
                    : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
                }`}
              >
                {cat.label} · {n}
              </Link>
            );
          })}
        </div>
        {c && <p className="text-sm text-neutral-400">{SYSTEM_CATEGORIES.find((x) => x.key === c)?.blurb}</p>}
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">No systems match that search.</p>
      ) : (
        <ShowMore key={`${c ?? ""}-${q ?? ""}`} initial={12} label="More systems" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((s) => (
            <Card key={s.id} className="flex flex-col transition hover:border-neutral-700">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-neutral-100">{s.title}</h3>
                  <p className="mt-0.5 text-xs text-neutral-500">{s.origin}</p>
                </div>
                <Badge className={`shrink-0 ${CAT_STYLE[s.category]}`}>{catLabel(s.category)}</Badge>
              </div>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-300">{s.summary}</p>
              <details className="group mt-3">
                <summary className="cursor-pointer select-none text-xs font-medium text-indigo-300 hover:text-indigo-200">
                  How to run it
                </summary>
                <ol className="mt-2 space-y-1.5">
                  {s.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-neutral-400">
                      <span className="w-4 shrink-0 text-right text-xs font-semibold text-neutral-500">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </details>
              <div className="mt-auto pt-3">
                <p className="mb-2.5 rounded-lg bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300">
                  <span className="font-semibold text-neutral-100">Try today:</span> {s.tryToday}
                </p>
                <div className="flex flex-wrap gap-2">
                  <AdoptButton system={s} adopted={isAdopted(s)} />
                  <ActionButton action={addTodoFromText} fields={{ text: s.tryToday }} label="Add to to-dos" doneLabel="On today's list" />
                  <ActionButton action={makeGoalFromSystem} fields={{ systemId: s.id }} label="Make it a goal" doneLabel="Goal created" />
                  <Link
                    href={journalHref(s)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 px-3 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800"
                  >
                    <NotebookPen size={13} /> Reflect
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </ShowMore>
      )}
    </div>
  );
}
