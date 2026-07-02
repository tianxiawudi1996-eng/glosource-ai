import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, socialPosts } from '@/app/lib/db';

const DAILY_POSTS = [
  'Finding a Korean supplier is easy. Verifying whether they can actually export, meet your MOQ, and support your category is the hard part.',
  'A supplier list is not sourcing intelligence. Buyers need evidence: certifications, export signals, product fit, MOQ context, and clear next steps.',
  'Before contacting a Korean manufacturer, check three things: category fit, export readiness, and whether the claimed certifications match the product.',
  'The fastest supplier is not always the right supplier. A better shortlist reduces wasted outreach, sample costs, and compliance risk.',
  'Korean sourcing should not require hours of translating directories and guessing which companies are export-ready. That is the problem GloSource AI is built to solve.',
  'A strong RFQ gives suppliers enough context to answer accurately: product specification, target quantity, market, certification needs, and timeline.',
  'Good sourcing software should show its uncertainty. GloSource AI presents risk signals and public evidence so buyers can decide what to verify next.',
] as const;

function kstDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getDailyPost(date = new Date()) {
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  const index = dayNumber % DAILY_POSTS.length;
  const url = new URL('https://glosourceai.com/en');
  url.searchParams.set('utm_source', 'threads');
  url.searchParams.set('utm_medium', 'organic');
  url.searchParams.set('utm_campaign', '2026-07-korean-supplier-intelligence');
  url.searchParams.set('utm_content', `daily-${index + 1}`);

  return {
    index,
    text: `${DAILY_POSTS[index]}\n\nSearch and assess Korean suppliers:\n${url.toString()}`,
  };
}

async function publishToBuffer(text: string) {
  const accessToken = process.env.BUFFER_API_KEY;
  const channelId = process.env.BUFFER_CHANNEL_THREADS;
  if (!accessToken || !channelId) {
    throw new Error('BUFFER_API_KEY or BUFFER_CHANNEL_THREADS is missing');
  }

  const response = await fetch('https://api.buffer.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            ... on PostActionSuccess { post { id } }
            ... on MutationError { message }
          }
        }
      `,
      variables: {
        input: {
          channelId,
          text,
          mode: 'shareNow',
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Buffer HTTP ${response.status}`);
  }

  const payload = await response.json() as {
    data?: { createPost?: { post?: { id?: string }; message?: string } };
    errors?: Array<{ message?: string }>;
  };
  const postId = payload.data?.createPost?.post?.id;
  if (!postId) {
    throw new Error(payload.data?.createPost?.message ?? payload.errors?.[0]?.message ?? 'Buffer did not return a post id');
  }

  return postId;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const date = kstDate();
  const articleUrl = `https://glosourceai.com/social/daily/${date}`;

  try {
    const existing = await db
      .select({ id: socialPosts.id, status: socialPosts.status })
      .from(socialPosts)
      .where(eq(socialPosts.articleUrl, articleUrl))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ success: true, skipped: true, reason: 'already-processed', date });
    }

    const dailyPost = getDailyPost();
    if (dailyPost.text.length > 500) {
      throw new Error('Daily Threads post exceeds 500 characters');
    }

    const [reservation] = await db.insert(socialPosts).values({
      articleUrl,
      articleTitle: `Daily supplier intelligence ${date}`,
      status: 'failed',
    }).returning({ id: socialPosts.id });

    const postId = await publishToBuffer(dailyPost.text);

    await db.update(socialPosts).set({
      threadsPostId: postId,
      status: 'published',
      publishedAt: new Date(),
    }).where(eq(socialPosts.id, reservation.id));

    return NextResponse.json({ success: true, skipped: false, date, postId });
  } catch (error) {
    console.error('[social-post cron]', error);
    return NextResponse.json({ error: 'Daily social post failed' }, { status: 500 });
  }
}
