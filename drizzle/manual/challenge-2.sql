-- Growth OS: 6-Month Challenge, part 2 (rule keep-up tracker + Proverbs log).
-- Run once in the Neon SQL editor, after challenge.sql.
CREATE TABLE IF NOT EXISTS "challenge_rule_weeks" (
  "user_id" uuid NOT NULL,
  "rule" smallint NOT NULL,
  "week_start" date NOT NULL,
  "status" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "rule", "week_start")
);
CREATE TABLE IF NOT EXISTS "challenge_proverbs" (
  "user_id" uuid NOT NULL,
  "day" date NOT NULL,
  "chapter" smallint NOT NULL,
  "reflection" text DEFAULT '' NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "day")
);
