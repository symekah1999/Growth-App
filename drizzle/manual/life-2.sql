-- Growth OS: smart reminders (adds the mid-morning deep-work nudge setting).
-- Run once in the Neon SQL editor, after push.sql.
ALTER TABLE "reminder_settings" ADD COLUMN IF NOT EXISTS "deep_on" boolean DEFAULT true NOT NULL;
