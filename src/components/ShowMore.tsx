"use client";

import { Children, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Shows the first `initial` children and reveals the rest in batches, so long
 * libraries (quotes, systems, stories, realities) don't stretch the page forever.
 * Nothing is removed — everything stays one tap away.
 */
export function ShowMore({
  children,
  initial = 12,
  step,
  className,
  label = "Show more",
}: {
  children: ReactNode;
  initial?: number;
  step?: number;
  className?: string;
  label?: string;
}) {
  const items = Children.toArray(children);
  const [count, setCount] = useState(initial);
  const remaining = items.length - count;
  const batch = step ?? initial;

  return (
    <>
      <div className={className}>{items.slice(0, count)}</div>
      {remaining > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCount((c) => c + batch)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:bg-neutral-800"
          >
            <ChevronDown size={15} />
            {label} ({Math.min(batch, remaining)} of {remaining} left)
          </button>
          {remaining > batch && (
            <button
              type="button"
              onClick={() => setCount(items.length)}
              className="rounded-lg px-3 py-2 text-xs text-neutral-500 transition hover:text-neutral-300"
            >
              Show all
            </button>
          )}
        </div>
      )}
    </>
  );
}
