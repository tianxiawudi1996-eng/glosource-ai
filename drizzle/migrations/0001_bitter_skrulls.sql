ALTER TABLE "abuse_events" DROP CONSTRAINT "abuse_events_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_subscription_id_subscriptions_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "usage_logs" DROP CONSTRAINT "usage_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "usage_logs" ALTER COLUMN "ip" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "abuse_events" ADD CONSTRAINT "abuse_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "abuse_events_created_at_idx" ON "abuse_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "abuse_identities_last_seen_at_idx" ON "abuse_identities" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "payments_created_at_idx" ON "payments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "search_history_created_at_idx" ON "search_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "usage_logs_user_created_at_idx" ON "usage_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "usage_logs_ip_created_at_idx" ON "usage_logs" USING btree ("ip","created_at");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "usage_logs_created_at_idx" ON "usage_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "waitlist_created_at_idx" ON "waitlist" USING btree ("created_at");
