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

const SOGOU_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Referer': 'https://weixin.sogou.com/',
};

interface SogouArticle {
  title: string;
  accountName: string;
  publishDate: string;
  url: string;
  snippet: string;
}

// Translates a Korean (or any language) keyword to Chinese construction industry terminology.
// Returns the original keyword on any failure so callers can always proceed.
async function translateKeywordToZh(keyword: string): Promise<string> {
  const CHINESE_RANGE = /[一-鿿]/;
  // If the keyword already contains enough Chinese, skip translation
  const chineseCount = [...keyword].filter((c) => CHINESE_RANGE.test(c)).length;
  if (chineseCount >= 2) return keyword;

  const prompt = `Translate the following product name to concise Chinese construction industry terminology (3–8 Chinese characters, no explanation, no romanization):
"${keyword}"
Reply with only the Chinese translation.`;

  for (const modelId of ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite']) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await model.generateContent(prompt);
      const translated = result.response.text().trim().replace(/["']/g, '');
      // Validate: must contain Chinese characters and be under 30 chars
      if (CHINESE_RANGE.test(translated) && translated.length <= 30) {
        return translated;
      }
    } catch {
      // silent — fall through to next model
    }
  }
  return keyword; // fallback: original keyword
}

async function scrapeSogouWeChat(keyword: string): Promise<SogouArticle[]> {
  const query = encodeURIComponent(`${keyword} 工厂 报价 厂家直供`);
  const url = `https://weixin.sogou.com/weixin?type=2&query=${query}&ie=utf8&page=1`;

  const res = await fetch(url, {
    headers: SOGOU_HEADERS,
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Sogou HTTP ${res.status}`);

  const html = await res.text();
  const $ = load(html);
  const articles: SogouArticle[] = [];

  // Sogou changes its HTML periodically — try multiple selector patterns
  $('ul.news-list li, .news-list li').each((_, el) => {
    const $el = $(el);

    // Find title link: h3>a is standard, but may be .txt-box a[href] or data-linktype attr
    const $h3a = $el.find('h3 a').first();
    const $txtA = $el.find('.txt-box a[href]').first();
    const $anyA = $el.find('a[href]').first();
    const $titleLink = $h3a.length ? $h3a : $txtA.length ? $txtA : $anyA;

    const title = $titleLink.text().trim()
      || $el.find('h3').text().trim()
      || $el.find('.txt-box').clone().find('p,span').remove().end().text().trim();

    const href = $titleLink.attr('href') || '';

    const accountName = $el.find('.account').text().trim()
      || $el.find('[class*="account"]').text().trim()
      || $el.find('.s-p a').first().text().trim()
      || '미확인 계정';

    const publishDate = $el.find('.s-p span').last().text().trim()
      || $el.find('.s-p').text().replace(accountName, '').trim()
      || '날짜 미확인';

    const snippet = $el.find('p.txt-info').text().trim()
      || $el.find('.txt-box p').text().trim()
      || '';

    if (title && href) {
      articles.push({
        title,
        accountName,
        publishDate,
        url: href.startsWith('http') ? href : `https://weixin.sogou.com${href}`,
        snippet,
      });
    }
  });

  return articles.slice(0, 12); // increased from 8 to provide more candidates before filtering
}

