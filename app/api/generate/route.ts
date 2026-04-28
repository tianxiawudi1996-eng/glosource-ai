import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface GenerateRequest {
  constructionType: string;  // 공사 종류
  hazardTypes: string;       // 주요 위험요소
  workerCount: number;       // 교육 대상 인원
  duration: '30min' | '1hr' | '2hr'; // 교육 시간
}

export interface SafetyEducationOutput {
  pptScript: string;   // PPT 스크립트 (슬라이드 10장)
  quiz: string;        // 퀴즈 10문항 + 정답
  attendance: string;  // 출석부 양식
  certificate: string; // 수료증 템플릿
}

const DURATION_MAP = {
  '30min': '30분',
  '1hr': '1시간',
  '2hr': '2시간',
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const { constructionType, hazardTypes, workerCount, duration } = body;

    if (!constructionType || !hazardTypes || !workerCount || !duration) {
      return NextResponse.json(
        { error: '모든 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `당신은 건설 현장 안전관리 전문가입니다.
아래 조건에 맞는 안전교육 자료를 작성해주세요.

[교육 조건]
- 공사 종류: ${constructionType}
- 주요 위험요소: ${hazardTypes}
- 교육 대상 인원: ${workerCount}명
- 교육 시간: ${DURATION_MAP[duration]}

다음 4가지 자료를 JSON 형식으로 작성해주세요. 반드시 유효한 JSON만 반환하세요. 마크다운 코드블록 없이 순수 JSON만 반환하세요.

{
  "pptScript": "PPT 스크립트 (슬라이드 10장, 각 슬라이드는 === 슬라이드 N: 제목 ===으로 구분, 내용 상세히 작성)",
  "quiz": "이해도 확인 퀴즈 10문항 (Q1~Q10 형식, 각 문제 후 [정답: ] 표시)",
  "attendance": "출석부 양식 텍스트 (교육명, 날짜, 교육장소, 교육강사, 번호/이름/소속/서명 칸 포함)",
  "certificate": "수료증 템플릿 텍스트 (수료자명 [홍길동], 교육명, 교육 내용 요약, 교육 시간, 발급기관, 발급일 포함)"
}

중요:
- pptScript는 실제 강의용으로 각 슬라이드당 강의 내용을 3~5문장 이상 상세히 작성
- quiz는 현장 실무에서 실제 발생할 수 있는 상황 기반 문제로 작성
- 모든 내용은 산업안전보건법 기준에 맞게 작성`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // JSON 파싱 (마크다운 코드블록 제거)
    let jsonText = text;
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const output = JSON.parse(jsonText) as SafetyEducationOutput;

    return NextResponse.json({ success: true, data: output });
  } catch (error) {
    console.error('[SafeDoc API Error]', error);
    const message = error instanceof Error ? error.message : '생성 중 오류가 발생했습니다.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
