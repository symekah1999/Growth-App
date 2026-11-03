-- Growth OS: Life Lessons table. Run once in the Neon SQL editor.
CREATE TABLE IF NOT EXISTS "life_lessons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "lesson" text NOT NULL,
  "context" text,
  "category" text DEFAULT 'life' NOT NULL,
  "source" text,
  "learned_on" date DEFAULT CURRENT_DATE NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "life_lessons_user_date_idx" ON "life_lessons" ("user_id", "learned_on");
