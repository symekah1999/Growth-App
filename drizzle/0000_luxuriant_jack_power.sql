CREATE TABLE "bible_books" (
	"id" smallint PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"testament" text NOT NULL,
	"chapter_count" smallint NOT NULL,
	"sort_order" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bible_verses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" smallint NOT NULL,
	"chapter" smallint NOT NULL,
	"verse" smallint NOT NULL,
	"text" text NOT NULL,
	"translation" text DEFAULT 'KJV' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "debt_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"debt_id" uuid NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"paid_on" date NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "debts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"principal" numeric(14, 2) NOT NULL,
	"balance" numeric(14, 2) NOT NULL,
	"interest_rate_apr" numeric(6, 3) DEFAULT '0' NOT NULL,
	"min_payment" numeric(14, 2) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'KES' NOT NULL,
	"due_day_of_month" smallint,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goal_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid NOT NULL,
	"title" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"target_date" date,
	"progress" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habit_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "habit_logs_unique_day" PRIMARY KEY("habit_id","log_date")
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"frequency" text DEFAULT 'daily' NOT NULL,
	"target_per_week" smallint DEFAULT 7 NOT NULL,
	"color" text DEFAULT '#6366f1' NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text NOT NULL,
	"mood" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"entry_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mantras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"text" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_of_the_day" (
	"date" date PRIMARY KEY NOT NULL,
	"quote_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"text" text NOT NULL,
	"author" text,
	"category" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "savings_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"contributed_on" date NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "savings_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"target_amount" numeric(14, 2) NOT NULL,
	"currency" text DEFAULT 'KES' NOT NULL,
	"target_date" date,
	"notes" text,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"scope" text DEFAULT 'daily' NOT NULL,
	"due_date" date,
	"done" boolean DEFAULT false NOT NULL,
	"done_at" timestamp with time zone,
	"goal_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verse_of_the_day" (
	"date" date PRIMARY KEY NOT NULL,
	"verse_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bible_verses" ADD CONSTRAINT "bible_verses_book_id_bible_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."bible_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_debt_id_debts_id_fk" FOREIGN KEY ("debt_id") REFERENCES "public"."debts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_milestones" ADD CONSTRAINT "goal_milestones_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_of_the_day" ADD CONSTRAINT "quote_of_the_day_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_plan_id_savings_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."savings_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verse_of_the_day" ADD CONSTRAINT "verse_of_the_day_verse_id_bible_verses_id_fk" FOREIGN KEY ("verse_id") REFERENCES "public"."bible_verses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bible_verses_lookup_idx" ON "bible_verses" USING btree ("book_id","chapter","verse");--> statement-breakpoint
CREATE INDEX "debt_payments_debt_idx" ON "debt_payments" USING btree ("debt_id");--> statement-breakpoint
CREATE INDEX "debts_user_idx" ON "debts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "milestones_goal_idx" ON "goal_milestones" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "goals_user_idx" ON "goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "habit_logs_habit_idx" ON "habit_logs" USING btree ("habit_id");--> statement-breakpoint
CREATE INDEX "habits_user_idx" ON "habits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "journal_user_date_idx" ON "journal_entries" USING btree ("user_id","entry_date");--> statement-breakpoint
CREATE INDEX "savings_contrib_plan_idx" ON "savings_contributions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "savings_plans_user_idx" ON "savings_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "todos_user_scope_due_idx" ON "todos" USING btree ("user_id","scope","due_date");