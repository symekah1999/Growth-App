import { db } from "@/db";
import {
  challengeDays,
  challengePlan,
  challengeProverbs,
  challengePillars,
  challengeRituals,
  challengeWild,
  challengeReviews,
  challengeRuleChecks,
  challengeRuleWeeks,
  challengeScorecard,
  challengeSetbacks,
} from "@/db/schema-challenge";
import { DAILY_CHECKS, MONTHS } from "@/db/seed-data/challenge";
import { addDaysISO } from "@/lib/utils";
import { desc, eq } from "drizzle-orm";

export type PlanRow = typeof challengePlan.$inferSelect;
export type DayRow = typeof challengeDays.$inferSelect;
export type ReviewRow = typeof challengeReviews.$inferSelect;
export type SetbackRow = typeof challengeSetbacks.$inferSelect;
export type ScoreRow = typeof challengeScorecard.$inferSelect;
export type RuleWeekRow = { rule: number; weekStart: string; status: string };
export type ProverbRow = { day: string; chapter: number; reflection: string };
export type RitualRow = { day: string; kind: string; answers: Record<string, string> };
export type PillarRow = { day: string; pillar: number };
export type WildRow = { day: string; animal: string; reflection: string };

/** Monday of the week containing the given date. */
export function weekStartOf(day: string) {
  const dow = new Date(day + "T00:00:00Z").getUTCDay(); // 0 = Sunday
  return addDaysISO(day, -((dow + 6) % 7));
}

/** Nairobi is UTC+3 with no daylight saving; the challenge runs on your local day. */
export const nairobiToday = () => new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);

export const DEFAULT_START = "2026-11-16";
export const DEFAULT_END = "2027-05-16";

/** Challenge month (1 to 6) a date falls in, counted from the start day. */
export function monthIndex(start: string, day: string): number {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [y, m, d] = day.split("-").map(Number);
  const idx = (y * 12 + m - (sy * 12 + sm)) - (d < sd ? 1 : 0) + 1;
  return Math.max(1, Math.min(6, idx));
}

export function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);
}

export function phaseInfo(plan: Pick<PlanRow, "startDate" | "endDate">, today: string) {
  const total = daysBetween(plan.startDate, plan.endDate) + 1;
  const dayNo = daysBetween(plan.startDate, today) + 1; // <1 = not started
  const left = daysBetween(today, plan.endDate);
  const started = dayNo >= 1;
  const finished = today > plan.endDate;
  const month = monthIndex(plan.startDate, started ? (finished ? plan.endDate : today) : plan.startDate);
  return { total, dayNo, left, started, finished, month, monthInfo: MONTHS[month - 1], pct: started ? Math.min(100, Math.max(0, Math.round((Math.min(dayNo, total) / total) * 100))) : 0 };
}

export type ChallengeData = {
  plan: PlanRow | null;
  days: DayRow[];
  ruleChecks: { rule: number; month: number }[];
  reviews: ReviewRow[];
  setbacks: SetbackRow[];
  scorecard: ScoreRow[];
  /** Part 2 tables. Null if challenge-2.sql hasn't been run yet. */
  ruleWeeks: RuleWeekRow[] | null;
  proverbs: ProverbRow[] | null;
  /** Part 3 table. Null if challenge-3.sql hasn't been run yet. */
  wild: WildRow[] | null;
  /** Part 4 table. Null if challenge-4.sql hasn't been run yet. */
  pillars: PillarRow[] | null;
  /** Part 5 table. Null if challenge-5.sql hasn't been run yet. */
  rituals: RitualRow[] | null;
};

