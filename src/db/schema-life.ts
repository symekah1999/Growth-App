import { boolean, date, index, jsonb, pgTable, primaryKey, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * To-don't list, affirmations and the birthday-year plan. Kept in their own module;
 * the SQL to create the tables is drizzle/manual/life.sql (run once in the Neon SQL editor).
 */

/** Things to avoid, each with a reason and a replacement action. */
export const todonts = pgTable(
  "todonts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    text: text("text").notNull(),
    why: text("why").notNull().default(""),
    instead: text("instead").notNull().default(""),
    category: text("category").notNull().default("life"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("todonts_user_idx").on(t.userId)],
);

/** One row per to-don't per day: held the line, or slipped (with an optional note). */
export const todontLogs = pgTable(
  "todont_logs",
  {
    userId: uuid("user_id").notNull(),
    todontId: uuid("todont_id").notNull(),
    day: date("day").notNull(),
    held: boolean("held").notNull(),
    note: text("note").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.todontId, t.day] })],
);

/** Affirmations the owner saved from the library (libraryKey set) or wrote themselves. */
export const myAffirmations = pgTable(
  "my_affirmations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    text: text("text").notNull(),
    category: text("category").notNull().default("mine"),
    libraryKey: text("library_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("my_affirmations_user_idx").on(t.userId)],
);

export type YearGoal = { goal: string; measure: string; q: [string, string, string, string]; progress: number };
export type BucketItem = { text: string; done: boolean };

/** The plan for one year of life, keyed by the age being lived (e.g. 27 = from the 27th birthday to the 28th). */
export const yearPlans = pgTable(
  "year_plans",
  {
    userId: uuid("user_id").notNull(),
    age: smallint("age").notNull(),
    startDate: date("start_date").notNull(), // the birthday that opens the year
    theme: text("theme").notNull().default(""),
    vision: text("vision").notNull().default(""),
    stop: text("stop").notNull().default(""),
    start: text("start").notNull().default(""),
    goals: jsonb("goals").$type<Record<string, YearGoal>>().notNull().default({}),
    quarters: jsonb("quarters").$type<string[]>().notNull().default([]),
    bucket: jsonb("bucket").$type<BucketItem[]>().notNull().default([]),
    letter: text("letter").notNull().default(""),
    sealed: boolean("sealed").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.age] })],
);

/** Monthly check-ins (kind "month", period 1-12) and quarterly reviews (kind "quarter", period 1-4). */
export const yearReviews = pgTable(
  "year_reviews",
  {
    userId: uuid("user_id").notNull(),
    age: smallint("age").notNull(),
    kind: text("kind").notNull(),
    period: smallint("period").notNull(),
    rating: smallint("rating"),
    wins: text("wins").notNull().default(""),
    lessons: text("lessons").notNull().default(""),
    adjust: text("adjust").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.age, t.kind, t.period] })],
);

/** Daily reflection on the "Rules to live by": the sentence of the day, how it was lived, and 1% better. SQL: drizzle/manual/life-3.sql */
export const ruleReflections = pgTable(
  "rule_reflections",
  {
    userId: uuid("user_id").notNull(),
    day: date("day").notNull(),
    sentence: smallint("sentence").notNull(),
    hack: smallint("hack").notNull(),
    action: text("action").notNull().default(""),
    lived: text("lived").notNull().default(""), // yes | partly | no | ""
    applied: boolean("applied").notNull().default(false),
    better: text("better").notNull().default(""),
    note: text("note").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

/** Growth experiments (No-Complaint, 75 Hard, 52-Week Money…): one row per challenge, restarted on a slip. */
export const growthTrials = pgTable(
  "growth_trials",
  {
    userId: uuid("user_id").notNull(),
    key: text("key").notNull(),
    startDate: date("start_date").notNull(),
    active: boolean("active").notNull().default(true),
    focus: text("focus").notNull().default(""),
    attempts: smallint("attempts").notNull().default(1),
    best: smallint("best").notNull().default(0),
    completed: smallint("completed").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.key] })],
);
