"use server";

import { db } from "@/db";
import { quotes } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { QUOTE_LIBRARY } from "@/db/seed-data/quote-library";
import { revalidatePath } from "next/cache";

export async function addQuote(formData: FormData) {
  const user = await requireUser();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  const author = String(formData.get("author") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;

  await db.insert(quotes).values({ userId: user.id, text, author, category });
  revalidatePath("/quotes");
  revalidatePath("/dashboard");
}

export async function deleteQuote(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(quotes).where(and(eq(quotes.id, id), eq(quotes.userId, user.id)));
  revalidatePath("/quotes");
}

/** Save a built-in library quote into your own collection. */
export async function saveLibraryQuote(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("libraryId"));
  const q = QUOTE_LIBRARY.find((x) => x.id === id);
  if (!q) return;

  const [existing] = await db
    .select({ id: quotes.id })
    .from(quotes)
    .where(and(eq(quotes.userId, user.id), eq(quotes.text, q.text)))
    .limit(1);
  if (!existing) {
    await db.insert(quotes).values({ userId: user.id, text: q.text, author: q.author, category: q.category });
  }
  revalidatePath("/quotes");
  revalidatePath("/dashboard");
}
