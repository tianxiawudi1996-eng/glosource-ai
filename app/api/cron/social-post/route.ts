import { NextRequest, NextResponse } from 'next/server';
import { db, socialPosts } from '@/app/lib/db';
import { eq } from 'drizzle-orm';

const BUFFER_API = 'https://api.buffer.com/graphql';
const CHANNELS = {
  threads: process.env.BUFFER_CHANNEL_THREADS!,
  twitter: process.env.BUFFER_CHANNEL_TWITTER!,
};

const RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://venturebeat.com/category/ai/feed/',
];

// [FIX 1] "verified" 제거, MFDS/HACCP 보장 표현 제거, #ad 표기 추가
const GLOSOURCE_MENTIONS = [
  '#ad Sourcing from Korea? GloSource AI (glosourceai.com) finds supplier candidates via EC21, BuyKorea & tradeKorea in ~90 sec.',
  '#ad Korean supplier research used to take hours of tab-switching. GloSource AI searches multiple B2B platforms simultaneously.',
  '#ad For buyers exploring Korean cosmetics, food, or fashion suppliers — GloSource AI surfaces candidates with AI-detected cert signals. Results require your own verification.',
];

// [FIX 2] 부적절한 뉴스 블랙리스트
const BLOCKED_KEYWORDS = [
  'scam', 'fraud', 'bankrupt', 'bankruptcy', 'lawsuit', 'layoff',
  'hack', 'breach', 'arrested', 'indicted', 'collapse', 'shutdown',
  'exploit', 'vulnerability', 'death', 'fatal',
];

// [FIX 3] GloSource 멘션은 소싱/무역 관련 뉴스에만 삽입
const SOURCING_KEYWORDS = [
  'supply chain', 'manufacturing', 'supplier', 'sourcing', 'import',
  'export', 'trade', 'b2b', 'factory', 'procurement', 'logistics',
  'warehouse', 'inventory', 'wholesale', 'vendor',
];

async function sendFailureAlert(message: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_EMAIL_FROM ?? 'noreply@glosource.ai',
        to: process.env.ADMIN_EMAIL ?? 'tianxiawudi1996@gmail.com',
        subject: '[GloSource] 소셜 자동화 발행 실패',
        text: message,
      }),
    });
  } catch {
    // 알림 실패는 무시
  }
}

// [FIX 6] DB에서 이미 발행된 URL 조회 (dedup)
async function isAlreadyPublished(articleUrl: string): Promise<boolean> {
  try {
    const rows = await db
      .select({ id: socialPosts.id })
      .from(socialPosts)
      .where(eq(socialPosts.articleUrl, articleUrl))
      .limit(1);
    return rows.length > 0;
  } catch {
    // DB 오류 시 dedup 건너뜀 (중단 방지)
    return false;
  }
}

