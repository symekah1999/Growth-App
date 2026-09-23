"use server";

import { db } from "@/db";
import { goalMilestones, goals } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: FormData) {
  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const description = String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "general").trim() || "general";
  const targetDate = String(formData.get("targetDate") ?? "") || null;

  await db.insert(goals).values({ userId: user.id, title, description, category, targetDate });
  revalidatePath("/goals");
}

export async function updateGoalStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));

  await db
    .update(goals)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)));

  revalidatePath("/goals");
  revalidatePath(`/goals/${id}`);
}

export async function updateGoalProgress(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const progress = Math.max(0, Math.min(100, Number(formData.get("progress") ?? 0)));

  await db
    .update(goals)
    .set({ progress, updatedAt: new Date() })
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)));

  revalidatePath("/goals");
  revalidatePath(`/goals/${id}`);
}

export async function deleteGoal(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, user.id)));
  revalidatePath("/goals");
}

export async function addMilestone(goalId: string, formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await db.insert(goalMilestones).values({ goalId, title });
  revalidatePath(`/goals/${goalId}`);
}

export async function toggleMilestone(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id"));
  const goalId = String(formData.get("goalId"));
  const done = formData.get("done") === "true";

  await db.update(goalMilestones).set({ done: !done, updatedAt: new Date() }).where(eq(goalMilestones.id, id));

  // auto-update parent goal progress based on milestone completion ratio
  const rows = await db.select().from(goalMilestones).where(eq(goalMilestones.goalId, goalId));
  if (rows.length > 0) {
    const doneCount = rows.filter((r) => (r.id === id ? !done : r.done)).length;
    const progress = Math.round((doneCount / rows.length) * 100);
    await db.update(goals).set({ progress, updatedAt: new Date() }).where(eq(goals.id, goalId));
  }

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/goals");
}

export async function deleteMilestone(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id"));
  const goalId = String(formData.get("goalId"));
  await db.delete(goalMilestones).where(eq(goalMilestones.id, id));
  revalidatePath(`/goals/${goalId}`);
}
