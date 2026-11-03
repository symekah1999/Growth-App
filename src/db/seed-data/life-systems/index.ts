import { todayISO } from "@/lib/utils";
import { SYSTEMS_1 } from "./part1";
import { SYSTEMS_2 } from "./part2";
import { SYSTEMS_3 } from "./part3";
import type { LifeSystem } from "./types";

export * from "./types";

export const LIFE_SYSTEMS: LifeSystem[] = [...SYSTEMS_1, ...SYSTEMS_2, ...SYSTEMS_3];

function dayNumber(dateISO: string): number {
  return Math.floor(new Date(dateISO + "T00:00:00Z").getTime() / 86_400_000);
}

/** Deterministic "system of the day" — same for the whole day, changes daily. */
export function getSystemOfTheDay(dateISO: string = todayISO()): LifeSystem {
  return LIFE_SYSTEMS[(dayNumber(dateISO) * 7 + 3) % LIFE_SYSTEMS.length];
}
