// Free-licence photos from Unsplash (https://unsplash.com/license), hot-linked
// from Unsplash's image CDN. Every ID below was checked to load before use.
const PHOTOS = {
  dashboard: "1506905925346-21bda4d32df4", // peaks above a sea of clouds at sunrise
  systems: "1500530855697-b586d89ba3ee", // road through the mountains
  lessons: "1502082553048-f009c37129b9", // lone tree under open sky
  story: "1499209974431-9dddcece7f88", // arms open to the sunset
  goals: "1503220317375-aaad61436b1b", // hiker looking out over a lake
  habits: "1476480862126-209bfaa8edc8", // runner climbing steps
  journal: "1484480974693-6ca0a78fb36b", // writing in a notebook
  recovery: "1490730141103-6cac27aaab94", // figure standing in calm water at sunset
  mantras: "1506126613408-eca07ce68773", // meditation at sunset
  bible: "1504052434569-70ad5836ab65", // open Bible
  quotes: "1455390582262-044cdead277a", // fountain pen on paper
  realities: "1426604966848-d7adac402bff", // El Capitan, Yosemite
  todos: "1499750310107-5fef28a66643", // desk with laptop and notebook
  savings: "1579621970563-ebec7560ff3e", // seedling growing from coins
  debts: "1508672019048-805c876b67e2", // calm pier into a mountain lake
  progress: "1512438248247-f0f2a5a8b7f0", // person on a summit above the clouds
  chat: "1519681393784-d120267933ba", // mountains under the night sky
  install: "1470071459604-3b5ec3a7fe05", // misty green mountains
} as const;

export type PhotoKey = keyof typeof PHOTOS;

export function photoUrl(key: PhotoKey, width = 1600): string {
  return `https://images.unsplash.com/photo-${PHOTOS[key]}?auto=format&fit=crop&w=${width}&q=70`;
}

/** Scene photo for a resilience story's field. */
export function storyPhoto(field: string): string {
  const map: Record<string, PhotoKey> = {
    leadership: "progress",
    activism: "story",
    business: "systems",
    sport: "habits",
    science: "chat",
    arts: "quotes",
    faith: "bible",
    philosophy: "realities",
  };
  return photoUrl(map[field] ?? "story", 1200);
}
