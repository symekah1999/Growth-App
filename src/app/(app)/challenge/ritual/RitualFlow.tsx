"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";

export type RitualStep = { key: string; label: string; node: ReactNode };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-base font-semibold text-white active:bg-indigo-700 disabled:opacity-60"
    >
      <Check size={18} /> {pending ? "Saving…" : label}
    </button>
  );
}

/** Full-screen, one-card-at-a-time flow. All steps stay mounted (hidden) so one form submits every answer. */
export function RitualFlow({ mode, steps, action, finishLabel }: { mode: "morning" | "evening"; steps: RitualStep[]; action: (fd: FormData) => void | Promise<void>; finishLabel: string }) {
  const [i, setI] = useState(0);
  const body = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const last = i === steps.length - 1;
  const go = (n: number) => setI(Math.min(steps.length - 1, Math.max(0, n)));

  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [i]);

  const accent = mode === "morning" ? "from-amber-500/15" : "from-indigo-500/15";

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col bg-gradient-to-b ${accent} to-neutral-950 bg-neutral-950`}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touch.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const s = touch.current;
        touch.current = null;
        if (!s) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - s.x;
        const dy = t.clientY - s.y;
        if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) go(dx < 0 ? i + 1 : i - 1);
      }}
    >
      <header className="flex items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link href="/challenge" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-400 active:bg-neutral-800" aria-label="Close ritual"><X size={20} /></Link>
        <div className="flex flex-1 gap-1" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1}>
          {steps.map((s, idx) => (
            <button key={s.key} type="button" onClick={() => go(idx)} aria-label={`Step ${idx + 1}: ${s.label}`} className="h-6 flex-1">
              <span className={`block h-1.5 rounded-full ${idx <= i ? (mode === "morning" ? "bg-amber-400" : "bg-indigo-400") : "bg-neutral-800"}`} />
            </button>
          ))}
        </div>
        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-neutral-500">{i + 1}/{steps.length}</span>
      </header>

      <form
        action={action}
        className="flex min-h-0 flex-1 flex-col"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
            e.preventDefault();
            if (!last) go(i + 1);
          }
        }}
      >
        <div ref={body} className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4">
          <div className="mx-auto w-full max-w-xl">
            {steps.map((s, idx) => (
              <section key={s.key} hidden={idx !== i} aria-label={s.label}>
                {s.node}
              </section>
            ))}
          </div>
        </div>
        <footer className="border-t border-neutral-800/80 bg-neutral-950/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="mx-auto flex w-full max-w-xl gap-2">
            <button
              type="button"
              onClick={() => go(i - 1)}
              disabled={i === 0}
              className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl border border-neutral-800 text-neutral-300 active:bg-neutral-800 disabled:opacity-30"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            {last ? (
              <Submit label={finishLabel} />
            ) : (
              <button type="button" onClick={() => go(i + 1)} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-100 text-base font-semibold text-neutral-900 active:bg-neutral-300">
                Next <ArrowRight size={18} />
              </button>
            )}
          </div>
        </footer>
      </form>
    </div>
  );
}
