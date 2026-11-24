-- Rules to live by (My year → Rules tab): daily reflections and growth experiments.
-- Run once in the Neon SQL editor.
CREATE TABLE IF NOT EXISTS "rule_reflections" (
  "user_id" uuid NOT NULL,
  "day" date NOT NULL,
  "sentence" smallint NOT NULL,
  "hack" smallint NOT NULL,
  "action" text DEFAULT '' NOT NULL,
  "lived" text DEFAULT '' NOT NULL,
  "applied" boolean DEFAULT false NOT NULL,
  "better" text DEFAULT '' NOT NULL,
  "note" text DEFAULT '' NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "day")
);

CREATE TABLE IF NOT EXISTS "growth_trials" (
  "user_id" uuid NOT NULL,
  "key" text NOT NULL,
  "start_date" date NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "focus" text DEFAULT '' NOT NULL,
  "attempts" smallint DEFAULT 1 NOT NULL,
  "best" smallint DEFAULT 0 NOT NULL,
  "completed" smallint DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "key")
);
