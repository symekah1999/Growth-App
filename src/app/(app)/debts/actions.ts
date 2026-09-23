"use server";

import { db } from "@/db";
import { debtPayments, debts } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/utils";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createDebt(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const principal = String(formData.get("principal") ?? "0");
  const balance = String(formData.get("balance") ?? principal);
  const interestRateApr = String(formData.get("interestRateApr") ?? "0");
  const minPayment = String(formData.get("minPayment") ?? "0");
  const currency = String(formData.get("currency") ?? "KES");

  await db.insert(debts).values({ userId: user.id, name, principal, balance, interestRateApr, minPayment, currency });
  revalidatePath("/debts");
}

export async function recordPayment(formData: FormData) {
  await requireUser();
  const debtId = String(formData.get("debtId"));
  const amount = String(formData.get("amount") ?? "0");
  const paidOn = String(formData.get("paidOn") ?? "") || todayISO();
  const note = String(formData.get("note") ?? "").trim() || null;

  if (Number(amount) <= 0) return;

  await db.insert(debtPayments).values({ debtId, amount, paidOn, note });
  await db
    .update(debts)
    .set({ balance: sql`greatest(0, ${debts.balance} - ${amount})`, updatedAt: new Date() })
    .where(eq(debts.id, debtId));

  revalidatePath("/debts");
}

export async function archiveDebt(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db
    .update(debts)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(debts.id, id), eq(debts.userId, user.id)));
  revalidatePath("/debts");
}

export async function deleteDebt(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(debts).where(and(eq(debts.id, id), eq(debts.userId, user.id)));
  revalidatePath("/debts");
}
