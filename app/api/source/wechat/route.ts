import { GoogleGenerativeAI } from '@google/generative-ai';
import { load } from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';
import { isValidLicenseKey, extractLicenseKey } from '../../../lib/licenseAuth';
import type { WeChatPost, WeChatSourcingOutput } from '../types';
import { kvSaveHistory, kvCheckFreeCredit } from '../../../lib/kv';

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function parseWeChatJSON(text: string): WeChatSourcingOutput {
  let clean = text.trim();
  if (clean.includes('```')) {
    const m = clean.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (m) clean = m[1].trim();
  }
  clean = clean.replace(/\[\d+\]/g, '').replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) clean = match[0];
  return JSON.parse(clean) as WeChatSourcingOutput;
}

function isRetryable(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes('404') || msg.includes('429') || msg.includes('503') ||
    msg.includes('no longer available') || msg.includes('Resource exhausted') ||
    msg === 'timeout';
}

// Translate Korean keyword to Chinese manufacturing terminology while preserving specs.
async function translateKeywordToZh(keyword: string): Promise<string> {
  const CHINESE_RANGE = /[一-鿿]/;
  const chineseCount = [...keyword].filter((c) => CHINESE_RANGE.test(c)).length;
  if (chineseCount >= 2) return keyword;

  const prompt = `당신은 중국 제조업 검색어 전문가입니다. 아래 제품명을 중국 B2B/WeChat에서 실제로 검색되는 중국어 제품 검색어로 바꾸세요.
제품명: "${keyword}"
규칙:
- 설명 문장 금지. 검색어만 반환
- 재질/등급/모델/규격 숫자(예: 6063-T5, SS400, 40x40, 6T)는 절대 삭제하지 마세요
- 너무 일반적인 단어 하나만 반환 금지 (예: 铝材, 钢材)
- 좋은 예: "6063-T5 铝合金门窗型材", "SS400 热轧钢板 6mm", "40x40 工业铝型材"`;

  for (const modelId of ['gemini-2.0-flash', 'gemini-2.0-flash-lite']) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
      ]);
      const translated = result.response.text().trim().replace(/["']/g, '').replace(/\s+/g, ' ');
      if (CHINESE_RANGE.test(translated) && translated.length >= 2 && translated.length <= 48) {
        return translated;
      }
    } catch { /* fall through */ }
  }
  return keyword;
}

// Sogou WeChat search — supplementary data source
const SOGOU_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9',
  'Referer': 'https://weixin.sogou.com/',
};

interface SogouArticle {
  title: string;
  accountName: string;
  publishDate: string;
  url: string;
  snippet: string;
}

async function scrapeSogouWeChat(zhKeyword: string): Promise<SogouArticle[]> {
  // Try multiple search queries for better coverage
  const queries = [
    `"${zhKeyword}" 厂家直销 报价`,
    `"${zhKeyword}" 工厂 批发价格`,
    `"${zhKeyword}" 微信 公众号`,
    `"${zhKeyword}" 参数 价格`,
  ];

  const seen = new Set<string>();
  const allArticles: SogouArticle[] = [];

  for (const q of queries) {
    try {
      const url = `https://weixin.sogou.com/weixin?type=2&query=${encodeURIComponent(q)}&ie=utf8&page=1`;
      const res = await fetch(url, { headers: SOGOU_HEADERS, signal: AbortSignal.timeout(7000) });
      if (!res.ok) continue;

      const html = await res.text();
      const $ = load(html);
      const articles: SogouArticle[] = [];

      $('ul.news-list li, .news-list li').each((_, el) => {
        const $el = $(el);
        const $link = $el.find('h3 a, .txt-box a[href]').first();
        const title = $link.text().trim() || $el.find('h3').text().trim();
        const href = $link.attr('href') || '';
        const accountName = $el.find('.account, [class*="account"], .s-p a').first().text().trim() || '미확인';
        const publishDate = $el.find('.s-p span').last().text().trim() || '';
        const snippet = $el.find('p.txt-info, .txt-box p').text().trim() || '';

        if (title && href) {
          articles.push({
            title, accountName, publishDate, snippet,
            url: href.startsWith('http') ? href : `https://weixin.sogou.com${href}`,
          });
        }
      });

      for (const article of articles) {
        const key = `${article.accountName}:${article.title}`;
        if (!seen.has(key)) {
          seen.add(key);
          allArticles.push(article);
        }
      }
    } catch { /* try next query */ }
  }
  return allArticles.slice(0, 14);
}

