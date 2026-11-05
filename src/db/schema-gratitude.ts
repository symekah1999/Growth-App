import { pgTable, uuid, text, date, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Gratitude log — one row per thing the owner is thankful for. Kept in its own
 * module so it ships independently; the SQL to create it is in
 * drizzle/manual/gratitude.sql (run once in the Neon SQL editor).
 */
export const gratitudeEntries = pgTable(
  "gratitude_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    text: text("text").notNull(),
    category: text("category").notNull().default("general"),
    entryDate: date("entry_date").notNull().default(sql`CURRENT_DATE`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("gratitude_user_date_idx").on(t.userId, t.entryDate)],
);

export const GRATITUDE_CATEGORIES = [
  { key: "general", label: "Anything" },
  { key: "faith", label: "Faith & God" },
  { key: "family", label: "Family" },
  { key: "friends", label: "Friends & people" },
  { key: "health", label: "Health & body" },
  { key: "work", label: "Work & career" },
  { key: "provision", label: "Provision & money" },
  { key: "growth", label: "Growth & lessons" },
  { key: "nature", label: "Nature & beauty" },
  { key: "joy", label: "Small joys" },
] as const;

export type GratitudeCategory = (typeof GRATITUDE_CATEGORIES)[number]["key"];

/** Gentle prompts to unstick you on a blank day. One is featured per day. */
export const GRATITUDE_PROMPTS: string[] = [
  "Who made your day easier recently, and how?",
  "What is something you can see, hear or touch right now that you're glad to have?",
  "What went better than you expected this week?",
  "Which part of your health or body are you thankful for today?",
  "What's a mistake or hardship that ended up teaching you something good?",
  "Who believed in you before you believed in yourself?",
  "What meal, drink or comfort did you enjoy today?",
  "What's one thing about your home you'd miss if it were gone?",
  "Which answered prayer, big or small, can you remember?",
  "What skill or ability do you have that you once wished for?",
  "Who is someone you haven't thanked yet?",
  "What is something beautiful you noticed today?",
  "What opportunity do you have now that you didn't a year ago?",
  "What's a small win from today that you almost overlooked?",
  "Which memory always makes you smile?",
  "What part of your work are you grateful for, even on a hard day?",
  "What's something that's easy for you that is hard for others?",
  "Who in your family are you thankful for, and why?",
  "What did you have enough of today?",
  "What's a problem you no longer have?",
  "Which book, verse, song or conversation lifted you recently?",
  "What technology or tool quietly makes your life better?",
  "What is a freedom or right you enjoy?",
  "Who taught you something valuable, formally or not?",
  "What are you looking forward to?",
  "What did your past self pray for that you now have?",
  "What has been steady and reliable in your life lately?",
  "What kindness did a stranger show you?",
  "What did you survive that you once thought you couldn't?",
  "What about today would you be happy to live again?",
];

export function getGratitudePrompt(dateISO: string): string {
  let hash = 0;
  for (let i = 0; i < dateISO.length; i++) hash = (hash * 31 + dateISO.charCodeAt(i)) >>> 0;
  return GRATITUDE_PROMPTS[hash % GRATITUDE_PROMPTS.length];
}
