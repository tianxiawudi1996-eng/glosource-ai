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
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"lang" text DEFAULT 'en' NOT NULL,
	"published_at" timestamp NOT NULL,
	"reading_time_min" integer DEFAULT 5 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "kr_cosmetics_firms" (
	"entp_seq" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_norm" text NOT NULL,
	"induty" text NOT NULL,
	"is_manufacturer" boolean NOT NULL,
	"boss_name" text,
	"permit_date" text,
	"factory_addr" text,
	"bizrno" text,
	"fetched_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kr_haccp_firms" (
	"appointno" text PRIMARY KEY NOT NULL,
	"company" text NOT NULL,
	"company_norm" text NOT NULL,
	"product_gb" text,
	"business_item" text,
	"companykind_nm" text,
	"area1" text,
	"area2" text,
	"issue_date" text
);
--> statement-breakpoint
CREATE TABLE "kr_health_food_firms" (
	"name_norm" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sample_product" text,
	"product_count" integer
);
--> statement-breakpoint
CREATE TABLE "kr_medical_device_firms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_norm" text NOT NULL,
	"induty" text NOT NULL,
	"is_manufacturer" boolean NOT NULL,
	"bizrno" text,
	"permit_date" text,
	"close_date" text,
	"addr" text
);
--> statement-breakpoint
CREATE TABLE "kr_quasi_drug_firms" (
	"entp_seq" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_norm" text NOT NULL,
	"induty" text,
	"is_manufacturer" boolean NOT NULL,
	"sample_item" text,
	"has_active" boolean NOT NULL,
	"permit_date" text
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subscription_id" text,
	"toss_payment_key" text,
	"toss_order_id" text,
	"polar_payment_id" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'KRW' NOT NULL,
	"status" text NOT NULL,
	"method" text,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_toss_payment_key_unique" UNIQUE("toss_payment_key"),
	CONSTRAINT "payments_toss_order_id_unique" UNIQUE("toss_order_id"),
	CONSTRAINT "payments_polar_payment_id_unique" UNIQUE("polar_payment_id")
);
--> statement-breakpoint
CREATE TABLE "search_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"product" text NOT NULL,
	"region" text NOT NULL,
	"supplier_count" integer DEFAULT 0 NOT NULL,
	"top_suppliers" text,
	"result_json" text,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"article_url" text NOT NULL,
	"article_title" text NOT NULL,
	"threads_post_id" text,
	"twitter_post_id" text,
	"status" text DEFAULT 'published' NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "social_posts_article_url_unique" UNIQUE("article_url")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan" text NOT NULL,
	"status" text DEFAULT 'trialing' NOT NULL,
	"toss_billing_key" text,
	"toss_customer_key" text,
	"toss_order_id" text,
	"polar_subscription_id" text,
	"polar_customer_id" text,
	"polar_product_id" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_polar_subscription_id_unique" UNIQUE("polar_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "usage_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"ip" text NOT NULL,
	"action" text NOT NULL,
	"product" text,
	"supplier_count" integer,
	"duration_ms" integer,
	"status" integer DEFAULT 200 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"password_hash" text,
	"polar_provisioned" boolean DEFAULT false NOT NULL,
	"password_set_at" timestamp,
	"welcome_reminder_sent_at" timestamp,
	"tos_consent_at" timestamp,
	"data_consent_at" timestamp,
	"gdpr_consent_at" timestamp,
	"age_confirmed_at" timestamp,
	"marketing_consent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "verified_suppliers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_en" text,
	"platform" text NOT NULL,
	"url" text,
	"category" text NOT NULL,
	"country" text DEFAULT 'KR' NOT NULL,
	"moq_min" integer,
	"lead_time_days" integer,
	"certifications" text,
	"trust_score" integer,
	"bizrno" text,
	"bizrno_source" text,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"verified_at" timestamp DEFAULT now() NOT NULL,
	"added_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'landing' NOT NULL,
	"ip" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "abuse_events" ADD CONSTRAINT "abuse_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abuse_events" ADD CONSTRAINT "abuse_events_identity_id_abuse_identities_id_fk" FOREIGN KEY ("identity_id") REFERENCES "public"."abuse_identities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;