import { db } from "@/db";
import {
  journalEntries,
  goals,
  goalMilestones,
  habits,
  habitLogs,
  mantras,
  coreValues,
  todos,
  quotes,
  savingsPlans,
  savingsContributions,
  debts,
  debtPayments,
  recoveryTrackers,
  recoveryCheckins,
  recoveryResets,
  bibleBooks,
  bibleVerses,
} from "@/db/schema";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { streakDayCount, todayISO } from "@/lib/utils";
import { computeStreaks } from "@/lib/streaks";
import type Anthropic from "@anthropic-ai/sdk";
import { QUOTE_CATEGORIES, QUOTE_LIBRARY } from "@/db/seed-data/quote-library";
import { REALITIES, REALITY_THEMES, getRealityOfTheDay } from "@/db/seed-data/realities";

type ToolDef = Anthropic.Tool;
type Executor = (userId: string, input: Record<string, unknown>) => Promise<unknown>;

const registry: { tool: ToolDef; run: Executor }[] = [];

function define(tool: ToolDef, run: Executor) {
  registry.push({ tool, run });
}

/** Finds exactly one row in `rows` whose `field` fuzzy-matches `query`
 * (case-insensitive substring). Returns a helpful message if 0 or 2+ match. */
function resolveOne<T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T,
  query: string,
): { row: T } | { error: string } {
  const q = query.trim().toLowerCase();
  const exact = rows.filter((r) => String(r[field]).toLowerCase() === q);
  if (exact.length === 1) return { row: exact[0] };
  const matches = rows.filter((r) => String(r[field]).toLowerCase().includes(q));
  if (matches.length === 1) return { row: matches[0] };
  if (matches.length === 0) {
    return {
      error: `No match for "${query}". Existing options: ${rows.map((r) => String(r[field])).join(", ") || "(none yet)"}`,
    };
  }
  return {
    error: `"${query}" matches multiple items: ${matches.map((r) => String(r[field])).join(", ")}. Ask the user which one they mean.`,
  };
}

// ---------------------------------------------------------------------------
// OVERVIEW
// ---------------------------------------------------------------------------
define(
  {
    name: "get_overview",
    description:
      "Get a full snapshot of the user's Growth OS: active goals with progress, habits with current streaks, today's to-dos, active recovery trackers with day counts, savings plan totals, debt balances, and counts of journal entries/mantras/quotes. Call this first whenever you need context before answering a question or before taking an action, unless the user already gave you everything you need.",
    input_schema: { type: "object", properties: {} },
  },
  async (userId) => {
    const today = todayISO();
    const [g, h, t, r, sp, d, journalCount, mantraCount, quoteCount] = await Promise.all([
      db.select().from(goals).where(and(eq(goals.userId, userId), eq(goals.status, "active"))),
      db.select().from(habits).where(and(eq(habits.userId, userId), eq(habits.archived, false))),
      db.select().from(todos).where(and(eq(todos.userId, userId), eq(todos.scope, "daily"), eq(todos.dueDate, today))),
      db.select().from(recoveryTrackers).where(and(eq(recoveryTrackers.userId, userId), eq(recoveryTrackers.active, true))),
      db.select().from(savingsPlans).where(and(eq(savingsPlans.userId, userId), eq(savingsPlans.archived, false))),
      db.select().from(debts).where(and(eq(debts.userId, userId), eq(debts.archived, false))),
      db.select({ count: sql<number>`count(*)` }).from(journalEntries).where(eq(journalEntries.userId, userId)),
      db.select({ count: sql<number>`count(*)` }).from(mantras).where(eq(mantras.userId, userId)),
      db.select({ count: sql<number>`count(*)` }).from(quotes).where(eq(quotes.userId, userId)),
    ]);

    const habitsWithStreaks = await Promise.all(
      h.map(async (habit) => {
        const logs = await db.select().from(habitLogs).where(eq(habitLogs.habitId, habit.id)).orderBy(desc(habitLogs.logDate)).limit(60);
        const { current } = computeStreaks(logs.map((l) => l.logDate));
        return { name: habit.name, currentStreak: current, targetPerWeek: habit.targetPerWeek };
      }),
    );

    const savingsWithTotals = await Promise.all(
      sp.map(async (plan) => {
        const contributions = await db.select().from(savingsContributions).where(eq(savingsContributions.planId, plan.id));
        const total = contributions.reduce((s, c) => s + Number(c.amount), 0);
        return { name: plan.name, saved: total, target: Number(plan.targetAmount), currency: plan.currency };
      }),
    );

    return {
      today,
      activeGoals: g.map((x) => ({ title: x.title, category: x.category, progress: x.progress, targetDate: x.targetDate })),
      habits: habitsWithStreaks,
      todayTodos: t.map((x) => ({ title: x.title, done: x.done })),
      recovery: r.map((x) => ({ name: x.name, currentDay: streakDayCount(x.startDate), targetDays: x.targetDays })),
      savings: savingsWithTotals,
      debts: d.map((x) => ({ name: x.name, balance: Number(x.balance), interestRateApr: Number(x.interestRateApr), minPayment: Number(x.minPayment) })),
      journalEntryCount: Number(journalCount[0]?.count ?? 0),
      mantraCount: Number(mantraCount[0]?.count ?? 0),
      quoteCount: Number(quoteCount[0]?.count ?? 0),
    };
  },
);

