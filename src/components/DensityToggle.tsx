"use client";

import { useEffect, useState } from "react";
import { Rows3, Rows2 } from "lucide-react";

const KEY = "growth-os-density";
type Density = "compact" | "comfortable";

/** Switches the whole app between compact (default) and comfortable text/spacing. */
export function DensityToggle() {
  const [d, setD] = useState<Density>("compact");

  useEffect(() => {
    setD(document.documentElement.dataset.density === "comfortable" ? "comfortable" : "compact");
  }, []);

  const set = (next: Density) => {
    setD(next);
    document.documentElement.dataset.density = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  };

  const btn = (v: Density, label: string, Icon: typeof Rows3) => (
    <button
      type="button"
      onClick={() => set(v)}
      aria-pressed={d === v}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs ${
        d === v ? "bg-neutral-800 text-neutral-100" : "text-neutral-500 hover:text-neutral-300"
      }`}
    >
      <Icon size={13} /> {label}
    </button>
  );

  return (
    <div className="flex gap-1 rounded-lg border border-neutral-800 p-0.5" role="group" aria-label="Display density">
      {btn("compact", "Compact", Rows3)}
      {btn("comfortable", "Comfy", Rows2)}
    </div>
  );
}
