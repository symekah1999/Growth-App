-- Growth OS: 6-Month Challenge. Run once in the Neon SQL editor.
CREATE TABLE IF NOT EXISTS "challenge_plan" (
  "user_id" uuid PRIMARY KEY NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "headline" text DEFAULT '' NOT NULL,
  "headline_by" date,
  "support1" text DEFAULT '' NOT NULL,
  "support2" text DEFAULT '' NOT NULL,
  "why" text DEFAULT '' NOT NULL,
  "vices" text[] DEFAULT '{}' NOT NULL,
  "people" text[] DEFAULT '{}' NOT NULL,
  "excuses" jsonb DEFAULT '[]' NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "challenge_days" (
  "user_id" uuid NOT NULL,
  "day" date NOT NULL,
  "checks" jsonb DEFAULT '{}' NOT NULL,
  "score" smallint DEFAULT 0 NOT NULL,
  "social_minutes" integer,
  "sleep_hours" numeric(3,1),
  "deep_blocks" smallint,
  "tomorrow_task" text,
  "note" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "day")
);
CREATE TABLE IF NOT EXISTS "challenge_rule_checks" (
  "user_id" uuid NOT NULL,
  "rule" smallint NOT NULL,
  "month" smallint NOT NULL,
  "done" boolean DEFAULT true NOT NULL,
  PRIMARY KEY ("user_id", "rule", "month")
);
CREATE TABLE IF NOT EXISTS "challenge_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "week_ending" date NOT NULL,
  "pace" text DEFAULT 'on' NOT NULL,
  "worked" text DEFAULT '' NOT NULL,
  "failed" text DEFAULT '' NOT NULL,
  "change" text DEFAULT '' NOT NULL,
  "next_plan" text DEFAULT '' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "challenge_setbacks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "day" date NOT NULL,
  "what" text NOT NULL,
  "control" text DEFAULT '' NOT NULL,
  "next_time" text DEFAULT '' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "challenge_scorecard" (
  "user_id" uuid NOT NULL,
  "measure" text NOT NULL,
  "baseline" text DEFAULT '' NOT NULL,
  "month3" text DEFAULT '' NOT NULL,
  "month6" text DEFAULT '' NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "measure")
);
