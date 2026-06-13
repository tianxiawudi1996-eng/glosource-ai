import { neon } from '@neondatabase/serverless';
import sanitizeHtml from 'sanitize-html';
import { BLOG_POSTS, type BlogPost } from './blog-posts';

// DB-sourced blog HTML is rendered raw via dangerouslySetInnerHTML, so it must be
// sanitized to close a stored-XSS path. Static repo posts (BLOG_POSTS) are trusted
// and left untouched to preserve their rich formatting exactly.
const BLOG_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li',
    'strong', 'em', 'b', 'i', 'u', 's', 'code', 'pre', 'blockquote',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption',
    'br', 'hr', 'img', 'span', 'div', 'figure', 'figcaption', 'sup', 'sub', 'small',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    td: ['colspan', 'rowspan', 'align'],
    th: ['colspan', 'rowspan', 'align', 'scope'],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  // Defend against reverse-tabnabbing on any links that open a new tab.
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }, true),
  },
};

function sanitizeDbPost(post: BlogPost): BlogPost {
  return { ...post, content: sanitizeHtml(post.content, BLOG_SANITIZE_OPTIONS) };
}

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
    return (rows as BlogPost[]).map(sanitizeDbPost);
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
    const dbPost = rows[0] as BlogPost | undefined;
    return dbPost ? sanitizeDbPost(dbPost) : undefined;
  } catch {
    return undefined;
  }
}
