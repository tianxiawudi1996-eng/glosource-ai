CREATE TABLE "abuse_identities" (
	"id" text PRIMARY KEY NOT NULL,
	"identity_type" text NOT NULL,
	"identity_hash" text NOT NULL,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"event_count" integer DEFAULT 0 NOT NULL,
	"user_count" integer DEFAULT 0 NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "abuse_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"identity_id" text,
	"event" text NOT NULL,
	"severity" integer DEFAULT 1 NOT NULL,
	"email_domain" text,
	"ip" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "abuse_events" ADD CONSTRAINT "abuse_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "abuse_events" ADD CONSTRAINT "abuse_events_identity_id_abuse_identities_id_fk" FOREIGN KEY ("identity_id") REFERENCES "public"."abuse_identities"("id") ON DELETE set null ON UPDATE no action;