// ---------------------------------------------------------------------------
// JOURNAL
// ---------------------------------------------------------------------------
define(
  {
    name: "create_journal_entry",
    description: "Add a new journal entry.",
    input_schema: {
      type: "object",
      properties: {
        body: { type: "string", description: "The journal entry text." },
        title: { type: "string" },
        mood: { type: "string", description: "e.g. grateful, anxious, energized, low, neutral" },
        tags: { type: "array", items: { type: "string" } },
        entryDate: { type: "string", description: "YYYY-MM-DD, defaults to today" },
      },
      required: ["body"],
    },
  },
  async (userId, input) => {
    const [row] = await db
      .insert(journalEntries)
      .values({
        userId,
        title: String(input.title ?? ""),
        body: String(input.body),
        mood: input.mood ? String(input.mood) : null,
        tags: Array.isArray(input.tags) ? (input.tags as string[]) : [],
        entryDate: String(input.entryDate ?? todayISO()),
      })
      .returning();
    return { created: true, id: row.id };
  },
);

define(
  {
    name: "list_journal_entries",
    description: "List recent journal entries, optionally filtered by a search term.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
  async (userId, input) => {
    const conditions = [eq(journalEntries.userId, userId)];
    if (input.query) conditions.push(ilike(journalEntries.body, `%${input.query}%`));
    const rows = await db
      .select()
      .from(journalEntries)
      .where(and(...conditions))
      .orderBy(desc(journalEntries.entryDate))
      .limit(Number(input.limit ?? 10));
    return rows.map((r) => ({ id: r.id, date: r.entryDate, title: r.title, mood: r.mood, excerpt: r.body.slice(0, 200) }));
  },
);

// ---------------------------------------------------------------------------
// GOALS
// ---------------------------------------------------------------------------
define(
  {
    name: "create_goal",
    description: "Create a new goal.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        category: { type: "string", description: "e.g. career, health, finance, spiritual, relationships, learning, general" },
        targetDate: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["title"],
    },
  },
  async (userId, input) => {
    const [row] = await db
      .insert(goals)
      .values({
        userId,
        title: String(input.title),
        description: input.description ? String(input.description) : null,
        category: String(input.category ?? "general"),
        targetDate: input.targetDate ? String(input.targetDate) : null,
      })
      .returning();
    return { created: true, id: row.id };
  },
);

define(
  {
    name: "update_goal_progress",
    description: "Set a goal's progress percentage (0-100), matched by title.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "The goal's title, or part of it." },
        progress: { type: "number" },
      },
      required: ["title", "progress"],
    },
  },
  async (userId, input) => {
    const rows = await db.select().from(goals).where(eq(goals.userId, userId));
    const found = resolveOne(rows, "title", String(input.title));
    if ("error" in found) return found;
    const progress = Math.max(0, Math.min(100, Number(input.progress)));
    await db.update(goals).set({ progress, updatedAt: new Date() }).where(eq(goals.id, found.row.id));
    return { updated: true, title: found.row.title, progress };
  },
);

