"use client";

import Link from "next/link";
import { useState } from "react";

export type TimelineGoal = {
  id: string;
  title: string;
  start: string;
  end: string;
  progress: number;
  expected: number | null;
  statusLabel: string;
  statusColor: string;
};

function toMs(iso: string) {
  return new Date(iso + "T00:00:00Z").getTime();
}
function fmt(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** Horizontal bars from each goal's start to its deadline, filled to its progress, with a "today" line. */
export function GoalsTimeline({ goals, today }: { goals: TimelineGoal[]; today: string }) {
  const [hover, setHover] = useState<string | null>(null);
  if (goals.length === 0) return null;

  const min = Math.min(...goals.map((g) => toMs(g.start)), toMs(today));
  const max = Math.max(...goals.map((g) => toMs(g.end)), toMs(today));
  const span = Math.max(1, max - min);
  const pos = (iso: string) => ((toMs(iso) - min) / span) * 100;
  const todayPos = pos(today);

  return (
    <div className="space-y-2.5">
      <div className="relative ml-0 sm:ml-40">
        <div className="flex justify-between text-[10px] text-neutral-500">
          <span>{fmt(new Date(min).toISOString().slice(0, 10))}</span>
          <span>{fmt(new Date(max).toISOString().slice(0, 10))}</span>
        </div>
      </div>

      {goals.map((g) => {
        const left = pos(g.start);
        const width = Math.max(1.5, pos(g.end) - left);
        const isHover = hover === g.id;
        return (
          <div key={g.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <Link href={`/goals/${g.id}`} className="truncate text-xs text-neutral-300 hover:text-neutral-100 sm:w-36 sm:shrink-0 sm:text-right">
              {g.title}
            </Link>
            <div
              className="relative h-6 w-full sm:flex-1"
              onPointerEnter={() => setHover(g.id)}
              onPointerLeave={() => setHover(null)}
            >
              <div className="absolute inset-y-[11px] left-0 right-0 rounded bg-neutral-800/50" />
              <button
                type="button"
                aria-label={`${g.title}: ${g.progress}% done, due ${fmt(g.end)}, ${g.statusLabel}`}
                onFocus={() => setHover(g.id)}
                onBlur={() => setHover(null)}
                className="absolute top-1 h-4 overflow-hidden rounded bg-indigo-950/80 outline-none ring-1 ring-indigo-900 focus-visible:ring-neutral-200"
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                <span className="block h-full rounded bg-indigo-500" style={{ width: `${g.progress}%` }} />
              </button>
              <span
                className="absolute top-[3px] h-3 w-3 rounded-full border-2 border-neutral-950"
                style={{ left: `calc(${left + width}% - 6px)`, backgroundColor: g.statusColor }}
                aria-hidden
              />
              <div className="absolute inset-y-0 w-px bg-neutral-300/70" style={{ left: `${todayPos}%` }} aria-hidden />

              {isHover && (
                <div
                  className="pointer-events-none absolute bottom-full z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs shadow-lg"
                  style={{ left: `${Math.min(85, Math.max(15, left + width / 2))}%` }}
                >
                  <p className="font-medium text-neutral-100">
                    {g.progress}% done
                    {g.expected !== null && <span className="font-normal text-neutral-400"> · expected {g.expected}%</span>}
                  </p>
                  <p className="text-neutral-400">
                    {g.title} · {g.statusLabel}
                  </p>
                  <p className="text-neutral-500">
                    {fmt(g.start)} → {fmt(g.end)}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-neutral-500 sm:ml-40">
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded-sm bg-indigo-500" /> progress
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded-sm bg-indigo-950 ring-1 ring-indigo-900" /> remaining
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-px bg-neutral-300" /> today
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#0ca30c]" /> on track
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#fab219]" /> behind
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#ec835a]" /> at risk
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#d03b3b]" /> overdue
        </span>
      </div>
    </div>
  );
}
