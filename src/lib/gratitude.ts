import { db } from "@/db";
import { gratitudeEntries } from "@/db/schema-gratitude";
import { addDaysISO, dailyIndex } from "@/lib/utils";
import { desc, eq } from "drizzle-orm";

export type GratitudeRow = typeof gratitudeEntries.$inferSelect;

/** Loads the owner's gratitude rows, newest first. Returns null if the table
 * hasn't been created yet, so callers can show a setup note instead of crashing. */
export async function loadGratitude(userId: string, limit = 3000): Promise<GratitudeRow[] | null> {
  try {
    return await db
      .select()
      .from(gratitudeEntries)
      .where(eq(gratitudeEntries.userId, userId))
      .orderBy(desc(gratitudeEntries.entryDate), desc(gratitudeEntries.createdAt))
      .limit(limit);
  } catch {
    return null;
  }
}

/** Current streak of consecutive days with at least one entry. A streak is still
 * alive if you logged yesterday but haven't yet today. */
export function currentStreak(dates: string[], today: string): number {
  const set = new Set(dates);
  let day = set.has(today) ? today : addDaysISO(today, -1);
  let n = 0;
  while (set.has(day)) {
    n += 1;
    day = addDaysISO(day, -1);
  }
  return n;
}

export function longestStreak(dates: string[]): number {
  const sorted = [...new Set(dates)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev && addDaysISO(prev, 1) === d ? run + 1 : 1;
    if (run > best) best = run;
    prev = d;
  }
  return best;
}

/** Entries from the same calendar day in earlier years ("on this day"). */
export function onThisDay(rows: GratitudeRow[], today: string): GratitudeRow[] {
  const md = today.slice(5);
  return rows.filter((r) => r.entryDate.slice(5) === md && r.entryDate.slice(0, 4) < today.slice(0, 4));
}

/** A stable-for-the-day older entry (at least a week old) worth remembering. */
export function resurfaced(rows: GratitudeRow[], today: string): GratitudeRow | null {
  const cutoff = addDaysISO(today, -7);
  const pool = rows.filter((r) => r.entryDate <= cutoff);
  return pool.length ? pool[dailyIndex(today, pool.length)] : null;
}

/** Split free text (one thing per line, optional bullets/numbers) into items. */
export function parseItems(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-*•·]|\d+[.)])\s*/, "").trim())
    .filter(Boolean)
    .map((l) => l.slice(0, 500))
    .slice(0, 25);
}
