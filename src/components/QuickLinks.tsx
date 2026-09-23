import Link from "next/link";
import {
  NotebookPen,
  Target,
  Flame,
  HeartPulse,
  Sparkles,
  BookOpen,
  Quote,
  ListChecks,
  PiggyBank,
  CreditCard,
  Bot,
  Trophy,
  Mountain,
  type LucideIcon,
} from "lucide-react";

type QuickLink = { href: string; label: string; icon: LucideIcon; accent: string };

const QUICK_LINKS: QuickLink[] = [
  { href: "/progress", label: "Progress", icon: Trophy, accent: "text-yellow-300" },
  { href: "/journal", label: "Journal", icon: NotebookPen, accent: "text-sky-400" },
  { href: "/goals", label: "Goals", icon: Target, accent: "text-indigo-400" },
  { href: "/habits", label: "Habits", icon: Flame, accent: "text-orange-400" },
  { href: "/recovery", label: "Recovery", icon: HeartPulse, accent: "text-rose-400" },
  { href: "/mantras", label: "Mantras", icon: Sparkles, accent: "text-fuchsia-400" },
  { href: "/bible", label: "Bible", icon: BookOpen, accent: "text-amber-400" },
  { href: "/quotes", label: "Quotes", icon: Quote, accent: "text-amber-300" },
  { href: "/realities", label: "Realities", icon: Mountain, accent: "text-orange-300" },
  { href: "/todos", label: "To-Dos", icon: ListChecks, accent: "text-emerald-400" },
  { href: "/savings", label: "Savings", icon: PiggyBank, accent: "text-teal-400" },
  { href: "/debts", label: "Debts", icon: CreditCard, accent: "text-red-400" },
  { href: "/chat", label: "Assistant", icon: Bot, accent: "text-indigo-300" },
];

export function QuickLinks() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {QUICK_LINKS.map(({ href, label, icon: Icon, accent }) => (
        <Link
          key={href}
          href={href}
          className="group flex flex-col items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-4 text-center transition hover:border-neutral-700 hover:bg-neutral-800/60"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800/80 transition group-hover:scale-105">
            <Icon size={18} className={accent} strokeWidth={2} />
          </span>
          <span className="text-xs font-medium text-neutral-300">{label}</span>
        </Link>
      ))}
    </div>
  );
}
