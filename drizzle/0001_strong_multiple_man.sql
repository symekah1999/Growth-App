CREATE TABLE "recovery_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tracker_id" uuid NOT NULL,
	"checkin_date" date NOT NULL,
	"craving_level" smallint,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recovery_checkins_unique_day" PRIMARY KEY("tracker_id","checkin_date")
);
--> statement-breakpoint
CREATE TABLE "recovery_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tracker_id" uuid NOT NULL,
	"reset_date" date NOT NULL,
	"streak_days_at_reset" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recovery_trackers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"target_days" integer DEFAULT 1000 NOT NULL,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recovery_checkins" ADD CONSTRAINT "recovery_checkins_tracker_id_recovery_trackers_id_fk" FOREIGN KEY ("tracker_id") REFERENCES "public"."recovery_trackers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_resets" ADD CONSTRAINT "recovery_resets_tracker_id_recovery_trackers_id_fk" FOREIGN KEY ("tracker_id") REFERENCES "public"."recovery_trackers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recovery_checkins_tracker_idx" ON "recovery_checkins" USING btree ("tracker_id");--> statement-breakpoint
CREATE INDEX "recovery_resets_tracker_idx" ON "recovery_resets" USING btree ("tracker_id");--> statement-breakpoint
CREATE INDEX "recovery_trackers_user_idx" ON "recovery_trackers" USING btree ("user_id");