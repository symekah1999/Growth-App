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
  Compass,
  Lightbulb,
  Heart,
  type LucideIcon,
} from "lucide-react";

type QuickLink = { href: string; label: string; icon: LucideIcon; accent: string };

const QUICK_LINKS: QuickLink[] = [
  { href: "/progress", label: "Progress", icon: Trophy, accent: "text-yellow-300" },
  { href: "/systems", label: "Systems", icon: Compass, accent: "text-indigo-300" },
  { href: "/lessons", label: "Lessons", icon: Lightbulb, accent: "text-amber-300" },
  { href: "/gratitude", label: "Gratitude", icon: Heart, accent: "text-rose-400" },
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
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-9">
      {QUICK_LINKS.map(({ href, label, icon: Icon, accent }) => (
        <Link
          key={href}
          href={href}
          className="group flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 rounded-xl sm:w-auto border border-neutral-800 bg-neutral-900/60 px-1 py-2.5 text-center transition hover:border-neutral-700 hover:bg-neutral-800/60"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800/80 transition group-hover:scale-105">
            <Icon size={16} className={accent} strokeWidth={2} />
          </span>
          <span className="max-w-full truncate text-[11px] font-medium text-neutral-300 sm:text-xs">{label}</span>
        </Link>
      ))}
    </div>
  );
}
