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
