import { NextRequest, NextResponse } from 'next/server';
import { db, blogPosts } from '@/app/lib/db';
import { desc, eq } from 'drizzle-orm';

function authorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_PUBLISH_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

// POST /api/admin/blog-posts — upsert a blog post
export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug, title, description, content, category, lang, publishedAt, readingTimeMin, published } = body;

  if (typeof slug !== 'string' || !slug.trim()) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  if (typeof title !== 'string' || !title.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 });
  if (typeof description !== 'string' || !description.trim()) return NextResponse.json({ error: 'description required' }, { status: 400 });
  if (typeof content !== 'string' || !content.trim()) return NextResponse.json({ error: 'content required' }, { status: 400 });
  if (typeof category !== 'string' || !category.trim()) return NextResponse.json({ error: 'category required' }, { status: 400 });

  const pubDate = publishedAt ? new Date(String(publishedAt)) : new Date();
  if (isNaN(pubDate.getTime())) return NextResponse.json({ error: 'Invalid publishedAt' }, { status: 400 });

  const langValue = (lang === 'ko' ? 'ko' : 'en') as 'en' | 'ko';
  const readTime = typeof readingTimeMin === 'number' ? Math.max(1, Math.round(readingTimeMin)) : 5;
  const isPublished = published !== false;

  try {
    await db
      .insert(blogPosts)
      .values({
        slug: slug.trim(),
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        category: category.trim(),
        lang: langValue,
        publishedAt: pubDate,
        readingTimeMin: readTime,
        published: isPublished,
      })
      .onConflictDoUpdate({
        target: blogPosts.slug,
        set: {
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
          category: category.trim(),
          lang: langValue,
          publishedAt: pubDate,
          readingTimeMin: readTime,
          published: isPublished,
        },
      });

    return NextResponse.json({ success: true, slug: slug.trim() });
  } catch (err) {
    console.error('[admin/blog-posts POST]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// GET /api/admin/blog-posts — list all posts including drafts
export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        category: blogPosts.category,
        lang: blogPosts.lang,
        publishedAt: blogPosts.publishedAt,
        readingTimeMin: blogPosts.readingTimeMin,
        published: blogPosts.published,
        createdAt: blogPosts.createdAt,
      })
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt));

    return NextResponse.json({ posts });
  } catch (err) {
    console.error('[admin/blog-posts GET]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// DELETE /api/admin/blog-posts?slug=... — soft-unpublish
export async function DELETE(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug param required' }, { status: 400 });

  try {
    await db.update(blogPosts).set({ published: false }).where(eq(blogPosts.slug, slug));
    return NextResponse.json({ success: true, unpublished: slug });
  } catch (err) {
    console.error('[admin/blog-posts DELETE]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