/** Loads everything for the owner. Returns null if the tables haven't been created yet. */
export async function loadChallenge(userId: string): Promise<ChallengeData | null> {
  try {
    const [[plan], days, ruleChecks, reviews, setbacks, scorecard] = await Promise.all([
      db.select().from(challengePlan).where(eq(challengePlan.userId, userId)),
      db.select().from(challengeDays).where(eq(challengeDays.userId, userId)).orderBy(desc(challengeDays.day)).limit(400),
      db.select({ rule: challengeRuleChecks.rule, month: challengeRuleChecks.month, done: challengeRuleChecks.done }).from(challengeRuleChecks).where(eq(challengeRuleChecks.userId, userId)),
      db.select().from(challengeReviews).where(eq(challengeReviews.userId, userId)).orderBy(desc(challengeReviews.weekEnding)).limit(60),
      db.select().from(challengeSetbacks).where(eq(challengeSetbacks.userId, userId)).orderBy(desc(challengeSetbacks.day), desc(challengeSetbacks.createdAt)).limit(100),
      db.select().from(challengeScorecard).where(eq(challengeScorecard.userId, userId)),
    ]);
    const ruleWeeks = await db
      .select({ rule: challengeRuleWeeks.rule, weekStart: challengeRuleWeeks.weekStart, status: challengeRuleWeeks.status })
      .from(challengeRuleWeeks)
      .where(eq(challengeRuleWeeks.userId, userId))
      .orderBy(desc(challengeRuleWeeks.weekStart))
      .limit(1000)
      .catch(() => null);
    const proverbs = await db
      .select({ day: challengeProverbs.day, chapter: challengeProverbs.chapter, reflection: challengeProverbs.reflection })
      .from(challengeProverbs)
      .where(eq(challengeProverbs.userId, userId))
      .orderBy(desc(challengeProverbs.day))
      .limit(400)
      .catch(() => null);
    const wild = await db
      .select({ day: challengeWild.day, animal: challengeWild.animal, reflection: challengeWild.reflection })
      .from(challengeWild)
      .where(eq(challengeWild.userId, userId))
      .orderBy(desc(challengeWild.day))
      .limit(400)
      .catch(() => null);
    const pillars = await db
      .select({ day: challengePillars.day, pillar: challengePillars.pillar })
      .from(challengePillars)
      .where(eq(challengePillars.userId, userId))
      .orderBy(desc(challengePillars.day))
      .limit(1500)
      .catch(() => null);
    const rituals = await db
      .select({ day: challengeRituals.day, kind: challengeRituals.kind, answers: challengeRituals.answers })
      .from(challengeRituals)
      .where(eq(challengeRituals.userId, userId))
      .orderBy(desc(challengeRituals.day))
      .limit(800)
      .catch(() => null);
    return { plan: plan ?? null, days, ruleChecks: ruleChecks.filter((r) => r.done), reviews, setbacks, scorecard, ruleWeeks, proverbs, wild, pillars, rituals };
  } catch {
    return null;
  }
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));

export function stats(days: DayRow[], today: string, start: string) {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const inRange = (from: string, to: string) => days.filter((d) => d.day >= from && d.day <= to && d.day >= start);
  const w7 = inRange(addDaysISO(today, -6), today);
  const w30 = inRange(addDaysISO(today, -29), today);

  // Days since the start that had no log or a score of 0 count as missed.
  const missedDates: string[] = [];
  for (let d = start; d < today; d = addDaysISO(d, 1)) {
    const row = byDay.get(d);
    if (!row || row.score === 0) missedDates.push(d);
  }
  const missedSet = new Set(missedDates);
  const yesterday = addDaysISO(today, -1);
  const missedTwice = yesterday >= start && missedSet.has(yesterday) && missedSet.has(addDaysISO(yesterday, -1));
  const missedYesterday = yesterday >= start && missedSet.has(yesterday);
  const thisMonthStart = addDaysISO(today, -29);
  const missed30 = missedDates.filter((d) => d >= thisMonthStart).length;

  // Consecutive logged days ending today (or yesterday if today isn't logged yet).
  const logged = (d: string) => (byDay.get(d)?.score ?? 0) > 0;
  let cur = logged(today) ? today : yesterday;
  let loggedStreak = 0;
  while (cur >= start && logged(cur)) {
    loggedStreak++;
    cur = addDaysISO(cur, -1);
  }

  // Clean streak on the vice list: days since the last day marked not clean.
  const isSlip = (d: string) => {
    const r = byDay.get(d);
    return !!r && r.checks && r.checks.clean === false && r.score > 0 && "clean" in r.checks;
  };
  let currentClean = 0;
  let longestClean = 0;
  let run = 0;
  for (let d = start; d <= today; d = addDaysISO(d, 1)) {
    const r = byDay.get(d);
    if (!r) continue; // unlogged days neither extend nor break the run
    if (isSlip(d)) run = 0;
    else if (r.checks?.clean) run++;
    longestClean = Math.max(longestClean, run);
  }
  currentClean = run;

  const weekSum = (f: (d: DayRow) => number) => w7.reduce((s, d) => s + f(d), 0);
  return {
    avg7: avg(w7.map((d) => d.score)),
    avg30: avg(w30.map((d) => d.score)),
    daysLogged: days.filter((d) => d.day >= start && d.score > 0).length,
    missedDates,
    missed30,
    missedYesterday,
    missedTwice,
    loggedStreak,
    currentClean,
    longestClean,
    week: {
      deep: weekSum((d) => d.deepBlocks ?? 0),
      training: w7.filter((d) => d.checks?.trained).length,
      sleep: avg(w7.map((d) => num(d.sleepHours)).filter((x): x is number => x !== null)),
      social: avg(w7.map((d) => d.socialMinutes).filter((x): x is number => x !== null && x !== undefined)),
      score: avg(w7.map((d) => d.score)),
      days: w7.length,
    },
  };
}

