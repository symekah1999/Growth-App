export type SystemCategory =
  | "stoic"
  | "habits"
  | "productivity"
  | "goals"
  | "mindset"
  | "decisions"
  | "learning"
  | "health"
  | "finance"
  | "relationships"
  | "faith"
  | "career";

export type LifeSystem = {
  id: string;
  title: string;
  /** Where it comes from — person, book or tradition. */
  origin: string;
  category: SystemCategory;
  /** One or two sentences: what it is and why it works. */
  summary: string;
  /** How to run it, step by step. */
  steps: string[];
  /** A small action to try today. */
  tryToday: string;
  /** If set, the system can be adopted as a habit in one click. */
  habit?: { name: string; targetPerWeek: number };
};

export const SYSTEM_CATEGORIES: { key: SystemCategory; label: string; blurb: string }[] = [
  { key: "stoic", label: "Stoic", blurb: "Ancient tools for a calm, strong mind." },
  { key: "habits", label: "Habits", blurb: "Make good behaviour automatic." },
  { key: "productivity", label: "Productivity", blurb: "Do the important work, not just the urgent." },
  { key: "goals", label: "Goals", blurb: "Turn dreams into plans you actually finish." },
  { key: "mindset", label: "Mindset", blurb: "How you think decides how you grow." },
  { key: "decisions", label: "Decisions", blurb: "Think clearly when it matters." },
  { key: "learning", label: "Learning", blurb: "Learn faster and remember longer." },
  { key: "health", label: "Health", blurb: "Body and energy, the foundation of everything." },
  { key: "finance", label: "Money", blurb: "Build wealth quietly and steadily." },
  { key: "relationships", label: "Relationships", blurb: "Love, friendship and influence." },
  { key: "faith", label: "Faith & Spirit", blurb: "Practices that root your life in God." },
  { key: "career", label: "Career", blurb: "Build skills and a working life that lasts." },
];
