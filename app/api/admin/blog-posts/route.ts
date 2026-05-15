import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const ENSURE_TABLE = `
  CREATE TABLE IF NOT EXISTS blog_posts (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    published_at TEXT NOT NULL,
    reading_time_min INTEGER NOT NULL DEFAULT 5,
    category    TEXT NOT NULL,
    content     TEXT NOT NULL,
    published   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )
`;

function authorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_PUBLISH_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    slug?: string;
    title?: string;
    description?: string;
    publishedAt?: string;
    readingTimeMin?: number;
    category?: string;
    content?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug, title, description, publishedAt, readingTimeMin = 5, category, content } = body;
  if (!slug || !title || !description || !publishedAt || !category || !content) {
    return NextResponse.json(
      { error: 'Missing required fields: slug, title, description, publishedAt, category, content' },
      { status: 400 }
    );
  }

  const url = process.env.DATABASE_URL;
  if (!url) return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });

  try {
    const sql = neon(url);
    await sql.unsafe(ENSURE_TABLE);
    await sql`
      INSERT INTO blog_posts (slug, title, description, published_at, reading_time_min, category, content)
      VALUES (${slug}, ${title}, ${description}, ${publishedAt}, ${readingTimeMin}, ${category}, ${content})
      ON CONFLICT (slug) DO UPDATE SET
        title            = EXCLUDED.title,
        description      = EXCLUDED.description,
        published_at     = EXCLUDED.published_at,
        reading_time_min = EXCLUDED.reading_time_min,
        category         = EXCLUDED.category,
        content          = EXCLUDED.content,
        created_at       = NOW()
    `;
    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('[admin/blog-posts] POST error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = process.env.DATABASE_URL;
  if (!url) return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });

  try {
    const sql = neon(url);
    await sql.unsafe(ENSURE_TABLE);
    const rows = await sql`
      SELECT slug, title, description, published_at AS "publishedAt",
             reading_time_min AS "readingTimeMin", category, published, created_at
      FROM blog_posts
      ORDER BY published_at DESC
    `;
    return NextResponse.json({ posts: rows });
  } catch (error) {
    console.error('[admin/blog-posts] GET error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
