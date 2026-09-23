import { db } from "@/db";
import { bibleBooks, bibleVerses, quotes } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { dailyIndex, todayISO } from "@/lib/utils";
import { FEATURED_REFERENCES } from "@/db/seed-data/books";
import { getPrayerForTheme } from "@/db/seed-data/prayers";
import { QUOTE_LIBRARY } from "@/db/seed-data/quote-library";

/** Verse of the day: deterministic pick from a curated reference list, so it
 * changes once every 24h and is the same all day without needing a cron job
 * or a row to write. Falls back gracefully if the Bible hasn't been seeded. */
export async function getVerseOfTheDay(dateISO = todayISO()) {
  const idx = dailyIndex(dateISO, FEATURED_REFERENCES.length);
  const ref = FEATURED_REFERENCES[idx];
  if (!ref) return null;

  const [row] = await db
    .select({
      text: bibleVerses.text,
      chapter: bibleVerses.chapter,
      verse: bibleVerses.verse,
      book: bibleBooks.name,
      bookId: bibleBooks.id,
    })
    .from(bibleVerses)
    .innerJoin(bibleBooks, eq(bibleVerses.bookId, bibleBooks.id))
    .where(
      and(eq(bibleBooks.name, ref.book), eq(bibleVerses.chapter, ref.chapter), eq(bibleVerses.verse, ref.verse)),
    )
    .limit(1);

  return row ?? null;
}

/** Prayer of the day: paired by theme to the same featured reference that
 * getVerseOfTheDay picks, so the two are always consistent with each other
 * for a given date. No DB row, no API call — same deterministic approach. */
export function getPrayerOfTheDay(dateISO = todayISO()) {
  const idx = dailyIndex(dateISO, FEATURED_REFERENCES.length);
  const ref = FEATURED_REFERENCES[idx];
  if (!ref) return null;
  return getPrayerForTheme(ref.theme);
}

/** Quote of the day: deterministic pick from the built-in library plus this
 * user's own saved quotes (your own quotes get double weight so they show up
 * more often). */
export async function getQuoteOfTheDay(userId: string, dateISO = todayISO()) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(quotes)
    .where(eq(quotes.userId, userId));

  const own = Number(count ?? 0);
  const pool = QUOTE_LIBRARY.length + own * 2;
  const idx = dailyIndex(dateISO + "-quote", pool);

  if (idx < QUOTE_LIBRARY.length) {
    const q = QUOTE_LIBRARY[idx];
    return { text: q.text, author: q.author, category: q.category };
  }

  const [row] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.userId, userId))
    .orderBy(quotes.createdAt)
    .limit(1)
    .offset(Math.floor((idx - QUOTE_LIBRARY.length) / 2));

  return row ? { text: row.text, author: row.author, category: row.category } : null;
}