// A+B: Primary strategy — Gemini with Google Search grounding
// Searches for real Chinese factory info with WeChat contacts for the specific product
async function searchWithGrounding(keyword: string, zhKeyword: string): Promise<WeChatSourcingOutput> {
  const prompt = `당신은 중국 제조업체 소싱 전문가입니다. Google 검색을 통해 "${keyword}"(중문: ${zhKeyword}) 제품을 실제 생산하는 중국 공장 정보를 찾아주세요.

[검색 대상]
- ${zhKeyword} 工厂 微信 报价 (공장 WeChat 연락처)
- ${zhKeyword} 厂家直销 批发价格 (도매 직거래 가격)
- ${zhKeyword} 制造商 1688 (1688 제조업체)
- site:1688.com ${zhKeyword} (1688 실제 상품)

[추출할 정보 — 반드시 ${keyword} 제품에만 집중]
각 공급자(최대 5개)에 대해:
1. 공장명 (중문) + 소재지 (省/市)
2. ${keyword} 제품 스펙 (재질, 규격, 용도, 특징)
3. 실제 가격대 (CNY/단위, 시세 기준)
4. MOQ (최소 주문 수량)
5. WeChat 공식계정명 또는 WeChat ID (있으면)
6. 1688 또는 공식 URL

[절대 금지]
- ${keyword}와 무관한 공급자 포함 금지
- 제품 스펙/가격/MOQ/공장명 중 2개 이상 확인되지 않으면 posts에 넣지 마세요
- URL 추측 생성 금지 (확인 못한 URL은 빈 문자열)
- 일반적인 WeChat 소싱 방법론 설명 금지 (제품 정보만)
- "어떻게 찾는지" 설명하는 가이드성 결과 금지. 실제 제품/공급자 정보만 반환

순수 JSON으로만 반환:
{
  "posts": [
    {
      "accountName": "실제 공장명 또는 WeChat 계정명 (중문)",
      "accountType": "공장 직영 | 무역상 | 업계 협회",
      "articleTitle": "${keyword} 제품명 + 핵심 스펙 (예: 알루미늄 창호 60시리즈 단열형)",
      "publishDate": "최근",
      "url": "실제 확인된 URL (없으면 빈 문자열)",
      "summary": "이 공급자의 ${keyword} 제품 구체적 정보: 스펙·가격·MOQ·한국 수출 경험 등 (한국어 2~3문장)",
      "productKeywords": ["${zhKeyword}", "관련 중국어 키워드"],
      "contactHint": "WeChat ID 또는 公众号명 (없으면 연락 방법)",
      "productSpecs": "확인된 제품 스펙",
      "productEvidence": "제품 일치 근거: 페이지 제목/본문에서 확인한 핵심 문구",
      "priceRange": "¥XX~XX/단위",
      "moq": "최소 주문 수량",
      "location": "광동성 포산시 등",
      "sourceType": "web_search",
      "relevanceScore": 85
    }
  ],
  "analysis": "${keyword} 중국 공장 소싱 핵심 요약: 주요 생산지, 실제 가격대, WeChat으로 접촉하는 방법, 주의사항 (한국어 4~5문장)",
  "searchKeyword": "${keyword}",
  "disclaimer": "AI 검색 기반 정보입니다. 실제 거래 전 반드시 직접 연락·확인하세요."
}`;

  // Try grounding-enabled models first
  for (const [modelId, ms] of [['gemini-2.0-flash', 18000], ['gemini-2.5-flash', 22000]] as [string, number][]) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelId,
        // googleSearch grounding — SDK types lag behind API; cast required
        tools: [{ googleSearch: {} }] as unknown as Parameters<typeof genAI.getGenerativeModel>[0]['tools'],
      });
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
      ]);
      const text = result.response.text().trim();
      const parsed = parseWeChatJSON(text);
      if (parsed.posts?.length) return parsed;
    } catch (e) {
      console.warn('[WeChat-grounding]', modelId, e instanceof Error ? e.message.slice(0, 80) : String(e));
      if (!isRetryable(e)) throw e;
    }
  }

  // Fallback: no grounding
  for (const [modelId, ms] of [['gemini-2.0-flash', 15000], ['gemini-2.0-flash-lite', 12000]] as [string, number][]) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
      ]);
      return parseWeChatJSON(result.response.text().trim());
    } catch (e) {
      if (!isRetryable(e)) throw e;
    }
  }
  throw new Error('WeChat 소싱 분석 실패');
}

