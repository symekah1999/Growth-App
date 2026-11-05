"use server";

import { db } from "@/db";
import { goalMilestones, goals, mantras, todos } from "@/db/schema";
import { LIFE_SYSTEMS } from "@/db/seed-data/life-systems";
import { requireUser } from "@/lib/auth";
import { addDaysISO, todayISO } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type Result = { ok: boolean; message?: string };

/** Puts a suggested action (from a system, story or reality) on today's to-do list. */
export async function addTodoFromText(formData: FormData): Promise<Result> {
  const user = await requireUser();
  const title = String(formData.get("text") ?? "").trim().slice(0, 200);
  if (!title) return { ok: false, message: "Nothing to add" };
  const today = todayISO();
  const existing = await db
    .select({ id: todos.id })
    .from(todos)
    .where(and(eq(todos.userId, user.id), eq(todos.scope, "daily"), eq(todos.dueDate, today), eq(todos.title, title)))
    .limit(1);
  if (existing.length) return { ok: true, message: "Already on today's list" };
  await db.insert(todos).values({ userId: user.id, title, scope: "daily", dueDate: today });
  revalidatePath("/todos");
  revalidatePath("/dashboard");
  revalidatePath("/checkin");
  return { ok: true, message: "On today's to-dos" };
}

const GOAL_AREA: Record<string, string> = {
  faith: "spiritual",
  health: "health",
  career: "career",
  finance: "finance",
  relationships: "relationships",
  learning: "learning",
};

/** Turns a Life System into a 30-day goal whose milestones are the system's steps. */
export async function makeGoalFromSystem(formData: FormData): Promise<Result> {
  const user = await requireUser();
  const system = LIFE_SYSTEMS.find((s) => s.id === String(formData.get("systemId") ?? ""));
  if (!system) return { ok: false, message: "System not found" };
  const title = `Practise: ${system.title}`.slice(0, 120);
  const existing = await db
    .select({ id: goals.id })
    .from(goals)
    .where(and(eq(goals.userId, user.id), eq(goals.title, title), eq(goals.status, "active")))
    .limit(1);
  if (existing.length) return { ok: true, message: "Already a goal" };

  const [goal] = await db
    .insert(goals)
    .values({
      userId: user.id,
      title,
      description: `${system.summary} (${system.origin})`,
      category: GOAL_AREA[system.category] ?? "general",
      targetDate: addDaysISO(todayISO(), 30),
    })
    .returning({ id: goals.id });
  if (goal && system.steps.length) {
    await db
      .insert(goalMilestones)
      .values(system.steps.map((step, i) => ({ goalId: goal.id, title: step.slice(0, 200), sortOrder: i })));
  }
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true, message: "Goal created" };
}

/** Saves a quote as one of your daily mantras. */
export async function makeMantra(formData: FormData): Promise<Result> {
  const user = await requireUser();
  const text = String(formData.get("text") ?? "").trim().slice(0, 300);
  if (!text) return { ok: false, message: "Nothing to add" };
  const existing = await db
    .select({ id: mantras.id })
    .from(mantras)
    .where(and(eq(mantras.userId, user.id), eq(mantras.text, text)))
    .limit(1);
  if (existing.length) return { ok: true, message: "Already a mantra" };
  await db.insert(mantras).values({ userId: user.id, text });
  revalidatePath("/mantras");
  revalidatePath("/dashboard");
  return { ok: true, message: "Added to mantras" };
}
