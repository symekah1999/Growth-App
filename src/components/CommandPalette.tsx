"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search as SearchIcon } from "lucide-react";
import { NAV_SECTIONS } from "@/components/nav-data";

export const OPEN_PALETTE_EVENT = "growth-os-open-palette";

// Extra words that should find a page (e.g. "diary" finds Journal).
const ALIASES: Record<string, string> = {
  "/journal": "diary notes write entries",
  "/gratitude": "thankful grateful thanks",
  "/habits": "routine streak daily",
  "/todos": "tasks to do checklist",
  "/savings": "money save budget",
  "/debts": "loan owe payoff",
  "/recovery": "addiction streak sober quit",
  "/export": "download backup csv json",
  "/reminders": "notifications push alerts",
  "/capture": "quick add offline jot",
  "/review": "weekly summary",
  "/trends": "charts graphs insights",
  "/quotes": "quote library",
  "/bible": "scripture verse",
  "/systems": "life systems stoic",
  "/lessons": "lessons stories resilience",
  "/realities": "truths reality",
};

type Item = { href: string; label: string; group: string; icon: (typeof NAV_SECTIONS)[number]["links"][number]["icon"]; hay: string };

const ITEMS: Item[] = NAV_SECTIONS.flatMap((s) =>
  s.links.map((l) => ({ ...l, group: s.label, hay: `${l.label} ${s.label} ${ALIASES[l.href] ?? ""}`.toLowerCase() })),
);

/** Ctrl/Cmd+K quick-jump to any page, or search your own data. */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => input.current?.focus(), 0);
    }
  }, [open]);

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return terms.length ? ITEMS.filter((i) => terms.every((t) => i.hay.includes(t))) : ITEMS;
  }, [q]);

  const searchRow = q.trim().length > 0;
  const total = results.length + (searchRow ? 1 : 0);

  const go = (i: number) => {
    setOpen(false);
    if (i < results.length) router.push(results[i].href);
    else if (searchRow) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Quick jump">
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-neutral-800 px-4">
          <SearchIcon size={16} className="text-neutral-500" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((i) => Math.min(i + 1, total - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && total) {
                e.preventDefault();
                go(idx);
              }
            }}
            placeholder="Jump to a page, or search your data…"
            className="h-12 w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
          />
          <kbd className="hidden rounded border border-neutral-700 px-1.5 py-0.5 text-[10px] text-neutral-500 sm:block">Esc</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-1.5">
          {results.map((r, i) => (
            <li key={r.href}>
              <button
                type="button"
                onMouseEnter={() => setIdx(i)}
                onClick={() => go(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${i === idx ? "bg-indigo-600/20 text-indigo-200" : "text-neutral-300"}`}
              >
                <r.icon size={16} className={i === idx ? "text-indigo-300" : "text-neutral-500"} />
                <span className="flex-1">{r.label}</span>
                <span className="text-[11px] text-neutral-600">{r.group}</span>
                {i === idx && <CornerDownLeft size={12} className="text-neutral-500" />}
              </button>
            </li>
          ))}
          {searchRow && (
            <li>
              <button
                type="button"
                onMouseEnter={() => setIdx(results.length)}
                onClick={() => go(results.length)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${idx === results.length ? "bg-indigo-600/20 text-indigo-200" : "text-neutral-300"}`}
              >
                <SearchIcon size={16} className="text-neutral-500" />
                <span className="flex-1 truncate">Search your data for &ldquo;{q.trim()}&rdquo;</span>
              </button>
            </li>
          )}
          {total === 0 && <li className="px-3 py-6 text-center text-sm text-neutral-500">Nothing found.</li>}
        </ul>
      </div>
    </div>
  );
}

export function JumpButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
      className={`flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-1.5 text-xs text-neutral-400 hover:border-neutral-700 hover:text-neutral-200 ${className}`}
      aria-label="Quick jump"
    >
      <SearchIcon size={13} />
      <span className="flex-1 text-left">Jump to…</span>
      <kbd className="hidden rounded border border-neutral-700 px-1 text-[10px] text-neutral-500 md:block">Ctrl K</kbd>
    </button>
  );
}