define(
  {
    name: "set_goal_status",
    description: "Change a goal's status: active, paused, completed, or abandoned. Matched by title.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        status: { type: "string", enum: ["active", "paused", "completed", "abandoned"] },
      },
      required: ["title", "status"],
    },
  },
  async (userId, input) => {
    const rows = await db.select().from(goals).where(eq(goals.userId, userId));
    const found = resolveOne(rows, "title", String(input.title));
    if ("error" in found) return found;
    await db.update(goals).set({ status: String(input.status), updatedAt: new Date() }).where(eq(goals.id, found.row.id));
    return { updated: true, title: found.row.title, status: input.status };
  },
);

define(
  {
    name: "add_goal_milestone",
    description: "Add a milestone/sub-task to an existing goal, matched by title.",
    input_schema: {
      type: "object",
      properties: {
        goalTitle: { type: "string" },
        milestoneTitle: { type: "string" },
      },
      required: ["goalTitle", "milestoneTitle"],
    },
  },
  async (userId, input) => {
    const rows = await db.select().from(goals).where(eq(goals.userId, userId));
    const found = resolveOne(rows, "title", String(input.goalTitle));
    if ("error" in found) return found;
    await db.insert(goalMilestones).values({ goalId: found.row.id, title: String(input.milestoneTitle) });
    return { created: true, goal: found.row.title, milestone: input.milestoneTitle };
  },
);

define(
  {
    name: "list_goals",
    description: "List goals, optionally filtered by status.",
    input_schema: {
      type: "object",
      properties: { status: { type: "string", enum: ["active", "paused", "completed", "abandoned"] } },
    },
  },
  async (userId, input) => {
    const conditions = [eq(goals.userId, userId)];
    if (input.status) conditions.push(eq(goals.status, String(input.status)));
    const rows = await db.select().from(goals).where(and(...conditions)).orderBy(desc(goals.createdAt));
    return rows.map((r) => ({ title: r.title, category: r.category, status: r.status, progress: r.progress, targetDate: r.targetDate }));
  },
);

// ---------------------------------------------------------------------------
// HABITS
// ---------------------------------------------------------------------------
define(
  {
    name: "create_habit",
    description: "Create a new habit to track.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        frequency: { type: "string", enum: ["daily", "weekly"] },
        targetPerWeek: { type: "number" },
      },
      required: ["name"],
    },
  },
  async (userId, input) => {
    const [row] = await db
      .insert(habits)
      .values({
        userId,
        name: String(input.name),
        description: input.description ? String(input.description) : null,
        frequency: String(input.frequency ?? "daily"),
        targetPerWeek: Number(input.targetPerWeek ?? 7),
      })
      .returning();
    return { created: true, id: row.id };
  },
);

define(
  {
    name: "log_habit",
    description: "Mark a habit as done for a given date (defaults to today), matched by name. Calling this again for the same day un-marks it (toggle).",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD, defaults to today" },
      },
      required: ["name"],
    },
  },
  async (userId, input) => {
    const rows = await db.select().from(habits).where(and(eq(habits.userId, userId), eq(habits.archived, false)));
    const found = resolveOne(rows, "name", String(input.name));
    if ("error" in found) return found;
    const date = String(input.date ?? todayISO());

    const existing = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, found.row.id), eq(habitLogs.logDate, date)))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(habitLogs).where(and(eq(habitLogs.habitId, found.row.id), eq(habitLogs.logDate, date)));
      return { habit: found.row.name, date, logged: false };
    }
    await db.insert(habitLogs).values({ habitId: found.row.id, logDate: date });
    return { habit: found.row.name, date, logged: true };
  },
);

