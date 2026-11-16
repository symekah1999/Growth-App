"use server";

import { db } from "@/db";
import {
  challengeDays,
  challengePlan,
  challengeReviews,
  challengeRuleChecks,
  challengeScorecard,
  challengeSetbacks,
  type Excuse,
} from "@/db/schema-challenge";
import { DAILY_CHECKS, SCORECARD } from "@/db/seed-data/challenge";
import { requireUser } from "@/lib/auth";
import { DEFAULT_END, DEFAULT_START, nairobiToday } from "@/lib/challenge";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const str = (fd: FormData, k: string, max = 2000) => String(fd.get(k) ?? "").trim().slice(0, max);
const lines = (s: string, max = 10) => s.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, max);
const intOrNull = (s: string) => (s !== "" && Number.isFinite(Number(s)) ? Math.max(0, Math.round(Number(s))) : null);
const refresh = () => revalidatePath("/challenge");
const back = (tab: string, extra = "") => redirect(`/challenge?tab=${tab}${extra}`);

export async function savePlan(fd: FormData) {
  const user = await requireUser();
  const start = ISO.test(str(fd, "startDate")) ? str(fd, "startDate") : DEFAULT_START;
  const end = ISO.test(str(fd, "endDate")) && str(fd, "endDate") > start ? str(fd, "endDate") : DEFAULT_END;
  const by = ISO.test(str(fd, "headlineBy")) ? str(fd, "headlineBy") : null;
  // One "excuse => plan" per line
  const excuses: Excuse[] = lines(str(fd, "excuses", 4000), 8).map((l) => {
    const [a, ...b] = l.split("=>");
    return { excuse: a.trim(), plan: b.join("=>").trim() };
  });
  const values = {
    startDate: start,
    endDate: end,
    headline: str(fd, "headline", 300),
    headlineBy: by,
    support1: str(fd, "support1", 300),
    support2: str(fd, "support2", 300),
    why: str(fd, "why", 1500),
    vices: lines(str(fd, "vices", 1000), 3),
    people: lines(str(fd, "people", 1000), 5),
    excuses,
    updatedAt: new Date(),
  };
  await db.insert(challengePlan).values({ userId: user.id, ...values }).onConflictDoUpdate({ target: challengePlan.userId, set: values });
  refresh();
  back("plan", "&saved=1");
}

export async function saveDay(fd: FormData) {
  const user = await requireUser();
  const today = nairobiToday();
  const rawDay = str(fd, "day");
  const day = ISO.test(rawDay) && rawDay <= today ? rawDay : today;
  const tomorrowTask = str(fd, "tomorrowTask", 300);
  const checks: Record<string, boolean> = {};
  for (const c of DAILY_CHECKS) checks[c.key] = fd.get(c.key) === "on";
  if (tomorrowTask && !checks.logged) checks.logged = true; // writing tomorrow's task counts as logging
  const score = Object.values(checks).filter(Boolean).length;
  const sleep = str(fd, "sleepHours");
  const sleepNum = sleep !== "" && Number.isFinite(Number(sleep)) ? Math.min(24, Math.max(0, Number(sleep))).toFixed(1) : null;
  const values = {
    checks,
    score,
    socialMinutes: intOrNull(str(fd, "socialMinutes")),
    sleepHours: sleepNum,
    deepBlocks: intOrNull(str(fd, "deepBlocks")),
    tomorrowTask: tomorrowTask || null,
    note: str(fd, "note", 1000) || null,
    updatedAt: new Date(),
  };
  await db.insert(challengeDays).values({ userId: user.id, day, ...values }).onConflictDoUpdate({ target: [challengeDays.userId, challengeDays.day], set: values });
  refresh();
  back("today", `&d=${day}&saved=1`);
}

export async function toggleRuleCheck(fd: FormData) {
  const user = await requireUser();
  const rule = Number(fd.get("rule"));
  const month = Number(fd.get("month"));
  if (!(rule >= 1 && rule <= 15 && month >= 1 && month <= 6)) return;
  const [row] = await db
    .select()
    .from(challengeRuleChecks)
    .where(and(eq(challengeRuleChecks.userId, user.id), eq(challengeRuleChecks.rule, rule), eq(challengeRuleChecks.month, month)));
  if (row) await db.delete(challengeRuleChecks).where(and(eq(challengeRuleChecks.userId, user.id), eq(challengeRuleChecks.rule, rule), eq(challengeRuleChecks.month, month)));
  else await db.insert(challengeRuleChecks).values({ userId: user.id, rule, month, done: true });
  refresh();
}

export async function saveReview(fd: FormData) {
  const user = await requireUser();
  const we = ISO.test(str(fd, "weekEnding")) ? str(fd, "weekEnding") : nairobiToday();
  const pace = ["ahead", "on", "behind"].includes(str(fd, "pace")) ? str(fd, "pace") : "on";
  await db.insert(challengeReviews).values({
    userId: user.id,
    weekEnding: we,
    pace,
    worked: str(fd, "worked"),
    failed: str(fd, "failed"),
    change: str(fd, "change"),
    nextPlan: str(fd, "nextPlan"),
  });
  refresh();
  back("review", "&saved=1");
}

export async function addSetback(fd: FormData) {
  const user = await requireUser();
  const what = str(fd, "what");
  if (!what) return;
  await db.insert(challengeSetbacks).values({ userId: user.id, day: nairobiToday(), what, control: str(fd, "control"), nextTime: str(fd, "nextTime") });
  refresh();
  back("review", "#setbacks");
}

export async function deleteSetback(fd: FormData) {
  const user = await requireUser();
  await db.delete(challengeSetbacks).where(and(eq(challengeSetbacks.id, str(fd, "id")), eq(challengeSetbacks.userId, user.id)));
  refresh();
  back("review", "#setbacks");
}

export async function saveScorecard(fd: FormData) {
  const user = await requireUser();
  for (const m of SCORECARD) {
    const values = {
      baseline: str(fd, `${m.key}.baseline`, 200),
      month3: str(fd, `${m.key}.month3`, 200),
      month6: str(fd, `${m.key}.month6`, 200),
      updatedAt: new Date(),
    };
    await db.insert(challengeScorecard).values({ userId: user.id, measure: m.key, ...values }).onConflictDoUpdate({ target: [challengeScorecard.userId, challengeScorecard.measure], set: values });
  }
  refresh();
  back("scorecard", "&saved=1");
}
