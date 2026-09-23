"use server";

import { db } from "@/db";
import { recoveryCheckins, recoveryResets, recoveryTrackers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { streakDayCount, todayISO } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTracker(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const startDate = String(formData.get("startDate") ?? "") || todayISO();
  const targetDays = Number(formData.get("targetDays") ?? 1000) || 1000;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await db.insert(recoveryTrackers).values({ userId: user.id, name, startDate, targetDays, notes });
  revalidatePath("/recovery");
}

export async function updateTrackerNotes(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await db
    .update(recoveryTrackers)
    .set({ notes, updatedAt: new Date() })
    .where(and(eq(recoveryTrackers.id, id), eq(recoveryTrackers.userId, user.id)));

  revalidatePath(`/recovery/${id}`);
}

export async function archiveTracker(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db
    .update(recoveryTrackers)
    .set({ active: false, updatedAt: new Date() })
    .where(and(eq(recoveryTrackers.id, id), eq(recoveryTrackers.userId, user.id)));
  revalidatePath("/recovery");
}

export async function reactivateTracker(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db
    .update(recoveryTrackers)
    .set({ active: true, updatedAt: new Date() })
    .where(and(eq(recoveryTrackers.id, id), eq(recoveryTrackers.userId, user.id)));
  revalidatePath("/recovery");
}

export async function deleteTracker(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(recoveryTrackers).where(and(eq(recoveryTrackers.id, id), eq(recoveryTrackers.userId, user.id)));
  revalidatePath("/recovery");
}

/** Logs a reset (relapse / slip) and starts the streak over from today,
 * preserving the streak just ended in recovery_resets so it still counts
 * toward your longest-streak record. */
export async function logReset(formData: FormData) {
  const user = await requireUser();
  const trackerId = String(formData.get("trackerId"));
  const note = String(formData.get("note") ?? "").trim() || null;

  const [tracker] = await db
    .select()
    .from(recoveryTrackers)
    .where(and(eq(recoveryTrackers.id, trackerId), eq(recoveryTrackers.userId, user.id)))
    .limit(1);
  if (!tracker) return;

  const streakDaysAtReset = streakDayCount(tracker.startDate);
  const today = todayISO();

  await db.insert(recoveryResets).values({ trackerId, resetDate: today, streakDaysAtReset, note });
  await db
    .update(recoveryTrackers)
    .set({ startDate: today, updatedAt: new Date() })
    .where(eq(recoveryTrackers.id, trackerId));

  revalidatePath("/recovery");
  revalidatePath(`/recovery/${trackerId}`);
}

export async function addCheckin(trackerId: string, formData: FormData) {
  await requireUser();
  const checkinDate = String(formData.get("checkinDate") ?? "") || todayISO();
  const cravingLevel = formData.get("cravingLevel") ? Number(formData.get("cravingLevel")) : null;
  const note = String(formData.get("note") ?? "").trim() || null;

  await db
    .insert(recoveryCheckins)
    .values({ trackerId, checkinDate, cravingLevel, note })
    .onConflictDoUpdate({
      target: [recoveryCheckins.trackerId, recoveryCheckins.checkinDate],
      set: { cravingLevel, note },
    });

  revalidatePath(`/recovery/${trackerId}`);
  revalidatePath("/recovery");
}