define(
  {
    name: "list_habits",
    description: "List active habits with their current streaks.",
    input_schema: { type: "object", properties: {} },
  },
  async (userId) => {
    const rows = await db.select().from(habits).where(and(eq(habits.userId, userId), eq(habits.archived, false)));
    return Promise.all(
      rows.map(async (h) => {
        const logs = await db.select().from(habitLogs).where(eq(habitLogs.habitId, h.id)).orderBy(desc(habitLogs.logDate)).limit(60);
        const { current, longest } = computeStreaks(logs.map((l) => l.logDate));
        return { name: h.name, frequency: h.frequency, targetPerWeek: h.targetPerWeek, currentStreak: current, longestStreak: longest };
      }),
    );
  },
);

// ---------------------------------------------------------------------------
// MANTRAS & VALUES
// ---------------------------------------------------------------------------
define(
  {
    name: "add_mantra",
    description: "Add a personal mantra.",
    input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
  },
  async (userId, input) => {
    await db.insert(mantras).values({ userId, text: String(input.text) });
    return { created: true };
  },
);

define(
  {
    name: "add_core_value",
    description: "Add a non-negotiable core value.",
    input_schema: {
      type: "object",
      properties: { title: { type: "string" }, description: { type: "string" } },
      required: ["title"],
    },
  },
  async (userId, input) => {
    await db.insert(coreValues).values({ userId, title: String(input.title), description: input.description ? String(input.description) : null });
    return { created: true };
  },
);

define(
  {
    name: "list_mantras_and_values",
    description: "List the user's mantras and core values.",
    input_schema: { type: "object", properties: {} },
  },
  async (userId) => {
    const [m, v] = await Promise.all([
      db.select().from(mantras).where(eq(mantras.userId, userId)),
      db.select().from(coreValues).where(eq(coreValues.userId, userId)),
    ]);
    return { mantras: m.map((x) => x.text), values: v.map((x) => ({ title: x.title, description: x.description })) };
  },
);

// ---------------------------------------------------------------------------
// TODOS
// ---------------------------------------------------------------------------
define(
  {
    name: "create_todo",
    description: "Add a to-do item.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        scope: { type: "string", enum: ["daily", "monthly", "yearly"] },
        dueDate: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["title"],
    },
  },
  async (userId, input) => {
    const scope = String(input.scope ?? "daily");
    const [row] = await db
      .insert(todos)
      .values({
        userId,
        title: String(input.title),
        scope,
        dueDate: input.dueDate ? String(input.dueDate) : scope === "daily" ? todayISO() : null,
      })
      .returning();
    return { created: true, id: row.id };
  },
);

define(
  {
    name: "complete_todo",
    description: "Mark a to-do as done (or not done again), matched by title.",
    input_schema: {
      type: "object",
      properties: { title: { type: "string" }, done: { type: "boolean", description: "defaults to true" } },
      required: ["title"],
    },
  },
  async (userId, input) => {
    const rows = await db.select().from(todos).where(and(eq(todos.userId, userId), eq(todos.done, false)));
    const found = resolveOne(rows, "title", String(input.title));
    if ("error" in found) return found;
    const done = input.done === undefined ? true : Boolean(input.done);
    await db.update(todos).set({ done, doneAt: done ? new Date() : null, updatedAt: new Date() }).where(eq(todos.id, found.row.id));
    return { updated: true, title: found.row.title, done };
  },
);

define(
  {
    name: "list_todos",
    description: "List to-dos, optionally filtered by scope.",
    input_schema: { type: "object", properties: { scope: { type: "string", enum: ["daily", "monthly", "yearly"] } } },
  },
  async (userId, input) => {
    const conditions = [eq(todos.userId, userId)];
    if (input.scope) conditions.push(eq(todos.scope, String(input.scope)));
    const rows = await db.select().from(todos).where(and(...conditions)).orderBy(desc(todos.createdAt)).limit(50);
    return rows.map((r) => ({ title: r.title, scope: r.scope, dueDate: r.dueDate, done: r.done }));
  },
);

