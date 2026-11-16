-- Growth OS: 6-Month Challenge, part 5 (Morning and Evening rituals).
-- Run once in the Neon SQL editor.
CREATE TABLE IF NOT EXISTS "challenge_rituals" (
  "user_id" uuid NOT NULL,
  "day" date NOT NULL,
  "kind" text NOT NULL,
  "answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "completed_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "day", "kind")
);
