"use client";

import { useActionState } from "react";
import { Sprout } from "lucide-react";
import { signIn } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(signIn, {
    error: null,
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.16),transparent)]" />
      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900/90 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-950/40">
          <Sprout size={18} className="text-white" />
        </div>
        <h1 className="mt-3 text-xl font-semibold text-neutral-50">Growth OS</h1>
        <p className="mt-1 text-sm text-neutral-400">Private account access only.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-neutral-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-neutral-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-indigo-500"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-400">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-xs text-neutral-500">
          No public sign-up. The owner account is provisioned directly in Supabase — see README.md.
        </p>
      </div>
    </div>
  );
}
