"use server";

import { db } from "@/db";
import {
  challengeDays,
  challengePlan,
  challengeProverbs,
  challengeReviews,
  challengeRuleChecks,
  challengeRuleWeeks,
  challengePillars,
  challengeRituals,
  challengeScorecard,
  challengeWild,
  challengeSetbacks,
  type Excuse,
} from "@/db/schema-challenge";
import { ANIMALS } from "@/db/seed-data/wild";
import { DAILY_CHECKS, SCORECARD } from "@/db/seed-data/challenge";
import { requireUser } from "@/lib/auth";
import { DEFAULT_END, DEFAULT_START, nairobiToday, weekStartOf } from "@/lib/challenge";
import { addDaysISO } from "@/lib/utils";
import { and, eq, inArray } from "drizzle-orm";
import { habitLogs, habits } from "@/db/schema";
import { todontLogs, todonts } from "@/db/schema-life";
import { todayISO } from "@/lib/utils";
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

/** Tap a status to set it; tap the same one again to clear it. */
export async function setRuleWeek(fd: FormData) {
  const user = await requireUser();
  const rule = Number(fd.get("rule"));
  const week = str(fd, "week");
  const status = str(fd, "status");
  if (!(rule >= 1 && rule <= 15) || !ISO.test(week) || !["kept", "partly", "missed"].includes(status)) return;
  const weekStart = weekStartOf(week);
  const [cur] = await db
    .select()
    .from(challengeRuleWeeks)
    .where(and(eq(challengeRuleWeeks.userId, user.id), eq(challengeRuleWeeks.rule, rule), eq(challengeRuleWeeks.weekStart, weekStart)));
  if (cur?.status === status) {
    await db.delete(challengeRuleWeeks).where(and(eq(challengeRuleWeeks.userId, user.id), eq(challengeRuleWeeks.rule, rule), eq(challengeRuleWeeks.weekStart, weekStart)));
  } else {
    await db
      .insert(challengeRuleWeeks)
      .values({ userId: user.id, rule, weekStart, status })
      .onConflictDoUpdate({ target: [challengeRuleWeeks.userId, challengeRuleWeeks.rule, challengeRuleWeeks.weekStart], set: { status, updatedAt: new Date() } });
  }
  refresh();
  back("keepup", `&w=${weekStart}#r${rule}`);
}

export async function saveProverbsDay(fd: FormData) {
  const user = await requireUser();
  const today = nairobiToday();
  const rawDay = str(fd, "day");
  const day = ISO.test(rawDay) && rawDay <= today ? rawDay : today;
  const chapter = Math.min(31, Math.max(1, Number(fd.get("chapter")) || 1));
  const reflection = str(fd, "reflection", 500);
  const values = { chapter, reflection, updatedAt: new Date() };
  await db.insert(challengeProverbs).values({ userId: user.id, day, ...values }).onConflictDoUpdate({ target: [challengeProverbs.userId, challengeProverbs.day], set: values });
  refresh();
  const to = str(fd, "from") === "today" ? "today" : "proverbs";
  back(to, "&saved=1");
}

export async function unmarkProverbsDay(fd: FormData) {
  const user = await requireUser();
  const day = str(fd, "day");
  if (!ISO.test(day)) return;
  await db.delete(challengeProverbs).where(and(eq(challengeProverbs.userId, user.id), eq(challengeProverbs.day, day)));
  refresh();
  back(str(fd, "from") === "today" ? "today" : "proverbs");
}

export async function saveWildDay(fd: FormData) {
  const user = await requireUser();
  const today = nairobiToday();
  const rawDay = str(fd, "day");
  const day = ISO.test(rawDay) && rawDay <= today ? rawDay : today;
  const animal = ANIMALS.some((a) => a.key === str(fd, "animal")) ? str(fd, "animal") : ANIMALS[0].key;
  const reflection = str(fd, "reflection", 500);
  const values = { animal, reflection, updatedAt: new Date() };
  await db.insert(challengeWild).values({ userId: user.id, day, ...values }).onConflictDoUpdate({ target: [challengeWild.userId, challengeWild.day], set: values });
  refresh();
  back(str(fd, "from") === "today" ? "today" : "wild", "&saved=1");
}

export async function unmarkWildDay(fd: FormData) {
  const user = await requireUser();
  const day = str(fd, "day");
  if (!ISO.test(day)) return;
  await db.delete(challengeWild).where(and(eq(challengeWild.userId, user.id), eq(challengeWild.day, day)));
  refresh();
  back("wild");
}

export async function savePillarsDay(fd: FormData) {
  const user = await requireUser();
  const today = nairobiToday();
  const rawDay = str(fd, "day");
  const day = ISO.test(rawDay) && rawDay <= today ? rawDay : today;
  const done = Array.from({ length: 10 }, (_, i) => i + 1).filter((n) => fd.get(`p${n}`) === "on");
  await db.delete(challengePillars).where(and(eq(challengePillars.userId, user.id), eq(challengePillars.day, day)));
  if (done.length) await db.insert(challengePillars).values(done.map((pillar) => ({ userId: user.id, day, pillar })));
  refresh();
  back("pillars", "&saved=1");
}

const ans = (fd: FormData, keys: string[], max = 500) => {
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = str(fd, k, max);
    if (v) out[k] = v;
  }
  return out;
};

