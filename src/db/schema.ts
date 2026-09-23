import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  date,
  smallint,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * NOTE ON AUTH
 * This app has a single "master account" — you. Auth identity/session is
 * handled by Supabase Auth (its own `auth.users` table lives in Supabase's
 * managed schema, not here). Every table below stores a `userId` (the
 * Supabase auth user id, a uuid) so the schema is future-proof if you ever
 * add a second account, but the app itself only ever allows the one
 * pre-configured owner email to sign in (see src/lib/auth.ts).
 */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

// ---------------------------------------------------------------------------
// JOURNAL
// ---------------------------------------------------------------------------
export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull().default(""),
    body: text("body").notNull(),
    mood: text("mood"), // e.g. grateful, anxious, energized, low, neutral
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    entryDate: date("entry_date").notNull(),
    ...timestamps,
  },
  (t) => [index("journal_user_date_idx").on(t.userId, t.entryDate)],
);

// ---------------------------------------------------------------------------
// GOALS
// ---------------------------------------------------------------------------
export const goalStatusEnum = ["active", "paused", "completed", "abandoned"] as const;
export type GoalStatus = (typeof goalStatusEnum)[number];

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull().default("general"), // career, health, finance, spiritual, relationships...
    status: text("status").notNull().default("active"),
    targetDate: date("target_date"),
    progress: smallint("progress").notNull().default(0), // 0-100
    ...timestamps,
  },
  (t) => [index("goals_user_idx").on(t.userId)],
);

export const goalMilestones = pgTable(
  "goal_milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    done: boolean("done").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("milestones_goal_idx").on(t.goalId)],
);

// ---------------------------------------------------------------------------
// HABITS
// ---------------------------------------------------------------------------
export const habits = pgTable(
  "habits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    frequency: text("frequency").notNull().default("daily"), // daily, weekly
    targetPerWeek: smallint("target_per_week").notNull().default(7),
    color: text("color").notNull().default("#6366f1"),
    archived: boolean("archived").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("habits_user_idx").on(t.userId)],
);

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    ...timestamps,
  },
  (t) => [
    index("habit_logs_habit_idx").on(t.habitId),
    primaryKey({ columns: [t.habitId, t.logDate], name: "habit_logs_unique_day" }),
  ],
);

// ---------------------------------------------------------------------------
// MANTRAS & CORE VALUES
// ---------------------------------------------------------------------------
export const mantras = pgTable("mantras", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  text: text("text").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const coreValues = pgTable("core_values", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(), // e.g. "Integrity"
  description: text("description"), // what it means to you / non-negotiable line
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// TODOS (daily / monthly / yearly)
// ---------------------------------------------------------------------------
export const todoScopeEnum = ["daily", "monthly", "yearly"] as const;
export type TodoScope = (typeof todoScopeEnum)[number];

export const todos = pgTable(
  "todos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    scope: text("scope").notNull().default("daily"), // daily, monthly, yearly
    dueDate: date("due_date"), // for daily: the day; for monthly: any day in that month; for yearly: any day in that year
    done: boolean("done").notNull().default(false),
    doneAt: timestamp("done_at", { withTimezone: true }),
    goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("todos_user_scope_due_idx").on(t.userId, t.scope, t.dueDate)],
);

// ---------------------------------------------------------------------------
// BIBLE
// ---------------------------------------------------------------------------
export const bibleBooks = pgTable("bible_books", {
  id: smallint("id").primaryKey(), // 1-66
  name: text("name").notNull(),
  testament: text("testament").notNull(), // old, new
  chapterCount: smallint("chapter_count").notNull(),
  sortOrder: smallint("sort_order").notNull(),
});

export const bibleVerses = pgTable(
  "bible_verses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: smallint("book_id")
      .notNull()
      .references(() => bibleBooks.id, { onDelete: "cascade" }),
    chapter: smallint("chapter").notNull(),
    verse: smallint("verse").notNull(),
    text: text("text").notNull(),
    translation: text("translation").notNull().default("KJV"),
  },
  (t) => [
    index("bible_verses_lookup_idx").on(t.bookId, t.chapter, t.verse),
  ],
);

