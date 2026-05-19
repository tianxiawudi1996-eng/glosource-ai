ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "age_confirmed_at" timestamp;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketing_consent_at" timestamp;
