import { db } from "@/db";
import { bibleBooks, bibleVerses, quotes } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { dailyIndex, todayISO } from "@/lib/utils";
import { FEATURED_REFERENCES } from "@/db/seed-data/books";

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

/** Quote of the day: deterministic pick from this user's own quote bank. */
export async function getQuoteOfTheDay(userId: string, dateISO = todayISO()) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(quotes)
    .where(eq(quotes.userId, userId));

  const total = Number(count ?? 0);
  if (total === 0) return null;

  const idx = dailyIndex(dateISO, total);

  const [row] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.userId, userId))
    .orderBy(quotes.createdAt)
    .limit(1)
    .offset(idx);

  return row ?? null;
}
