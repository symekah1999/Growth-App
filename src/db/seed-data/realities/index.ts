import { REALITIES_1 } from "./part1";
import { REALITIES_2 } from "./part2";
import { REALITY_THEMES, type Reality, type RealityTheme } from "./types";
import { dailyIndex, todayISO } from "@/lib/utils";

export { REALITY_THEMES };
export type { Reality, RealityTheme };

export const REALITIES: (Reality & { id: string })[] = [...REALITIES_1, ...REALITIES_2].map((r, i) => ({ ...r, id: `r${i}` }));

/** One reality per day, deterministic like the verse/quote of the day. */
export function getRealityOfTheDay(dateISO = todayISO()) {
  // offset the hash so it doesn't move in lockstep with the other daily picks
  return REALITIES[dailyIndex(dateISO + "-reality", REALITIES.length)];
}
