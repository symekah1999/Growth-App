"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
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
  Trophy,
  Mountain,
  type LucideIcon,
} from "lucide-react";

type LinkDef = { href: string; label: string; icon: LucideIcon };

const sections: { label: string; links: LinkDef[] }[] = [
  {
    label: "Overview",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/progress", label: "Progress", icon: Trophy },
      { href: "/chat", label: "Assistant", icon: Bot },
    ],
  },
  {
    label: "Growth",
    links: [
      { href: "/journal", label: "Journal", icon: NotebookPen },
      { href: "/goals", label: "Goals", icon: Target },
      { href: "/habits", label: "Habits", icon: Flame },
      { href: "/recovery", label: "Recovery", icon: HeartPulse },
    ],
  },
  {
    label: "Mind & Faith",
    links: [
      { href: "/mantras", label: "Mantras & Values", icon: Sparkles },
      { href: "/bible", label: "Bible", icon: BookOpen },
      { href: "/quotes", label: "Quotes", icon: Quote },
      { href: "/realities", label: "Realities of Life", icon: Mountain },
    ],
  },
  {
    label: "Planning & Finance",
    links: [
      { href: "/todos", label: "To-Dos", icon: ListChecks },
      { href: "/savings", label: "Savings", icon: PiggyBank },
      { href: "/debts", label: "Debt Payoff", icon: CreditCard },
    ],
  },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
            {section.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-gradient-to-r from-indigo-600/20 to-indigo-600/0 text-indigo-300"
                      : "text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-100",
                  )}
                >
                  <Icon
                    size={17}
                    strokeWidth={2}
                    className={active ? "text-indigo-400" : "text-neutral-500 group-hover:text-neutral-300"}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