export const CHECK_KEYS = DAILY_CHECKS.map((c) => c.key);

/** Day-by-day Proverbs reading streak ending today (or yesterday if today isn't logged yet). */
export function proverbsStreak(rows: { day: string }[], today: string) {
  const set = new Set(rows.map((r) => r.day));
  let cur = set.has(today) ? today : addDaysISO(today, -1);
  let n = 0;
  while (set.has(cur)) {
    n++;
    cur = addDaysISO(cur, -1);
  }
  return n;
}

/** Which daily check each rule can be auto-measured from, for the weekly keep-up hints. */
export const RULE_AUTO: Record<number, { key: string; label: string }> = {
  1: { key: "social", label: "days under 30 min social" },
  2: { key: "logged", label: "days logged" },
  6: { key: "deep", label: "days with deep work" },
  7: { key: "trained", label: "days trained or walked" },
  8: { key: "wake", label: "days up on time" },
  9: { key: "ate", label: "days ate to plan" },
  10: { key: "clean", label: "days clean" },
};

export function ruleWeekHints(days: DayRow[], weekStart: string): Record<number, string> {
  const end = addDaysISO(weekStart, 6);
  const wk = days.filter((d) => d.day >= weekStart && d.day <= end);
  const out: Record<number, string> = {};
  for (const [rule, a] of Object.entries(RULE_AUTO)) {
    const n = wk.filter((d) => d.checks?.[a.key]).length;
    out[Number(rule)] = `${n}/7 ${a.label}`;
  }
  return out;
}

/** Share of rules kept for a week: kept = 1, partly = 0.5, missed or unrated = 0. */
export function weekKeepUp(rows: RuleWeekRow[], weekStart: string) {
  const wk = rows.filter((r) => r.weekStart === weekStart);
  const kept = wk.filter((r) => r.status === "kept").length;
  const partly = wk.filter((r) => r.status === "partly").length;
  const missed = wk.filter((r) => r.status === "missed").length;
  return { kept, partly, missed, rated: wk.length, pct: Math.round(((kept + partly * 0.5) / 15) * 100) };
}

/** Days on which both rituals were completed, counted back from today (or yesterday if today isn't finished). */
export function ritualStreak(rows: { day: string; kind: string }[], today: string) {
  const m = new Set(rows.filter((r) => r.kind === "morning").map((r) => r.day));
  const e = new Set(rows.filter((r) => r.kind === "evening").map((r) => r.day));
  const both = (d: string) => m.has(d) && e.has(d);
  let cur = both(today) ? today : addDaysISO(today, -1);
  let n = 0;
  while (both(cur)) {
    n++;
    cur = addDaysISO(cur, -1);
  }
  return n;
}

/** Hour (0-23) in Nairobi, used to pick morning vs evening by default. */
export function nairobiHour() {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Nairobi", hour: "2-digit", hour12: false }).format(new Date())) % 24;
}
