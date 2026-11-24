"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, CalendarCheck, CalendarDays, ClipboardCheck, Compass, Crown,
  Eye, Flag, Gem, Gauge, LayoutGrid, ListChecks, Map as MapIcon, PawPrint, ScrollText, Sparkles, Sun, Target, X,
} from "lucide-react";

const ICONS = {
  today: Sun, rules: ListChecks, keepup: CalendarCheck, plan: ScrollText, review: ClipboardCheck,
  scorecard: Gauge, proverbs: BookOpen, pillars: Crown, wild: PawPrint, guide: Compass, recap: BarChart3,
  vision: Eye, goals: Target, quarters: MapIcon, bucket: Sparkles, checkins: CalendarDays, flag: Flag, live: Gem,
} as const;

export type TabIcon = keyof typeof ICONS;
export type TabItem = { key: string; label: string; href: string; icon: TabIcon; hint?: string; group?: string; accent?: boolean };

/**
 * Sticky section bar: icon chips that scroll sideways on phones (the active one is
 * kept in view), an "All" sheet listing every section with a one-line hint, and a
 * line under the bar saying where you are.
 */
export function TabNav({ tabs, active }: { tabs: TabItem[]; active: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [edges, setEdges] = useState({ left: false, right: false });
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const el = row.querySelector<HTMLElement>("[data-active='true']");
    if (el) row.scrollLeft = el.offsetLeft - row.clientWidth / 2 + el.clientWidth / 2;
    const update = () => setEdges({ left: row.scrollLeft > 4, right: row.scrollLeft + row.clientWidth < row.scrollWidth - 4 });
    update();
    row.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { row.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [active]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const groups = Array.from(new Set(tabs.map((t) => t.group ?? "")));

  return (
    <>
      <div className="tabbar-sticky -mx-4 mb-4 border-b border-neutral-800/70 bg-neutral-950/85 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <nav ref={rowRef} aria-label="Sections" className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map((t) => {
                const Icon = ICONS[t.icon];
                const on = t.key === current.key;
                return (
                  <Link
                    key={t.key}
                    href={t.href}
                    data-active={on}
                    aria-current={on ? "page" : undefined}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      on
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/50"
                        : t.accent
                          ? "text-amber-300 hover:bg-neutral-800"
                          : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    {t.label}
                  </Link>
                );
              })}
            </nav>
            {edges.left && <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-neutral-950 to-transparent" />}
            {edges.right && <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-neutral-950 to-transparent" />}
          </div>
          {tabs.length > 5 && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="All sections"
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-neutral-800 px-3 text-xs font-medium text-neutral-300 hover:bg-neutral-800 lg:hidden"
            >
              <LayoutGrid size={14} /> All
            </button>
          )}
        </div>
      </div>

      {current.hint && (
        <p className="-mt-1 mb-4 flex items-baseline gap-2 text-xs text-neutral-500">
          <span className="shrink-0 whitespace-nowrap font-semibold uppercase tracking-wide text-indigo-300">{current.label}</span>
          <span className="text-neutral-700">·</span>
          <span className="min-w-0">{current.hint}</span>
        </p>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="All sections">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border border-neutral-800 bg-neutral-900 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:max-w-lg sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-100">Jump to a section</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800"><X size={18} /></button>
            </div>
            {groups.map((g) => (
              <div key={g || "all"} className="mb-3 last:mb-0">
                {g && <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{g}</p>}
                <div className="grid gap-1.5">
                  {tabs.filter((t) => (t.group ?? "") === g).map((t) => {
                    const Icon = ICONS[t.icon];
                    const on = t.key === current.key;
                    return (
                      <Link
                        key={t.key}
                        href={t.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 ${on ? "border-indigo-500/60 bg-indigo-600/15" : "border-neutral-800 hover:bg-neutral-800/60"}`}
                      >
                        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${on ? "bg-indigo-600 text-white" : "bg-neutral-800 text-neutral-300"}`}><Icon size={15} /></span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-neutral-100">{t.label}</span>
                          {t.hint && <span className="block text-xs leading-snug text-neutral-500">{t.hint}</span>}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/** Previous / next section links shown at the bottom of a tab. */
export function TabFooter({ tabs, active }: { tabs: TabItem[]; active: string }) {
  const list = tabs.filter((t) => !t.accent);
  const i = list.findIndex((t) => t.key === active);
  if (i < 0) return null;
  const prev = list[i - 1];
  const next = list[i + 1];
  return (
    <div className="mb-12 mt-6 grid grid-cols-2 gap-2 border-t md:mb-0 border-neutral-800/70 pt-4">
      {prev ? (
        <Link href={prev.href} className="flex min-h-12 items-center gap-2 rounded-xl border border-neutral-800 px-3 py-2 hover:bg-neutral-800/60">
          <ArrowLeft size={16} className="shrink-0 text-neutral-500" />
          <span className="min-w-0"><span className="block text-[11px] text-neutral-500">Previous</span><span className="block truncate text-sm font-medium text-neutral-200">{prev.label}</span></span>
        </Link>
      ) : <span />}
      {next ? (
        <Link href={next.href} className="flex min-h-12 items-center justify-end gap-2 rounded-xl border border-neutral-800 px-3 py-2 text-right hover:bg-neutral-800/60">
          <span className="min-w-0"><span className="block text-[11px] text-neutral-500">Next</span><span className="block truncate text-sm font-medium text-neutral-200">{next.label}</span></span>
          <ArrowRight size={16} className="shrink-0 text-neutral-500" />
        </Link>
      ) : <span />}
    </div>
  );
}
