import { db } from "@/db";
import {
  coreValues,
  debtPayments,
  debts,
  goalMilestones,
  goals,
  habitLogs,
  habits,
  journalEntries,
  mantras,
  quotes,
  recoveryResets,
  recoveryTrackers,
  savingsContributions,
  savingsPlans,
  todos,
} from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { computeStreaks } from "@/lib/streaks";
import { goalPacing } from "@/lib/pacing";
import { addDaysISO, daysBetween, streakDayCount, todayISO, toISODate } from "@/lib/utils";

export type ProgressData = Awaited<ReturnType<typeof loadProgressData>>;

/** One round-trip-ish load of everything the Progress page needs. */
export async function loadProgressData(userId: string) {
  const [
    habitRows,
    journalRows,
    goalRows,
    trackerRows,
    planRows,
    debtRows,
    todoRows,
    [{ quoteCount }],
    [{ valueCount }],
    [{ mantraCount }],
  ] = await Promise.all([
    db.select().from(habits).where(eq(habits.userId, userId)),
    db.select({ entryDate: journalEntries.entryDate }).from(journalEntries).where(eq(journalEntries.userId, userId)),
    db.select().from(goals).where(eq(goals.userId, userId)),
    db.select().from(recoveryTrackers).where(eq(recoveryTrackers.userId, userId)),
    db.select().from(savingsPlans).where(eq(savingsPlans.userId, userId)),
    db.select().from(debts).where(eq(debts.userId, userId)),
    db.select().from(todos).where(eq(todos.userId, userId)),
    db.select({ quoteCount: sql<number>`count(*)` }).from(quotes).where(eq(quotes.userId, userId)),
    db.select({ valueCount: sql<number>`count(*)` }).from(coreValues).where(eq(coreValues.userId, userId)),
    db.select({ mantraCount: sql<number>`count(*)` }).from(mantras).where(eq(mantras.userId, userId)),
  ]);

  const habitIds = habitRows.map((h) => h.id);
  const goalIds = goalRows.map((g) => g.id);
  const trackerIds = trackerRows.map((t) => t.id);
  const planIds = planRows.map((p) => p.id);
  const debtIds = debtRows.map((d) => d.id);

  const [logRows, milestoneRows, resetRows, contributionRows, paymentRows] = await Promise.all([
    habitIds.length
      ? db.select({ habitId: habitLogs.habitId, logDate: habitLogs.logDate }).from(habitLogs).where(inArray(habitLogs.habitId, habitIds))
      : Promise.resolve([]),
    goalIds.length ? db.select().from(goalMilestones).where(inArray(goalMilestones.goalId, goalIds)) : Promise.resolve([]),
    trackerIds.length ? db.select().from(recoveryResets).where(inArray(recoveryResets.trackerId, trackerIds)) : Promise.resolve([]),
    planIds.length ? db.select().from(savingsContributions).where(inArray(savingsContributions.planId, planIds)) : Promise.resolve([]),
    debtIds.length ? db.select().from(debtPayments).where(inArray(debtPayments.debtId, debtIds)) : Promise.resolve([]),
  ]);

  return {
    habitRows,
    journalRows,
    goalRows,
    trackerRows,
    planRows,
    debtRows,
    todoRows,
    logRows,
    milestoneRows,
    resetRows,
    contributionRows,
    paymentRows,
    quoteCount: Number(quoteCount),
    valueCount: Number(valueCount),
    mantraCount: Number(mantraCount),
  };
}

// ---------------------------------------------------------------------------
// LIFE SCORE
// ---------------------------------------------------------------------------

const PACE_SCORE: Record<string, number> = { "on-track": 1, behind: 0.6, "at-risk": 0.3, overdue: 0 };

type Component = { key: string; label: string; weight: number; score: number | null; detail: string };

