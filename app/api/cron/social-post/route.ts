import { NextRequest, NextResponse } from 'next/server';

const BUFFER_API = 'https://api.buffer.com/graphql';
const BUFFER_TOKEN = process.env.BUFFER_API_KEY!;
const CHANNELS = {
  threads: process.env.BUFFER_CHANNEL_THREADS!,
  twitter: process.env.BUFFER_CHANNEL_TWITTER!,
};

const RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://venturebeat.com/category/ai/feed/',
];

const GLOSOURCE_MENTIONS = [
  'If you source products from Korea, GloSource AI (glosource-ai.vercel.app) can find verified Korean suppliers in ~90 seconds. Worth trying.',
  'Korean supplier research used to take hours. GloSource AI cuts it to ~90 sec — EC21, BuyKorea, tradeKorea searched simultaneously.',
  'For buyers sourcing Korean cosmetics, food, or fashion — GloSource AI finds supplier candidates with MFDS/HACCP signals automatically.',
];

async function fetchRSSItem(): Promise<{ title: string; link: string; summary: string } | null> {
  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed, { next: { revalidate: 0 } });
      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g);
      if (!items || items.length === 0) continue;

      const randomItem = items[Math.floor(Math.random() * Math.min(5, items.length))];
      const cdataTitle = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/.exec(randomItem)?.[1];
      const plainTitle = /<title>([\s\S]*?)<\/title>/.exec(randomItem)?.[1];
      const title = cdataTitle ?? plainTitle ?? '';
      const link = randomItem.match(/<link>(.*?)<\/link>/)?.[1]
        ?? randomItem.match(/<link[^>]*href="([^"]+)"/)?.[1]
        ?? '';
      const cdataDesc = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/.exec(randomItem)?.[1];
      const plainDesc = /<description>([\s\S]*?)<\/description>/.exec(randomItem)?.[1];
      const desc = cdataDesc ?? plainDesc ?? '';

      const summary = desc.replace(/<[^>]+>/g, '').slice(0, 200).trim();
      if (title && link) return { title, link, summary };
    } catch {
      continue;
    }
  }
  return null;
}

async function generatePost(newsItem: { title: string; link: string; summary: string }): Promise<{ threads: string; twitter: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY missing');

  const shouldMentionGlosource = Math.random() < 0.4;
  const glosourceLine = shouldMentionGlosource
    ? `\n\n💡 ${GLOSOURCE_MENTIONS[Math.floor(Math.random() * GLOSOURCE_MENTIONS.length)]}`
    : '';

  const prompt = `You are a B2B sourcing and AI industry content writer targeting international buyers and entrepreneurs.

Write TWO versions of a social media post about this AI news:

NEWS TITLE: ${newsItem.title}
SUMMARY: ${newsItem.summary}
LINK: ${newsItem.link}

VERSION 1 (Threads) — max 400 characters total, conversational, 1-2 hashtags, include the link. Keep it tight.
VERSION 2 (Twitter/X) — max 260 characters, punchy, include the link, 1-2 hashtag

Rules:
- Focus on practical implications for business/sourcing/trade
- No hype language ("game-changer", "revolutionary", "mindblowing")
- Sound like a knowledgeable professional, not a marketer
- Always include the original news link

Respond in this exact JSON format:
{"threads": "...", "twitter": "..."}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid Gemini response');

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    threads: parsed.threads + glosourceLine,
    twitter: parsed.twitter,
  };
}

async function scheduleBufferPost(channelId: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const tomorrow9am = new Date();
  tomorrow9am.setDate(tomorrow9am.getDate() + 1);
  tomorrow9am.setHours(9, 0, 0, 0);

  const mutation = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess { post { id status } }
        ... on InvalidInputError { message }
        ... on LimitReachedError { message }
        ... on UnexpectedError { message }
      }
    }
  `;

  const res = await fetch(BUFFER_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BUFFER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          channelId,
          text,
          schedulingType: 'automatic',
          mode: 'addToQueue',
          assets: [],
        },
      },
    }),
  });

  const data = await res.json();
  if (data.errors) {
    return { ok: false, error: JSON.stringify(data.errors) };
  }
  const result = data.data?.createPost;
  if (result?.message) {
    return { ok: false, error: result.message };
  }
  return { ok: !!result?.post?.id };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newsItem = await fetchRSSItem();
    if (!newsItem) {
      return NextResponse.json({ error: 'No news found' }, { status: 500 });
    }

    const posts = await generatePost(newsItem);

    const [threadsResult, twitterResult] = await Promise.all([
      scheduleBufferPost(CHANNELS.threads, posts.threads),
      scheduleBufferPost(CHANNELS.twitter, posts.twitter),
    ]);

    return NextResponse.json({
      success: true,
      news: newsItem.title,
      scheduled: {
        threads: threadsResult.ok,
        twitter: twitterResult.ok,
        threadsError: threadsResult.error,
        twitterError: twitterResult.error,
      },
    });
  } catch (error) {
    console.error('[social-post cron]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
