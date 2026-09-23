"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(_prevState: { error: string | null }, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase().trim();
  if (ownerEmail && email.toLowerCase() !== ownerEmail) {
    return { error: "This app is private — that account isn't recognized." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
