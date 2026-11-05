import { db } from "@/db";
import {
  bibleBooks,
  bibleVerses,
  coreValues,
  goals,
  habits,
  journalEntries,
  mantras,
  quotes,
  todos,
} from "@/db/schema";
import { lifeLessons } from "@/db/schema-lessons";
import { gratitudeEntries } from "@/db/schema-gratitude";
import { LIFE_SYSTEMS } from "@/db/seed-data/life-systems";
import { RESILIENCE_STORIES } from "@/db/seed-data/resilience";
import { REALITIES } from "@/db/seed-data/realities";
import { QUOTE_LIBRARY } from "@/db/seed-data/quote-library";
import { and, desc, eq, ilike, or } from "drizzle-orm";

export type SearchItem = { title: string; snippet?: string; meta?: string; href: string };
export type SearchGroup = { key: string; label: string; href: string; total: number; items: SearchItem[] };

const PER_GROUP = 6;

/** Escape LIKE wildcards so the user's text is matched literally. */
function like(q: string) {
  return `%${q.replace(/[\\%_]/g, "\\$&")}%`;
}

/** A short excerpt of `text` around the first match of `q`. */
export function snippet(text: string | null | undefined, q: string, len = 150): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, " ").trim();
  const i = clean.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return clean.length > len ? clean.slice(0, len).trimEnd() + "…" : clean;
  const start = Math.max(0, i - Math.floor(len / 3));
  const end = Math.min(clean.length, start + len);
  return (start > 0 ? "…" : "") + clean.slice(start, end).trim() + (end < clean.length ? "…" : "");
}

const safe = <T,>(p: Promise<T[]>): Promise<T[]> => p.catch(() => [] as T[]);

