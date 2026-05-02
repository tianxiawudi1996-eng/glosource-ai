import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { isValidLicenseKey, extractLicenseKey } from '../../lib/licenseAuth';
import { getCategoryByCode } from '../../lib/categories';
import type { Category } from '../../lib/categories';
import type { SourcingRequest, SourcingOutput } from './types';

export const maxDuration = 60;

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

function buildCategorySection(cat: Category): string {
  return `
[카테고리 컨텍스트 — 아래 정보를 검색어 및 분석에 적극 활용하세요]
대분류: ${cat.l1NameKo} (${cat.l1NameZh})
소분류: ${cat.l2NameKo} (${cat.l2NameZh})
중국어 검색어: ${cat.searchTermsZh.join(', ')}
관련 HS코드: ${cat.hsCodes.join(', ')}
관련 인증: ${cat.certifications.join(', ')}
일반 가격대: ${cat.typicalPriceRange}
권장 수량 단위: ${cat.quantityUnitSuggestion}
`;
}

function buildQuantityUnitNote(req: SourcingRequest): string {
  if (!req.quantityUnit) return '';
  const unitMap: Record<string, string> = {
    kg: '(please also quote per kg for weight-based pricing)',
    ton: '(please quote per metric ton)',
    m2: '(please quote per square meter / ㎡)',
    m3: '(please quote per cubic meter / ㎥)',
    m: '(please quote per linear meter)',
    set: '(please quote per complete set)',
    개: '',
  };
  return unitMap[req.quantityUnit] ?? '';
}

function buildPrompt(req: SourcingRequest, categoryContext?: Category): string {
  const catSection = categoryContext ? buildCategorySection(categoryContext) : '';
  const unitNote = buildQuantityUnitNote(req);

  return `당신은 20년 경력의 글로벌 소싱 전문가입니다. Google 검색을 통해 아래 소싱 요청에 맞는 해외 공급자를 실제로 탐색하고, 각 공급자의 신뢰도를 전문가 관점에서 분석해주세요.
${catSection}
[소싱 요청]
- 제품/자재: ${req.productDescription}
- 필요 수량: ${req.quantity}${unitNote ? ' ' + unitNote : ''}
- 예산 범위: ${req.budget || '미지정 (합리적 시세 기준으로 분석)'}
- 원산지 선호: ${COUNTRY_LABELS[req.countryPreference]}
- 발주 주기: ${FREQUENCY_LABELS[req.orderFrequency]}

[탐색 우선순위 — 아래 순서로 반드시 탐색]
1순위: 1688.com (중국 내수 B2B 도매 플랫폼 — 공장 직거래, Alibaba 대비 30~50% 저렴한 원가)
   → 검색어 예시: "${categoryContext ? categoryContext.searchTermsZh[0] : req.productDescription} 厂家直销 site:1688.com"
2순위: Alibaba.com (글로벌 수출 B2B — 단, 무역상 포함 주의)
3순위: DHgate.com (소량 발주 특화), Made-in-China.com, Global Sources

[중요 규칙 — 반드시 준수]
1. Google 그라운딩 검색으로 실제 확인한 공급자만 반환하라
2. URL을 직접 확인하지 못했다면 url은 빈 문자열("")로, verificationStatus는 "ai_estimated"로 설정하라
3. 1688.com/Alibaba/Made-in-China URL을 추측으로 생성하지 마라 — 존재하지 않는 URL은 신뢰를 파괴한다
4. 확인된 공급자가 3개 미만이더라도 추측으로 수를 채우지 마라 — 빈 배열보다 정확한 2개가 낫다
5. 제품명 설명(${req.productDescription})을 우선 권위로 사용하고, 카테고리 컨텍스트는 보조 힌트로만 사용하라

[분석 지시]
1. 위 우선순위대로 3~5개 공급자를 탐색하세요. 1688.com 공급자를 최소 2개 포함하세요
2. 각 공급자의 신뢰도를 다음 기준으로 평가하세요:
   - 설립 연도 및 운영 기간 (오래될수록 신뢰도↑)
   - ISO·CE·SGS 등 인증서 보유 여부${categoryContext ? ` (특히 ${categoryContext.certifications.join(', ')})` : ''}
   - 거래 리뷰 수 및 평점
   - 플랫폼 인증 배지 (Gold Supplier, 诚信通, Verified Supplier 등)
   - Red flag: 설립 6개월 미만, 연락처 불명확, 비상식적 저가, 리뷰 0개
3. 1688.com 공급자의 경우 CNY 가격과 USD 환산가를 모두 표기하세요
4. productStage를 원자재(raw_material)/반완성품(semi_finished)/완성품(finished_product)으로 구분하세요
5. 신뢰도 점수 0~100으로 채점하세요 (증거 없으면 낮은 점수)
6. 발주 주기(${FREQUENCY_LABELS[req.orderFrequency]})에 맞는 RFQ 이메일 초안을 영어와 중국어(간체)로 작성하세요
   - RFQ 영문에 수량 단위 명시: ${req.quantity}${req.quantityUnit ? ' ' + req.quantityUnit : ''}${unitNote ? ' ' + unitNote : ''}

[출력 형식]
반드시 아래 JSON 구조로만 응답하세요. 마크다운 코드블록(\`\`\`)이나 인용번호([1][2])를 절대 포함하지 마세요. 순수 JSON만 반환하세요.

{
  "suppliers": [
    {
      "rank": 1,
      "name": "공급자명 (영문/중문)",
      "platform": "1688 | Alibaba | DHgate | Made-in-China | Global Sources | WeChat",
      "country": "중국",
      "url": "",
      "verificationStatus": "grounding_confirmed | ai_estimated",
      "productStage": "raw_material | semi_finished | finished_product",
      "trustScore": 82,
      "trustEvidence": ["설립 12년 (2013년)", "诚信通 인증 5년", "ISO 9001:2015", "거래 리뷰 3,200건+"],
      "redFlags": [],
      "productMatch": "직접 제조 확인 / OEM 가능",
      "estimatedPrice": "¥45~60/unit (CNY) ≈ USD 6~8/unit",
      "moq": "500개",
      "leadTimeDays": "15~20일",
      "hscode": "${categoryContext ? categoryContext.hsCodes[0] : ''}",
      "exportToKoreaExperience": true,
      "summary": "1688 공장직거래로 Alibaba 대비 약 40% 저렴. OEM 최소 200개부터 가능."
    }
  ],
  "recommendation": "전체 공급자 비교 후 최종 추천 요약 (2~4문장). 1688 vs Alibaba 가격 차이 반드시 언급.",
  "rfqEmail": {
    "en": "Dear [Supplier Name],\\n\\nWe are [Company Name], a Korean company interested in sourcing ${req.productDescription}.\\n\\n- Product: ${req.productDescription}\\n- Quantity: ${req.quantity}${req.quantityUnit ? ' ' + req.quantityUnit : ''}${unitNote ? '\\n- Unit note: ' + unitNote : ''}\\n- Payment: T/T 30% deposit, 70% before shipment\\n\\nPlease confirm: 1) Unit price (CNY + USD)? 2) Lead time? 3) Sample available? 4) ${categoryContext ? categoryContext.certifications[0] + ' cert available?' : 'Certifications?'} 5) Korea export experience?\\n\\nBest regards,\\n[Your Name]",
    "zh": "您好，\\n\\n我们是韩国公司，在1688平台找到贵公司，希望采购${req.productDescription}。\\n\\n- 产品：${req.productDescription}\\n- 数量：${req.quantity}${req.quantityUnit ? ' ' + req.quantityUnit : ''}\\n- 付款方式：T/T 30%预付款\\n\\n请确认：1) 含CNY和USD单价？2) 交货期？3) 是否提供样品？4) 出口韩国经验？\\n\\n期待合作，\\n[您的姓名]"
  },
  "disclaimer": "본 분석은 AI가 공개 정보를 기반으로 생성한 참고용 자료입니다. AI 리서치 결과이므로 반드시 공급자 직접 확인 후 거래하시기 바랍니다."
}`;
}


