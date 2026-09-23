"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // The /chat page already has a full-size panel — no need for the bubble there.
  if (pathname?.startsWith("/chat")) return null;

  return (
    <>
      <div
        className={cn(
          "fixed bottom-20 right-5 z-40 w-[min(92vw,24rem)] origin-bottom-right overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/50 transition-all duration-200 sm:bottom-24 sm:right-6",
          open ? "h-[32rem] scale-100 opacity-100" : "pointer-events-none h-0 scale-95 opacity-0",
        )}
      >
        <div className="h-full">
          <ChatPanel compact />
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle assistant"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-950/50 transition hover:scale-105 active:scale-95 sm:right-6"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}
