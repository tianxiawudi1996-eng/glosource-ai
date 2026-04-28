import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type WorkerType = 'office' | 'field' | 'special';
export type EducationType = 'regular' | 'onboarding' | 'change' | 'special';

export interface GenerateRequest {
  constructionType: string;
  hazardTypes: string;
  workerCount: number;
  duration: '30min' | '1hr' | '2hr';
  workerType: WorkerType;
  educationType: EducationType;
}

export interface SafetyEducationOutput {
  pptScript: string;
  quiz: string;
  attendance: string;
  certificate: string;
  legalInfo: {
    requiredHours: number;
    legalBasis: string;
    mandatoryItems: string[];
  };
}

const DURATION_MAP = { '30min': '30분', '1hr': '1시간', '2hr': '2시간' };

// 산업안전보건법 제29조 법정 교육 시간
const LEGAL_HOURS: Record<WorkerType, Record<EducationType, number>> = {
  office:  { regular: 3,  onboarding: 4,  change: 1,  special: 2 },
  field:   { regular: 6,  onboarding: 8,  change: 2,  special: 16 },
  special: { regular: 6,  onboarding: 8,  change: 2,  special: 16 },
};

// 고용노동부 고시 법정 교육 내용 항목
const LEGAL_ITEMS: Record<EducationType, string[]> = {
  regular: [
    '산업안전 및 사고 예방에 관한 사항',
    '산업보건 및 직업병 예방에 관한 사항',
    '건강증진 및 질병 예방에 관한 사항',
    '유해·위험 작업환경 관리에 관한 사항',
    '산업안전보건법 및 일반관리에 관한 사항',
    '직무 스트레스 예방 및 관리에 관한 사항',
  ],
  onboarding: [
    '기계·기구의 위험성과 작업의 순서 및 동선에 관한 사항',
    '작업 개시 전 점검에 관한 사항',
    '정리정돈 및 청소에 관한 사항',
    '사고 발생 시 긴급조치에 관한 사항',
    '산업보건 및 직업병 예방에 관한 사항',
    '물질안전보건자료에 관한 사항',
    '산업안전보건법 및 일반관리에 관한 사항',
  ],
  change: [
    '새로운 작업의 위험성과 작업의 순서에 관한 사항',
    '새로운 기계·기구 사용의 위험성에 관한 사항',
    '새로운 화학물질의 사용 방법에 관한 사항',
    '작업변경에 따른 안전보건 조치사항',
  ],
  special: [
    '위험 작업별 특별안전교육 내용 (고시 별표 5)',
    '유해·위험 작업에 필요한 안전보건지식',
    '해당 설비 및 작업 공정의 유해·위험성',
    '작업 시작 전 점검 방법 및 순서',
    '보호구의 착용 방법 및 관리 방법',
    '사고 발생 시 응급처치 및 대피 방법',
  ],
};

const EDUCATION_TYPE_LABELS: Record<EducationType, string> = {
  regular: '정기교육',
  onboarding: '채용 시 교육',
  change: '작업 변경 시 교육',
  special: '특별교육',
};

const WORKER_TYPE_LABELS: Record<WorkerType, string> = {
  office: '사무직',
  field: '현장 근로자 (비사무직)',
  special: '특별위험작업 근로자',
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const { constructionType, hazardTypes, workerCount, duration, workerType, educationType } = body;

    if (!constructionType || !hazardTypes || !workerCount || !duration) {
      return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 });
    }

    const wType = workerType ?? 'field';
    const eType = educationType ?? 'regular';
    const requiredHours = LEGAL_HOURS[wType][eType];
    const mandatoryItems = LEGAL_ITEMS[eType];
    const legalBasis = `산업안전보건법 제29조, 고용노동부 고시 제2023-19호`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `당신은 고용노동부 공인 건설 현장 안전관리 전문가입니다.
산업안전보건법 제29조 및 고용노동부 고시 기준에 맞는 안전교육 자료를 작성해주세요.

[교육 조건]
- 공사 종류: ${constructionType}
- 주요 위험요소: ${hazardTypes}
- 교육 대상: ${WORKER_TYPE_LABELS[wType]} ${workerCount}명
- 교육 구분: ${EDUCATION_TYPE_LABELS[eType]}
- 교육 시간: ${DURATION_MAP[duration]}
- 법정 필요 시간: 분기 ${requiredHours}시간 이상

[법정 필수 교육 항목 (반드시 포함)]
${mandatoryItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

다음 4가지 자료를 JSON 형식으로 작성하세요. 순수 JSON만 반환하고 마크다운 코드블록 없이 반환하세요.

{
  "pptScript": "PPT 스크립트 (슬라이드 10장, 각 슬라이드는 === 슬라이드 N: 제목 ===으로 구분, 법정 필수 항목을 모두 포함하여 각 슬라이드 내용을 4~6문장으로 상세 작성)",
  "quiz": "이해도 확인 퀴즈 10문항 (Q1~Q10 형식, 법정 교육 내용 기반, 각 문제 후 [정답: ] 표시)",
  "attendance": "교육 출석부 (교육명: ${EDUCATION_TYPE_LABELS[eType]}, 법적 근거: ${legalBasis}, 날짜/장소/강사/수료기준 포함, 번호·성명·소속·직책·서명란 15명 분량)",
  "certificate": "교육 이수 확인서 (수료자명 [홍 길 동], 생년월일, 소속, 교육명: ${EDUCATION_TYPE_LABELS[eType]}, 교육 내용 요약, 교육 시간: ${DURATION_MAP[duration]}, 법적 근거: ${legalBasis}, 발급기관, 직인란, 발급일 포함)"
}

중요: 모든 내용은 실제 현장에서 법적 효력을 가질 수 있도록 산업안전보건법 기준에 정확히 맞게 작성하세요.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let jsonText = text;
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const output = JSON.parse(jsonText) as Omit<SafetyEducationOutput, 'legalInfo'>;

    return NextResponse.json({
      success: true,
      data: {
        ...output,
        legalInfo: { requiredHours, legalBasis, mandatoryItems },
      } as SafetyEducationOutput,
    });
  } catch (error) {
    console.error('[SafeDoc API Error]', error);
    const message = error instanceof Error ? error.message : '생성 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
