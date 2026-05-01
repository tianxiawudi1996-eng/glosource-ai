import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { isValidLicenseKey, extractLicenseKey } from '../../../lib/licenseAuth';
import { getCategoryByCode } from '../../../lib/categories';
import type { Category } from '../../../lib/categories';
import type { SourcingRequest, SourcingOutput } from '../types';

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function build1688Prompt(req: SourcingRequest, categoryContext?: Category): string {
  const catSection = categoryContext ? `
[카테고리 컨텍스트 — 검색어 및 분석에 적극 활용]
대분류: ${categoryContext.l1NameKo} (${categoryContext.l1NameZh})
소분류: ${categoryContext.l2NameKo} (${categoryContext.l2NameZh})
중국어 검색어: ${categoryContext.searchTermsZh.join(', ')}
관련 HS코드: ${categoryContext.hsCodes.join(', ')}
관련 인증: ${categoryContext.certifications.join(', ')}
일반 가격대: ${categoryContext.typicalPriceRange}
` : '';

  return `당신은 중국 내수 B2B 소싱 전문가입니다. 1688.com에서 아래 제품의 공장 직거래 공급자를 탐색하세요.

1688.com은 알리바바 그룹의 중국 내수 도매 플랫폼으로, Alibaba.com 대비 30~50% 저렴한 실제 원가 가격입니다.
${catSection}
[소싱 요청]
- 제품: ${req.productDescription}
- 수량: ${req.quantity}
- 예산: ${req.budget || '미지정'}

[중요 규칙 — 반드시 준수]
1. Google 그라운딩 검색으로 실제 확인한 공급자만 반환하라
2. URL을 직접 확인하지 못했다면 url은 빈 문자열("")로 설정하라
3. 1688.com URL을 추측으로 생성하지 마라 — 존재하지 않는 URL은 신뢰를 파괴한다
4. 확인된 공급자가 3개 미만이더라도 추측으로 수를 채우지 마라
5. 제품명(${req.productDescription})을 우선 권위로, 카테고리는 보조 힌트로만 사용하라

[탐색 지시]
1. 다음 검색을 통해 1688.com 공급자 3~5개를 찾으세요:
   - "site:1688.com ${categoryContext ? categoryContext.searchTermsZh[0] : req.productDescription} 厂家直销"
   - "1688 ${req.productDescription} 批发 工厂"
   - "${req.productDescription} 1688网 诚信通"

2. 각 공급자에 대해 다음 정보를 수집하세요:
   - 회사명 (중문 + 영문 번역)
   - 1688.com 상품 페이지 URL
   - CNY 단가 및 MOQ
   - 诚信通(청신통) 인증 여부 — 1688의 유료 신뢰 인증 배지
   - 거래 리뷰 수, 재구매율
   - 공장 소재지 (省/市)
   - OEM/ODM 가능 여부
   - 연간 생산 능력 (年产量)

3. 신뢰도 평가 기준 (1688 특화):
   - 诚信通 年限 (年数가 많을수록 신뢰도↑)
   - 实力商家 배지 보유 여부
   - 거래 리뷰 수 500건 이상 = 신뢰
   - Red flag: 诚信通 없음, 리뷰 0건, 가격이 비상식적으로 낮음

4. Alibaba.com 동일 제품과 가격 비교를 반드시 포함하세요

[출력 형식]
마크다운 코드블록(\`\`\`)이나 인용번호([1][2]) 없이 순수 JSON만 반환하세요.

{
  "suppliers": [
    {
      "rank": 1,
      "name": "공급자명 (중문/영문)",
      "platform": "1688",
      "country": "중국",
      "url": "https://detail.1688.com/...",
      "trustScore": 85,
      "trustEvidence": ["诚信通 8년", "실력상가 인증", "재구매율 92%", "거래 리뷰 4,500건"],
      "redFlags": [],
      "productMatch": "공장 직접 제조, OEM 최소 200개",
      "estimatedPrice": "¥38~55/unit ≈ USD 5.3~7.6/unit (Alibaba 대비 약 40% 저렴)",
      "moq": "200개",
      "summary": "광동성 소재 10년 이상 운영 공장. 诚信通 인증 보유. 소량 OEM 가능하며 한국 바이어 거래 경험 있음."
    }
  ],
  "recommendation": "1688 공장직거래 최종 추천 (Alibaba 대비 절감액 명시)",
  "rfqEmail": {
    "en": "Dear Factory Manager,\\n\\nWe found your factory on 1688.com and are interested in direct sourcing of ${req.productDescription}.\\n\\n- Required quantity: ${req.quantity}\\n- Payment: T/T 30% deposit, 70% before shipment\\n- We are a Korean company seeking long-term partnership\\n\\nPlease quote: unit price (CNY/USD), MOQ, lead time, OEM availability\\n\\nBest regards,\\n[Your Name]",
    "zh": "您好，\\n\\n我们在1688平台找到贵工厂，希望直接采购${req.productDescription}。\\n\\n- 采购数量：${req.quantity}\\n- 付款方式：T/T 30%预付\\n- 我们是韩国公司，寻求长期合作\\n\\n请报：单价（含CNY/USD）、最小起订量、交期、是否可贴牌OEM\\n\\n期待回复，\\n[您的姓名]"
  },
  "disclaimer": "1688.com은 중국 내수용 플랫폼입니다. 국제 배송 및 통관은 포워딩 업체를 통해 진행하시기 바랍니다. 본 분석은 AI 참고용 자료입니다.",
  "groundingUsed": true
}`;
}

