-- Growth OS: Gratitude log table. Run once in the Neon SQL editor.
CREATE TABLE IF NOT EXISTS "gratitude_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "text" text NOT NULL,
  "category" text DEFAULT 'general' NOT NULL,
  "entry_date" date DEFAULT CURRENT_DATE NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "gratitude_user_date_idx" ON "gratitude_entries" ("user_id", "entry_date");