function windowScore(data: ProgressData, endISO: string) {
  const startISO = addDaysISO(endISO, -6);
  const inWindow = (d: string) => d >= startISO && d <= endISO;
  const components: Component[] = [];

  // Habits: share of possible habit check-ins done
  const liveHabits = data.habitRows.filter((h) => !h.archived && toISODate(h.createdAt) <= endISO);
  if (liveHabits.length > 0) {
    const ids = new Set(liveHabits.map((h) => h.id));
    const done = data.logRows.filter((l) => ids.has(l.habitId) && inWindow(l.logDate)).length;
    const possible = liveHabits.reduce((s, h) => s + Math.min(7, h.targetPerWeek || 7), 0);
    components.push({
      key: "habits",
      label: "Habits",
      weight: 30,
      score: Math.min(1, done / possible),
      detail: `${done} of ${possible} check-ins`,
    });
  }

  // Journal: days written, 5+ days a week counts as full marks
  const journalDays = new Set(data.journalRows.map((j) => j.entryDate).filter(inWindow)).size;
  if (data.journalRows.length > 0) {
    components.push({ key: "journal", label: "Journal", weight: 20, score: Math.min(1, journalDays / 5), detail: `${journalDays} of 7 days` });
  }

  // Goals: current pacing of active goals with deadlines
  const paced = data.goalRows
    .filter((g) => g.status === "active" && g.targetDate)
    .map((g) => goalPacing(g, endISO))
    .filter((p) => p.status in PACE_SCORE);
  if (paced.length > 0) {
    const avg = paced.reduce((s, p) => s + PACE_SCORE[p.status], 0) / paced.length;
    const onTrack = paced.filter((p) => p.status === "on-track").length;
    components.push({ key: "goals", label: "Goals on pace", weight: 25, score: avg, detail: `${onTrack} of ${paced.length} on track` });
  }

  // To-dos: daily to-dos due in the window that got done
  const dueTodos = data.todoRows.filter((t) => t.scope === "daily" && t.dueDate && inWindow(t.dueDate));
  if (dueTodos.length > 0) {
    const done = dueTodos.filter((t) => t.done).length;
    components.push({ key: "todos", label: "To-dos", weight: 15, score: done / dueTodos.length, detail: `${done} of ${dueTodos.length} done` });
  }

  // Recovery: active trackers that went the whole window without a reset
  const liveTrackers = data.trackerRows.filter((t) => t.active && toISODate(t.createdAt) <= endISO);
  if (liveTrackers.length > 0) {
    const clean = liveTrackers.filter((t) => !data.resetRows.some((r) => r.trackerId === t.id && inWindow(r.resetDate))).length;
    components.push({
      key: "recovery",
      label: "Recovery",
      weight: 10,
      score: clean / liveTrackers.length,
      detail: `${clean} of ${liveTrackers.length} streak${liveTrackers.length === 1 ? "" : "s"} unbroken`,
    });
  }

  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  const score = totalWeight > 0 ? Math.round((components.reduce((s, c) => s + c.weight * (c.score ?? 0), 0) / totalWeight) * 100) : null;
  return { score, components };
}

export function lifeScore(data: ProgressData, today = todayISO()) {
  const current = windowScore(data, today);
  const previous = windowScore(data, addDaysISO(today, -7));
  const delta = current.score !== null && previous.score !== null ? current.score - previous.score : null;
  // 8-week history for a sparkline
  const history = Array.from({ length: 8 }, (_, i) => {
    const end = addDaysISO(today, -7 * (7 - i));
    return { label: i === 7 ? "This wk" : `${7 - i}w ago`, value: windowScore(data, end).score };
  });
  return { ...current, previous: previous.score, delta, history };
}

// ---------------------------------------------------------------------------
// ACHIEVEMENTS
// ---------------------------------------------------------------------------

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  group: "Growth" | "Habits" | "Goals" | "Recovery" | "Finance" | "Mind & Faith";
  earned: boolean;
  progress: number; // 0-1
  progressLabel: string;
};

function longestDayRun(datesISO: string[]) {
  const uniq = [...new Set(datesISO)].sort().reverse();
  return computeStreaks(uniq).longest;
}

