"use server";

import { db } from "@/db";
import { coreValues, mantras } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addMantra(formData: FormData) {
  const user = await requireUser();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  await db.insert(mantras).values({ userId: user.id, text });
  revalidatePath("/mantras");
}

export async function deleteMantra(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(mantras).where(and(eq(mantras.id, id), eq(mantras.userId, user.id)));
  revalidatePath("/mantras");
}

export async function addValue(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const description = String(formData.get("description") ?? "").trim() || null;
  await db.insert(coreValues).values({ userId: user.id, title, description });
  revalidatePath("/mantras");
}

export async function deleteValue(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(coreValues).where(and(eq(coreValues.id, id), eq(coreValues.userId, user.id)));
  revalidatePath("/mantras");
}
