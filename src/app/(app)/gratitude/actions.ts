"use server";

import { db } from "@/db";
import { gratitudeEntries, GRATITUDE_CATEGORIES } from "@/db/schema-gratitude";
import { requireUser } from "@/lib/auth";
import { parseItems } from "@/lib/gratitude";
import { todayISO } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const VALID = new Set<string>(GRATITUDE_CATEGORIES.map((c) => c.key));

/** Adds one or many gratitude items (one per line) for a given day. */
export async function addGratitude(formData: FormData) {
  const user = await requireUser();
  const items = parseItems(String(formData.get("items") ?? ""));
  if (items.length === 0) return;
  const rawCat = String(formData.get("category") ?? "general");
  const category = VALID.has(rawCat) ? rawCat : "general";
  const rawDate = String(formData.get("entryDate") ?? "").trim();
  const today = todayISO();
  // Never allow dates in the future.
  const entryDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) && rawDate <= today ? rawDate : today;

  await db.insert(gratitudeEntries).values(items.map((text) => ({ userId: user.id, text, category, entryDate })));
  revalidatePath("/gratitude");
  revalidatePath("/dashboard");
}

export async function deleteGratitude(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(gratitudeEntries).where(and(eq(gratitudeEntries.id, id), eq(gratitudeEntries.userId, user.id)));
  revalidatePath("/gratitude");
  revalidatePath("/dashboard");
}
