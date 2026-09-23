"use server";

import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEntry(formData: FormData) {
  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const mood = String(formData.get("mood") ?? "").trim() || null;
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const entryDate = String(formData.get("entryDate") ?? "") || todayISO();

  if (!body) return;

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await db.insert(journalEntries).values({
    userId: user.id,
    title,
    body,
    mood,
    tags,
    entryDate,
  });

  revalidatePath("/journal");
}

export async function updateEntry(id: string, formData: FormData) {
  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const mood = String(formData.get("mood") ?? "").trim() || null;
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const entryDate = String(formData.get("entryDate") ?? "");

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await db
    .update(journalEntries)
    .set({ title, body, mood, tags, entryDate, updatedAt: new Date() })
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)));

  revalidatePath("/journal");
  redirect("/journal");
}

export async function deleteEntry(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));

  await db
    .delete(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)));

  revalidatePath("/journal");
}
