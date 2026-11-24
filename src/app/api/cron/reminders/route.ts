import { db } from "@/db";
import { habitLogs, habits, todos } from "@/db/schema";
import { gratitudeEntries } from "@/db/schema-gratitude";
import { pushSubscriptions, reminderSettings } from "@/db/schema-push";
import { challengeDays, challengeRituals } from "@/db/schema-challenge";
import { todontLogs, todonts, yearPlans } from "@/db/schema-life";
import { affirmationForDay } from "@/db/seed-data/life";
import { pushConfigured, sendToUser } from "@/lib/push";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { attempt } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Nairobi is UTC+3 with no daylight saving.
const nairobiDay = (offsetDays = 0) => new Date(Date.now() + 3 * 3600 * 1000 + offsetDays * 86400000).toISOString().slice(0, 10);
const utcDay = () => new Date().toISOString().slice(0, 10);
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
const clip = (s: string, n = 90) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

type Slot = "morning" | "deep" | "evening";

/** Called by Vercel Cron (see vercel.json) with `Authorization: Bearer $CRON_SECRET`. ?slot=morning|deep|evening */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!pushConfigured()) return NextResponse.json({ error: "Push keys are not set" }, { status: 503 });

  const raw = new URL(req.url).searchParams.get("slot");
  const slot: Slot = raw === "evening" ? "evening" : raw === "deep" ? "deep" : "morning";
  const today = nairobiDay();
  const yesterday = nairobiDay(-1);
  const hDay = utcDay(); // habits and to-dos use the UTC date elsewhere in the app

  const subs = await db.select({ userId: pushSubscriptions.userId }).from(pushSubscriptions).catch(() => []);
  const userIds = [...new Set(subs.map((s) => s.userId))];
  const results: Record<string, unknown> = {};

  for (const userId of userIds) {
    // Settings: fall back to the original two columns if the deep_on column hasn't been added yet.
    const full = await attempt(db.select().from(reminderSettings).where(eq(reminderSettings.userId, userId)), null);
    const basic = full
      ? null
      : await attempt(db.select({ morningOn: reminderSettings.morningOn, eveningOn: reminderSettings.eveningOn }).from(reminderSettings).where(eq(reminderSettings.userId, userId)), []);
    const prefs = full ? (full[0] ?? null) : basic?.[0] ? { ...basic[0], deepOn: true } : null;
    const on = slot === "morning" ? (prefs?.morningOn ?? true) : slot === "deep" ? (prefs?.deepOn ?? true) : (prefs?.eveningOn ?? true);
    if (!on) {
      results[userId] = "off";
      continue;
    }

    const rituals = await db
      .select({ day: challengeRituals.day, kind: challengeRituals.kind, answers: challengeRituals.answers })
      .from(challengeRituals)
      .where(and(eq(challengeRituals.userId, userId), inArray(challengeRituals.day, [today, yesterday])))
      .catch(() => []);
    const did = (day: string, kind: string) => rituals.some((r) => r.day === day && r.kind === kind);
    const task = (rituals.find((r) => r.day === today && r.kind === "morning")?.answers as Record<string, string> | undefined)?.task1 ?? "";

    const live = await db.select({ id: habits.id }).from(habits).where(and(eq(habits.userId, userId), eq(habits.archived, false))).catch(() => []);
    const ids = live.map((h) => h.id);
    const habitDone = ids.length
      ? new Set((await db.select({ habitId: habitLogs.habitId }).from(habitLogs).where(and(inArray(habitLogs.habitId, ids), eq(habitLogs.logDate, hDay))).catch(() => [])).map((d) => d.habitId)).size
      : 0;
    const habitsLeft = Math.max(0, ids.length - habitDone);
    const openTodos = await db
      .select({ id: todos.id })
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.scope, "daily"), eq(todos.dueDate, hDay), eq(todos.done, false)))
      .catch(() => []);
    const tdActive = await db.select({ id: todonts.id }).from(todonts).where(and(eq(todonts.userId, userId), eq(todonts.active, true))).catch(() => []);
    const tdLogged = await db.select({ id: todontLogs.todontId }).from(todontLogs).where(and(eq(todontLogs.userId, userId), eq(todontLogs.day, today))).catch(() => []);

    let payload: { title: string; body: string; url: string } | null = null;

    if (slot === "morning") {
      const birthday = (await attempt(db.select({ age: yearPlans.age }).from(yearPlans).where(and(eq(yearPlans.userId, userId), eq(yearPlans.startDate, today))), []))[0] ?? null;
      const word = affirmationForDay(today).text;
      if (did(today, "morning")) {
        payload = { title: "Your one thing", body: task ? `First, before anything else: ${clip(task)}` : "Pick your decisive task and start it before anything else.", url: "/today" };
      } else {
        const bits = [];
        if (tdActive.length) bits.push(plural(tdActive.length, "to-don't"));
        if (ids.length) bits.push(plural(ids.length, "habit"));
        payload = {
          title: birthday ? `Happy birthday! Year ${birthday.age} starts today` : "Good morning. Ritual first",
          body: `${clip(word, 110)}${bits.length ? ` · Today: ${bits.join(", ")}.` : ""}`,
          url: "/challenge/ritual?mode=morning",
        };
      }
    } else if (slot === "deep") {
      payload = {
        title: "Deep-work block",
        body: task ? `Phone in another room. 90 minutes on: ${clip(task)}` : "Phone in another room. 90 minutes on the task that moves your target most.",
        url: "/today",
      };
    } else {
      if (did(today, "evening")) {
        results[userId] = "evening ritual already done";
        continue;
      }
      const yRows = await attempt(db.select({ score: challengeDays.score }).from(challengeDays).where(and(eq(challengeDays.userId, userId), eq(challengeDays.day, yesterday))), null);
      const challengeOn = yRows !== null; // null = tables not set up
      const yRow = yRows?.[0] ?? null;
      const missedYesterday = challengeOn && !did(yesterday, "evening") && !(yRow && yRow.score > 0);
      const gratitude = await db
        .select({ id: gratitudeEntries.id })
        .from(gratitudeEntries)
        .where(and(eq(gratitudeEntries.userId, userId), eq(gratitudeEntries.entryDate, hDay)))
        .limit(1)
        .catch(() => []);
      const bits = [];
      if (habitsLeft) bits.push(`${plural(habitsLeft, "habit")} left`);
      const tdOpen = Math.max(0, tdActive.length - new Set(tdLogged.map((l) => l.id)).size);
      if (tdOpen) bits.push(`${plural(tdOpen, "to-don't")} to log`);
      if (openTodos.length) bits.push(`${plural(openTodos.length, "to-do")} open`);
      if (!gratitude.length && !did(today, "evening")) bits.push("three gratitudes");
      payload = missedYesterday
        ? { title: "Never miss twice", body: `Yesterday slipped by. Close today, even with the minimum.${bits.length ? ` ${bits.join(", ")}.` : ""}`, url: "/challenge/ritual?mode=evening" }
        : { title: "Close the day well", body: bits.length ? `Evening ritual, 5 minutes: ${bits.join(", ")}.` : "Evening ritual, 5 minutes: score the day and set up tomorrow.", url: "/challenge/ritual?mode=evening" };
    }

    results[userId] = await sendToUser(userId, { ...payload, tag: `growth-${slot}` });
  }

  return NextResponse.json({ slot, today, results });
}