// ---------------------------------------------------------------------------
// QUOTES
// ---------------------------------------------------------------------------
define(
  {
    name: "add_quote",
    description: "Add a quote to the user's personal quote bank.",
    input_schema: {
      type: "object",
      properties: { text: { type: "string" }, author: { type: "string" }, category: { type: "string" } },
      required: ["text"],
    },
  },
  async (userId, input) => {
    await db.insert(quotes).values({
      userId,
      text: String(input.text),
      author: input.author ? String(input.author) : null,
      category: input.category ? String(input.category) : null,
    });
    return { created: true };
  },
);

define(
  {
    name: "browse_quote_library",
    description: `Search the built-in library of ${QUOTE_LIBRARY.length} quotes (scripture, classical thinkers, proverbs incl. Swahili, modern voices). Filter by category and/or a keyword. Categories: ${QUOTE_CATEGORIES.map((c) => c.slug).join(", ")}. Use this to encourage the user with a fitting quote rather than inventing one.`,
    input_schema: {
      type: "object",
      properties: { category: { type: "string" }, query: { type: "string" }, limit: { type: "number" } },
    },
  },
  async (_userId, input) => {
    const cat = input.category ? String(input.category) : null;
    const q = input.query ? String(input.query).toLowerCase() : null;
    const limit = Math.min(20, Number(input.limit ?? 8));
    return QUOTE_LIBRARY.filter(
      (x) => (!cat || x.category === cat) && (!q || x.text.toLowerCase().includes(q) || x.author.toLowerCase().includes(q)),
    )
      .slice(0, limit)
      .map(({ text, author, category }) => ({ text, author, category }));
  },
);

// ---------------------------------------------------------------------------
// REALITIES OF LIFE
// ---------------------------------------------------------------------------
define(
  {
    name: "get_life_realities",
    description: `Get "realities of life" — hard truths with an explanation and one concrete action each. Filter by theme (${REALITY_THEMES.map((t) => t.slug).join(", ")}) or get today's reality with today=true. Use when the user needs perspective, a reality check, or practical wisdom.`,
    input_schema: {
      type: "object",
      properties: { theme: { type: "string" }, today: { type: "boolean" } },
    },
  },
  async (_userId, input) => {
    if (input.today) return getRealityOfTheDay();
    const theme = input.theme ? String(input.theme) : null;
    return REALITIES.filter((r) => !theme || r.theme === theme).map(({ theme, truth, detail, action }) => ({ theme, truth, detail, action }));
  },
);

// ---------------------------------------------------------------------------
// SAVINGS
// ---------------------------------------------------------------------------
define(
  {
    name: "create_savings_plan",
    description: "Create a new savings plan/goal.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        targetAmount: { type: "number" },
        currency: { type: "string" },
        targetDate: { type: "string" },
      },
      required: ["name", "targetAmount"],
    },
  },
  async (userId, input) => {
    const [row] = await db
      .insert(savingsPlans)
      .values({
        userId,
        name: String(input.name),
        targetAmount: String(input.targetAmount),
        currency: String(input.currency ?? "KES"),
        targetDate: input.targetDate ? String(input.targetDate) : null,
      })
      .returning();
    return { created: true, id: row.id };
  },
);

define(
  {
    name: "add_savings_contribution",
    description: "Log a contribution toward a savings plan, matched by plan name.",
    input_schema: {
      type: "object",
      properties: {
        planName: { type: "string" },
        amount: { type: "number" },
        date: { type: "string" },
        note: { type: "string" },
      },
      required: ["planName", "amount"],
    },
  },
  async (userId, input) => {
    const rows = await db.select().from(savingsPlans).where(and(eq(savingsPlans.userId, userId), eq(savingsPlans.archived, false)));
    const found = resolveOne(rows, "name", String(input.planName));
    if ("error" in found) return found;
    await db.insert(savingsContributions).values({
      planId: found.row.id,
      amount: String(input.amount),
      contributedOn: String(input.date ?? todayISO()),
      note: input.note ? String(input.note) : null,
    });
    return { logged: true, plan: found.row.name, amount: input.amount };
  },
);

