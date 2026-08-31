CREATE TABLE IF NOT EXISTS "quota_reservations" (
	"token" text PRIMARY KEY NOT NULL,
	"subject_type" text NOT NULL,
	"subject_key" text NOT NULL,
	"surface" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"slot" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quota_reservations_bucket_slot_uidx" ON "quota_reservations" USING btree ("subject_type","subject_key","surface","period_start","slot");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quota_reservations_expires_at_idx" ON "quota_reservations" USING btree ("expires_at");
