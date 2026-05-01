import { GoogleGenerativeAI } from '@google/generative-ai';
import { load } from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';
import type { WeChatPost, WeChatSourcingOutput } from '../types';

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

  // Sogou WeChat search result items
  $('ul.news-list > li').each((_, el) => {
    const $el = $(el);
    const title = $el.find('h3 a').text().trim() || $el.find('.txt-box h3').text().trim();
    const accountName = $el.find('.account').text().trim() || $el.find('.s-p').text().trim();
    const publishDate = $el.find('.s-p span').last().text().trim() ||
                        $el.find('span.s-p').text().trim();
    const href = $el.find('h3 a').attr('href') || $el.find('.txt-box h3 a').attr('href') || '';
    const snippet = $el.find('p.txt-info').text().trim() || $el.find('.txt-box p').text().trim();

    if (title && href) {
      articles.push({
        title,
        accountName: accountName || '미확인 계정',
        publishDate: publishDate || '날짜 미확인',
        url: href.startsWith('http') ? href : `https://weixin.sogou.com${href}`,
        snippet,
      });
    }
  });

  return articles.slice(0, 8);
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

async function analyzeWithGemini(prompt: string): Promise<string> {
  for (const modelId of ['gemini-2.5-flash', 'gemini-1.5-flash']) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('404') && !msg.includes('no longer available') && !msg.includes('503')) throw e;
      console.warn('[WeChat] model failed:', modelId, msg.slice(0, 80));
    }
  }
  throw new Error('AI 분석 모델 응답 실패');
}

async function fallbackGeminiGrounding(keyword: string): Promise<WeChatSourcingOutput> {
  const prompt = `당신은 중국 WeChat 소싱 전문가입니다. Google 검색을 통해 "${keyword}"와 관련된 WeChat 공식계정(微信公众号) 공장 홍보 정보를 탐색하세요.

검색어: "${keyword} 微信公众号 工厂 报价 site:mp.weixin.qq.com"
또는: "${keyword} 厂家 微信 直供 批发价"

탐색 후 소싱 바이어에게 유용한 WeChat 공장 계정 정보를 분석하세요.

[출력 형식]
마크다운 코드블록(\`\`\`)이나 인용번호([1][2]) 없이 순수 JSON만 반환하세요.

{
  "posts": [
    {
      "accountName": "WeChat 공식계정명",
      "accountType": "공장 직영 | 무역상 | 미분류",
      "articleTitle": "기사 또는 포스팅 제목",
      "publishDate": "날짜 (알 수 없으면 '최근')",
      "url": "https://mp.weixin.qq.com/...",
      "summary": "소싱 관련 핵심 내용 (한국어)",
      "productKeywords": ["키워드"],
      "contactHint": "연락처 힌트 또는 빈 문자열",
      "relevanceScore": 75
    }
  ],
  "analysis": "WeChat 소싱 분석 요약 (한국어)",
  "searchKeyword": "${keyword}",
  "disclaimer": "WeChat 정보는 AI 참고용이며 직접 확인이 필요합니다."
}`;

  for (const modelId of ['gemini-2.5-flash', 'gemini-1.5-flash']) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelId,
        tools: [{ googleSearch: {} }] as never,
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      return parseWeChatJSON(text);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('404') && !msg.includes('no longer available') && !msg.includes('503')) throw e;
      console.warn('[WeChat-grounding] model failed:', modelId, msg.slice(0, 80));
    }
  }
  throw new Error('WeChat Grounding 분석 실패');
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { keyword: string };
    const keyword = body.keyword?.trim();

    if (!keyword) {
      return NextResponse.json({ error: '검색할 제품/키워드를 입력해주세요.' }, { status: 400 });
    }

    let output: WeChatSourcingOutput;

    try {
      // Step 1: Sogou WeChat 검색 스크래핑
      const articles = await scrapeSogouWeChat(keyword);

      if (articles.length === 0) {
        // 스크래핑 결과 없으면 Gemini Grounding fallback
        output = await fallbackGeminiGrounding(keyword);
      } else {
        // Step 2: Gemini로 기사 분석
        const analysisPrompt = buildWeChatAnalysisPrompt(keyword, articles);
        const analysisText = await analyzeWithGemini(analysisPrompt);
        output = parseWeChatJSON(analysisText);
      }
    } catch (scrapeErr) {
      console.warn('[WeChat] Sogou scrape failed, using Gemini grounding fallback:', scrapeErr instanceof Error ? scrapeErr.message.slice(0, 100) : String(scrapeErr));
      output = await fallbackGeminiGrounding(keyword);
    }

    if (!output.posts?.length) {
      return NextResponse.json(
        { error: 'WeChat에서 관련 공장 정보를 찾지 못했습니다. 더 구체적인 제품명(중문 포함)으로 검색해보세요.' },
        { status: 500 }
      );
    }

    // 관련성 점수 기준 정렬
    output.posts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({ success: true, data: output });
  } catch (error) {
    console.error('[WeChat API Error]', error);
    const message = error instanceof Error ? error.message : 'WeChat 소싱 분석 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