function extractJSON(text: string): string {
  let clean = text.trim();
  // 마크다운 코드블록 제거
  if (clean.includes('```')) {
    const m = clean.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (m) clean = m[1].trim();
  }
  // 인용번호 제거
  clean = clean.replace(/\[\d+\]/g, '');
  // Gemini thinking 태그 제거
  clean = clean.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
  // JSON 객체 추출 (앞뒤 텍스트 무시)
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) return match[0];
  return clean;
}

export async function POST(request: NextRequest) {
  try {
    // License key validation
    const licenseKey = extractLicenseKey(request);
    if (licenseKey !== null && !isValidLicenseKey(licenseKey)) {
      return NextResponse.json({ error: 'subscription_required' }, { status: 401 });
    }

    const body = (await request.json()) as Pick<SourcingRequest, 'productDescription' | 'quantity' | 'budget' | 'categoryCode'>;

    if (!body.productDescription?.trim()) {
      return NextResponse.json({ error: '제품/자재명을 입력해주세요.' }, { status: 400 });
    }
    if (!body.quantity?.trim()) {
      return NextResponse.json({ error: '필요 수량을 입력해주세요.' }, { status: 400 });
    }

    const req: SourcingRequest = {
      productDescription: body.productDescription,
      quantity: body.quantity,
      budget: body.budget,
      countryPreference: 'china',
      orderFrequency: 'one_time',
      categoryCode: body.categoryCode,
    };

    const categoryContext = req.categoryCode ? getCategoryByCode(req.categoryCode) : undefined;
    const prompt = build1688Prompt(req, categoryContext);
    let text = '';
    let groundingUsed = false;

    const MODELS = [
      { model: 'gemini-2.5-flash', grounding: true },
      { model: 'gemini-2.5-flash', grounding: false },
      { model: 'gemini-1.5-flash', grounding: false },
    ];
    for (const m of MODELS) {
      try {
        const cfg = m.grounding
          ? { model: m.model, tools: [{ googleSearch: {} }] as never }
          : { model: m.model };
        const model = genAI.getGenerativeModel(cfg);
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
        groundingUsed = m.grounding;
        break;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const retryable = msg.includes('503') || msg.includes('429') || msg.includes('400') ||
          msg.includes('403') || msg.includes('404') || msg.includes('no longer available');
        if (!retryable) throw new Error('1688 소싱 분석 실패: ' + msg.slice(0, 80));
        console.warn('[1688] attempt failed:', m.model, msg.slice(0, 80));
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    if (!text) throw new Error('1688 소싱 분석에 실패했습니다. 잠시 후 다시 시도해주세요.');

    const jsonText = extractJSON(text);

    let parsed: Omit<SourcingOutput, 'groundingUsed'>;
    try {
      parsed = JSON.parse(jsonText) as Omit<SourcingOutput, 'groundingUsed'>;
    } catch {
      console.error('[1688] JSON parse failed:', jsonText.slice(0, 200));
      return NextResponse.json({ error: 'AI 응답 파싱 실패. 다시 시도해주세요.' }, { status: 500 });
    }

    if (!parsed.suppliers?.length) {
      return NextResponse.json({ error: '1688에서 공급자를 찾지 못했습니다. 제품 설명을 더 구체적으로 입력해주세요.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { ...parsed, groundingUsed } });
  } catch (error) {
    console.error('[1688 API Error]', error);
    const message = error instanceof Error ? error.message : '1688 소싱 분석 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