define(
  {
    name: "list_savings_plans",
    description: "List savings plans with totals saved so far.",
    input_schema: { type: "object", properties: {} },
  },
  async (userId) => {
    const rows = await db.select().from(savingsPlans).where(and(eq(savingsPlans.userId, userId), eq(savingsPlans.archived, false)));
    return Promise.all(
      rows.map(async (p) => {
        const contributions = await db.select().from(savingsContributions).where(eq(savingsContributions.planId, p.id));
        const total = contributions.reduce((s, c) => s + Number(c.amount), 0);
        return { name: p.name, saved: total, target: Number(p.targetAmount), currency: p.currency, targetDate: p.targetDate };
      }),
    );
  },
);

// ---------------------------------------------------------------------------
// DEBTS
// ---------------------------------------------------------------------------
define(
  {
    name: "create_debt",
    description: "Add a debt to track.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        principal: { type: "number" },
        balance: { type: "number", description: "current remaining balance; defaults to principal" },
        interestRateApr: { type: "number" },
        minPayment: { type: "number" },
        currency: { type: "string" },
      },
      required: ["name", "principal"],
    },
  },
  async (userId, input) => {
    const [row] = await db
      .insert(debts)
      .values({
        userId,
        name: String(input.name),
        principal: String(input.principal),
        balance: String(input.balance ?? input.principal),
        interestRateApr: String(input.interestRateApr ?? 0),
        minPayment: String(input.minPayment ?? 0),
        currency: String(input.currency ?? "KES"),
      })
      .returning();
    return { created: true, id: row.id };
  },
);

define(
  {
    name: "record_debt_payment",
    description: "Log a payment against a debt, matched by name. Reduces its balance.",
    input_schema: {
      type: "object",
      properties: { debtName: { type: "string" }, amount: { type: "number" }, date: { type: "string" }, note: { type: "string" } },
      required: ["debtName", "amount"],
    },
  },
  async (userId, input) => {
    const rows = await db.select().from(debts).where(and(eq(debts.userId, userId), eq(debts.archived, false)));
    const found = resolveOne(rows, "name", String(input.debtName));
    if ("error" in found) return found;
    const amount = String(input.amount);
    await db.insert(debtPayments).values({ debtId: found.row.id, amount, paidOn: String(input.date ?? todayISO()), note: input.note ? String(input.note) : null });
    await db.update(debts).set({ balance: sql`greatest(0, ${debts.balance} - ${amount})`, updatedAt: new Date() }).where(eq(debts.id, found.row.id));
    return { logged: true, debt: found.row.name, amount: input.amount };
  },
);

define(
  {
    name: "list_debts",
    description: "List debts with balances, interest rates, and minimum payments.",
    input_schema: { type: "object", properties: {} },
  },
  async (userId) => {
    const rows = await db.select().from(debts).where(and(eq(debts.userId, userId), eq(debts.archived, false)));
    return rows.map((d) => ({ name: d.name, balance: Number(d.balance), interestRateApr: Number(d.interestRateApr), minPayment: Number(d.minPayment), currency: d.currency }));
  },
);

// ---------------------------------------------------------------------------
// RECOVERY
// ---------------------------------------------------------------------------
define(
  {
    name: "create_recovery_tracker",
    description: "Start a new recovery tracker (e.g. for an addiction or habit being broken).",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        startDate: { type: "string", description: "YYYY-MM-DD, defaults to today" },
        targetDays: { type: "number", description: "defaults to 1000" },
        notes: { type: "string" },
      },
      required: ["name"],
    },
  },
  async (userId, input) => {
    const [row] = await db
      .insert(recoveryTrackers)
      .values({
        userId,
        name: String(input.name),
        startDate: String(input.startDate ?? todayISO()),
        targetDays: Number(input.targetDays ?? 1000),
        notes: input.notes ? String(input.notes) : null,
      })
      .returning();
    return { created: true, id: row.id };
  },
);