export function achievements(data: ProgressData, today = todayISO()): Achievement[] {
  const journalCount = data.journalRows.length;
  const journalRun = longestDayRun(data.journalRows.map((j) => j.entryDate));

  const habitLogCount = data.logRows.length;
  const bestHabitStreak = data.habitRows.reduce((best, h) => {
    const dates = data.logRows.filter((l) => l.habitId === h.id).map((l) => l.logDate);
    return Math.max(best, longestDayRun(dates));
  }, 0);

  const goalCount = data.goalRows.length;
  const goalsDone = data.goalRows.filter((g) => g.status === "completed").length;
  const goalsDoneOnTime = data.goalRows.filter(
    (g) => g.status === "completed" && g.targetDate && toISODate(g.updatedAt) <= g.targetDate,
  ).length;
  const milestonesDone = data.milestoneRows.filter((m) => m.done).length;

  const bestRecovery = Math.max(
    0,
    ...data.trackerRows.filter((t) => t.active).map((t) => streakDayCount(t.startDate, today)),
    ...data.resetRows.map((r) => r.streakDaysAtReset),
  );

  const contributionCount = data.contributionRows.length;
  const plansFunded = data.planRows.filter((p) => {
    const total = data.contributionRows.filter((c) => c.planId === p.id).reduce((s, c) => s + Number(c.amount), 0);
    return total >= Number(p.targetAmount) && Number(p.targetAmount) > 0;
  }).length;
  const debtsCleared = data.debtRows.filter((d) => Number(d.balance) <= 0).length;
  const debtPaymentCount = data.paymentRows.length;

  const todosDone = data.todoRows.filter((t) => t.done).length;

  const mk = (
    id: string,
    group: Achievement["group"],
    icon: string,
    title: string,
    description: string,
    value: number,
    target: number,
    unit: string,
  ): Achievement => ({
    id,
    group,
    icon,
    title,
    description,
    earned: value >= target,
    progress: Math.min(1, target > 0 ? value / target : 0),
    progressLabel: `${Math.min(value, target)} / ${target} ${unit}`,
  });

  return [
    mk("first-entry", "Growth", "✍️", "First Words", "Write your first journal entry", journalCount, 1, "entry"),
    mk("journal-week", "Growth", "📖", "Week of Reflection", "Journal 7 days in a row", journalRun, 7, "days"),
    mk("journal-30", "Growth", "📚", "Chronicler", "Write 30 journal entries", journalCount, 30, "entries"),
    mk("journal-100", "Growth", "🏛️", "Life Historian", "Write 100 journal entries", journalCount, 100, "entries"),

    mk("habit-first", "Habits", "🌱", "Seed Planted", "Log a habit for the first time", habitLogCount, 1, "log"),
    mk("habit-7", "Habits", "🔥", "On Fire", "Hit a 7-day habit streak", bestHabitStreak, 7, "days"),
    mk("habit-30", "Habits", "⚡", "Iron Discipline", "Hit a 30-day habit streak", bestHabitStreak, 30, "days"),
    mk("habit-100", "Habits", "💎", "Unbreakable", "Hit a 100-day habit streak", bestHabitStreak, 100, "days"),
    mk("habit-500", "Habits", "🏔️", "Consistency Summit", "Log 500 habit check-ins", habitLogCount, 500, "check-ins"),

    mk("goal-first", "Goals", "🎯", "Vision Set", "Create your first goal", goalCount, 1, "goal"),
    mk("goal-done", "Goals", "🏁", "Finisher", "Complete a goal", goalsDone, 1, "goal"),
    mk("goal-ontime", "Goals", "⏱️", "Right on Time", "Complete a goal before its deadline", goalsDoneOnTime, 1, "goal"),
    mk("goal-5", "Goals", "🏆", "Achiever", "Complete 5 goals", goalsDone, 5, "goals"),
    mk("milestones-10", "Goals", "🪜", "Step by Step", "Tick off 10 milestones", milestonesDone, 10, "milestones"),

    mk("rec-7", "Recovery", "🌤️", "One Week Free", "Reach 7 days in recovery", bestRecovery, 7, "days"),
    mk("rec-30", "Recovery", "🌿", "A Month Strong", "Reach 30 days in recovery", bestRecovery, 30, "days"),
    mk("rec-90", "Recovery", "🌳", "90 Days", "Reach 90 days in recovery", bestRecovery, 90, "days"),
    mk("rec-365", "Recovery", "🌅", "One Year", "Reach 365 days in recovery", bestRecovery, 365, "days"),
    mk("rec-1000", "Recovery", "👑", "The Thousand", "Reach 1,000 days in recovery", bestRecovery, 1000, "days"),

    mk("save-first", "Finance", "🪙", "First Deposit", "Make a savings contribution", contributionCount, 1, "deposit"),
    mk("save-funded", "Finance", "🏦", "Target Reached", "Fully fund a savings plan", plansFunded, 1, "plan"),
    mk("debt-first", "Finance", "✂️", "Chipping Away", "Log a debt payment", debtPaymentCount, 1, "payment"),
    mk("debt-cleared", "Finance", "🗡️", "Debt Slayer", "Pay a debt down to zero", debtsCleared, 1, "debt"),

    mk("values-5", "Mind & Faith", "🧭", "Rooted", "Define 5 core values", data.valueCount, 5, "values"),
    mk("mantras-3", "Mind & Faith", "🕯️", "Words to Live By", "Write 3 mantras", data.mantraCount, 3, "mantras"),
    mk("quotes-25", "Mind & Faith", "💬", "Wisdom Collector", "Save 25 quotes", data.quoteCount, 25, "quotes"),
    mk("todos-50", "Growth", "✅", "Getting Things Done", "Complete 50 to-dos", todosDone, 50, "to-dos"),
  ];
}

