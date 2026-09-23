export type RealityTheme = "self" | "time" | "money" | "relationships" | "work" | "health" | "adversity" | "mind" | "character" | "faith" | "growth";

export type Reality = { theme: RealityTheme; truth: string; detail: string; action: string };

export const REALITY_THEMES: { slug: RealityTheme; label: string; blurb: string }[] = [
  { slug: "self", label: "Self & Discipline", blurb: "Owning your life and your choices." },
  { slug: "time", label: "Time & Mortality", blurb: "Living with urgency and clarity." },
  { slug: "money", label: "Money", blurb: "What actually builds (and destroys) wealth." },
  { slug: "relationships", label: "Relationships", blurb: "People, boundaries and love." },
  { slug: "work", label: "Work & Career", blurb: "How careers are really built." },
  { slug: "health", label: "Health", blurb: "The foundation under everything else." },
  { slug: "adversity", label: "Adversity & Pain", blurb: "What hard seasons teach." },
  { slug: "mind", label: "Mind & Emotions", blurb: "Mastering your inner world." },
  { slug: "character", label: "Character", blurb: "Who you are when no one's watching." },
  { slug: "faith", label: "Faith & Purpose", blurb: "Meaning beyond the everyday." },
  { slug: "growth", label: "Growth", blurb: "How people actually change." },
];
