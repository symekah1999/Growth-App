import { db } from "@/db";
import {
  chatMessages,
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
  recoveryCheckins,
  recoveryResets,
  recoveryTrackers,
  savingsContributions,
  savingsPlans,
  todos,
} from "@/db/schema";
import { gratitudeEntries } from "@/db/schema-gratitude";
import { lifeLessons } from "@/db/schema-lessons";
import { eq, inArray } from "drizzle-orm";

export type Row = Record<string, unknown>;
export type Section = { key: string; label: string; rows: Row[]; missing?: boolean };

async function safe(fn: () => Promise<Row[]>): Promise<{ rows: Row[]; missing: boolean }> {
  try {
    return { rows: await fn(), missing: false };
  } catch {
    return { rows: [], missing: true };
  }
}

/** Every record you own, grouped by section. Tables that don't exist yet come back empty and flagged. */
export async function collectExport(userId: string): Promise<Section[]> {
  const [
    journal, goalsR, habitsR, mantraR, valueR, todoR, quoteR, planR, debtR, trackerR, chatR, gratR, lessonR,
  ] = await Promise.all([
    safe(() => db.select().from(journalEntries).where(eq(journalEntries.userId, userId))),
    safe(() => db.select().from(goals).where(eq(goals.userId, userId))),
    safe(() => db.select().from(habits).where(eq(habits.userId, userId))),
    safe(() => db.select().from(mantras).where(eq(mantras.userId, userId))),
    safe(() => db.select().from(coreValues).where(eq(coreValues.userId, userId))),
    safe(() => db.select().from(todos).where(eq(todos.userId, userId))),
    safe(() => db.select().from(quotes).where(eq(quotes.userId, userId))),
    safe(() => db.select().from(savingsPlans).where(eq(savingsPlans.userId, userId))),
    safe(() => db.select().from(debts).where(eq(debts.userId, userId))),
    safe(() => db.select().from(recoveryTrackers).where(eq(recoveryTrackers.userId, userId))),
    safe(() => db.select().from(chatMessages).where(eq(chatMessages.userId, userId))),
    safe(() => db.select().from(gratitudeEntries).where(eq(gratitudeEntries.userId, userId))),
    safe(() => db.select().from(lifeLessons).where(eq(lifeLessons.userId, userId))),
  ]);

  const ids = (r: Row[]) => r.map((x) => x.id as string);
  const gIds = ids(goalsR.rows), hIds = ids(habitsR.rows), pIds = ids(planR.rows), dIds = ids(debtR.rows), tIds = ids(trackerR.rows);

  const [ms, logs, contribs, pays, resets, checkins] = await Promise.all([
    gIds.length ? safe(() => db.select().from(goalMilestones).where(inArray(goalMilestones.goalId, gIds))) : { rows: [] as Row[], missing: false },
    hIds.length ? safe(() => db.select().from(habitLogs).where(inArray(habitLogs.habitId, hIds))) : { rows: [] as Row[], missing: false },
    pIds.length ? safe(() => db.select().from(savingsContributions).where(inArray(savingsContributions.planId, pIds))) : { rows: [] as Row[], missing: false },
    dIds.length ? safe(() => db.select().from(debtPayments).where(inArray(debtPayments.debtId, dIds))) : { rows: [] as Row[], missing: false },
    tIds.length ? safe(() => db.select().from(recoveryResets).where(inArray(recoveryResets.trackerId, tIds))) : { rows: [] as Row[], missing: false },
    tIds.length ? safe(() => db.select().from(recoveryCheckins).where(inArray(recoveryCheckins.trackerId, tIds))) : { rows: [] as Row[], missing: false },
  ]);

  const s = (key: string, label: string, r: { rows: Row[]; missing: boolean }): Section => ({ key, label, rows: r.rows, missing: r.missing });
  return [
    s("journal", "Journal entries", journal),
    s("gratitude", "Gratitude", gratR),
    s("lessons", "Lessons of life", lessonR),
    s("goals", "Goals", goalsR),
    s("goal_milestones", "Goal milestones", ms),
    s("habits", "Habits", habitsR),
    s("habit_logs", "Habit check-ins", logs),
    s("todos", "To-dos", todoR),
    s("mantras", "Mantras", mantraR),
    s("core_values", "Core values", valueR),
    s("quotes", "Saved quotes", quoteR),
    s("savings_plans", "Savings plans", planR),
    s("savings_contributions", "Savings contributions", contribs),
    s("debts", "Debts", debtR),
    s("debt_payments", "Debt payments", pays),
    s("recovery_trackers", "Recovery trackers", trackerR),
    s("recovery_resets", "Recovery resets", resets),
    s("recovery_checkins", "Recovery check-ins", checkins),
    s("chat_messages", "Assistant chat history", chatR),
  ];
}

function cell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const t = v instanceof Date ? v.toISOString() : Array.isArray(v) || typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

/** CSV with a BOM so Excel reads UTF-8 correctly. */
export function toCsv(rows: Row[]): string {
  if (!rows.length) return "﻿";
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  return "﻿" + [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
}