export const verseOfTheDay = pgTable("verse_of_the_day", {
  date: date("date").primaryKey(),
  verseId: uuid("verse_id")
    .notNull()
    .references(() => bibleVerses.id, { onDelete: "cascade" }),
});

// ---------------------------------------------------------------------------
// QUOTES
// ---------------------------------------------------------------------------
export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  text: text("text").notNull(),
  author: text("author"),
  category: text("category"), // discipline, faith, resilience, focus...
  ...timestamps,
});

export const quoteOfTheDay = pgTable("quote_of_the_day", {
  date: date("date").primaryKey(),
  quoteId: uuid("quote_id")
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
});

// ---------------------------------------------------------------------------
// FINANCE — SAVINGS
// ---------------------------------------------------------------------------
export const savingsPlans = pgTable(
  "savings_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    targetAmount: numeric("target_amount", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("KES"),
    targetDate: date("target_date"),
    notes: text("notes"),
    archived: boolean("archived").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("savings_plans_user_idx").on(t.userId)],
);

export const savingsContributions = pgTable(
  "savings_contributions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => savingsPlans.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    contributedOn: date("contributed_on").notNull(),
    note: text("note"),
    ...timestamps,
  },
  (t) => [index("savings_contrib_plan_idx").on(t.planId)],
);

// ---------------------------------------------------------------------------
// FINANCE — DEBT
// ---------------------------------------------------------------------------
export const debts = pgTable(
  "debts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    principal: numeric("principal", { precision: 14, scale: 2 }).notNull(), // original amount
    balance: numeric("balance", { precision: 14, scale: 2 }).notNull(), // current remaining balance
    interestRateApr: numeric("interest_rate_apr", { precision: 6, scale: 3 }).notNull().default("0"),
    minPayment: numeric("min_payment", { precision: 14, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("KES"),
    dueDayOfMonth: smallint("due_day_of_month"),
    archived: boolean("archived").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("debts_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// RECOVERY (addiction / habit-break tracking against a day-count target)
// ---------------------------------------------------------------------------
export const recoveryTrackers = pgTable(
  "recovery_trackers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(), // e.g. "Alcohol", "Smoking", whatever you're tracking
    startDate: date("start_date").notNull(), // date of the current streak's day one
    targetDays: integer("target_days").notNull().default(1000),
    notes: text("notes"),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("recovery_trackers_user_idx").on(t.userId)],
);

// A record of every reset/relapse, so past streaks aren't lost — lets you
// see your longest streak even after starting over.
export const recoveryResets = pgTable(
  "recovery_resets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trackerId: uuid("tracker_id")
      .notNull()
      .references(() => recoveryTrackers.id, { onDelete: "cascade" }),
    resetDate: date("reset_date").notNull(),
    streakDaysAtReset: integer("streak_days_at_reset").notNull(),
    note: text("note"),
    ...timestamps,
  },
  (t) => [index("recovery_resets_tracker_idx").on(t.trackerId)],
);

// Optional daily check-in: a quick pulse-check, not required to keep the
// streak counter itself going (that's purely date-based).
export const recoveryCheckins = pgTable(
  "recovery_checkins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trackerId: uuid("tracker_id")
      .notNull()
      .references(() => recoveryTrackers.id, { onDelete: "cascade" }),
    checkinDate: date("checkin_date").notNull(),
    cravingLevel: smallint("craving_level"), // 1 (none) - 5 (intense), optional
    note: text("note"),
    ...timestamps,
  },
  (t) => [
    index("recovery_checkins_tracker_idx").on(t.trackerId),
    primaryKey({ columns: [t.trackerId, t.checkinDate], name: "recovery_checkins_unique_day" }),
  ],
);

// ---------------------------------------------------------------------------
// AI ASSISTANT — chat history (so conversations survive page reloads)
// ---------------------------------------------------------------------------
export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    role: text("role").notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("chat_messages_user_idx").on(t.userId, t.createdAt)],
);

export const debtPayments = pgTable(
  "debt_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    debtId: uuid("debt_id")
      .notNull()
      .references(() => debts.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    paidOn: date("paid_on").notNull(),
    note: text("note"),
    ...timestamps,
  },
  (t) => [index("debt_payments_debt_idx").on(t.debtId)],
);
