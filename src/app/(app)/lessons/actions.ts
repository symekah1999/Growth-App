"use server";

import { db } from "@/db";
import { lifeLessons, LESSON_CATEGORIES } from "@/db/schema-lessons";
import { RESILIENCE_STORIES } from "@/db/seed-data/resilience";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const VALID = new Set<string>(LESSON_CATEGORIES.map((c) => c.key));

export async function addLesson(formData: FormData) {
  const user = await requireUser();
  const lesson = String(formData.get("lesson") ?? "").trim();
  if (!lesson) return;
  const context = String(formData.get("context") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "").trim() || null;
  const rawCat = String(formData.get("category") ?? "life");
  const category = VALID.has(rawCat) ? rawCat : "life";
  const rawDate = String(formData.get("learnedOn") ?? "").trim();
  const learnedOn = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : todayISO();

  await db.insert(lifeLessons).values({ userId: user.id, lesson, context, source, category, learnedOn });
  revalidatePath("/lessons");
  revalidatePath("/dashboard");
}

export async function deleteLesson(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(lifeLessons).where(and(eq(lifeLessons.id, id), eq(lifeLessons.userId, user.id)));
  revalidatePath("/lessons");
}

/** Saves the lesson from a great-life story into the owner's own log. */
export async function saveStoryLesson(formData: FormData) {
  const user = await requireUser();
  const story = RESILIENCE_STORIES.find((s) => s.id === String(formData.get("storyId") ?? ""));
  if (!story) return;
  await db.insert(lifeLessons).values({
    userId: user.id,
    lesson: story.lesson,
    context: `${story.setback} ${story.breakthrough}`,
    source: story.name,
    category: "resilience",
    learnedOn: todayISO(),
  });
  revalidatePath("/lessons");
}
