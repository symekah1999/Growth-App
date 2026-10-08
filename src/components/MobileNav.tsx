"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Sprout } from "lucide-react";
import { Nav } from "@/components/nav";

export function MobileNav({ email, signOutSlot }: { email: string; signOutSlot: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="md:hidden">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-800/80 bg-neutral-950/90 px-4 py-3 backdrop-blur pt-[max(0.75rem,env(safe-area-inset-top))]">
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
      </header>

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
            {signOutSlot}
          </aside>
        </div>
      )}
    </div>
  );
}
