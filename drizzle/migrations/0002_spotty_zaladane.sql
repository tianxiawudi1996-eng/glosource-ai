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
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"verified_at" timestamp DEFAULT now() NOT NULL,
	"added_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
