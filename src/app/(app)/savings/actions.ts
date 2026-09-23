"use server";

import { db } from "@/db";
import { savingsContributions, savingsPlans } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPlan(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const targetAmount = String(formData.get("targetAmount") ?? "0");
  const currency = String(formData.get("currency") ?? "KES");
  const targetDate = String(formData.get("targetDate") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await db.insert(savingsPlans).values({ userId: user.id, name, targetAmount, currency, targetDate, notes });
  revalidatePath("/savings");
}

export async function addContribution(formData: FormData) {
  await requireUser();
  const planId = String(formData.get("planId"));
  const amount = String(formData.get("amount") ?? "0");
  const contributedOn = String(formData.get("contributedOn") ?? "") || todayISO();
  const note = String(formData.get("note") ?? "").trim() || null;

  if (Number(amount) <= 0) return;

  await db.insert(savingsContributions).values({ planId, amount, contributedOn, note });
  revalidatePath("/savings");
}

export async function archivePlan(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db
    .update(savingsPlans)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(savingsPlans.id, id), eq(savingsPlans.userId, user.id)));
  revalidatePath("/savings");
}

export async function deletePlan(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(savingsPlans).where(and(eq(savingsPlans.id, id), eq(savingsPlans.userId, user.id)));
  revalidatePath("/savings");
}
