import type { ReactNode } from "react";

/** Big-number tiles and story cards for the recap pages. */
export function Stat({ value, label, tone = "text-neutral-50" }: { value: ReactNode; label: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-3 text-center">
      <p className={`text-2xl font-semibold tabular-nums ${tone}`}>{value}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-neutral-500">{label}</p>
    </div>
  );
}

export function Slide({ kicker, title, children, tint = "from-indigo-500/15" }: { kicker: string; title: ReactNode; children?: ReactNode; tint?: string }) {
  return (
    <section className={`rounded-2xl border border-neutral-800 bg-gradient-to-br ${tint} to-neutral-950 p-5`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{kicker}</p>
      <h2 className="mt-1 text-2xl font-semibold leading-tight text-neutral-50">{title}</h2>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}

export function Bar({ label, pct, note }: { label: string; pct: number; note?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-neutral-200">{label}</span>
        <span className="tabular-nums text-neutral-400">{note ?? `${pct}%`}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-indigo-500" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
    </div>
  );
}
