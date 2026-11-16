import { pgTable, uuid, text, date, smallint, integer, numeric, jsonb, timestamp, boolean, primaryKey } from "drizzle-orm/pg-core";

/** 6-Month Challenge tables. SQL is in drizzle/manual/challenge.sql (run once in Neon). */

export type Excuse = { excuse: string; plan: string };

export const challengePlan = pgTable("challenge_plan", {
  userId: uuid("user_id").primaryKey(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  headline: text("headline").notNull().default(""),
  headlineBy: date("headline_by"),
  support1: text("support1").notNull().default(""),
  support2: text("support2").notNull().default(""),
  why: text("why").notNull().default(""),
  vices: text("vices").array().notNull().default([]),
  people: text("people").array().notNull().default([]),
  excuses: jsonb("excuses").$type<Excuse[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const challengeDays = pgTable(
  "challenge_days",
  {
    userId: uuid("user_id").notNull(),
    day: date("day").notNull(),
    checks: jsonb("checks").$type<Record<string, boolean>>().notNull().default({}),
    score: smallint("score").notNull().default(0),
    socialMinutes: integer("social_minutes"),
    sleepHours: numeric("sleep_hours", { precision: 3, scale: 1 }),
    deepBlocks: smallint("deep_blocks"),
    tomorrowTask: text("tomorrow_task"),
    note: text("note"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

export const challengeRuleChecks = pgTable(
  "challenge_rule_checks",
  {
    userId: uuid("user_id").notNull(),
    rule: smallint("rule").notNull(),
    month: smallint("month").notNull(),
    done: boolean("done").notNull().default(true),
  },
  (t) => [primaryKey({ columns: [t.userId, t.rule, t.month] })],
);

export const challengeReviews = pgTable("challenge_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  weekEnding: date("week_ending").notNull(),
  pace: text("pace").notNull().default("on"),
  worked: text("worked").notNull().default(""),
  failed: text("failed").notNull().default(""),
  change: text("change").notNull().default(""),
  nextPlan: text("next_plan").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const challengeSetbacks = pgTable("challenge_setbacks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  day: date("day").notNull(),
  what: text("what").notNull(),
  control: text("control").notNull().default(""),
  nextTime: text("next_time").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const challengeScorecard = pgTable(
  "challenge_scorecard",
  {
    userId: uuid("user_id").notNull(),
    measure: text("measure").notNull(),
    baseline: text("baseline").notNull().default(""),
    month3: text("month3").notNull().default(""),
    month6: text("month6").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.measure] })],
);

/** Weekly keep-up rating for each of the 15 rules (week_start is the Monday). */
export const challengeRuleWeeks = pgTable(
  "challenge_rule_weeks",
  {
    userId: uuid("user_id").notNull(),
    rule: smallint("rule").notNull(),
    weekStart: date("week_start").notNull(),
    status: text("status").notNull(), // kept | partly | missed
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.rule, t.weekStart] })],
);

/** The Proverbs chapter read each day, with a one-line "how I'll apply it". */
export const challengeProverbs = pgTable(
  "challenge_proverbs",
  {
    userId: uuid("user_id").notNull(),
    day: date("day").notNull(),
    chapter: smallint("chapter").notNull(),
    reflection: text("reflection").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

/** The apex animal studied each day, with a one-line "how I'll apply it". */
export const challengeWild = pgTable(
  "challenge_wild",
  {
    userId: uuid("user_id").notNull(),
    day: date("day").notNull(),
    animal: text("animal").notNull(),
    reflection: text("reflection").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);
