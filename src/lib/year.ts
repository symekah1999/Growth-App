import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { yearPlans, yearReviews } from "@/db/schema-life";
import { daysBetween } from "@/lib/challenge";

export type YearPlan = typeof yearPlans.$inferSelect;
export type YearReview = typeof yearReviews.$inferSelect;

/** Same day-of-month n months later, as YYYY-MM-DD (UTC arithmetic, no time-zone drift). */
export function addMonthsISO(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + n, d));
  return dt.toISOString().slice(0, 10);
}

/** All plans (newest age first) plus their reviews. Null when the tables don't exist yet. */
export async function loadYear(userId: string): Promise<{ plans: YearPlan[]; reviews: YearReview[] } | null> {
  try {
    const [plans, reviews] = await Promise.all([
      db.select().from(yearPlans).where(eq(yearPlans.userId, userId)).orderBy(desc(yearPlans.age)),
      db.select().from(yearReviews).where(eq(yearReviews.userId, userId)),
    ]);
    return { plans, reviews };
  } catch {
    return null;
  }
}

/** Where today sits inside the year that starts on `start` (a birthday). */
export function yearInfo(start: string, today: string) {
  const end = addMonthsISO(start, 12); // next birthday
  const total = daysBetween(start, end);
  const day = daysBetween(start, today) + 1; // 1 on the birthday itself
  const started = day >= 1;
  const finished = today >= end;
  const daysLeft = Math.max(0, daysBetween(today, end));
  const pct = started ? Math.min(100, Math.round(((Math.min(day, total) - 1) / total) * 100)) : 0;
  const months = Array.from({ length: 12 }, (_, i) => ({ n: i + 1, from: addMonthsISO(start, i), to: addMonthsISO(start, i + 1) }));
  const quarters = Array.from({ length: 4 }, (_, i) => ({ n: i + 1, from: addMonthsISO(start, i * 3), to: addMonthsISO(start, i * 3 + 3) }));
  const month = months.find((m) => today >= m.from && today < m.to)?.n ?? (started ? 12 : 1);
  const quarter = quarters.find((q) => today >= q.from && today < q.to)?.n ?? (started ? 4 : 1);
  return { start, end, total, day, started, finished, daysLeft, pct, months, quarters, month, quarter, isBirthday: today === start };
}

/** The plan for the year being lived now: the latest one that has started, else the next upcoming one. */
export function currentPlan(plans: YearPlan[], today: string) {
  const started = plans.filter((p) => p.startDate <= today).sort((a, b) => b.age - a.age);
  return started[0] ?? [...plans].sort((a, b) => a.age - b.age)[0] ?? null;
}