async function fetchRSSItem(): Promise<{ title: string; link: string; summary: string } | null> {
  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed, { next: { revalidate: 0 } });
      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g);
      if (!items || items.length === 0) continue;

      // 최신 10개 중 랜덤 선택 (더 다양한 뉴스)
      const candidates = items.slice(0, 10);
      for (let attempt = 0; attempt < candidates.length; attempt++) {
        const randomItem = candidates[Math.floor(Math.random() * candidates.length)];
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

        if (!title || !link) continue;

        // [FIX 2] 블랙리스트 필터 — 부적절한 뉴스 건너뜀
        const titleLower = title.toLowerCase();
        const isBlocked = BLOCKED_KEYWORDS.some(kw => titleLower.includes(kw));
        if (isBlocked) continue;

        // [FIX 6] 중복 발행 방지 — 이미 DB에 있는 URL 건너뜀
        const alreadyPublished = await isAlreadyPublished(link);
        if (alreadyPublished) continue;

        return { title, link, summary };
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function generatePost(newsItem: { title: string; link: string; summary: string }): Promise<{ threads: string; twitter: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY missing');

  // [FIX 3] 소싱/무역 관련 뉴스에서만 GloSource 멘션 삽입
  const combined = (newsItem.title + ' ' + newsItem.summary).toLowerCase();
  const isRelevantTopic = SOURCING_KEYWORDS.some(kw => combined.includes(kw));
  const shouldMentionGlosource = isRelevantTopic && Math.random() < 0.5;
  const glosourceMention = shouldMentionGlosource
    ? GLOSOURCE_MENTIONS[Math.floor(Math.random() * GLOSOURCE_MENTIONS.length)]
    : '';

  const prompt = `You are a B2B sourcing and AI industry content writer targeting international buyers and entrepreneurs.

Write TWO versions of a social media post about this AI news:

NEWS TITLE: ${newsItem.title}
SUMMARY: ${newsItem.summary}
LINK: ${newsItem.link}

VERSION 1 (Threads) — max 380 characters total including link and hashtags. Conversational, 1-2 hashtags. Keep it tight.
VERSION 2 (Twitter/X) — max 250 characters total including link and hashtag. Punchy, 1 hashtag max.

Rules:
- Focus on practical implications for business/sourcing/trade
- No hype words: "game-changer", "revolutionary", "mindblowing", "groundbreaking"
- Sound like a knowledgeable professional, not a marketer
- Always include the original news link
- Output valid JSON only — no markdown, no code block

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
  let threadsText = String(parsed.threads ?? '').trim();
  const twitterText = String(parsed.twitter ?? '').trim();

  // [FIX 4] 맥락 있을 때만 GloSource 멘션 append (문자수 초과 방지)
  if (glosourceMention && threadsText.length + glosourceMention.length + 2 <= 500) {
    threadsText = `${threadsText}\n\n${glosourceMention}`;
  }

  // 안전 truncate
  return {
    threads: threadsText.slice(0, 500),
    twitter: twitterText.slice(0, 280),
  };
}

async function scheduleBufferPost(channelId: string, text: string): Promise<{ ok: boolean; postId?: string; error?: string }> {
  const bufferToken = process.env.BUFFER_API_KEY;
  if (!bufferToken) return { ok: false, error: 'BUFFER_API_KEY missing' };
  if (!channelId) return { ok: false, error: 'Buffer channel id missing' };

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
      'Authorization': `Bearer ${bufferToken}`,
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
  const postId = result?.post?.id as string | undefined;
  return { ok: !!postId, postId };
}

// [FIX 8] 발행 성공 후 DB에 기록
async function logPublishedPost(
  newsItem: { title: string; link: string },
  threadsPostId: string | undefined,
  twitterPostId: string | undefined,
  status: 'published' | 'partial' | 'failed',
): Promise<void> {
  try {
    await db.insert(socialPosts).values({
      articleUrl: newsItem.link,
      articleTitle: newsItem.title,
      threadsPostId: threadsPostId ?? null,
      twitterPostId: twitterPostId ?? null,
      status,
    });
  } catch {
    // 로그 실패는 무시 (발행 성공이 우선)
  }
}

export async function GET(request: NextRequest) {
  // [FIX 5] 항상 CRON_SECRET 검증 (개발환경 무인증 제거)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newsItem = await fetchRSSItem();
    if (!newsItem) {
      await sendFailureAlert('소셜 자동화: RSS에서 적합한 뉴스를 찾지 못했습니다. (모두 중복이거나 블랙리스트 필터됨)');
      return NextResponse.json({ error: 'No suitable news found' }, { status: 500 });
    }

    const posts = await generatePost(newsItem);

    const [threadsResult, twitterResult] = await Promise.all([
      scheduleBufferPost(CHANNELS.threads, posts.threads),
      scheduleBufferPost(CHANNELS.twitter, posts.twitter),
    ]);

    // [FIX 5] 발행 실패 시 success:false + 이메일 알림
    const allOk = threadsResult.ok && twitterResult.ok;
    const status = allOk ? 'published' : (threadsResult.ok || twitterResult.ok ? 'partial' : 'failed');

    // [FIX 8] 발행 결과 DB 기록 (성공·부분 성공 모두 기록)
    if (status !== 'failed') {
      await logPublishedPost(
        newsItem,
        threadsResult.postId,
        twitterResult.postId,
        status,
      );
    }

    if (!allOk) {
      const errorMsg = [
        `뉴스: ${newsItem.title}`,
        threadsResult.error ? `Threads 실패: ${threadsResult.error}` : '',
        twitterResult.error ? `Twitter 실패: ${twitterResult.error}` : '',
      ].filter(Boolean).join('\n');
      await sendFailureAlert(errorMsg);
    }

    return NextResponse.json(
      {
        success: allOk,
        news: newsItem.title,
        scheduled: {
          threads: threadsResult.ok,
          twitter: twitterResult.ok,
          ...(threadsResult.error && { threadsError: threadsResult.error }),
          ...(twitterResult.error && { twitterError: twitterResult.error }),
        },
      },
      { status: allOk ? 200 : 500 }
    );
  } catch (error) {
    console.error('[social-post cron]', error);
    await sendFailureAlert(`소셜 자동화 예외 발생: ${String(error)}`);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
