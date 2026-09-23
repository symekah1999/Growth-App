/**
 * One-time (and safe-to-rerun) seed script.
 *
 * Loads:
 *  1. The full KJV Bible (66 books, ~31,100 verses — public domain) into
 *     bible_books / bible_verses. This is global content, not tied to any
 *     one user.
 *  2. A starter set of quotes, tied to your account (needs SEED_USER_ID —
 *     your Supabase auth user id — see README.md for how to find it).
 *     Safe to skip: just omit SEED_USER_ID and re-run later.
 *
 * Usage:
 *   npm run db:seed              # Bible only
 *   SEED_USER_ID=<uuid> npm run db:seed   # Bible + starter quotes
 */
import "dotenv/config";
import { db } from "./index";
import { bibleBooks, bibleVerses, quotes } from "./schema";
import { BOOK_META } from "./seed-data/books";
import { STARTER_QUOTES } from "./seed-data/quotes";
import kjv from "./seed-data/kjv.json";
import { sql } from "drizzle-orm";

type KjvBook = { abbrev: string; chapters: string[][] };

async function seedBible() {
  const existing = await db.select({ count: sql<number>`count(*)` }).from(bibleBooks);
  if (Number(existing[0]?.count ?? 0) > 0) {
    console.log("Bible already seeded — skipping. (Delete rows from bible_books to force a reseed.)");
    return;
  }

  console.log("Seeding Bible books...");
  await db.insert(bibleBooks).values(
    BOOK_META.map((b, i) => ({
      id: i + 1,
      name: b.name,
      testament: b.testament,
      chapterCount: (kjv as KjvBook[])[i].chapters.length,
      sortOrder: i + 1,
    })),
  );

  console.log("Seeding verses (this takes a minute)...");
  const rows: { bookId: number; chapter: number; verse: number; text: string; translation: string }[] = [];
  (kjv as KjvBook[]).forEach((book, bookIdx) => {
    book.chapters.forEach((chapter, chapterIdx) => {
      chapter.forEach((text, verseIdx) => {
        rows.push({
          bookId: bookIdx + 1,
          chapter: chapterIdx + 1,
          verse: verseIdx + 1,
          text: text.replace(/\{|\}/g, ""), // KJV source wraps italicized words in { }
          translation: "KJV",
        });
      });
    });
  });

  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    await db.insert(bibleVerses).values(rows.slice(i, i + BATCH));
    process.stdout.write(`\r  inserted ${Math.min(i + BATCH, rows.length)}/${rows.length} verses`);
  }
  console.log("\nBible seeded:", rows.length, "verses.");
}

async function seedQuotes() {
  const userId = process.env.SEED_USER_ID;
  if (!userId) {
    console.log("SEED_USER_ID not set — skipping starter quotes (you can add your own from the Quotes page).");
    return;
  }

  const existing = await db.select({ count: sql<number>`count(*)` }).from(quotes);
  if (Number(existing[0]?.count ?? 0) > 0) {
    console.log("Quotes table already has rows — skipping starter quotes.");
    return;
  }

  console.log("Seeding starter quotes for user", userId);
  await db.insert(quotes).values(STARTER_QUOTES.map((q) => ({ ...q, userId })));
  console.log("Quotes seeded:", STARTER_QUOTES.length);
}

async function main() {
  await seedBible();
  await seedQuotes();
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
