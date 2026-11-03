import { todayISO } from "@/lib/utils";
import { STORIES_1 } from "./part1";
import { STORIES_2 } from "./part2";
import type { ResilienceStory } from "./types";

export * from "./types";

export const RESILIENCE_STORIES: ResilienceStory[] = [...STORIES_1, ...STORIES_2];

function dayNumber(dateISO: string): number {
  return Math.floor(new Date(dateISO + "T00:00:00Z").getTime() / 86_400_000);
}

/** Deterministic story of the day — same all day, changes daily. */
export function getStoryOfTheDay(dateISO: string = todayISO()): ResilienceStory {
  return RESILIENCE_STORIES[(dayNumber(dateISO) * 11 + 5) % RESILIENCE_STORIES.length];
}
