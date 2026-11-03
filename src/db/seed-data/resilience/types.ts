export type StoryField =
  | "leadership"
  | "activism"
  | "business"
  | "sport"
  | "science"
  | "arts"
  | "faith"
  | "philosophy";

export type ResilienceStory = {
  id: string;
  name: string;
  field: StoryField;
  /** Short descriptor, e.g. "Kenyan environmentalist". */
  known: string;
  /** What went wrong — the setback or hardship. */
  setback: string;
  /** How they kept going. */
  persistence: string;
  /** What they eventually achieved. */
  breakthrough: string;
  /** The transferable lesson. */
  lesson: string;
  /** Something you can do with it today. */
  action: string;
};

export const STORY_FIELDS: { key: StoryField; label: string }[] = [
  { key: "leadership", label: "Leadership" },
  { key: "activism", label: "Justice & Activism" },
  { key: "business", label: "Business" },
  { key: "sport", label: "Sport" },
  { key: "science", label: "Science" },
  { key: "arts", label: "Arts & Writing" },
  { key: "faith", label: "Faith" },
  { key: "philosophy", label: "Philosophy" },
];
