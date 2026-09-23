"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-fatal: the app works fine without offline support, this just
      // means the install-to-home-screen / offline-shell behavior is skipped.
    });
  }, []);

  return null;
}
