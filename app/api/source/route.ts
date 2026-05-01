import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import type { SourcingRequest, SourcingOutput } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const COUNTRY_LABELS: Record<string, string> = {
  china: '중국',
  southeast_asia: '동남아시아 (베트남·태국·말레이시아 등)',
  europe: '유럽',
  japan: '일본',
  any: '원산지 무관',
};

const FREQUENCY_LABELS: Record<string, string> = {
  one_time: '1회성 발주',
  monthly: '월 1회 정기 발주',
  bimonthly_plus: '월 2회 이상 정기 발주',
};

function buildPrompt(req: SourcingRequest): string {
  return `당신은 20년 경력의 글로벌 소싱 전문가입니다. Google 검색을 통해 아래 소싱 요청에 맞는 해외 공급자를 실제로 탐색하고, 각 공급자의 신뢰도를 전문가 관점에서 분석해주세요.

[소싱 요청]
- 제품/자재: ${req.productDescription}
- 필요 수량: ${req.quantity}
- 예산 범위: ${req.budget || '미지정 (합리적 시세 기준으로 분석)'}
- 원산지 선호: ${COUNTRY_LABELS[req.countryPreference]}
- 발주 주기: ${FREQUENCY_LABELS[req.orderFrequency]}

[분석 지시]
1. Alibaba.com, Made-in-China.com, Global Sources에서 위 제품을 공급하는 업체 3~5개를 탐색하세요
2. 각 공급자의 신뢰도를 다음 기준으로 평가하세요:
   - 설립 연도 및 운영 기간 (오래될수록 신뢰도↑)
   - ISO·CE·SGS 등 인증서 보유 여부
   - 거래 리뷰 수 및 평점
   - 플랫폼 인증 배지 (Gold Supplier, Verified Supplier 등)
   - Red flag: 설립 6개월 미만, 연락처 불명확, 비상식적 저가, 리뷰 0개
3. 신뢰도 점수 0~100으로 채점하세요 (증거 없으면 낮은 점수)
4. 발주 주기(${FREQUENCY_LABELS[req.orderFrequency]})에 맞는 RFQ 이메일 초안을 영어와 중국어(간체)로 작성하세요

[출력 형식]
반드시 아래 JSON 구조로만 응답하세요. 마크다운 코드블록(\`\`\`)이나 인용번호([1][2])를 절대 포함하지 마세요. 순수 JSON만 반환하세요.

{
  "suppliers": [
    {
      "rank": 1,
      "name": "공급자명 (영문)",
      "platform": "Alibaba | Made-in-China | Global Sources",
      "country": "중국",
      "url": "https://...",
      "trustScore": 82,
      "trustEvidence": ["설립 12년 (2013년)", "Gold Supplier 5년 연속", "ISO 9001:2015 인증", "거래 리뷰 1,200건+"],
      "redFlags": [],
      "productMatch": "직접 제조 확인 / OEM 가능",
      "estimatedPrice": "USD 8~12/unit (MOQ 기준)",
      "moq": "500개",
      "summary": "이 공급자를 1순위로 추천하는 이유를 2~3문장으로 설명"
    }
  ],
  "recommendation": "전체 공급자 비교 후 최종 추천 요약 (2~4문장)",
  "rfqEmail": {
    "en": "Dear [Supplier Name],\\n\\nWe are [Company Name], a Korean manufacturing/construction company interested in sourcing [product]. Please provide your best quote for:\\n\\n- Product: ${req.productDescription}\\n- Quantity: ${req.quantity}\\n- Required delivery: [date]\\n- Payment terms: T/T 30% deposit\\n\\nPlease also confirm:\\n1. Can you provide product samples?\\n2. What certifications does your product carry?\\n3. What is your lead time?\\n\\nBest regards,\\n[Your Name]",
    "zh": "您好，\\n\\n我们是韩国的[公司名称]，希望采购[产品名称]。请提供以下报价：\\n\\n- 产品：${req.productDescription}\\n- 数量：${req.quantity}\\n- 交货期：[日期]\\n- 付款方式：T/T 30%预付款\\n\\n请确认：\\n1. 是否可以提供样品？\\n2. 产品有哪些认证？\\n3. 生产周期是多久？\\n\\n期待您的回复，\\n[您的姓名]"
  },
  "disclaimer": "본 분석은 AI가 공개 정보를 기반으로 생성한 참고용 자료입니다. 특정 공급자를 보증하지 않으며, 최종 거래 결정은 반드시 본인이 직접 확인 후 진행하시기 바랍니다. 공급자 정보는 변경될 수 있습니다."
}`;
}

