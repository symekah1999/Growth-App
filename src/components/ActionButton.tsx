"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Plus } from "lucide-react";

type Result = { ok: boolean; message?: string } | void;

/** A small one-tap button that runs a server action with fixed fields and shows
 * a confirmation, so you can act on a quote, system or story without leaving the page. */
export function ActionButton({
  action,
  fields,
  label,
  doneLabel = "Added",
  className = "",
}: {
  action: (formData: FormData) => Promise<Result>;
  fields: Record<string, string>;
  label: string;
  doneLabel?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const [note, setNote] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = () =>
    start(async () => {
      try {
        const fd = new FormData();
        for (const [k, v] of Object.entries(fields)) fd.set(k, v);
        const r = await action(fd);
        if (r && r.ok === false) {
          setState("error");
          setNote(r.message ?? "Could not do that");
        } else {
          setState("done");
          setNote(r && r.message ? r.message : null);
        }
      } catch {
        setState("error");
        setNote("Something went wrong");
      }
    });

  const base = "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition";
  if (state === "done")
    return (
      <span className={`${base} border-emerald-800/60 text-emerald-300 ${className}`} role="status">
        <Check size={13} /> {note ?? doneLabel}
      </span>
    );
  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className={`${base} border-neutral-800 text-neutral-300 hover:bg-neutral-800 disabled:opacity-60 ${className}`}
      title={state === "error" ? (note ?? "") : undefined}
    >
      {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
      {state === "error" ? "Try again" : label}
    </button>
  );
}