function buildWeChatAnalysisPrompt(keyword: string, articles: SogouArticle[]): string {
  const articleList = articles
    .map((a, i) => `[${i + 1}] 제목: ${a.title}\n계정: ${a.accountName}\n날짜: ${a.publishDate}\nURL: ${a.url}\n요약: ${a.snippet}`)
    .join('\n\n');

  return `당신은 중국 WeChat(微信) 마케팅 전문가입니다. 아래는 "${keyword}"로 검색한 WeChat 공식계정(公众号) 기사 목록입니다.

각 기사를 분석하여 소싱 바이어에게 유용한 정보를 추출하세요.

[검색된 WeChat 기사]
${articleList}

[분석 지시]
1. 각 기사의 발행 계정이 실제 공장/제조업체인지, 무역상인지, 홍보 에이전시인지 판단하세요
2. 제품 관련 가격/MOQ/연락처 정보가 있으면 추출하세요
3. 소싱 관련성 점수를 0~100으로 매기세요 (공장 직거래 정보일수록 높음)
4. 전체 WeChat 기사 분석 결과를 한국어로 요약하세요

[출력 형식]
마크다운 코드블록(\`\`\`)이나 인용번호([1][2]) 없이 순수 JSON만 반환하세요.

{
  "posts": [
    {
      "accountName": "계정명 (중문)",
      "accountType": "공장 직영 | 무역상 | 홍보 에이전시 | 미분류",
      "articleTitle": "기사 제목",
      "publishDate": "날짜",
      "url": "https://...",
      "summary": "소싱 관련 핵심 내용 요약 (한국어, 2~3문장)",
      "productKeywords": ["키워드1", "키워드2"],
      "contactHint": "WeChat ID, 전화번호 등 연락처 힌트 (없으면 빈 문자열)",
      "relevanceScore": 85
    }
  ],
  "analysis": "전체 WeChat 소싱 인텔리전스 요약. 주목할 공장 계정, 가격 동향, 연락 방법 등 (한국어 3~5문장)",
  "searchKeyword": "${keyword}",
  "disclaimer": "WeChat 기사 정보는 공장 홍보 직원이 올린 실시간 자료이나, AI 분석 결과이므로 반드시 직접 연락 확인 후 거래하세요."
}`;
}

function isRateLimitOrUnavailable(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes('404') || msg.includes('429') || msg.includes('503') ||
    msg.includes('no longer available') || msg.includes('Resource exhausted');
}

async function analyzeWithGemini(prompt: string): Promise<string> {
  for (const [modelId, ms] of [['gemini-2.0-flash', 15000], ['gemini-2.0-flash-lite', 12000], ['gemini-2.5-flash', 20000]] as [string, number][]) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), ms)),
      ]);
      return result.response.text().trim();
    } catch (e) {
      const isTimeout = e instanceof Error && e.message === 'timeout';
      if (!isRateLimitOrUnavailable(e) && !isTimeout) throw e;
      console.warn('[WeChat] model failed:', modelId, (e instanceof Error ? e.message : String(e)).slice(0, 80));
    }
  }
  throw new Error('AI 분석 모델 응답 실패');
}

