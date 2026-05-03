import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { isValidLicenseKey, extractLicenseKey } from '../../../lib/licenseAuth';
import { kvCheckFreeCredit } from '../../../lib/kv';

export const maxDuration = 30;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ImageAnalysisResult {
  productNameKo: string;
  productNameEn: string;
  productNameZh: string;
  specs: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  searchQuery: string;
}

const VALID_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

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

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: '이미지가 없습니다.' }, { status: 400 });
    }
    if (!VALID_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'JPEG, PNG, WebP 이미지만 지원합니다.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: '이미지 크기는 10MB 이하여야 합니다.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `당신은 글로벌 B2B 소싱 전문가입니다. 이미지에 있는 제품/자재를 분석하여 1688.com, Alibaba 소싱에 최적화된 정보를 추출해주세요.

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "productNameKo": "한국어 제품명 (구체적으로, 예: SS400 강판 6T)",
  "productNameEn": "English product name",
  "productNameZh": "中文产品名称（1688搜索用）",
  "specs": "보이는 규격/사양 (재질, 크기, 두께, 색상 등 최대한 상세히)",
  "category": "제품 카테고리 (예: 건축자재, 금속재료, 전자부품, 기계부품, 화학원료)",
  "confidence": "high 또는 medium 또는 low",
  "searchQuery": "1688.com 검색 최적 중국어 키워드 (공백 없이, 예: 镀锌钢板)"
}

규칙:
- 건설 현장 자재라면 KS 규격 병기
- confidence: high=명확히 식별, medium=대략 파악, low=불분명
- 알 수 없는 항목은 빈 문자열로 설정`;

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType: file.type } },
      prompt,
    ]);

    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI가 제품을 인식하지 못했습니다. 다른 이미지를 시도해보세요.');
    }

    const data = JSON.parse(jsonMatch[0]) as ImageAnalysisResult;

    if (!data.productNameKo && !data.productNameEn) {
      return NextResponse.json(
        { error: '제품을 인식할 수 없습니다. 더 선명한 이미지를 업로드해주세요.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    const message = e instanceof Error ? e.message : '이미지 분석 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
