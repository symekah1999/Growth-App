"use server";

import { db } from "@/db";
import { habits } from "@/db/schema";
import { LIFE_SYSTEMS } from "@/db/seed-data/life-systems";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/** Turns a system's suggested habit into a real habit on the Habits page. */
export async function adoptSystemHabit(formData: FormData) {
  const user = await requireUser();
  const system = LIFE_SYSTEMS.find((s) => s.id === String(formData.get("systemId") ?? ""));
  if (!system?.habit) return;

  const existing = await db
    .select({ id: habits.id })
    .from(habits)
    .where(and(eq(habits.userId, user.id), eq(habits.name, system.habit.name), eq(habits.archived, false)))
    .limit(1);
  if (existing.length) return;

  await db.insert(habits).values({
    userId: user.id,
    name: system.habit.name,
    description: `From the "${system.title}" system (${system.origin}).`,
    frequency: system.habit.targetPerWeek >= 7 ? "daily" : "weekly",
    targetPerWeek: system.habit.targetPerWeek,
    color: "#6366f1",
  });
  revalidatePath("/habits");
  revalidatePath("/systems");
  revalidatePath("/dashboard");
}
