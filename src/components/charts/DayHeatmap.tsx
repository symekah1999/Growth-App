"use client";

import { useState } from "react";

export type HeatCell = { date: string; value: number; detail: string };

// Sequential single-hue ramp (blue), stepped for the dark surface: brighter = more.
const STEPS = ["#262626", "#104281", "#1c5cab", "#2a78d6", "#6da7ec"];

function stepFor(v: number) {
  if (v <= 0) return STEPS[0];
  if (v <= 0.25) return STEPS[1];
  if (v <= 0.5) return STEPS[2];
  if (v <= 0.75) return STEPS[3];
  return STEPS[4];
}

const WEEKDAYS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

/** GitHub-style grid: one column per week (Mon→Sun), oldest on the left. */
export function DayHeatmap({ cells, emptyLabel = "nothing logged" }: { cells: HeatCell[]; emptyLabel?: string }) {
  const [hover, setHover] = useState<{ cell: HeatCell; x: number; y: number } | null>(null);

  if (cells.length === 0) return null;

  // pad the front so the first column starts on Monday
  const first = new Date(cells[0].date + "T00:00:00Z");
  const lead = (first.getUTCDay() + 6) % 7;
  const padded: (HeatCell | null)[] = [...Array(lead).fill(null), ...cells];
  const weeks: (HeatCell | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  const monthLabels = weeks.map((w, i) => {
    const firstReal = w.find(Boolean);
    if (!firstReal) return "";
    const d = new Date(firstReal.date + "T00:00:00Z");
    const prev = i > 0 ? weeks[i - 1].find(Boolean) : null;
    const prevMonth = prev ? new Date(prev.date + "T00:00:00Z").getUTCMonth() : -1;
    return d.getUTCMonth() !== prevMonth ? d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }) : "";
  });

  return (
    <div className="relative">
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex gap-1.5">
          <div className="flex flex-col gap-[3px] pt-4 pr-1 text-[9px] leading-[11px] text-neutral-500">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="h-[11px]">
                {d}
              </span>
            ))}
          </div>
          <div>
            <div className="flex gap-[3px] text-[9px] text-neutral-500">
              {monthLabels.map((m, i) => (
                <span key={i} className="h-4 w-[11px] overflow-visible whitespace-nowrap">
                  {m}
                </span>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {weeks.map((w, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }, (_, di) => {
                    const cell = w[di];
                    if (!cell) return <span key={di} className="h-[11px] w-[11px]" />;
                    return (
                      <button
                        key={di}
                        type="button"
                        aria-label={`${cell.date}: ${cell.detail}`}
                        className="h-[11px] w-[11px] rounded-[2px] outline-none ring-neutral-200 focus-visible:ring-1"
                        style={{ backgroundColor: stepFor(cell.value) }}
                        onPointerEnter={(e) => {
                          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          const p = (e.currentTarget.closest(".relative") as HTMLElement).getBoundingClientRect();
                          setHover({ cell, x: r.left - p.left + 5, y: r.top - p.top });
                        }}
                        onFocus={(e) => {
                          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          const p = (e.currentTarget.closest(".relative") as HTMLElement).getBoundingClientRect();
                          setHover({ cell, x: r.left - p.left + 5, y: r.top - p.top });
                        }}
                        onPointerLeave={() => setHover(null)}
                        onBlur={() => setHover(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-neutral-500">
        <span>{emptyLabel}</span>
        {STEPS.map((c) => (
          <span key={c} className="h-[11px] w-[11px] rounded-[2px]" style={{ backgroundColor: c }} />
        ))}
        <span>all done</span>
      </div>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: hover.x, top: hover.y - 6 }}
        >
          <p className="font-medium text-neutral-100">{hover.cell.detail}</p>
          <p className="text-neutral-500">
            {new Date(hover.cell.date + "T00:00:00Z").toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
