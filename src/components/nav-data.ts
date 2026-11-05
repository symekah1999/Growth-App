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
  Download,
  Compass,
  Lightbulb,
  Heart,
  ClipboardCheck,
  CalendarCheck,
  Search,
  TrendingUp,
  Archive,
  Bell,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type LinkDef = { href: string; label: string; icon: LucideIcon };
export type NavSection = { label: string; links: LinkDef[] };

/** Every page in the app, grouped. Shared by the sidebar, mobile menu and quick-jump palette. */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Today",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/checkin", label: "Daily check-in", icon: ClipboardCheck },
      { href: "/capture", label: "Quick capture", icon: Zap },
      { href: "/search", label: "Search", icon: Search },
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
      { href: "/systems", label: "Life Systems", icon: Compass },
      { href: "/review", label: "Weekly review", icon: CalendarCheck },
      { href: "/progress", label: "Progress", icon: Trophy },
      { href: "/trends", label: "Trends", icon: TrendingUp },
    ],
  },
  {
    label: "Mind & Faith",
    links: [
      { href: "/mantras", label: "Mantras & Values", icon: Sparkles },
      { href: "/bible", label: "Bible", icon: BookOpen },
      { href: "/quotes", label: "Quotes", icon: Quote },
      { href: "/lessons", label: "Lessons of Life", icon: Lightbulb },
      { href: "/gratitude", label: "Gratitude", icon: Heart },
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
  {
    label: "App",
    links: [
      { href: "/reminders", label: "Reminders", icon: Bell },
      { href: "/export", label: "Backup & export", icon: Archive },
      { href: "/install", label: "Install app", icon: Download },
    ],
  },
];

export const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(href + "/");
