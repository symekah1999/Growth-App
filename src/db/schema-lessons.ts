import { pgTable, uuid, text, date, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Life lessons — one row per lesson the owner logs. Kept in its own module so
 * it can ship independently; the SQL to create it is in
 * drizzle/manual/life_lessons.sql (run once in the Neon SQL editor).
 */
export const lifeLessons = pgTable(
  "life_lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    lesson: text("lesson").notNull(),
    context: text("context"),
    category: text("category").notNull().default("life"),
    source: text("source"),
    learnedOn: date("learned_on").notNull().default(sql`CURRENT_DATE`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("life_lessons_user_date_idx").on(t.userId, t.learnedOn)],
);

export const LESSON_CATEGORIES = [
  { key: "life", label: "Life" },
  { key: "self", label: "Self & character" },
  { key: "faith", label: "Faith" },
  { key: "work", label: "Work & career" },
  { key: "money", label: "Money" },
  { key: "relationships", label: "Relationships" },
  { key: "health", label: "Health" },
  { key: "failure", label: "From a failure" },
  { key: "resilience", label: "From great lives" },
] as const;

export type LessonCategory = (typeof LESSON_CATEGORIES)[number]["key"];
