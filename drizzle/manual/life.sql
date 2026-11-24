-- Growth OS: To-don't list, Affirmations and Year plan.
-- Run once in the Neon SQL editor.
CREATE TABLE IF NOT EXISTS "todonts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "text" text NOT NULL,
  "why" text DEFAULT '' NOT NULL,
  "instead" text DEFAULT '' NOT NULL,
  "category" text DEFAULT 'life' NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "todonts_user_idx" ON "todonts" ("user_id");

CREATE TABLE IF NOT EXISTS "todont_logs" (
  "user_id" uuid NOT NULL,
  "todont_id" uuid NOT NULL,
  "day" date NOT NULL,
  "held" boolean NOT NULL,
  "note" text DEFAULT '' NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "todont_id", "day")
);

CREATE TABLE IF NOT EXISTS "my_affirmations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "text" text NOT NULL,
  "category" text DEFAULT 'mine' NOT NULL,
  "library_key" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "my_affirmations_user_idx" ON "my_affirmations" ("user_id");

CREATE TABLE IF NOT EXISTS "year_plans" (
  "user_id" uuid NOT NULL,
  "age" smallint NOT NULL,
  "start_date" date NOT NULL,
  "theme" text DEFAULT '' NOT NULL,
  "vision" text DEFAULT '' NOT NULL,
  "stop" text DEFAULT '' NOT NULL,
  "start" text DEFAULT '' NOT NULL,
  "goals" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "quarters" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "bucket" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "letter" text DEFAULT '' NOT NULL,
  "sealed" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "age")
);

CREATE TABLE IF NOT EXISTS "year_reviews" (
  "user_id" uuid NOT NULL,
  "age" smallint NOT NULL,
  "kind" text NOT NULL,
  "period" smallint NOT NULL,
  "rating" smallint,
  "wins" text DEFAULT '' NOT NULL,
  "lessons" text DEFAULT '' NOT NULL,
  "adjust" text DEFAULT '' NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "age", "kind", "period")
);
