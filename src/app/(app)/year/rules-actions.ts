"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { growthTrials, ruleReflections } from "@/db/schema-life";
import { trialByKey } from "@/db/seed-data/rules-to-live";
import { requireUser } from "@/lib/auth";
import { daysBetween, nairobiToday } from "@/lib/challenge";

const str = (fd: FormData, k: string, max = 2000) => String(fd.get(k) ?? "").trim().slice(0, max);
const int = (fd: FormData, k: string, min: number, max: number) => Math.min(max, Math.max(min, Math.round(Number(fd.get(k)) || min)));
const back = (fd: FormData, v: string, extra = "") => {
  revalidatePath("/year");
  redirect(`/year?age=${int(fd, "age", 1, 120)}&tab=rules&v=${v}${extra}`);
};

export async function saveReflection(fd: FormData) {
  const user = await requireUser();
  const day = nairobiToday();
  const lived = str(fd, "lived", 10);
  const values = {
    sentence: int(fd, "sentence", 1, 27),
    hack: int(fd, "hack", 1, 14),
    action: str(fd, "action", 1000),
    lived: ["yes", "partly", "no"].includes(lived) ? lived : "",
    applied: fd.get("applied") === "on",
    better: str(fd, "better", 1000),
    note: str(fd, "note", 4000),
    updatedAt: new Date(),
  };
  await db.insert(ruleReflections).values({ userId: user.id, day, ...values }).onConflictDoUpdate({ target: [ruleReflections.userId, ruleReflections.day], set: values });
  back(fd, "reflect", "&saved=1");
}

async function getTrial(userId: string, key: string) {
  const [t] = await db.select().from(growthTrials).where(and(eq(growthTrials.userId, userId), eq(growthTrials.key, key)));
  return t ?? null;
}

const runDays = (start: string, today: string) => Math.max(0, daysBetween(start, today));

export async function startTrial(fd: FormData) {
  const user = await requireUser();
  const key = str(fd, "key", 40);
  if (!trialByKey(key)) return;
  const today = nairobiToday();
  const focus = str(fd, "focus", 200);
  const prev = await getTrial(user.id, key);
  if (prev) {
    await db.update(growthTrials).set({ startDate: today, active: true, focus: focus || prev.focus, attempts: prev.attempts + 1, updatedAt: new Date() }).where(and(eq(growthTrials.userId, user.id), eq(growthTrials.key, key)));
  } else {
    await db.insert(growthTrials).values({ userId: user.id, key, startDate: today, focus });
  }
  back(fd, "challenges", `#t-${key}`);
}

/** Slipped: back to day 1, keeping the best run. */
export async function restartTrial(fd: FormData) {
  const user = await requireUser();
  const key = str(fd, "key", 40);
  const t = await getTrial(user.id, key);
  if (!t) return;
  const today = nairobiToday();
  await db.update(growthTrials).set({ startDate: today, active: true, attempts: t.attempts + 1, best: Math.max(t.best, runDays(t.startDate, today)), updatedAt: new Date() }).where(and(eq(growthTrials.userId, user.id), eq(growthTrials.key, key)));
  back(fd, "challenges", `#t-${key}`);
}

export async function stopTrial(fd: FormData) {
  const user = await requireUser();
  const key = str(fd, "key", 40);
  const t = await getTrial(user.id, key);
  if (!t) return;
  const done = fd.get("done") === "1";
  const today = nairobiToday();
  const len = trialByKey(key)?.days ?? 0;
  await db.update(growthTrials).set({
    active: false,
    best: Math.max(t.best, Math.min(len, runDays(t.startDate, today) + 1)),
    completed: done ? t.completed + 1 : t.completed,
    updatedAt: new Date(),
  }).where(and(eq(growthTrials.userId, user.id), eq(growthTrials.key, key)));
  back(fd, "challenges", `#t-${key}`);
}
