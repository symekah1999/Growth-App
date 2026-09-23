import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * This app has exactly one intended user (you). Supabase Auth handles
 * sessions; this helper is the extra guard that makes sure whoever is
 * signed in is actually the owner account, even if Supabase project
 * settings ever changed to allow more signups.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase().trim();
  if (ownerEmail && user.email?.toLowerCase() !== ownerEmail) {
    // Someone other than the configured owner is signed in — deny.
    return null;
  }

  return user;
}

/** Use in server components/actions that require a signed-in owner. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