/** Searches everything the owner has written plus the built-in libraries. */
export async function searchAll(userId: string, rawQuery: string): Promise<SearchGroup[]> {
  const q = rawQuery.trim().slice(0, 80);
  if (q.length < 2) return [];
  const pat = like(q);
  const lc = q.toLowerCase();
  const enc = encodeURIComponent(q);
  const has = (...vals: (string | null | undefined)[]) => vals.some((v) => v && v.toLowerCase().includes(lc));

  const [journal, goalRows, todoRows, habitRows, mantraRows, valueRows, quoteRows, lessonRows, gratitudeRows, verseRows] =
    await Promise.all([
      safe(
        db
          .select({ id: journalEntries.id, title: journalEntries.title, body: journalEntries.body, entryDate: journalEntries.entryDate })
          .from(journalEntries)
          .where(and(eq(journalEntries.userId, userId), or(ilike(journalEntries.title, pat), ilike(journalEntries.body, pat))))
          .orderBy(desc(journalEntries.entryDate))
          .limit(40),
      ),
      safe(
        db
          .select()
          .from(goals)
          .where(and(eq(goals.userId, userId), or(ilike(goals.title, pat), ilike(goals.description, pat))))
          .limit(40),
      ),
      safe(
        db
          .select()
          .from(todos)
          .where(and(eq(todos.userId, userId), ilike(todos.title, pat)))
          .orderBy(desc(todos.createdAt))
          .limit(40),
      ),
      safe(
        db
          .select()
          .from(habits)
          .where(and(eq(habits.userId, userId), or(ilike(habits.name, pat), ilike(habits.description, pat))))
          .limit(40),
      ),
      safe(db.select().from(mantras).where(and(eq(mantras.userId, userId), ilike(mantras.text, pat))).limit(40)),
      safe(
        db
          .select()
          .from(coreValues)
          .where(and(eq(coreValues.userId, userId), or(ilike(coreValues.title, pat), ilike(coreValues.description, pat))))
          .limit(40),
      ),
      safe(
        db
          .select()
          .from(quotes)
          .where(and(eq(quotes.userId, userId), or(ilike(quotes.text, pat), ilike(quotes.author, pat))))
          .limit(40),
      ),
      safe(
        db
          .select()
          .from(lifeLessons)
          .where(and(eq(lifeLessons.userId, userId), or(ilike(lifeLessons.lesson, pat), ilike(lifeLessons.context, pat), ilike(lifeLessons.source, pat))))
          .orderBy(desc(lifeLessons.learnedOn))
          .limit(40),
      ),
      safe(
        db
          .select()
          .from(gratitudeEntries)
          .where(and(eq(gratitudeEntries.userId, userId), ilike(gratitudeEntries.text, pat)))
          .orderBy(desc(gratitudeEntries.entryDate))
          .limit(40),
      ),
      safe(
        db
          .select({ bookId: bibleBooks.id, book: bibleBooks.name, chapter: bibleVerses.chapter, verse: bibleVerses.verse, text: bibleVerses.text })
          .from(bibleVerses)
          .innerJoin(bibleBooks, eq(bibleVerses.bookId, bibleBooks.id))
          .where(ilike(bibleVerses.text, pat))
          .limit(40),
      ),
    ]);

  const systems = LIFE_SYSTEMS.filter((s) => has(s.title, s.summary, s.origin, s.tryToday, ...s.steps));
  const stories = RESILIENCE_STORIES.filter((s) => has(s.name, s.known, s.lesson, s.setback, s.persistence, s.breakthrough));
  const realities = REALITIES.filter((r) => has(r.truth, r.detail, r.action));
  const libQuotes = QUOTE_LIBRARY.filter((x) => has(x.text, x.author));

  const groups: SearchGroup[] = [
    {
      key: "journal",
      label: "Journal",
      href: `/journal?q=${enc}`,
      total: journal.length,
      items: journal.slice(0, PER_GROUP).map((e) => ({
        title: e.title || "Untitled entry",
        snippet: snippet(e.body, q),
        meta: e.entryDate,
        href: `/journal?q=${enc}`,
      })),
    },
    {
      key: "gratitude",
      label: "Gratitude",
      href: "/gratitude",
      total: gratitudeRows.length,
      items: gratitudeRows.slice(0, PER_GROUP).map((g) => ({ title: g.text, meta: g.entryDate, href: "/gratitude" })),
    },
    {
      key: "lessons",
      label: "My lessons",
      href: "/lessons",
      total: lessonRows.length,
      items: lessonRows.slice(0, PER_GROUP).map((l) => ({
        title: l.lesson,
        snippet: snippet(l.context, q),
        meta: [l.source, l.learnedOn].filter(Boolean).join(" · "),
        href: "/lessons",
      })),
    },
    {
      key: "goals",
      label: "Goals",
      href: "/goals",
      total: goalRows.length,
      items: goalRows.slice(0, PER_GROUP).map((g) => ({
        title: g.title,
        snippet: snippet(g.description, q),
        meta: `${g.status} · ${g.progress}%`,
        href: "/goals",
      })),
    },
    {
      key: "habits",
      label: "Habits",
      href: "/habits",
      total: habitRows.length,
      items: habitRows.slice(0, PER_GROUP).map((h) => ({ title: h.name, snippet: snippet(h.description, q), href: "/habits" })),
    },
    {
      key: "todos",
      label: "To-dos",
      href: "/todos",
      total: todoRows.length,
      items: todoRows.slice(0, PER_GROUP).map((t) => ({
        title: t.title,
        meta: `${t.scope}${t.dueDate ? " · " + t.dueDate : ""}${t.done ? " · done" : ""}`,
        href: "/todos",
      })),
    },
    {
      key: "mantras",
      label: "Mantras & values",
      href: "/mantras",
      total: mantraRows.length + valueRows.length,
      items: [
        ...mantraRows.map((m) => ({ title: m.text, meta: "Mantra", href: "/mantras" })),
        ...valueRows.map((v) => ({ title: v.title, snippet: snippet(v.description, q), meta: "Core value", href: "/mantras" })),
      ].slice(0, PER_GROUP),
    },
    {
      key: "myquotes",
      label: "My saved quotes",
      href: `/quotes?tab=mine&q=${enc}`,
      total: quoteRows.length,
      items: quoteRows.slice(0, PER_GROUP).map((x) => ({ title: `“${x.text}”`, meta: x.author ?? undefined, href: `/quotes?tab=mine&q=${enc}` })),
    },
    {
      key: "systems",
      label: "Life Systems",
      href: `/systems?q=${enc}`,
      total: systems.length,
      items: systems.slice(0, PER_GROUP).map((s) => ({ title: s.title, snippet: snippet(s.summary, q), meta: s.origin, href: `/systems?q=${enc}` })),
    },
    {
      key: "stories",
      label: "Great lives",
      href: "/lessons#library",
      total: stories.length,
      items: stories.slice(0, PER_GROUP).map((s) => ({ title: s.name, snippet: snippet(s.lesson, q), meta: s.known, href: "/lessons#library" })),
    },
    {
      key: "realities",
      label: "Realities of life",
      href: "/realities",
      total: realities.length,
      items: realities.slice(0, PER_GROUP).map((r) => ({ title: r.truth, snippet: snippet(r.detail, q), href: "/realities" })),
    },
    {
      key: "library",
      label: "Quote library",
      href: `/quotes?q=${enc}`,
      total: libQuotes.length,
      items: libQuotes.slice(0, PER_GROUP).map((x) => ({ title: `“${x.text}”`, meta: x.author, href: `/quotes?q=${enc}` })),
    },
    {
      key: "bible",
      label: "Bible",
      href: "/bible",
      total: verseRows.length,
      items: verseRows.slice(0, PER_GROUP).map((v) => ({
        title: `${v.book} ${v.chapter}:${v.verse}`,
        snippet: snippet(v.text, q),
        href: `/bible/${v.bookId}/${v.chapter}`,
      })),
    },
  ];

  return groups.filter((g) => g.total > 0);
}
