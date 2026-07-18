CREATE TABLE IF NOT EXISTS "kr_dart_firms" (
	"corp_code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_norm" text NOT NULL,
	"name_en" text,
	"stock_code" text,
	"jurir_no" text,
	"bizrno" text NOT NULL,
	"address" text,
	"homepage" text,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kr_dart_firms_name_norm_idx" ON "kr_dart_firms" USING btree ("name_norm");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kr_dart_firms_bizrno_idx" ON "kr_dart_firms" USING btree ("bizrno");
