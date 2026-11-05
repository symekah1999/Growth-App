"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Sprout, LayoutDashboard, ClipboardCheck, Zap, NotebookPen, Search } from "lucide-react";
import { Nav } from "@/components/nav";
import { OPEN_PALETTE_EVENT } from "@/components/CommandPalette";
import { DensityToggle } from "@/components/DensityToggle";
import { isActive } from "@/components/nav-data";

const BAR = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/checkin", label: "Check-in", icon: ClipboardCheck },
  { href: "/capture", label: "Capture", icon: Zap },
  { href: "/journal", label: "Journal", icon: NotebookPen },
];

export function MobileNav({ email, signOutSlot }: { email: string; signOutSlot: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="md:hidden">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-800/80 bg-neutral-950/90 px-4 py-2 backdrop-blur pt-[max(0.5rem,env(safe-area-inset-top))]">
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-lg p-1.5 text-neutral-300 hover:bg-neutral-800"
        >
          <Menu size={22} />
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500">
          <Sprout size={14} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-neutral-50">Growth OS</span>
        <button
          aria-label="Quick jump"
          onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
          className="ml-auto rounded-lg p-1.5 text-neutral-300 hover:bg-neutral-800"
        >
          <Search size={20} />
        </button>
      </header>

      <nav
        aria-label="Quick access"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-800/80 bg-neutral-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        {BAR.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${active ? "text-indigo-300" : "text-neutral-500"}`}
            >
              <Icon size={19} />
              {label}
            </Link>
          );
        })}
        <button onClick={() => setOpen(true)} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-neutral-500">
          <Menu size={19} />
          Menu
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative flex w-72 max-w-[85%] flex-col border-r border-neutral-800 bg-neutral-900 pt-[env(safe-area-inset-top)]">
            <div className="flex items-center justify-between border-b border-neutral-800/80 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-50">Growth OS</p>
                <p className="truncate text-xs text-neutral-500">{email}</p>
              </div>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-1 text-neutral-400">
                <X size={20} />
              </button>
            </div>
            <Nav />
            <div className="px-3 pb-1"><DensityToggle /></div>
            {signOutSlot}
          </aside>
        </div>
      )}
    </div>
  );
}