// Sogou articles → Gemini analysis focused on product-specific info
function buildProductFocusedPrompt(keyword: string, zhKeyword: string, articles: SogouArticle[]): string {
  const articleList = articles
    .map((a, i) => `[${i + 1}] 제목: ${a.title}\n계정: ${a.accountName}\n날짜: ${a.publishDate}\nURL: ${a.url}\n내용: ${a.snippet}`)
    .join('\n\n');

  return `당신은 중국 제조업체 소싱 전문가입니다. 아래 WeChat 기사에서 "${keyword}"(중문: ${zhKeyword}) 제품에 관한 구체적 정보를 추출하세요.

[WeChat 검색 결과]
${articleList}

[추출 지시 — 제품 정보에만 집중]
1. 기사가 실제로 ${keyword} 제품을 다루는지 확인 (무관하면 relevanceScore 20 이하)
2. 제품 스펙 추출: 재질, 규격, 적용 용도, 가격, MOQ
3. 공장인지 무역상인지 판단 (공장 직영이면 점수 높음)
4. WeChat ID, 전화번호, 연락처 힌트 추출
5. 공장 소재지 추출

[절대 금지]
- 제품과 무관한 내용을 요약에 포함하지 마세요
- 가격 정보 없으면 priceRange는 "문의 필요"로 표기
- 일반적인 WeChat 사용법 설명 금지. 기사 안의 제품 정보만 요약

순수 JSON만 반환:
{
  "posts": [
    {
      "accountName": "계정명",
      "accountType": "공장 직영 | 무역상 | 홍보 에이전시 | 미분류",
      "articleTitle": "${keyword} 관련 제품명 + 스펙",
      "publishDate": "날짜",
      "url": "URL",
      "summary": "${keyword} 제품 구체적 정보 (스펙·가격·MOQ 포함, 한국어 2~3문장)",
      "productKeywords": ["관련 키워드"],
      "contactHint": "연락처 힌트",
      "productSpecs": "확인된 제품 스펙",
      "productEvidence": "제품 일치 근거: 기사 제목/본문의 핵심 문구",
      "priceRange": "¥XX~XX/단위 또는 문의 필요",
      "moq": "최소 주문량",
      "location": "소재지",
      "sourceType": "wechat_article",
      "relevanceScore": 85
    }
  ],
  "analysis": "${keyword} WeChat 소싱 분석: 발견된 공급자 유형, 가격 동향, 추천 접근법 (한국어 3~4문장)",
  "searchKeyword": "${keyword}",
  "disclaimer": "WeChat 공개 정보 기반 AI 분석입니다. 실제 거래 전 직접 확인하세요."
}`;
}

async function analyzeArticles(prompt: string): Promise<WeChatSourcingOutput> {
  for (const [modelId, ms] of [['gemini-2.0-flash', 15000], ['gemini-2.0-flash-lite', 12000], ['gemini-2.5-flash', 20000]] as [string, number][]) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
      ]);
      return parseWeChatJSON(result.response.text().trim());
    } catch (e) {
      if (!isRetryable(e)) throw e;
      console.warn('[WeChat-analyze]', modelId, e instanceof Error ? e.message.slice(0, 80) : String(e));
    }
  }
  throw new Error('AI 분석 실패');
}

// Merge Sogou articles + grounding results, deduplicate by accountName
function mergeResults(grounding: WeChatSourcingOutput, sogou?: WeChatSourcingOutput): WeChatSourcingOutput {
  if (!sogou?.posts?.length) return grounding;
  const seen = new Set(grounding.posts.map((p) => p.accountName));
  const uniqueSogou = sogou.posts.filter((p) => !seen.has(p.accountName));
  return {
    ...grounding,
    posts: [...grounding.posts, ...uniqueSogou],
    analysis: grounding.analysis,
  };
}

