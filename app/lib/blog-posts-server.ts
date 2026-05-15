import { neon } from '@neondatabase/serverless';
import { BLOG_POSTS, type BlogPost } from './blog-posts';

async function queryDbPosts(): Promise<BlogPost[]> {
  const url = process.env.DATABASE_URL;
  if (!url) return [];
  try {
    const sql = neon(url);
    const rows = await sql`
      SELECT slug, title, description,
             published_at AS "publishedAt",
             reading_time_min AS "readingTimeMin",
             category, content
      FROM blog_posts
      WHERE published = true
      ORDER BY published_at DESC
    `;
    return rows as BlogPost[];
  } catch {
    return [];
  }
}

export async function getAllPostsMerged(): Promise<BlogPost[]> {
  const dbPosts = await queryDbPosts();
  const staticSlugs = new Set(BLOG_POSTS.map(p => p.slug));
  const freshDbPosts = dbPosts.filter(p => !staticSlugs.has(p.slug));
  return [...freshDbPosts, ...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getPostMerged(slug: string): Promise<BlogPost | undefined> {
  const staticPost = BLOG_POSTS.find(p => p.slug === slug);
  if (staticPost) return staticPost;

  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  try {
    const sql = neon(url);
    const rows = await sql`
      SELECT slug, title, description,
             published_at AS "publishedAt",
             reading_time_min AS "readingTimeMin",
             category, content
      FROM blog_posts
      WHERE slug = ${slug} AND published = true
      LIMIT 1
    `;
    return (rows[0] as BlogPost) ?? undefined;
  } catch {
    return undefined;
  }
}
