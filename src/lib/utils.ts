import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(d: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const date = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  return date.toLocaleDateString("en-US", opts ?? { month: "short", day: "numeric", year: "numeric" });
}

export function currency(amount: number | string, code = "KES") {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );
}

/** Day count of a streak that started on `startISO`, counting the start
 * date itself as day 1. */
export function streakDayCount(startISO: string, asOfISO = todayISO()) {
  const start = new Date(startISO + "T00:00:00").getTime();
  const asOf = new Date(asOfISO + "T00:00:00").getTime();
  return Math.max(1, Math.floor((asOf - start) / 86400000) + 1);
}

/** Deterministic pseudo-random index for a given date + pool size, so
 * "verse/quote of the day" is stable across requests without needing to
 * write to the DB until we actually want to pin one. */
export function dailyIndex(dateISO: string, poolSize: number) {
  if (poolSize <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < dateISO.length; i++) {
    hash = (hash * 31 + dateISO.charCodeAt(i)) >>> 0;
  }
  return hash % poolSize;
}
