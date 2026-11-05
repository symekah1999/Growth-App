"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS, isActive } from "@/components/nav-data";

const KEY = "growth-os-nav-closed";

export function Nav() {
  const pathname = usePathname();
  // Sections you folded away. The section holding the current page is always shown.
  const [closed, setClosed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setClosed(JSON.parse(raw));
    } catch {}
  }, []);

  const toggle = (label: string) =>
    setClosed((prev) => {
      const next = prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-3">
      {NAV_SECTIONS.map((section) => {
        const hasActive = section.links.some((l) => isActive(pathname, l.href));
        const open = hasActive || !closed.includes(section.label);
        return (
          <div key={section.label}>
            <button
              type="button"
              onClick={() => toggle(section.label)}
              aria-expanded={open}
              className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-300"
            >
              {section.label}
              <ChevronDown size={12} className={cn("transition-transform", !open && "-rotate-90")} />
            </button>
            {open && (
              <div className="mb-1 flex flex-col gap-px">
                {section.links.map(({ href, label, icon: Icon }) => {
                  const active = isActive(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                        active
                          ? "bg-gradient-to-r from-indigo-600/20 to-indigo-600/0 text-indigo-300"
                          : "text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-100",
                      )}
                    >
                      <Icon size={16} strokeWidth={2} className={active ? "text-indigo-400" : "text-neutral-500 group-hover:text-neutral-300"} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
