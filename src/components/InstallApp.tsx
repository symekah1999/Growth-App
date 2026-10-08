"use client";

import { useEffect, useState } from "react";
import { Download, Share, Check } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "installed" | "prompt" | "ios" | "other";

export function InstallApp({ compact = false }: { compact?: boolean }) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setPlatform("installed");
      return;
    }
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setPlatform("ios");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setPlatform("prompt");
    };
    const onInstalled = () => {
      setDeferred(null);
      setPlatform("installed");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  if (platform === "installed") {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-400">
        <Check size={16} /> Installed — you&apos;re running the app.
      </p>
    );
  }

  if (platform === "prompt") {
    return (
      <button
        onClick={install}
        className={
          compact
            ? "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-indigo-300 transition hover:bg-neutral-800/60"
            : "inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        }
      >
        <Download size={compact ? 17 : 16} /> Install app
      </button>
    );
  }

  if (compact) return null;

  if (platform === "ios") {
    return (
      <p className="flex items-start gap-2 text-sm text-neutral-300">
        <Share size={16} className="mt-0.5 shrink-0" />
        In Safari tap the Share button, then &quot;Add to Home Screen&quot;.
      </p>
    );
  }

  return (
    <p className="text-sm text-neutral-400">
      Your browser hasn&apos;t offered the install prompt yet. Use the browser menu (see below), or reload once
      and try again.
    </p>
  );
}
