"use client";

import { captureItem, type CaptureItem } from "@/app/(app)/capture/actions";

const KEY = "growth-os-capture-queue";
const EVENT = "growth-os-queue-changed";

export function readQueue(): CaptureItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeQueue(items: CaptureItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // storage full or blocked: nothing more we can do
  }
}

export function onQueueChange(fn: () => void) {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

export const localDate = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in the device's timezone

export function enqueue(item: Omit<CaptureItem, "id" | "date">) {
  const full: CaptureItem = { ...item, id: crypto.randomUUID(), date: localDate() };
  writeQueue([...readQueue(), full]);
  return full;
}

let flushing = false;

/** Sends queued items in order. An item is removed only after the server confirms it. */
export async function flushQueue(): Promise<{ sent: number; left: number }> {
  if (flushing || typeof navigator === "undefined" || !navigator.onLine) return { sent: 0, left: readQueue().length };
  flushing = true;
  let sent = 0;
  try {
    for (const item of readQueue()) {
      let ok = false;
      try {
        ok = (await captureItem(item)).ok;
      } catch {
        break; // still offline or signed out: keep the rest for later
      }
      if (!ok) break;
      writeQueue(readQueue().filter((q) => q.id !== item.id));
      sent++;
    }
  } finally {
    flushing = false;
  }
  return { sent, left: readQueue().length };
}