// ---------------------------------------------------------------------------
// WEEKLY REVIEW
// ---------------------------------------------------------------------------

export function weeklyReview(data: ProgressData, today = todayISO()) {
  const start = addDaysISO(today, -6);
  const next7 = addDaysISO(today, 7);
  const inWeek = (d: string) => d >= start && d <= today;

  const liveHabits = data.habitRows.filter((h) => !h.archived);
  const habitWeek = liveHabits.map((h) => ({
    name: h.name,
    done: data.logRows.filter((l) => l.habitId === h.id && inWeek(l.logDate)).length,
    target: Math.min(7, h.targetPerWeek || 7),
  }));

  const journalDays = new Set(data.journalRows.map((j) => j.entryDate).filter(inWeek)).size;

  const todosDone = data.todoRows.filter((t) => t.done && t.doneAt && inWeek(toISODate(t.doneAt))).length;
  const todosOverdue = data.todoRows.filter((t) => !t.done && t.scope === "daily" && t.dueDate && t.dueDate < today).length;

  const goalsCompleted = data.goalRows.filter((g) => g.status === "completed" && inWeek(toISODate(g.updatedAt)));
  const goalsDueSoon = data.goalRows.filter((g) => g.status === "active" && g.targetDate && g.targetDate >= today && g.targetDate <= next7);
  const goalsOverdue = data.goalRows.filter((g) => g.status === "active" && g.targetDate && g.targetDate < today && g.progress < 100);

  const goalTitle = new Map(data.goalRows.map((g) => [g.id, g.title]));
  const activeGoalIds = new Set(data.goalRows.filter((g) => g.status === "active").map((g) => g.id));
  const milestonesDueSoon = data.milestoneRows
    .filter((m) => !m.done && m.dueDate && m.dueDate <= next7 && activeGoalIds.has(m.goalId))
    .map((m) => ({ title: m.title, goal: goalTitle.get(m.goalId) ?? "", dueDate: m.dueDate!, overdue: m.dueDate! < today }))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

  const recoveryDays = data.trackerRows
    .filter((t) => t.active)
    .map((t) => ({ name: t.name, days: streakDayCount(t.startDate, today), gained: Math.min(7, Math.max(0, daysBetween(t.startDate, today) + 1)) }));

  const planCurrency = new Map(data.planRows.map((p) => [p.id, p.currency]));
  const savedByCurrency = new Map<string, number>();
  for (const c of data.contributionRows.filter((c) => inWeek(c.contributedOn))) {
    const cur = planCurrency.get(c.planId) ?? "KES";
    savedByCurrency.set(cur, (savedByCurrency.get(cur) ?? 0) + Number(c.amount));
  }
  const debtCurrency = new Map(data.debtRows.map((d) => [d.id, d.currency]));
  const paidByCurrency = new Map<string, number>();
  for (const p of data.paymentRows.filter((p) => inWeek(p.paidOn))) {
    const cur = debtCurrency.get(p.debtId) ?? "KES";
    paidByCurrency.set(cur, (paidByCurrency.get(cur) ?? 0) + Number(p.amount));
  }

  return {
    start,
    end: today,
    habitWeek,
    journalDays,
    todosDone,
    todosOverdue,
    goalsCompleted,
    goalsDueSoon,
    goalsOverdue,
    milestonesDueSoon,
    recoveryDays,
    savedByCurrency: [...savedByCurrency.entries()],
    paidByCurrency: [...paidByCurrency.entries()],
  };
}

// ---------------------------------------------------------------------------
// LIFE AREAS
// ---------------------------------------------------------------------------

export const LIFE_AREAS = ["spiritual", "health", "career", "finance", "relationships", "learning", "general"] as const;

export function lifeAreas(data: ProgressData) {
  return LIFE_AREAS.map((area) => {
    const inArea = data.goalRows.filter((g) => g.category === area);
    const active = inArea.filter((g) => g.status === "active");
    const completed = inArea.filter((g) => g.status === "completed").length;
    const avgProgress = active.length ? Math.round(active.reduce((s, g) => s + g.progress, 0) / active.length) : null;
    return { area, active: active.length, completed, avgProgress };
  });
}

