/**
 * Seed script — migrates static blog posts from app/lib/blog-posts.ts into the blog_posts DB table.
 * Run once: npx tsx scripts/seed-blog.ts
 * Requires DATABASE_URL in environment (or .env.local via dotenv).
 */

import { neon } from '@neondatabase/serverless';

import { BLOG_POSTS } from '../app/lib/blog-posts';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set. Add it to .env.local or export it before running.');
    process.exit(1);
  }

  const sql = neon(url);

  console.log(`Seeding ${BLOG_POSTS.length} static blog posts into DB...`);

  for (const post of BLOG_POSTS) {
    await sql`
      INSERT INTO blog_posts (id, slug, title, description, content, category, lang, published_at, reading_time_min, published)
      VALUES (
        gen_random_uuid()::text,
        ${post.slug},
        ${post.title},
        ${post.description},
        ${post.content},
        ${post.category},
        'en',
        ${new Date(post.publishedAt).toISOString()},
        ${post.readingTimeMin},
        true
      )
      ON CONFLICT (slug) DO UPDATE SET
        title            = EXCLUDED.title,
        description      = EXCLUDED.description,
        content          = EXCLUDED.content,
        category         = EXCLUDED.category,
        published_at     = EXCLUDED.published_at,
        reading_time_min = EXCLUDED.reading_time_min,
        published        = true
    `;
    console.log(`  ✓ ${post.slug}`);
  }

  console.log('Seed complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
