"use server";

import { db } from "@/db";
import { journalEntries, todos } from "@/db/schema";
import { gratitudeEntries } from "@/db/schema-gratitude";
import { requireUser } from "@/lib/auth";
import { parseItems } from "@/lib/gratitude";
import { todayISO } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export type CaptureItem = { id: string; kind: "journal" | "gratitude" | "todo"; text: string; date: string };

/** Saves one quick-captured item. `date` is the day it was written on the device, so
 * something jotted offline late at night still lands on the right day. */
export async function captureItem(item: CaptureItem): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser();
  const text = String(item?.text ?? "").trim().slice(0, 4000);
  if (!text) return { ok: false, message: "Nothing to save." };
  const today = todayISO();
  // Device dates can be a day ahead of UTC; allow tomorrow, never further.
  const maxDate = new Date(Date.now() + 36 * 3600 * 1000).toISOString().slice(0, 10);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(item.date) && item.date <= maxDate ? item.date : today;

  try {
    if (item.kind === "journal") {
      await db.insert(journalEntries).values({ userId: user.id, title: "", body: text, tags: ["quick-capture"], entryDate: date });
    } else if (item.kind === "gratitude") {
      const items = parseItems(text);
      if (!items.length) return { ok: false, message: "Nothing to save." };
      await db.insert(gratitudeEntries).values(items.map((t) => ({ userId: user.id, text: t, category: "general", entryDate: date })));
    } else if (item.kind === "todo") {
      await db.insert(todos).values({ userId: user.id, title: text.slice(0, 200), scope: "daily", dueDate: date });
    } else {
      return { ok: false, message: "Unknown type." };
    }
  } catch {
    return { ok: false, message: "Could not save." };
  }
  for (const p of ["/journal", "/gratitude", "/todos", "/dashboard", "/checkin", "/day"]) revalidatePath(p);
  return { ok: true };
}
