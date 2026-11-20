import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/** "March 2026" for an ISO date, in UTC so the label never shifts. */
export function monthLabel(iso: string) {
  return new Date(iso.slice(0, 10) + "T00:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** Group items by a key, keeping first-seen order. */
export function groupBy<T>(items: T[], key: (t: T) => string): [string, T[]][] {
  const m = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    m.set(k, [...(m.get(k) ?? []), it]);
  }
  return [...m.entries()];
}

/**
 * A collapsible group: title, count and a one-line preview stay visible; the entries open on tap.
 * Nothing is hidden for good, it is just tucked into its folder until you need it.
 */
export function Folder({
  id,
  title,
  count,
  latest,
  open,
  tint = "bg-neutral-800 text-neutral-300",
  children,
}: {
  id?: string;
  title: string;
  count: number;
  latest?: string | null;
  open?: boolean;
  tint?: string;
  children: ReactNode;
}) {
  return (
    <details id={id} open={open} className="group min-w-0 scroll-mt-20 rounded-xl border border-neutral-800 bg-neutral-900/40 open:bg-neutral-900/70">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <ChevronRight size={16} className="shrink-0 text-neutral-500 transition-transform group-open:rotate-90" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-50">{title}</p>
          {latest && <p className="truncate text-xs text-neutral-500 group-open:hidden">{latest}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${tint}`}>{count}</span>
      </summary>
      <div className="space-y-2 border-t border-neutral-800 px-3 py-3">{children}</div>
    </details>
  );
}

/** Pill switch between ways of grouping, kept in the URL as ?view=. Other params are preserved. */
export function ViewToggle({
  path,
  params,
  current,
  options,
  accent = "bg-indigo-600/25 text-indigo-100",
  hash,
}: {
  path: string;
  params: Record<string, string | undefined>;
  current: string;
  options: { key: string; label: string }[];
  accent?: string;
  hash?: string;
}) {
  const href = (view: string) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "view") p.set(k, v);
    p.set("view", view);
    return `${path}?${p.toString()}${hash ? `#${hash}` : ""}`;
  };
  return (
    <div className="inline-flex rounded-lg border border-neutral-800 p-0.5" role="tablist" aria-label="Group entries by">
      {options.map((o) => (
        <Link key={o.key} href={href(o.key)} scroll={false} role="tab" aria-selected={current === o.key} className={`rounded-md px-3 py-1.5 text-xs font-medium ${current === o.key ? accent : "text-neutral-400 hover:text-neutral-200"}`}>
          {o.label}
        </Link>
      ))}
    </div>
  );
}
