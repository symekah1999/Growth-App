import { HeartHandshake, Lightbulb, PartyPopper, Sprout } from "lucide-react";
import type { RecoveryInsight } from "@/lib/recovery-insights";

const TONE = {
  celebrate: { Icon: PartyPopper, cls: "border-indigo-800/70 bg-indigo-950/30", icon: "text-indigo-300" },
  encourage: { Icon: Sprout, cls: "border-neutral-800 bg-neutral-900/60", icon: "text-emerald-400" },
  insight: { Icon: Lightbulb, cls: "border-neutral-800 bg-neutral-900/60", icon: "text-amber-300" },
  gentle: { Icon: HeartHandshake, cls: "border-rose-900/50 bg-rose-950/20", icon: "text-rose-300" },
} as const;

export function InsightList({ insights }: { insights: RecoveryInsight[] }) {
  return (
    <ul className="space-y-2.5">
      {insights.map((i, idx) => {
        const t = TONE[i.tone];
        return (
          <li key={idx} className={`flex gap-3 rounded-xl border px-4 py-3 ${t.cls}`}>
            <t.Icon size={18} className={`mt-0.5 shrink-0 ${t.icon}`} />
            <div>
              <p className="text-sm font-medium text-neutral-100">{i.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-neutral-400">{i.text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
