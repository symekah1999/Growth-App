"use server";

import { db } from "@/db";
import { todos } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTodo(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const scope = String(formData.get("scope") ?? "daily");
  const dueDate = String(formData.get("dueDate") ?? "") || (scope === "daily" ? todayISO() : null);

  await db.insert(todos).values({ userId: user.id, title, scope, dueDate });
  revalidatePath("/todos");
  revalidatePath("/dashboard");
}

export async function toggleTodo(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const done = formData.get("done") === "true";

  await db
    .update(todos)
    .set({ done: !done, doneAt: !done ? new Date() : null, updatedAt: new Date() })
    .where(and(eq(todos.id, id), eq(todos.userId, user.id)));

  revalidatePath("/todos");
  revalidatePath("/dashboard");
}

export async function deleteTodo(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, user.id)));
  revalidatePath("/todos");
  revalidatePath("/dashboard");
}
