CREATE TABLE "waitlist" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'landing' NOT NULL,
	"ip" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "polar_payment_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "polar_subscription_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "polar_customer_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "polar_product_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_polar_payment_id_unique" UNIQUE("polar_payment_id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_polar_subscription_id_unique" UNIQUE("polar_subscription_id");