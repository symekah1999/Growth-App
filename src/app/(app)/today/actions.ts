"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { habitLogs, habits, todos } from "@/db/schema";
import { challengeDays } from "@/db/schema-challenge";
import { todontLogs, todonts } from "@/db/schema-life";
import { DAILY_CHECKS } from "@/db/seed-data/challenge";
import { requireUser } from "@/lib/auth";
import { nairobiToday } from "@/lib/challenge";
import { todayISO } from "@/lib/utils";

const str = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);
function refresh() {
  for (const p of ["/today", "/dashboard", "/challenge", "/habits", "/todos", "/todont", "/checkin"]) revalidatePath(p);
}

/** Flip one of the 7 daily challenge points for today, keeping everything else on the day's row. */
export async function toggleCheckToday(fd: FormData) {
  const user = await requireUser();
  const key = str(fd, "key", 20);
  if (!DAILY_CHECKS.some((c) => c.key === key)) return;
  const day = nairobiToday();
  const [row] = await db.select().from(challengeDays).where(and(eq(challengeDays.userId, user.id), eq(challengeDays.day, day)));
  const checks = { ...((row?.checks ?? {}) as Record<string, boolean>), [key]: !(row?.checks as Record<string, boolean> | undefined)?.[key] };
  const score = DAILY_CHECKS.filter((c) => checks[c.key]).length;
  await db
    .insert(challengeDays)
    .values({ userId: user.id, day, checks, score })
    .onConflictDoUpdate({ target: [challengeDays.userId, challengeDays.day], set: { checks, score, updatedAt: new Date() } });
  refresh();
}

export async function toggleHabitToday(fd: FormData) {
  const user = await requireUser();
  const habitId = str(fd, "habitId", 64);
  const [own] = await db.select({ id: habits.id }).from(habits).where(and(eq(habits.id, habitId), eq(habits.userId, user.id)));
  if (!own) return;
  const today = todayISO();
  if (fd.get("isLogged") === "true") await db.delete(habitLogs).where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.logDate, today)));
  else await db.insert(habitLogs).values({ habitId, logDate: today }).onConflictDoNothing();
  refresh();
}

export async function toggleTodoToday(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, "id", 64);
  const done = fd.get("done") === "true";
  await db.update(todos).set({ done: !done, doneAt: !done ? new Date() : null, updatedAt: new Date() }).where(and(eq(todos.id, id), eq(todos.userId, user.id)));
  refresh();
}

export async function addTodoToday(fd: FormData) {
  const user = await requireUser();
  const title = str(fd, "title", 200);
  if (!title) return;
  await db.insert(todos).values({ userId: user.id, title, scope: "daily", dueDate: todayISO() });
  refresh();
}

/** Held / slipped from the Today screen. Tapping the active status again clears it. */
export async function logTodontToday(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, "id", 64);
  const held = str(fd, "status") === "held";
  const [own] = await db.select({ id: todonts.id }).from(todonts).where(and(eq(todonts.id, id), eq(todonts.userId, user.id)));
  if (!own) return;
  const day = nairobiToday();
  const where = and(eq(todontLogs.userId, user.id), eq(todontLogs.todontId, id), eq(todontLogs.day, day));
  const [cur] = await db.select().from(todontLogs).where(where);
  if (cur && cur.held === held) await db.delete(todontLogs).where(where);
  else
    await db
      .insert(todontLogs)
      .values({ userId: user.id, todontId: id, day, held })
      .onConflictDoUpdate({ target: [todontLogs.userId, todontLogs.todontId, todontLogs.day], set: { held, updatedAt: new Date() } });
  refresh();
}