function normalizeWeChatOutput(output: WeChatSourcingOutput): WeChatSourcingOutput {
  return {
    ...output,
    posts: (output.posts ?? []).map((post) => ({
      ...post,
      productKeywords: Array.isArray(post.productKeywords) ? post.productKeywords : [],
      contactHint: post.contactHint ?? '',
      priceRange: post.priceRange || '문의 필요',
      moq: post.moq || '문의 필요',
      location: post.location || '미확인',
      productSpecs: post.productSpecs || '미확인',
      productEvidence: post.productEvidence || '',
      sourceType: post.sourceType || (post.url ? 'web_search' : 'ai_estimated'),
      relevanceScore: Math.max(0, Math.min(100, Number(post.relevanceScore) || 0)),
    })),
  };
}

export async function POST(request: NextRequest) {
  try {
    const licenseKey = extractLicenseKey(request);
    if (licenseKey !== null && !isValidLicenseKey(licenseKey)) {
      return NextResponse.json({ error: 'subscription_required' }, { status: 401 });
    }
    if (licenseKey === null) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
      const allowed = await kvCheckFreeCredit(ip);
      if (!allowed) {
        return NextResponse.json({ error: 'subscription_required' }, { status: 401 });
      }
    }

    const body = (await request.json()) as { keyword: string };
    const keyword = body.keyword?.trim();
    if (!keyword) {
      return NextResponse.json({ error: '검색할 제품/키워드를 입력해주세요.' }, { status: 400 });
    }

    // Step 1: Translate keyword to Chinese manufacturing terminology
    const zhKeyword = await translateKeywordToZh(keyword);

    // Step 2: Run grounding search (B) + Sogou scraping (A) in parallel
    const [groundingResult, sogouArticles] = await Promise.allSettled([
      searchWithGrounding(keyword, zhKeyword),
      scrapeSogouWeChat(zhKeyword),
    ]);

    let output: WeChatSourcingOutput;

    if (groundingResult.status === 'fulfilled') {
      output = groundingResult.value;

      // Supplement with Sogou results if available
      if (sogouArticles.status === 'fulfilled' && sogouArticles.value.length > 0) {
        try {
          const sogouPrompt = buildProductFocusedPrompt(keyword, zhKeyword, sogouArticles.value);
          const sogouOutput = await analyzeArticles(sogouPrompt);
          output = mergeResults(output, sogouOutput);
        } catch { /* Sogou analysis failed — use grounding result only */ }
      }
    } else if (sogouArticles.status === 'fulfilled' && sogouArticles.value.length > 0) {
      // Grounding failed but Sogou has data
      const sogouPrompt = buildProductFocusedPrompt(keyword, zhKeyword, sogouArticles.value);
      output = await analyzeArticles(sogouPrompt);
    } else {
      // Both failed — last resort: grounding without tools
      output = await searchWithGrounding(keyword, zhKeyword);
    }

    output = normalizeWeChatOutput(output);

    // Filter low-relevance and generic guide-like results.
    if (output.posts?.length) {
      output.posts = output.posts.filter((p: WeChatPost) =>
        p.relevanceScore >= 55 &&
        !p.summary.includes('진입 방법') &&
        !p.summary.includes('찾는 방법') &&
        !p.articleTitle.includes('계정 유형')
      );
    }

    if (!output.posts?.length) {
      return NextResponse.json(
        { error: `"${keyword}" 관련 중국 공장 정보를 찾지 못했습니다. 더 구체적인 제품명으로 검색해보세요. (예: 알루미늄 창호 → 알루미늄 단열 창호 60시리즈)` },
        { status: 500 }
      );
    }

    // Sort by relevance
    output.posts.sort((a: WeChatPost, b: WeChatPost) => b.relevanceScore - a.relevanceScore);
    output.posts = output.posts.slice(0, 8);

    if (zhKeyword !== keyword) {
      output.translatedKeyword = zhKeyword;
    }

    kvSaveHistory({
      id: `${Date.now()}-wechat`,
      timestamp: new Date().toISOString(),
      source: 'wechat',
      query: { keyword },
      status: 200,
      supplierCount: output.posts?.length ?? 0,
      raw: output,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: output });
  } catch (error) {
    console.error('[WeChat API Error]', error);
    const message = error instanceof Error ? error.message : 'WeChat 소싱 분석 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
