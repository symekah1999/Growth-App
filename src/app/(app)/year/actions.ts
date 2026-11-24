"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { yearPlans, yearReviews, type BucketItem, type YearGoal } from "@/db/schema-life";
import { YEAR_AREAS } from "@/db/seed-data/life";
import { requireUser } from "@/lib/auth";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const str = (fd: FormData, k: string, max = 2000) => String(fd.get(k) ?? "").trim().slice(0, max);
const age = (fd: FormData) => Math.min(120, Math.max(1, Math.round(Number(fd.get("age")) || 0)));
const back = (a: number, tab: string, extra = "") => {
  revalidatePath("/year");
  redirect(`/year?age=${a}&tab=${tab}${extra}`);
};

async function getPlan(userId: string, a: number) {
  const [p] = await db.select().from(yearPlans).where(and(eq(yearPlans.userId, userId), eq(yearPlans.age, a)));
  return p ?? null;
}

export async function createYearPlan(fd: FormData) {
  const user = await requireUser();
  const a = age(fd);
  const start = str(fd, "startDate");
  if (!a || !ISO.test(start)) return;
  await db.insert(yearPlans).values({ userId: user.id, age: a, startDate: start }).onConflictDoUpdate({ target: [yearPlans.userId, yearPlans.age], set: { startDate: start, updatedAt: new Date() } });
  back(a, "vision");
}

export async function saveYearVision(fd: FormData) {
  const user = await requireUser();
  const a = age(fd);
  const plan = await getPlan(user.id, a);
  if (!plan) return;
  const values: Partial<typeof yearPlans.$inferInsert> = {
    theme: str(fd, "theme", 60),
    vision: str(fd, "vision", 4000),
    stop: str(fd, "stop", 2000),
    start: str(fd, "start", 2000),
    updatedAt: new Date(),
  };
  // A sealed letter can't be edited or read until it opens.
  if (!plan.sealed) {
    values.letter = str(fd, "letter", 8000);
    values.sealed = fd.get("seal") === "on" && !!values.letter;
  }
  await db.update(yearPlans).set(values).where(and(eq(yearPlans.userId, user.id), eq(yearPlans.age, a)));
  back(a, "vision", "&saved=1");
}

export async function saveYearGoal(fd: FormData) {
  const user = await requireUser();
  const a = age(fd);
  const area = str(fd, "area", 30);
  const plan = await getPlan(user.id, a);
  if (!plan || !YEAR_AREAS.some((x) => x.key === area)) return;
  const goal: YearGoal = {
    goal: str(fd, "goal", 500),
    measure: str(fd, "measure", 300),
    q: [str(fd, "q1", 300), str(fd, "q2", 300), str(fd, "q3", 300), str(fd, "q4", 300)],
    progress: Math.min(100, Math.max(0, Math.round(Number(fd.get("progress")) || 0))),
  };
  await db.update(yearPlans).set({ goals: { ...(plan.goals ?? {}), [area]: goal }, updatedAt: new Date() }).where(and(eq(yearPlans.userId, user.id), eq(yearPlans.age, a)));
  back(a, "goals", `&saved=1#g-${area}`);
}

export async function saveQuarterFocus(fd: FormData) {
  const user = await requireUser();
  const a = age(fd);
  const q = Math.min(4, Math.max(1, Number(fd.get("quarter")) || 1));
  const plan = await getPlan(user.id, a);
  if (!plan) return;
  const quarters = [0, 1, 2, 3].map((i) => plan.quarters?.[i] ?? "");
  quarters[q - 1] = str(fd, "focus", 500);
  await db.update(yearPlans).set({ quarters, updatedAt: new Date() }).where(and(eq(yearPlans.userId, user.id), eq(yearPlans.age, a)));
  back(a, "quarters", `&saved=1#q${q}`);
}

export async function saveYearReview(fd: FormData) {
  const user = await requireUser();
  const a = age(fd);
  const kind = str(fd, "kind") === "quarter" ? "quarter" : "month";
  const period = Math.min(kind === "quarter" ? 4 : 12, Math.max(1, Number(fd.get("period")) || 1));
  const r = Number(fd.get("rating"));
  const values = {
    rating: Number.isFinite(r) && r >= 1 && r <= 10 ? Math.round(r) : null,
    wins: str(fd, "wins"),
    lessons: str(fd, "lessons"),
    adjust: str(fd, "adjust"),
    updatedAt: new Date(),
  };
  await db
    .insert(yearReviews)
    .values({ userId: user.id, age: a, kind, period, ...values })
    .onConflictDoUpdate({ target: [yearReviews.userId, yearReviews.age, yearReviews.kind, yearReviews.period], set: values });
  back(a, kind === "quarter" ? "quarters" : "checkins", `&saved=1${kind === "quarter" ? `#q${period}` : ""}`);
}

async function setBucket(userId: string, a: number, fn: (b: BucketItem[]) => BucketItem[]) {
  const plan = await getPlan(userId, a);
  if (!plan) return;
  await db.update(yearPlans).set({ bucket: fn([...(plan.bucket ?? [])]), updatedAt: new Date() }).where(and(eq(yearPlans.userId, userId), eq(yearPlans.age, a)));
}

export async function addBucketItem(fd: FormData) {
  const user = await requireUser();
  const a = age(fd);
  const text = str(fd, "text", 200);
  if (text) await setBucket(user.id, a, (b) => (b.length >= 60 ? b : [...b, { text, done: false }]));
  back(a, "bucket");
}

export async function toggleBucketItem(fd: FormData) {
  const user = await requireUser();
  const a = age(fd);
  const i = Number(fd.get("i"));
  await setBucket(user.id, a, (b) => b.map((x, j) => (j === i ? { ...x, done: !x.done } : x)));
  back(a, "bucket");
}

export async function removeBucketItem(fd: FormData) {
  const user = await requireUser();
  const a = age(fd);
  const i = Number(fd.get("i"));
  await setBucket(user.id, a, (b) => b.filter((_, j) => j !== i));
  back(a, "bucket");
}
