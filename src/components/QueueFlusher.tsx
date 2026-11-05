"use client";

import { useEffect } from "react";
import { flushQueue, readQueue } from "@/lib/offline-queue";

/** Sends anything captured offline as soon as the app is open and online. */
export function QueueFlusher() {
  useEffect(() => {
    const run = () => {
      if (readQueue().length) void flushQueue();
    };
    run();
    window.addEventListener("online", run);
    window.addEventListener("focus", run);
    return () => {
      window.removeEventListener("online", run);
      window.removeEventListener("focus", run);
    };
  }, []);
  return null;
}