export async function completeMorning(fd: FormData) {
  const user = await requireUser();
  const day = nairobiToday();
  const answers = ans(fd, ["prayer", "reflection", "risk", "response", "task1", "task2", "task3"]);
  await db
    .insert(challengeRituals)
    .values({ userId: user.id, day, kind: "morning", answers })
    .onConflictDoUpdate({ target: [challengeRituals.userId, challengeRituals.day, challengeRituals.kind], set: { answers, completedAt: new Date() } });
  // Reading Proverbs in the ritual counts as today's Proverbs log
  const chapter = Math.min(31, Math.max(1, Number(fd.get("chapter")) || 1));
  const values = { chapter, reflection: answers.reflection ?? "", updatedAt: new Date() };
  await db.insert(challengeProverbs).values({ userId: user.id, day, ...values }).onConflictDoUpdate({ target: [challengeProverbs.userId, challengeProverbs.day], set: values }).catch(() => null);
  refresh();
  revalidatePath("/today");
  redirect("/challenge?tab=today&ritual=morning");
}

export async function completeEvening(fd: FormData) {
  const user = await requireUser();
  const day = nairobiToday();
  const answers = ans(fd, ["aarPlan", "aarReality", "aarFix", "stoicWell", "stoicBad", "stoicLeft", "g1", "g2", "g3"]);
  // 1. the 7-point daily scorecard
  const tomorrowTask = str(fd, "tomorrowTask", 300);
  const checks: Record<string, boolean> = {};
  for (const c of DAILY_CHECKS) checks[c.key] = fd.get(c.key) === "on";
  if (tomorrowTask && !checks.logged) checks.logged = true;
  const score = Object.values(checks).filter(Boolean).length;
  const sleep = str(fd, "sleepHours");
  const sleepNum = sleep !== "" && Number.isFinite(Number(sleep)) ? Math.min(24, Math.max(0, Number(sleep))).toFixed(1) : null;
  const dayValues = {
    checks,
    score,
    socialMinutes: intOrNull(str(fd, "socialMinutes")),
    sleepHours: sleepNum,
    deepBlocks: intOrNull(str(fd, "deepBlocks")),
    tomorrowTask: tomorrowTask || null,
    note: answers.aarFix ?? null,
    updatedAt: new Date(),
  };
  await db.insert(challengeDays).values({ userId: user.id, day, ...dayValues }).onConflictDoUpdate({ target: [challengeDays.userId, challengeDays.day], set: dayValues });
  // 2. the ten pillars
  const done = Array.from({ length: 10 }, (_, i) => i + 1).filter((n) => fd.get(`p${n}`) === "on");
  await db.delete(challengePillars).where(and(eq(challengePillars.userId, user.id), eq(challengePillars.day, day))).catch(() => null);
  if (done.length) await db.insert(challengePillars).values(done.map((pillar) => ({ userId: user.id, day, pillar }))).catch(() => null);
  // 2b. habits: one tick list, written to the same log the Habits page uses
  const habitIds = String(fd.get("habitIds") ?? "").split(",").filter(Boolean).slice(0, 100);
  if (habitIds.length) {
    const own = await db.select({ id: habits.id }).from(habits).where(and(eq(habits.userId, user.id), inArray(habits.id, habitIds))).catch(() => []);
    const hDay = todayISO();
    for (const { id } of own) {
      if (fd.get(`h_${id}`) === "on") await db.insert(habitLogs).values({ habitId: id, logDate: hDay }).onConflictDoNothing();
      else await db.delete(habitLogs).where(and(eq(habitLogs.habitId, id), eq(habitLogs.logDate, hDay)));
    }
  }
  // 2c. to-don'ts: held or slipped; left blank means not logged
  const tdIds = String(fd.get("todontIds") ?? "").split(",").filter(Boolean).slice(0, 100);
  if (tdIds.length) {
    const own = await db.select({ id: todonts.id }).from(todonts).where(and(eq(todonts.userId, user.id), inArray(todonts.id, tdIds))).catch(() => []);
    for (const { id } of own) {
      const v = str(fd, `td_${id}`);
      if (v !== "held" && v !== "slipped") continue;
      const held = v === "held";
      await db
        .insert(todontLogs)
        .values({ userId: user.id, todontId: id, day, held })
        .onConflictDoUpdate({ target: [todontLogs.userId, todontLogs.todontId, todontLogs.day], set: { held, updatedAt: new Date() } });
    }
  }
  // 3. the ritual itself
  await db
    .insert(challengeRituals)
    .values({ userId: user.id, day, kind: "evening", answers })
    .onConflictDoUpdate({ target: [challengeRituals.userId, challengeRituals.day, challengeRituals.kind], set: { answers, completedAt: new Date() } });
  refresh();
  for (const p of ["/today", "/habits", "/todont", "/dashboard"]) revalidatePath(p);
  redirect("/challenge?tab=today&ritual=evening");
}

/** Restart the challenge clock from a new start date. Logs, reviews and reflections are kept; only the run-specific monthly ticks (and optionally the scorecard) are cleared. */
export async function restartChallenge(fd: FormData) {
  const user = await requireUser();
  if (fd.get("confirm") !== "on") back("plan", "&restart=confirm");
  const rawStart = str(fd, "newStart");
  const start = ISO.test(rawStart) ? rawStart : nairobiToday();
  const end = addDaysISO(start, 181); // about six months
  const values = { startDate: start, endDate: end, updatedAt: new Date() };
  await db
    .insert(challengePlan)
    .values({ userId: user.id, ...values, headline: "", headlineBy: null, support1: "", support2: "", why: "", vices: [], people: [], excuses: [] })
    .onConflictDoUpdate({ target: challengePlan.userId, set: values });
  if (fd.get("clearRules") === "on") await db.delete(challengeRuleChecks).where(eq(challengeRuleChecks.userId, user.id));
  if (fd.get("clearScore") === "on") await db.delete(challengeScorecard).where(eq(challengeScorecard.userId, user.id));
  refresh();
  back("today", "&restarted=1");
}
