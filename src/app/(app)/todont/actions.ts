"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { todontLogs, todonts } from "@/db/schema-life";
import { TODONT_CATEGORIES, TODONT_SUGGESTIONS } from "@/db/seed-data/life";
import { requireUser } from "@/lib/auth";
import { nairobiToday } from "@/lib/challenge";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const str = (fd: FormData, k: string, max = 500) => String(fd.get(k) ?? "").trim().slice(0, max);
const done = (hash = "") => {
  revalidatePath("/todont");
  redirect(`/todont${hash}`);
};

export async function addTodont(fd: FormData) {
  const user = await requireUser();
  const text = str(fd, "text", 200);
  if (!text) return;
  const category = TODONT_CATEGORIES.some((c) => c.key === str(fd, "category")) ? str(fd, "category") : "life";
  await db.insert(todonts).values({ userId: user.id, text, why: str(fd, "why"), instead: str(fd, "instead"), category });
  done("#today");
}

export async function addSuggestedTodont(fd: FormData) {
  const user = await requireUser();
  const s = TODONT_SUGGESTIONS.find((x) => x.key === str(fd, "key"));
  if (!s) return;
  await db.insert(todonts).values({ userId: user.id, text: s.text, why: s.why, instead: s.instead, category: s.category });
  done("#suggestions");
}

/** Held or slipped for a day. Tapping the same status again clears it. */
export async function logTodont(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, "id", 64);
  const status = str(fd, "status");
  const today = nairobiToday();
  const day = ISO.test(str(fd, "day")) && str(fd, "day") <= today ? str(fd, "day") : today;
  if (!id || !["held", "slipped"].includes(status)) return;
  const held = status === "held";
  const where = and(eq(todontLogs.userId, user.id), eq(todontLogs.todontId, id), eq(todontLogs.day, day));
  const [cur] = await db.select().from(todontLogs).where(where);
  if (cur && cur.held === held && str(fd, "toggle") === "1") {
    await db.delete(todontLogs).where(where);
  } else {
    const note = str(fd, "note");
    await db
      .insert(todontLogs)
      .values({ userId: user.id, todontId: id, day, held, note })
      .onConflictDoUpdate({ target: [todontLogs.userId, todontLogs.todontId, todontLogs.day], set: { held, note, updatedAt: new Date() } });
  }
  done(`#t-${id}`);
}

export async function toggleTodontActive(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, "id", 64);
  const [row] = await db.select().from(todonts).where(and(eq(todonts.userId, user.id), eq(todonts.id, id)));
  if (!row) return;
  await db.update(todonts).set({ active: !row.active }).where(and(eq(todonts.userId, user.id), eq(todonts.id, id)));
  done("#manage");
}

export async function deleteTodont(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, "id", 64);
  await db.delete(todontLogs).where(and(eq(todontLogs.userId, user.id), eq(todontLogs.todontId, id)));
  await db.delete(todonts).where(and(eq(todonts.userId, user.id), eq(todonts.id, id)));
  done("#manage");
}