define(
  {
    name: "log_recovery_checkin",
    description: "Log today's (or a given date's) recovery check-in for a tracker, matched by name.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        date: { type: "string" },
        cravingLevel: { type: "number", description: "1 (none) to 5 (intense)" },
        note: { type: "string" },
      },
      required: ["name"],
    },
  },
  async (userId, input) => {
    const rows = await db.select().from(recoveryTrackers).where(and(eq(recoveryTrackers.userId, userId), eq(recoveryTrackers.active, true)));
    const found = resolveOne(rows, "name", String(input.name));
    if ("error" in found) return found;
    const checkinDate = String(input.date ?? todayISO());
    await db
      .insert(recoveryCheckins)
      .values({
        trackerId: found.row.id,
        checkinDate,
        cravingLevel: input.cravingLevel ? Number(input.cravingLevel) : null,
        note: input.note ? String(input.note) : null,
      })
      .onConflictDoUpdate({
        target: [recoveryCheckins.trackerId, recoveryCheckins.checkinDate],
        set: { cravingLevel: input.cravingLevel ? Number(input.cravingLevel) : null, note: input.note ? String(input.note) : null },
      });
    return { logged: true, tracker: found.row.name, date: checkinDate };
  },
);

define(
  {
    name: "log_recovery_reset",
    description: "Log a reset/relapse for a recovery tracker (matched by name) and restart its day count from today. Only call this when the user clearly says they reset, relapsed, or want to restart the count — always confirm with the user first if there's any ambiguity.",
    input_schema: {
      type: "object",
      properties: { name: { type: "string" }, note: { type: "string" } },
      required: ["name"],
    },
  },
  async (userId, input) => {
    const rows = await db.select().from(recoveryTrackers).where(and(eq(recoveryTrackers.userId, userId), eq(recoveryTrackers.active, true)));
    const found = resolveOne(rows, "name", String(input.name));
    if ("error" in found) return found;
    const streakDaysAtReset = streakDayCount(found.row.startDate);
    const today = todayISO();
    await db.insert(recoveryResets).values({ trackerId: found.row.id, resetDate: today, streakDaysAtReset, note: input.note ? String(input.note) : null });
    await db.update(recoveryTrackers).set({ startDate: today, updatedAt: new Date() }).where(eq(recoveryTrackers.id, found.row.id));
    return { reset: true, tracker: found.row.name, previousStreak: streakDaysAtReset };
  },
);

define(
  {
    name: "list_recovery_trackers",
    description: "List active recovery trackers with current day counts and targets.",
    input_schema: { type: "object", properties: {} },
  },
  async (userId) => {
    const rows = await db.select().from(recoveryTrackers).where(and(eq(recoveryTrackers.userId, userId), eq(recoveryTrackers.active, true)));
    return rows.map((r) => ({ name: r.name, currentDay: streakDayCount(r.startDate), targetDays: r.targetDays, startDate: r.startDate }));
  },
);

// ---------------------------------------------------------------------------
// BIBLE (read-only)
// ---------------------------------------------------------------------------
define(
  {
    name: "get_bible_verse",
    description: "Look up a specific Bible verse by book, chapter, and verse (KJV).",
    input_schema: {
      type: "object",
      properties: {
        book: { type: "string", description: "e.g. Psalms, John, Philippians" },
        chapter: { type: "number" },
        verse: { type: "number" },
      },
      required: ["book", "chapter", "verse"],
    },
  },
  async (_userId, input) => {
    const [row] = await db
      .select({ text: bibleVerses.text, book: bibleBooks.name, chapter: bibleVerses.chapter, verse: bibleVerses.verse })
      .from(bibleVerses)
      .innerJoin(bibleBooks, eq(bibleVerses.bookId, bibleBooks.id))
      .where(and(ilike(bibleBooks.name, String(input.book)), eq(bibleVerses.chapter, Number(input.chapter)), eq(bibleVerses.verse, Number(input.verse))))
      .limit(1);
    return row ?? { error: "Verse not found — check the book name, or the Bible may not be seeded yet (see README)." };
  },
);

export const TOOLS: ToolDef[] = registry.map((r) => r.tool);

export async function executeTool(name: string, input: Record<string, unknown>, userId: string): Promise<unknown> {
  const entry = registry.find((r) => r.tool.name === name);
  if (!entry) return { error: `Unknown tool: ${name}` };
  try {
    return await entry.run(userId, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Tool execution failed." };
  }
}
