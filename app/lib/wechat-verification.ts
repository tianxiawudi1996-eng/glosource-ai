import type { WeChatPost, WeChatSourcingOutput } from '@/app/api/source/types';
import { GLOSOURCE_BOT_USER_AGENT, parsePublicHttpUrl } from '@/app/lib/public-url';

interface WeChatSourceEvidence {
  groundingUrls?: readonly string[];
  sogouUrls?: readonly string[];
}

type Fetcher = (input: string, init: RequestInit) => Promise<Response>;
type WeChatSourceType = NonNullable<WeChatPost['sourceType']>;

export function parseWeChatKeyword(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const keyword = (body as { keyword?: unknown }).keyword;
  if (typeof keyword !== 'string') return null;
  return keyword.trim() || null;
}

function classifySourceType(
  sourceUrl: string | null,
  sogouUrls: ReadonlySet<string>,
  groundingUrls: ReadonlySet<string>,
): WeChatSourceType {
  if (sourceUrl && sogouUrls.has(sourceUrl)) return 'wechat_article';
  if (sourceUrl && groundingUrls.has(sourceUrl)) return 'web_search';
  return 'ai_estimated';
}

export function normalizeWeChatOutput(
  output: unknown,
  evidence: WeChatSourceEvidence = {},
): WeChatSourcingOutput {
  const source = output && typeof output === 'object'
    ? output as Record<string, unknown>
    : {};
  const sogouUrls = new Set(
    (evidence.sogouUrls ?? [])
      .map((url) => parsePublicHttpUrl(url)?.requestUrl ?? null)
      .filter((url): url is string => Boolean(url)),
  );
  const groundingUrls = new Set(
    (evidence.groundingUrls ?? [])
      .map((url) => parsePublicHttpUrl(url)?.requestUrl ?? null)
      .filter((url): url is string => Boolean(url)),
  );

  return {
    posts: (Array.isArray(source.posts) ? source.posts : []).flatMap((value) => {
      if (!value || typeof value !== 'object') return [];
      const post = value as Record<string, unknown>;
      const accountName = typeof post.accountName === 'string' ? post.accountName.trim() : '';
      const articleTitle = typeof post.articleTitle === 'string' ? post.articleTitle.trim() : '';
      const summary = typeof post.summary === 'string' ? post.summary.trim() : '';
      if (!accountName || !articleTitle || !summary) return [];

      const rawUrl = typeof post.url === 'string' ? post.url : '';
      const parsedUrl = parsePublicHttpUrl(rawUrl);
      const canonicalUrl = parsedUrl?.displayUrl ?? null;
      const sourceUrl = parsedUrl?.requestUrl ?? null;
      const sourceType = classifySourceType(
        sourceUrl,
        sogouUrls,
        groundingUrls,
      );

      return {
        accountName,
        accountType: typeof post.accountType === 'string' && post.accountType.trim() ? post.accountType : '미분류',
        articleTitle,
        publishDate: typeof post.publishDate === 'string' && post.publishDate.trim() ? post.publishDate : '미확인',
        url: sourceType === 'ai_estimated' ? '' : canonicalUrl ?? '',
        summary,
        productKeywords: Array.isArray(post.productKeywords)
          ? post.productKeywords.filter((keyword): keyword is string => typeof keyword === 'string')
          : [],
        contactHint: typeof post.contactHint === 'string' ? post.contactHint : '',
        priceRange: typeof post.priceRange === 'string' && post.priceRange.trim() ? post.priceRange : '문의 필요',
        moq: typeof post.moq === 'string' && post.moq.trim() ? post.moq : '문의 필요',
        location: typeof post.location === 'string' && post.location.trim() ? post.location : '미확인',
        productSpecs: typeof post.productSpecs === 'string' && post.productSpecs.trim() ? post.productSpecs : '미확인',
        productEvidence: typeof post.productEvidence === 'string' ? post.productEvidence : '',
        sourceType,
        relevanceScore: Math.max(0, Math.min(100, Number(post.relevanceScore) || 0)),
      };
    }),
    analysis: typeof source.analysis === 'string' ? source.analysis : '',
    searchKeyword: typeof source.searchKeyword === 'string' ? source.searchKeyword : '',
    ...(typeof source.translatedKeyword === 'string' ? { translatedKeyword: source.translatedKeyword } : {}),
    disclaimer: typeof source.disclaimer === 'string'
      ? source.disclaimer
      : 'AI 분석 정보입니다. 실제 거래 전 직접 확인하세요.',
  };
}

export async function verifyWeChatPostUrls(
  posts: WeChatPost[],
  fetcher: Fetcher = fetch,
  timeoutMs = 4000,
  requestSignal?: AbortSignal,
): Promise<void> {
  if (timeoutMs <= 0) return;

  const postsByUrl = new Map<string, WeChatPost[]>();
  for (const post of posts) {
    if (post.sourceType === 'ai_estimated') continue;
    const url = parsePublicHttpUrl(post.url ?? '')?.requestUrl ?? null;
    if (!url) {
      post.sourceType = 'ai_estimated';
      post.url = '';
      continue;
    }
    const matchingPosts = postsByUrl.get(url) ?? [];
    matchingPosts.push(post);
    postsByUrl.set(url, matchingPosts);
  }

  await Promise.allSettled([...postsByUrl].map(async ([url, matchingPosts]) => {
    let response: Response | undefined;
    try {
      const timeoutSignal = AbortSignal.timeout(Math.min(4000, timeoutMs));
      const signal = requestSignal
        ? AbortSignal.any([requestSignal, timeoutSignal])
        : timeoutSignal;
      response = await fetcher(url, {
        method: 'GET',
        redirect: 'manual',
        signal,
        headers: {
          'User-Agent': GLOSOURCE_BOT_USER_AGENT,
        },
      });
      if (response.status === 404 || response.status === 410) {
        for (const post of matchingPosts) {
          post.sourceType = 'ai_estimated';
          post.url = '';
        }
      }
    } catch (error) {
      const name = (error as { name?: string } | null)?.name;
      if (name === 'AbortError' || name === 'TimeoutError') return;
      for (const post of matchingPosts) {
        post.sourceType = 'ai_estimated';
        post.url = '';
      }
    } finally {
      await response?.body?.cancel().catch(() => {});
    }
  }));
}
