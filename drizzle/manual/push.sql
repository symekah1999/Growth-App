-- Growth OS: push reminders. Run once in the Neon SQL editor.
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "endpoint" text NOT NULL UNIQUE,
  "p256dh" text NOT NULL,
  "auth" text NOT NULL,
  "user_agent" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "push_user_idx" ON "push_subscriptions" ("user_id");
CREATE TABLE IF NOT EXISTS "reminder_settings" (
  "user_id" uuid PRIMARY KEY NOT NULL,
  "morning_on" boolean DEFAULT true NOT NULL,
  "evening_on" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