export async function POST(request: NextRequest) {
  try {
    // License key validation
    const licenseKey = extractLicenseKey(request);
    if (licenseKey !== null && !isValidLicenseKey(licenseKey)) {
      return NextResponse.json({ error: 'subscription_required' }, { status: 401 });
    }

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
      categoryCode: body.categoryCode,
      categoryNameZh: body.categoryNameZh,
      quantityUnit: body.quantityUnit,
    };

    const categoryContext = req.categoryCode ? getCategoryByCode(req.categoryCode) : undefined;
    const prompt = buildPrompt(req, categoryContext);

    // 전략: 1차(2.5-flash + grounding) → 2차(2.5-flash no-grounding) → 3차(2.0-flash) → 4차(2.0-flash-lite)
    const MODELS = [
      { model: 'gemini-2.0-flash',      ms: 15000 },
      { model: 'gemini-2.0-flash-lite', ms: 12000 },
      { model: 'gemini-2.5-flash',      ms: 20000 },
    ];

    let text = '';
    let groundingUsed = false;
    let lastError: Error | null = null;

    for (const m of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: m.model });
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), m.ms)),
        ]);
        text = result.response.text().trim();
        groundingUsed = false;
        break;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        const msg = lastError.message;
        const isRetryable =
          msg.includes('503') || msg.includes('Service Unavailable') ||
          msg.includes('429') || msg.includes('Too Many') ||
          msg.includes('400') || msg.includes('403') ||
          msg.includes('404') || msg.includes('no longer available') ||
          msg === 'timeout';
        if (!isRetryable) throw lastError;
        console.warn(`[GloSource] attempt failed (${m.model}):`, msg.slice(0, 120));
        await new Promise(r => setTimeout(r, 500));
      }
    }

    if (!text) {
      throw lastError ?? new Error('모든 AI 모델이 응답하지 않습니다. 잠시 후 다시 시도해주세요.');
    }

    // JSON 추출 (마크다운/thinking/인용번호 제거)
    let jsonText = text;
    if (jsonText.includes('```')) {
      const m = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (m) jsonText = m[1].trim();
    }
    jsonText = jsonText.replace(/\[\d+\]/g, '').replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonText = jsonMatch[0];

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
