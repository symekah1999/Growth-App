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
  // Blank form fields arrive as "" (not null), which Postgres rejects for numeric
  // columns — so parse each one explicitly and apply sensible defaults.
  const num = (key: string): number | null => {
    const raw = String(formData.get(key) ?? "").trim().replace(/,/g, "");
    if (raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  const principalN = num("principal") ?? num("balance");
  if (principalN === null || principalN <= 0) return;
  const balanceN = num("balance") ?? principalN;
  const principal = principalN.toFixed(2);
  const balance = balanceN.toFixed(2);
  const interestRateApr = Math.min(num("interestRateApr") ?? 0, 999).toFixed(3);
  const minPayment = (num("minPayment") ?? 0).toFixed(2);
  const currency = String(formData.get("currency") ?? "").trim() || "KES";

  await db.insert(debts).values({ userId: user.id, name, principal, balance, interestRateApr, minPayment, currency });
  revalidatePath("/debts");
}

export async function recordPayment(formData: FormData) {
  await requireUser();
  const debtId = String(formData.get("debtId"));
  const amountN = Number(String(formData.get("amount") ?? "").trim().replace(/,/g, ""));
  if (!Number.isFinite(amountN)) return;
  const amount = amountN.toFixed(2);
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