async function callGemini(prompt: string, useGrounding: boolean): Promise<{ text: string; groundingUsed: boolean }> {
  const modelConfig = useGrounding
    ? { model: 'gemini-2.0-flash', tools: [{ googleSearch: {} }] as never }
    : { model: 'gemini-2.5-flash' };

  const model = genAI.getGenerativeModel(modelConfig);
  const result = await model.generateContent(prompt);
  return { text: result.response.text().trim(), groundingUsed: useGrounding };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SourcingRequest;
    const { productDescription, quantity } = body;

    if (!productDescription?.trim()) {
      return NextResponse.json({ error: '제품/자재명을 입력해주세요.' }, { status: 400 });
    }
    if (!quantity?.trim()) {
      return NextResponse.json({ error: '필요 수량을 입력해주세요.' }, { status: 400 });
    }

    const req: SourcingRequest = {
      productDescription: body.productDescription,
      quantity: body.quantity,
      budget: body.budget,
      countryPreference: body.countryPreference ?? 'china',
      orderFrequency: body.orderFrequency ?? 'one_time',
    };

    const prompt = buildPrompt(req);

    // 전략: 1차(grounding) → 2차(grounding 없이 2.5-flash) → 3차(2.0-flash-lite)
    const ATTEMPTS: Array<{ useGrounding: boolean; model?: string }> = [
      { useGrounding: true },
      { useGrounding: false },
    ];

    let text = '';
    let groundingUsed = false;
    let lastError: Error | null = null;

    for (const attempt of ATTEMPTS) {
      try {
        const modelConfig = attempt.useGrounding
          ? { model: 'gemini-2.0-flash', tools: [{ googleSearch: {} }] as never }
          : { model: 'gemini-2.5-flash' };
        const model = genAI.getGenerativeModel(modelConfig);
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
        groundingUsed = attempt.useGrounding;
        break;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        const msg = lastError.message;
        const isRetryable =
          msg.includes('503') || msg.includes('Service Unavailable') ||
          msg.includes('429') || msg.includes('Too Many') ||
          msg.includes('400') || msg.includes('403'); // grounding 미지원
        if (!isRetryable) throw lastError;
        console.warn(`[GloSource] attempt failed (${attempt.useGrounding ? 'grounding' : 'no-grounding'}):`, msg.slice(0, 100));
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    // 최후 폴백: gemini-2.0-flash-lite
    if (!text) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
        groundingUsed = false;
      } catch (e) {
        throw lastError ?? new Error('모든 AI 모델이 응답하지 않습니다. 잠시 후 다시 시도해주세요.');
      }
    }

    // JSON 파싱 (마크다운 코드블록 제거)
    let jsonText = text;
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    // 인용번호 제거 ([1], [2] 등)
    jsonText = jsonText.replace(/\[\d+\]/g, '');

    let parsed: Omit<SourcingOutput, 'groundingUsed'>;
    try {
      parsed = JSON.parse(jsonText) as Omit<SourcingOutput, 'groundingUsed'>;
    } catch {
      console.error('[GloSource] JSON parse failed:', jsonText.slice(0, 200));
      return NextResponse.json({ error: 'AI 응답을 파싱하는 데 실패했습니다. 다시 시도해주세요.' }, { status: 500 });
    }

    if (!parsed.suppliers || parsed.suppliers.length === 0) {
      return NextResponse.json({ error: '공급자를 찾지 못했습니다. 제품 설명을 더 구체적으로 입력해주세요.' }, { status: 500 });
    }

    const output: SourcingOutput = { ...parsed, groundingUsed };

    return NextResponse.json({ success: true, data: output });
  } catch (error) {
    console.error('[GloSource API Error]', error);
    const message = error instanceof Error ? error.message : '소싱 분석 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
