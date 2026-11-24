"use server";

import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { challengeReviews } from "@/db/schema-challenge";
import { nairobiToday } from "@/lib/challenge";

/** Saves the weekly reflection as a Journal entry tagged "weekly-review". */
export async function saveReview(formData: FormData) {
  const user = await requireUser();
  const wins = String(formData.get("wins") ?? "").trim().slice(0, 3000);
  const blockers = String(formData.get("blockers") ?? "").trim().slice(0, 3000);
  const focus = String(formData.get("focus") ?? "").trim().slice(0, 3000);
  if (!wins && !blockers && !focus) return;
  const today = todayISO();
  const body = [`Wins:\n${wins || "—"}`, `What got in the way:\n${blockers || "—"}`, `Focus for next week:\n${focus || "—"}`].join("\n\n");
  await db.insert(journalEntries).values({
    userId: user.id,
    title: `Weekly review · week ending ${today}`,
    body,
    mood: null,
    tags: ["weekly-review"],
    entryDate: today,
  });
  // One Sunday review: if the challenge fields were filled, the same answers also go to the challenge's review log.
  const pace = String(formData.get("pace") ?? "");
  if (["ahead", "on", "behind"].includes(pace)) {
    await db
      .insert(challengeReviews)
      .values({ userId: user.id, weekEnding: nairobiToday(), pace, worked: wins, failed: blockers, change: String(formData.get("change") ?? "").trim().slice(0, 2000), nextPlan: focus })
      .catch(() => null);
    revalidatePath("/challenge");
  }
  revalidatePath("/review");
  revalidatePath("/journal");
  redirect("/review?saved=1");
}
