"use server";

import { db } from "@/db";
import { pushSubscriptions, reminderSettings } from "@/db/schema-push";
import { requireUser } from "@/lib/auth";
import { pushConfigured, sendToUser } from "@/lib/push";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type Result = { ok: boolean; message?: string };

export async function savePushSubscription(sub: { endpoint: string; p256dh: string; auth: string; userAgent?: string }): Promise<Result> {
  const user = await requireUser();
  if (!sub?.endpoint || !sub.p256dh || !sub.auth) return { ok: false, message: "Invalid subscription." };
  try {
    await db
      .insert(pushSubscriptions)
      .values({ userId: user.id, endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth, userAgent: (sub.userAgent ?? "").slice(0, 300) })
      .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { userId: user.id, p256dh: sub.p256dh, auth: sub.auth } });
  } catch {
    return { ok: false, message: "The reminders table isn't set up yet. Run the SQL from the setup note first." };
  }
  revalidatePath("/reminders");
  return { ok: true };
}

export async function removePushSubscription(endpoint: string): Promise<Result> {
  const user = await requireUser();
  const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint)).catch(() => []);
  if (subs.some((s) => s.userId === user.id)) await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  revalidatePath("/reminders");
  return { ok: true };
}

export async function sendTestPush(): Promise<Result> {
  const user = await requireUser();
  if (!pushConfigured()) return { ok: false, message: "Push keys aren't set in Vercel yet." };
  const r = await sendToUser(user.id, { title: "Growth OS", body: "Reminders are working. See you tomorrow morning.", url: "/checkin", tag: "test" });
  if (r.sent === 0) return { ok: false, message: r.removed ? "That device's subscription had expired. Turn reminders on again." : "No device is subscribed yet." };
  return { ok: true, message: `Sent to ${r.sent} device${r.sent === 1 ? "" : "s"}.` };
}

export async function saveReminderSettings(formData: FormData) {
  const user = await requireUser();
  const morningOn = formData.get("morningOn") === "on";
  const eveningOn = formData.get("eveningOn") === "on";
  try {
    await db
      .insert(reminderSettings)
      .values({ userId: user.id, morningOn, eveningOn })
      .onConflictDoUpdate({ target: reminderSettings.userId, set: { morningOn, eveningOn, updatedAt: new Date() } });
  } catch {
    // table missing: page shows the setup note
  }
  revalidatePath("/reminders");
}
