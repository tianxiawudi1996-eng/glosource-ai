-- 베타 웨이트리스트 테이블
CREATE TABLE IF NOT EXISTS "waitlist" (
  "id" text PRIMARY KEY NOT NULL,
  "email" text NOT NULL UNIQUE,
  "source" text DEFAULT 'landing' NOT NULL,
  "ip" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
