-- Growth OS: 6-Month Challenge, part 4 (Ten Pillars tracker).
-- Run once in the Neon SQL editor.
CREATE TABLE IF NOT EXISTS "challenge_pillars" (
  "user_id" uuid NOT NULL,
  "day" date NOT NULL,
  "pillar" smallint NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "day", "pillar")
);
