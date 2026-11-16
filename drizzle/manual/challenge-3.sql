-- Growth OS: 6-Month Challenge, part 3 (Apex animals log).
-- Run once in the Neon SQL editor.
CREATE TABLE IF NOT EXISTS "challenge_wild" (
  "user_id" uuid NOT NULL,
  "day" date NOT NULL,
  "animal" text NOT NULL,
  "reflection" text DEFAULT '' NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "day")
);
