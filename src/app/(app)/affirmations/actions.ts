"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { myAffirmations } from "@/db/schema-life";
import { AFFIRMATIONS } from "@/db/seed-data/life";
import { requireUser } from "@/lib/auth";

const str = (fd: FormData, k: string, max = 600) => String(fd.get(k) ?? "").trim().slice(0, max);
const done = (hash = "") => {
  revalidatePath("/affirmations");
  redirect(`/affirmations${hash}`);
};

export async function saveLibraryAffirmation(fd: FormData) {
  const user = await requireUser();
  const a = AFFIRMATIONS.find((x) => x.key === str(fd, "key"));
  if (!a) return;
  const [exists] = await db.select().from(myAffirmations).where(and(eq(myAffirmations.userId, user.id), eq(myAffirmations.libraryKey, a.key)));
  if (!exists) await db.insert(myAffirmations).values({ userId: user.id, text: a.text, category: a.category, libraryKey: a.key });
  done(str(fd, "from") === "today" ? "#today" : `#lib-${a.category}`);
}

export async function addMyAffirmation(fd: FormData) {
  const user = await requireUser();
  const text = str(fd, "text");
  if (!text) return;
  await db.insert(myAffirmations).values({ userId: user.id, text, category: "mine" });
  done("#mine");
}

export async function removeMyAffirmation(fd: FormData) {
  const user = await requireUser();
  await db.delete(myAffirmations).where(and(eq(myAffirmations.userId, user.id), eq(myAffirmations.id, str(fd, "id", 64))));
  done("#mine");
}
