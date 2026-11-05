import { db } from "@/db";
import { habitLogs, habits, todos } from "@/db/schema";
import { gratitudeEntries } from "@/db/schema-gratitude";
import { pushSubscriptions, reminderSettings } from "@/db/schema-push";
import { pushConfigured, sendToUser } from "@/lib/push";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Nairobi is UTC+3 with no daylight saving.
const nairobiToday = () => new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);

/** Called by Vercel Cron (see vercel.json) with `Authorization: Bearer $CRON_SECRET`. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!pushConfigured()) return NextResponse.json({ error: "Push keys are not set" }, { status: 503 });

  const slot = new URL(req.url).searchParams.get("slot") === "evening" ? "evening" : "morning";
  const today = nairobiToday();

  const subs = await db.select({ userId: pushSubscriptions.userId }).from(pushSubscriptions).catch(() => []);
  const userIds = [...new Set(subs.map((s) => s.userId))];
  const results: Record<string, unknown> = {};

  for (const userId of userIds) {
    const [prefs] = await db.select().from(reminderSettings).where(eq(reminderSettings.userId, userId)).catch(() => []);
    const on = slot === "morning" ? (prefs?.morningOn ?? true) : (prefs?.eveningOn ?? true);
    if (!on) {
      results[userId] = "off";
      continue;
    }

    const live = await db.select({ id: habits.id }).from(habits).where(and(eq(habits.userId, userId), eq(habits.archived, false))).catch(() => []);
    const ids = live.map((h) => h.id);
    const done = ids.length
      ? await db.select({ habitId: habitLogs.habitId }).from(habitLogs).where(and(inArray(habitLogs.habitId, ids), eq(habitLogs.logDate, today))).catch(() => [])
      : [];
    const habitsLeft = Math.max(0, ids.length - new Set(done.map((d) => d.habitId)).size);
    const openTodos = await db
      .select({ id: todos.id })
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.scope, "daily"), eq(todos.dueDate, today), eq(todos.done, false)))
      .catch(() => []);
    const gratitude = await db
      .select({ id: gratitudeEntries.id })
      .from(gratitudeEntries)
      .where(and(eq(gratitudeEntries.userId, userId), eq(gratitudeEntries.entryDate, today)))
      .limit(1)
      .catch(() => []);

    let title: string, body: string;
    if (slot === "morning") {
      title = "Good morning";
      const bits = [];
      if (ids.length) bits.push(`${ids.length} habit${ids.length === 1 ? "" : "s"} to tick`);
      if (openTodos.length) bits.push(`${openTodos.length} to-do${openTodos.length === 1 ? "" : "s"} today`);
      body = bits.length ? `Set your intention. ${bits.join(" · ")}.` : "Set your intention and choose your top three for today.";
    } else {
      title = "Evening check-in";
      const bits = [];
      if (habitsLeft) bits.push(`${habitsLeft} habit${habitsLeft === 1 ? "" : "s"} left`);
      if (openTodos.length) bits.push(`${openTodos.length} to-do${openTodos.length === 1 ? "" : "s"} open`);
      if (!gratitude.length) bits.push("no gratitude logged yet");
      body = bits.length ? `Close the day well: ${bits.join(", ")}.` : "Everything done today. Take a minute to reflect.";
    }
    results[userId] = await sendToUser(userId, { title, body, url: "/checkin", tag: `growth-${slot}` });
  }

  return NextResponse.json({ slot, today, results });
}
