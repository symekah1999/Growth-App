import webpush from "web-push";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema-push";
import { eq } from "drizzle-orm";

export type PushPayload = { title: string; body: string; url?: string; tag?: string };

/** True when the three env vars needed for Web Push are present. */
export function pushConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
}

let ready = false;
function init() {
  if (ready) return;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  ready = true;
}

/** Sends to every device the user has enabled. Dead subscriptions (404/410) are removed. */
export async function sendToUser(userId: string, payload: PushPayload): Promise<{ sent: number; removed: number; failed: number }> {
  if (!pushConfigured()) return { sent: 0, removed: 0, failed: 0 };
  init();
  const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  let sent = 0, removed = 0, failed = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 60 * 60 * 6 });
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id)).catch(() => {});
          removed++;
        } else failed++;
      }
    }),
  );
  return { sent, removed, failed };
}
