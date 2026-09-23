"use server";

import { db } from "@/db";
import { habitLogs, habits } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createHabit(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const description = String(formData.get("description") ?? "").trim() || null;
  const frequency = String(formData.get("frequency") ?? "daily");
  const targetPerWeek = Number(formData.get("targetPerWeek") ?? 7);
  const color = String(formData.get("color") ?? "#6366f1");

  await db.insert(habits).values({ userId: user.id, name, description, frequency, targetPerWeek, color });
  revalidatePath("/habits");
}

export async function toggleTodayLog(formData: FormData) {
  await requireUser();
  const habitId = String(formData.get("habitId"));
  const isLogged = formData.get("isLogged") === "true";
  const today = todayISO();

  if (isLogged) {
    await db.delete(habitLogs).where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.logDate, today)));
  } else {
    await db.insert(habitLogs).values({ habitId, logDate: today }).onConflictDoNothing();
  }

  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function archiveHabit(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db
    .update(habits)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(habits.id, id), eq(habits.userId, user.id)));
  revalidatePath("/habits");
}

export async function deleteHabit(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, user.id)));
  revalidatePath("/habits");
}
