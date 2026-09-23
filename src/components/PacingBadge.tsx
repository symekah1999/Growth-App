import { AlertTriangle, CheckCircle2, Clock, CircleDashed, TrendingDown, Trophy } from "lucide-react";
import type { Pacing } from "@/lib/pacing";

// Status colours are reserved for state and always ship with an icon + label.
const STYLE: Record<Pacing["status"], { cls: string; Icon: typeof Clock }> = {
  "on-track": { cls: "border-[#0ca30c]/50 text-[#4ade4a] bg-[#0ca30c]/10", Icon: CheckCircle2 },
  behind: { cls: "border-[#fab219]/50 text-[#fab219] bg-[#fab219]/10", Icon: Clock },
  "at-risk": { cls: "border-[#ec835a]/50 text-[#ec835a] bg-[#ec835a]/10", Icon: TrendingDown },
  overdue: { cls: "border-[#d03b3b]/60 text-[#f07070] bg-[#d03b3b]/10", Icon: AlertTriangle },
  done: { cls: "border-emerald-800 text-emerald-300 bg-emerald-900/20", Icon: Trophy },
  "no-deadline": { cls: "border-neutral-700 text-neutral-400", Icon: CircleDashed },
  inactive: { cls: "border-neutral-800 text-neutral-500", Icon: CircleDashed },
};

export function PacingBadge({ pacing, className = "" }: { pacing: Pacing; className?: string }) {
  const { cls, Icon } = STYLE[pacing.status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cls} ${className}`}>
      <Icon size={12} strokeWidth={2.25} />
      {pacing.label}
    </span>
  );
}

/** Progress bar with a tick showing where you'd expect to be by today. */
export function PacedProgressBar({ progress, expected }: { progress: number; expected: number | null }) {
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <div className="relative h-2 w-full rounded-full bg-neutral-800">
      <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
      {expected !== null && expected > 0 && expected < 100 && (
        <div
          className="absolute -top-1 h-4 w-0.5 rounded bg-neutral-200"
          style={{ left: `calc(${expected}% - 1px)` }}
          title={`Expected by today: ${expected}%`}
        />
      )}
    </div>
  );
}
