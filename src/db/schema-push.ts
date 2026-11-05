import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Web Push subscriptions (one per browser/device) and reminder preferences.
 * Kept in its own module; SQL is in drizzle/manual/push.sql (run once in Neon).
 */
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("push_user_idx").on(t.userId)],
);

export const reminderSettings = pgTable("reminder_settings", {
  userId: uuid("user_id").primaryKey(),
  morningOn: boolean("morning_on").notNull().default(true),
  eveningOn: boolean("evening_on").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
