import type { ProgressData } from "@/lib/progress";
import { averageMood } from "@/lib/review";
import { addDaysISO, toISODate } from "@/lib/utils";

export type WeekBucket = {
  label: string;
  start: string;
  end: string;
  habitPct: number | null;
  journalDays: number;
  gratitudeItems: number;
  gratitudeDays: number;
  lessons: number;
  todosDone: number;
  mood: number | null;
};

type Inputs = {
  data: ProgressData;
  gratitude: { entryDate: string; category: string }[];
  lessonDates: string[];
  moods: { entryDate: string; mood: string | null }[];
  today: string;
  weeks?: number;
};

/** Rolling 7-day windows ending today, oldest first. */
export function weeklyBuckets({ data, gratitude, lessonDates, moods, today, weeks = 12 }: Inputs): WeekBucket[] {
  return Array.from({ length: weeks }, (_, i) => {
    const end = addDaysISO(today, -7 * (weeks - 1 - i));
    const start = addDaysISO(end, -6);
    const inW = (d: string) => d >= start && d <= end;

    const live = data.habitRows.filter((h) => !h.archived && toISODate(h.createdAt) <= end);
    let habitPct: number | null = null;
    if (live.length) {
      const ids = new Set(live.map((h) => h.id));
      const done = data.logRows.filter((l) => ids.has(l.habitId) && inW(l.logDate)).length;
      const possible = live.reduce((s, h) => s + Math.min(7, h.targetPerWeek || 7), 0);
      habitPct = possible ? Math.min(100, Math.round((done / possible) * 100)) : null;
    }

    const g = gratitude.filter((x) => inW(x.entryDate));
    return {
      label: i === weeks - 1 ? "This wk" : `${weeks - 1 - i}w`,
      start,
      end,
      habitPct,
      journalDays: new Set(data.journalRows.map((j) => j.entryDate).filter(inW)).size,
      gratitudeItems: g.length,
      gratitudeDays: new Set(g.map((x) => x.entryDate)).size,
      lessons: lessonDates.filter(inW).length,
      todosDone: data.todoRows.filter((t) => t.done && t.dueDate && inW(t.dueDate)).length,
      mood: averageMood(moods, start, end),
    };
  });
}

function pearson(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  if (n < 6) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

const PAIRS: { a: keyof WeekBucket; b: keyof WeekBucket; an: string; bn: string }[] = [
  { a: "habitPct", b: "mood", an: "habit completion", bn: "mood" },
  { a: "journalDays", b: "mood", an: "journaling days", bn: "mood" },
  { a: "gratitudeItems", b: "mood", an: "gratitude logged", bn: "mood" },
  { a: "gratitudeItems", b: "habitPct", an: "gratitude logged", bn: "habit completion" },
  { a: "journalDays", b: "habitPct", an: "journaling days", bn: "habit completion" },
  { a: "todosDone", b: "mood", an: "to-dos done", bn: "mood" },
];

/** Weekly pairs that move together. Needs 6+ weeks with both values; correlation is not causation. */
export function correlations(weeks: WeekBucket[]): string[] {
  const out: { r: number; text: string }[] = [];
  for (const p of PAIRS) {
    const rows = weeks.filter((w) => w[p.a] !== null && w[p.b] !== null);
    const r = pearson(rows.map((w) => w[p.a] as number), rows.map((w) => w[p.b] as number));
    if (r === null || Math.abs(r) < 0.45) continue;
    const dir = r > 0 ? "higher" : "lower";
    out.push({
      r: Math.abs(r),
      text: `Weeks with more ${p.an} tended to have ${dir} ${p.bn} (${rows.length} weeks, r = ${r.toFixed(2)}). Treat it as a pattern to watch, not proof of cause.`,
    });
  }
  return out.sort((a, b) => b.r - a.r).slice(0, 3).map((o) => o.text);
}

export function weekdayCounts(logDates: string[]): { day: string; count: number }[] {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = new Array(7).fill(0);
  for (const d of logDates) counts[new Date(d + "T00:00:00Z").getUTCDay()]++;
  return [1, 2, 3, 4, 5, 6, 0].map((i) => ({ day: names[i], count: counts[i] }));
}

export function categoryCounts(items: { category: string }[]): { category: string; count: number }[] {
  const m = new Map<string, number>();
  for (const i of items) m.set(i.category, (m.get(i.category) ?? 0) + 1);
  return [...m.entries()].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
}