async function fallbackGeminiGrounding(keyword: string): Promise<WeChatSourcingOutput> {
  // WeChat is a closed platform — articles aren't indexed by Google Search.
  // Use Gemini knowledge-based sourcing intelligence instead.
  const prompt = `당신은 10년 경력의 중국 WeChat 소싱 전문가입니다. "${keyword}" 제품 카테고리에서 WeChat(微信)을 통해 중국 공장 직거래를 하는 방법을 소싱 바이어에게 안내하세요.

실제로 존재하는 WeChat 공식계정(微信公众号) 유형, 행업군 WeChat 그룹, 공장 영업사원 접촉 방법 등을 구체적으로 설명하세요.

[답변 기준]
1. "${keyword}" 제품을 판매하는 실제 공장 유형(산지별: 광동성, 저장성, 장쑤성 등)에서 운영하는 WeChat 공식계정 패턴을 설명하세요
2. 해당 제품 카테고리에서 활성화된 업계 WeChat 그룹(微信群) 진입 방법을 알려주세요
3. 1688.com 또는 Made-in-China.com 공급자의 WeChat ID를 찾는 구체적 방법을 알려주세요
4. WeChat 소싱 시 흔히 쓰이는 협상 문구(중국어)를 포함하세요
5. 가격 협상 팁과 샘플 요청 절차를 알려주세요

[출력 형식]
마크다운 코드블록(\`\`\`)이나 인용번호([1][2]) 없이 순수 JSON만 반환하세요.

{
  "posts": [
    {
      "accountName": "공식계정명 (카테고리 대표 계정 패턴, 예: 佛山铝材行业协会)",
      "accountType": "공장 직영 | 업계 협회 | 소싱 에이전트",
      "articleTitle": "이 계정 유형이 주로 올리는 콘텐츠 설명",
      "publishDate": "상시 활성",
      "url": "https://mp.weixin.qq.com/",
      "summary": "${keyword} 소싱에 이 WeChat 채널이 유용한 이유와 접근 방법 (한국어, 2~3문장)",
      "productKeywords": ["${keyword} 관련 중국어 검색어"],
      "contactHint": "이 채널 유형의 영업사원에게 연락하는 방법 (예: 공식계정 메시지 → 담당자 WeChat ID 요청)",
      "relevanceScore": 80
    }
  ],
  "analysis": "「${keyword}」 WeChat 소싱 전략 종합 안내: 어떤 지역 공장을 타겟해야 하는지, 어떤 업계 그룹에 진입해야 하는지, 가격 협상은 어떻게 시작하는지 (한국어 4~6문장). 실제 중국어 협상 문구 2~3개 포함.",
  "searchKeyword": "${keyword}",
  "disclaimer": "이 정보는 AI가 생성한 WeChat 소싱 가이드입니다. 실제 계정 정보와 다를 수 있으며, 반드시 직접 검색 및 확인 후 거래하세요."
}`;

  for (const [modelId, ms] of [['gemini-2.0-flash', 15000], ['gemini-2.0-flash-lite', 12000], ['gemini-2.5-flash', 20000]] as [string, number][]) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), ms)),
      ]);
      const text = result.response.text().trim();
      return parseWeChatJSON(text);
    } catch (e) {
      const isTimeout = e instanceof Error && e.message === 'timeout';
      if (!isRateLimitOrUnavailable(e) && !isTimeout) throw e;
      console.warn('[WeChat-intelligence] model failed:', modelId, (e instanceof Error ? e.message : String(e)).slice(0, 80));
    }
  }
  throw new Error('WeChat 소싱 인텔리전스 생성 실패');
}

export async function POST(request: NextRequest) {
  try {
    // License key validation
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

    // Step 0: Pre-translate Korean keyword to Chinese for better Sogou results
    const translatedKeyword = await translateKeywordToZh(keyword);
    const searchKeyword = translatedKeyword !== keyword ? translatedKeyword : keyword;

    let output: WeChatSourcingOutput;

    try {
      const articles = await scrapeSogouWeChat(searchKeyword);

      if (articles.length === 0) {
        output = await fallbackGeminiGrounding(keyword);
      } else {
        const analysisPrompt = buildWeChatAnalysisPrompt(keyword, articles);
        const analysisText = await analyzeWithGemini(analysisPrompt);
        output = parseWeChatJSON(analysisText);
      }
    } catch (scrapeErr) {
      console.warn('[WeChat] Sogou scrape failed, using Gemini grounding fallback:', scrapeErr instanceof Error ? scrapeErr.message.slice(0, 100) : String(scrapeErr));
      output = await fallbackGeminiGrounding(keyword);
    }

    // Filter out low-relevance results
    if (output.posts?.length) {
      output.posts = output.posts.filter((p) => p.relevanceScore >= 50);
    }

    // If all posts filtered out, use knowledge-based fallback
    if (!output.posts?.length) {
      console.warn('[WeChat] All posts filtered (relevanceScore < 50), using knowledge fallback');
      output = await fallbackGeminiGrounding(keyword);
    }

    if (!output.posts?.length) {
      return NextResponse.json(
        { error: 'WeChat에서 관련 공장 정보를 찾지 못했습니다. 더 구체적인 제품명(중문 포함)으로 검색해보세요.' },
        { status: 500 }
      );
    }

    // Sort by relevance
    output.posts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Include translated keyword in response so client can display it as a chip
    if (translatedKeyword !== keyword) {
      output.translatedKeyword = translatedKeyword;
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
