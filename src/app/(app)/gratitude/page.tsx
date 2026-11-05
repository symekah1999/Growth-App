import { requireUser } from "@/lib/auth";
import { addDaysISO, todayISO } from "@/lib/utils";
import Link from "next/link";
import { Button, Card, EmptyState, PageHeader, Select, Textarea } from "@/components/ui";
import { DayHeatmap, type HeatCell } from "@/components/charts/DayHeatmap";
import { ShowMore } from "@/components/ShowMore";
import { GRATITUDE_CATEGORIES, getGratitudePrompt } from "@/db/schema-gratitude";
import {
  currentStreak,
  loadGratitude,
  longestStreak,
  onThisDay,
  resurfaced as pickResurfaced,
  type GratitudeRow,
} from "@/lib/gratitude";
import { photoUrl } from "@/lib/images";
import { addGratitude, deleteGratitude } from "./actions";
import { Flame, Heart, History, Lightbulb, Sparkles, X } from "lucide-react";

const HEATMAP_DAYS = 182; // ~26 weeks

const catLabel = (key: string) => GRATITUDE_CATEGORIES.find((c) => c.key === key)?.label ?? key;

function fmtDay(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Item({ row }: { row: GratitudeRow }) {
  return (
    <li className="group flex items-start gap-2.5 rounded-lg px-1 py-1">
      <Heart size={13} className="mt-1 shrink-0 text-rose-400/80" />
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-neutral-100">
        {row.text}
        {row.category !== "general" && (
          <span className="ml-2 rounded-full border border-neutral-700 px-1.5 py-0.5 align-middle text-[10px] text-neutral-400">
            {catLabel(row.category)}
          </span>
        )}
      </p>
      <form action={deleteGratitude}>
        <input type="hidden" name="id" value={row.id} />
        <button
          type="submit"
          aria-label="Delete"
          className="rounded p-1 text-neutral-600 opacity-60 transition hover:bg-neutral-800 hover:text-red-400 group-hover:opacity-100"
        >
          <X size={13} />
        </button>
      </form>
    </li>
  );
}

export default async function GratitudePage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const user = await requireUser();
  const { cat } = await searchParams;
  const today = todayISO();
  const prompt = getGratitudePrompt(today);

  const rows = await loadGratitude(user.id);
  const tableMissing = rows === null;
  const all = rows ?? [];

  const dates = all.map((r) => r.entryDate);
  const streak = currentStreak(dates, today);
  const best = longestStreak(dates);
  const todays = all.filter((r) => r.entryDate === today);
  const weekStart = addDaysISO(today, -6);
  const thisWeek = all.filter((r) => r.entryDate >= weekStart).length;
  const daysLogged = new Set(dates).size;

  const memories = onThisDay(all, today);
  const remembered = memories[0] ?? pickResurfaced(all, today);

  // Heatmap: items per day, 4+ = full colour.
  const perDay = new Map<string, number>();
  for (const r of all) perDay.set(r.entryDate, (perDay.get(r.entryDate) ?? 0) + 1);
  const cells: HeatCell[] = Array.from({ length: HEATMAP_DAYS }, (_, i) => {
    const date = addDaysISO(today, -(HEATMAP_DAYS - 1 - i));
    const n = perDay.get(date) ?? 0;
    return { date, value: Math.min(1, n / 4), detail: n === 0 ? "Nothing logged" : `${n} thing${n === 1 ? "" : "s"} to be thankful for` };
  });

  // History grouped by day (excluding today, which has its own card).
  const filtered = (cat ? all.filter((r) => r.category === cat) : all).filter((r) => r.entryDate !== today);
  const groups = new Map<string, GratitudeRow[]>();
  for (const r of filtered) groups.set(r.entryDate, [...(groups.get(r.entryDate) ?? []), r]);

  return (
    <div>
      <PageHeader
        image={photoUrl("story")}
        eyebrow="Gratitude"
        title="What I'm thankful for"
        subtitle="Name the good things, big and small. A grateful mind notices more to be grateful for."
        action={
          <div className="flex gap-5 text-right">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-neutral-400">Total</p>
              <p className="text-xl font-semibold text-white">{all.length}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-neutral-400">Streak</p>
              <p className="flex items-center justify-end gap-1 text-xl font-semibold text-white">
                <Flame size={16} className="text-orange-400" />
                {streak}
              </p>
            </div>
          </div>
        }
      />

      {tableMissing && (
        <Card className="mb-4 border-amber-800/60 bg-amber-950/20">
          <p className="text-sm font-medium text-amber-200">One-time setup needed</p>
          <p className="mt-1 text-sm text-neutral-300">
            The gratitude table doesn&apos;t exist in your database yet. Run the SQL in{" "}
            <code className="rounded bg-neutral-800 px-1">drizzle/manual/gratitude.sql</code> in the Neon SQL editor, then
            reload this page.
          </p>
        </Card>
      )}

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        {/* Log */}
        <Card className="border-rose-900/40 bg-rose-950/10">
          <h2 className="mb-1 flex items-center gap-2 font-semibold text-neutral-100">
            <Heart size={16} className="text-rose-400" /> Today I&apos;m thankful for…
          </h2>
          <p className="mb-3 flex items-start gap-1.5 text-xs text-neutral-400">
            <Sparkles size={12} className="mt-0.5 shrink-0 text-amber-300" />
            <span>
              <span className="font-medium text-neutral-300">Prompt: </span>
              {prompt}
            </span>
          </p>
          <form action={addGratitude} className="space-y-3">
            <Textarea
              name="items"
              required
              rows={4}
              placeholder={"One thing per line, for example:\nA safe trip home\nMum's phone call\nA productive morning"}
            />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <Select name="category" defaultValue="general" aria-label="Category">
                {GRATITUDE_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <input
                type="date"
                name="entryDate"
                defaultValue={today}
                max={today}
                aria-label="Date"
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-indigo-500"
              />
              <Button type="submit" disabled={tableMissing}>
                <Heart size={14} /> Log it
              </Button>
            </div>
          </form>

          {todays.length > 0 && (
            <div className="mt-4 border-t border-neutral-800 pt-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Today · {todays.length}
              </p>
              <ul>
                {todays.map((r) => (
                  <Item key={r.id} row={r} />
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Look-back + stats */}
        <div className="space-y-4">
          {remembered && (
            <Card className="border-amber-900/40 bg-amber-950/10">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
                <History size={12} /> {memories.length > 0 ? "On this day" : "Remember this?"}
              </p>
              <p className="mt-2 text-base font-medium leading-snug text-neutral-50">{remembered.text}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {fmtDay(remembered.entryDate)} · {catLabel(remembered.category)}
              </p>
              <p className="mt-2 text-xs text-neutral-400">Is it still true? Add it again if so.</p>
            </Card>
          )}
          <Card>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-2xl font-semibold text-neutral-50">{thisWeek}</p>
                <p className="text-[11px] uppercase tracking-wide text-neutral-500">Last 7 days</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-neutral-50">{daysLogged}</p>
                <p className="text-[11px] uppercase tracking-wide text-neutral-500">Days logged</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-neutral-50">{streak}</p>
                <p className="text-[11px] uppercase tracking-wide text-neutral-500">Current streak</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-neutral-50">{best}</p>
                <p className="text-[11px] uppercase tracking-wide text-neutral-500">Best streak</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="mb-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-neutral-300">Last 26 weeks</h2>
          <p className="text-xs text-neutral-500">Each square is a day. Brighter = more things named.</p>
        </div>
        <DayHeatmap cells={cells} emptyLabel="none" fullLabel="4 or more" />
      </Card>

      <div id="history">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-50">
            <Lightbulb size={16} className="text-amber-300" /> Everything I&apos;ve been thankful for
          </h2>
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Link
            href="/gratitude#history"
            className={`rounded-full border px-3 py-1 text-xs ${
              !cat ? "border-rose-500 bg-rose-500/15 text-rose-200" : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
            }`}
          >
            All
          </Link>
          {GRATITUDE_CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/gratitude?cat=${c.key}#history`}
              className={`rounded-full border px-3 py-1 text-xs ${
                cat === c.key
                  ? "border-rose-500 bg-rose-500/15 text-rose-200"
                  : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {groups.size === 0 ? (
          <EmptyState
            title={all.length === 0 ? "Nothing logged yet" : "Nothing here yet"}
            subtitle={all.length === 0 ? "Start with just one thing you're thankful for today." : "Try another category."}
          />
        ) : (
          <ShowMore key={cat ?? "all"} initial={10} label="Earlier days" className="grid gap-3 md:grid-cols-2">
            {[...groups.entries()].map(([date, items]) => (
              <Card key={date}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <Link href={`/day?d=${date}`} className="hover:text-neutral-300 hover:underline">{fmtDay(date)}</Link> · {items.length}
                </p>
                <ul>
                  {items.map((r) => (
                    <Item key={r.id} row={r} />
                  ))}
                </ul>
              </Card>
            ))}
          </ShowMore>
        )}
      </div>
    </div>
  );
}
