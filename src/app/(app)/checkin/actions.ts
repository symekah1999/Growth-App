"use server";

import { db } from "@/db";
import { habitLogs, habits, journalEntries, todos } from "@/db/schema";
import { lifeLessons } from "@/db/schema-lessons";
import { gratitudeEntries } from "@/db/schema-gratitude";
import { requireUser } from "@/lib/auth";
import { parseItems } from "@/lib/gratitude";
import { todayISO } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function refresh() {
  for (const p of ["/checkin", "/dashboard", "/habits", "/todos", "/gratitude", "/lessons", "/journal", "/review"]) revalidatePath(p);
}

export async function checkinToggleHabit(formData: FormData) {
  const user = await requireUser();
  const habitId = String(formData.get("habitId") ?? "");
  const isLogged = formData.get("isLogged") === "true";
  const today = todayISO();
  // make sure the habit is the owner's
  const [own] = await db.select({ id: habits.id }).from(habits).where(and(eq(habits.id, habitId), eq(habits.userId, user.id)));
  if (!own) return;
  if (isLogged) await db.delete(habitLogs).where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.logDate, today)));
  else await db.insert(habitLogs).values({ habitId, logDate: today }).onConflictDoNothing();
  refresh();
}

export async function checkinToggleTodo(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const done = formData.get("done") === "true";
  await db
    .update(todos)
    .set({ done: !done, doneAt: !done ? new Date() : null, updatedAt: new Date() })
    .where(and(eq(todos.id, id), eq(todos.userId, user.id)));
  refresh();
}

export async function checkinAddTodo(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  if (!title) return;
  await db.insert(todos).values({ userId: user.id, title, scope: "daily", dueDate: todayISO() });
  refresh();
}

const MOODS = new Set(["grateful", "energized", "hopeful", "neutral", "reflective", "anxious", "low"]);

/** Saves the text parts of a check-in. Intentions and reflections go to the
 * Journal (tagged "check-in"), gratitude and lessons to their own logs. */
export async function saveCheckin(formData: FormData) {
  const user = await requireUser();
  const mode = formData.get("mode") === "evening" ? "evening" : "morning";
  const today = todayISO();

  if (mode === "morning") {
    const intention = String(formData.get("intention") ?? "").trim();
    if (intention) {
      await db.insert(journalEntries).values({
        userId: user.id,
        title: "Morning intention",
        body: intention.slice(0, 4000),
        mood: null,
        tags: ["check-in", "morning"],
        entryDate: today,
      });
    }
  } else {
    const reflection = String(formData.get("reflection") ?? "").trim();
    const rawMood = String(formData.get("mood") ?? "");
    if (reflection) {
      await db.insert(journalEntries).values({
        userId: user.id,
        title: "Evening reflection",
        body: reflection.slice(0, 4000),
        mood: MOODS.has(rawMood) ? rawMood : null,
        tags: ["check-in", "evening"],
        entryDate: today,
      });
    }
    const thanks = parseItems(String(formData.get("gratitude") ?? ""));
    if (thanks.length) {
      try {
        await db.insert(gratitudeEntries).values(thanks.map((text) => ({ userId: user.id, text, category: "general", entryDate: today })));
      } catch {
        /* gratitude table not created yet */
      }
    }
    const lesson = String(formData.get("lesson") ?? "").trim();
    if (lesson) {
      try {
        await db.insert(lifeLessons).values({ userId: user.id, lesson: lesson.slice(0, 1000), category: "life", learnedOn: today });
      } catch {
        /* lessons table not created yet */
      }
    }
  }

  refresh();
  redirect(`/checkin?mode=${mode}&saved=1`);
}
