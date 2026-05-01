---
title: "feat: SafeDoc AI → GloSource AI 완전 피벗"
type: feat
status: active
date: 2026-05-01
origin: docs/brainstorms/2026-04-30-glosource-ai-requirements.md
---

# feat: SafeDoc AI → GloSource AI 완전 피벗

## Overview

SafeDoc AI(법정 안전교육 자료 생성기)의 브랜드·기능·UI를 **GloSource AI**(AI 글로벌 소싱 에이전트)로 완전 교체한다.  
기존 Next.js + Vercel + Gemini 인프라는 그대로 유지하면서 비즈니스 로직 전체를 대체한다.

**핵심 변화:**
- 입력: 안전교육 조건 → 소싱 요청(제품, 수량, 예산, 원산지)
- 처리: 법정항목 생성 프롬프트 → Gemini Google Search Grounding으로 실제 공급자 탐색 + 신뢰도 분석
- 출력: PPT/퀴즈/출석부 → 공급자 랭킹 리포트 + RFQ 이메일 초안

---

## Problem Frame

한국 소규모 제조·건설업체는 해외 직발주를 원하지만 공급자 사기 피해 공포, 언어 장벽, 검증 불가로 시작조차 못 한다.  
GloSource AI는 Gemini 웹 검색으로 실제 공급자를 탐색하고 신뢰도를 한국어로 분석해 이 진입 장벽을 제거한다.  
(see origin: docs/brainstorms/2026-04-30-glosource-ai-requirements.md)

---

## Requirements Trace

- R1. 한국어 입력(제품명, 수량, 예산, 원산지)으로 해외 공급자 3~5개 탐색
- R2. 각 공급자 신뢰도 점수(0~100) + 한국어 근거 + Red flag 제공
- R3. 공급자 비교 리포트 PDF 다운로드 (회사명·날짜 포함)
- R4. 선택 공급자에게 보낼 RFQ 이메일 초안 (영어/중국어 자동 생성)
- R5. 무료 1회 → 유료 크레딧 게이트 (기존 SafeDoc 방식 그대로)
- R6. 법적 면책 고지 UI에 필수 포함

---

## Scope Boundaries

- 결제 에스크로, 실제 주문 처리 없음 — 정보 제공 서비스만
- 통관·관세 자동 계산 없음 (v2 예정)
- 공급자 DB 자체 구축 없음 — Gemini 그라운딩으로 실시간 탐색
- 모바일 앱 없음
- 기존 `app/api/generate/route.ts`는 삭제 (사용 없음)

---

## Context & Research

### 재활용 가능한 패턴

| 패턴 | 위치 | 재활용 여부 |
|------|------|-------------|
| Gemini retry + fallback 루프 | `app/api/generate/route.ts:130-148` | 그대로 이식 |
| JSON 마크다운 스트리핑 | `app/api/generate/route.ts:150-153` | 그대로 이식 |
| window.print() PDF 생성 | `app/page.tsx:285-291` | 템플릿 교체 후 재활용 |
| localStorage 크레딧 시스템 | `app/page.tsx:165-167, 246-250` | 상수 교체 후 재활용 |
| SVG 아이콘 컴포넌트 시스템 | `app/page.tsx:9-124` | 일부 재활용, 신규 추가 |
| 다크 네이비(`#0D1B2A`) + 오렌지(`#EA580C`) 색상 시스템 | `app/globals.css` | 그대로 유지 |
| Pretendard 폰트 CDN | `app/layout.tsx:27` | 그대로 유지 |

### 교체 대상

| 대상 | 이유 |
|------|------|
| `app/api/generate/route.ts` 전체 로직 | 새 API `app/api/source/route.ts` 로 대체 |
| 모든 상수 (CONSTRUCTION_TYPES, HAZARD_TYPES 등) | 소싱 관련 상수로 전면 교체 |
| 입력 폼 UI 섹션 전체 | 완전히 다른 입력 필드 |
| 결과 표시 섹션 전체 | 공급자 카드 + 이메일 탭 구조로 교체 |
| 히어로 copy, 메타데이터 | GloSource AI 브랜드로 전환 |

### Gemini Google Search Grounding

`@google/generative-ai` v0.24+에서 지원:
```
getGenerativeModel({ model: 'gemini-2.5-flash', tools: [{ googleSearch: {} }] })
```
- `gemini-2.5-flash`가 기본 모델, 그라운딩 실패 시 `gemini-2.0-flash-lite`로 폴백 (그라운딩 없이)
- 응답에 `groundingMetadata.groundingChunks[]` 포함 (웹 소스 URL)
- 프롬프트에 "순수 JSON만 반환, 인용 번호[1] 없이" 명시 필수
- 그라운딩 사용 시 추가 비용 가능 — 무료 티어에서는 비활성화 가능성 있음 → 폴백 경로 필수

---

## Key Technical Decisions

- **단일 Gemini 호출로 탐색 + 분석 + 이메일 통합**: 두 번 호출하면 레이턴시 2배. 하나의 구조화 프롬프트로 전부 처리 → 30~60초 허용
- **그라운딩 폴백 설계**: 그라운딩 활성화 실패(401/400) 시 그라운딩 없는 일반 생성으로 자동 재시도 → "Gemini 지식 기반 분석"으로 결과 제공
- **API 엔드포인트 분리**: 기존 `/api/generate` 삭제, 새 `/api/source` 생성 — 오염 없이 피벗
- **타입 공유**: `app/api/source/types.ts`에서 서버/클라이언트 타입 export → `page.tsx`에서 import
- **신뢰도 점수는 AI 생성**: 알고리즘 계산 아님. AI가 증거 기반으로 판단 → 면책 고지 필수

---

## Open Questions

### Resolved During Planning

- **그라운딩 없이도 유용한가?**: 유용함. Gemini의 학습 데이터에 Alibaba/Made-in-China 공급자 정보 다수 포함. 그라운딩 없어도 알려진 공급자 분석 가능 (단, 최신성 부족 명시 필요)
- **app/api/generate 삭제 안전한가?**: 안전함. 현재 page.tsx에서만 호출, 외부 API 없음

### Deferred to Implementation

- **그라운딩 무료 티어 지원 여부**: 실제 API key로 테스트해야 확인 가능 → 폴백 로직으로 양쪽 대응
- **Gemini 응답 JSON 파싱 안정성**: 그라운딩 결과에 따라 응답 형태 변동 가능 → 구현 시 try/catch + 재시도 패턴 확인

---

## High-Level Technical Design

> *이 다이어그램은 방향성 가이드이며 구현 명세가 아닙니다. 구현 시 컨텍스트로 참고하세요.*

```
사용자 입력 (page.tsx)
  productDescription, quantity, budget, countryPref, orderFrequency
          │
          ▼
POST /api/source (route.ts)
          │
    ┌─────┴──────┐
    │ 1차 시도    │  gemini-2.5-flash + googleSearch grounding
    │            │  → 실제 공급자 탐색 + 분석
    └─────┬──────┘
          │ 503/429/400(grounding 불가)
    ┌─────▼──────┐
    │ 2차 폴백    │  gemini-2.0-flash-lite (그라운딩 없이)
    │            │  → Gemini 지식 기반 분석
    └─────┬──────┘
          │
    JSON 파싱 (SourcingOutput)
          │
    ┌─────▼──────────────────────┐
    │ 응답                        │
    │  suppliers[]: 3~5개         │
    │    - name, platform, url   │
    │    - trustScore(0~100)     │
    │    - trustEvidence[]       │
    │    - redFlags[]            │
    │    - estimatedPrice, moq   │
    │  recommendation: string    │
    │  rfqEmail: { en, zh }      │
    │  disclaimer: string        │
    │  groundingUsed: boolean    │
    └────────────────────────────┘
          │
  page.tsx 결과 표시
    - 공급자 카드 리스트 (trustScore 뱃지)
    - 선택 공급자 상세 패널
    - RFQ 이메일 탭 (영어 / 중국어)
    - PDF 다운로드
```

---

## Implementation Units

- [ ] **Unit 1: 브랜드 + 레이아웃 업데이트**

**Goal:** GloSource AI 브랜드로 메타데이터, 타이틀, 레이아웃 전환

**Requirements:** R1 (브랜드 일관성)

**Dependencies:** 없음

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Approach:**
- `metadata.title` → `"GloSource AI | AI 글로벌 소싱 에이전트"`
- `metadata.description` → 소싱/공급자 검증 중심으로 교체
- `metadata.keywords` → "해외소싱, 공급자검증, 글로벌소싱, 수입직발주, AI소싱에이전트"
- globals.css에 `.trust-badge` 스타일 추가 (신뢰도 점수 표시용 컬러 등급 클래스)

**Test scenarios:**
- Happy path: 페이지 로드 시 탭 타이틀이 "GloSource AI"로 표시
- Happy path: OG 메타태그에 소싱 관련 description 포함

**Verification:** 브라우저 탭 + HTML head 확인

---

- [ ] **Unit 2: API 타입 정의**

**Goal:** 소싱 요청·응답 타입 전체 정의. page.tsx와 route.ts가 공유하는 단일 타입 소스.

**Requirements:** R1, R2, R4

**Dependencies:** Unit 1

**Files:**
- Create: `app/api/source/types.ts`

**Approach:**
- `SourcingRequest` 인터페이스: `productDescription`, `quantity`, `budget` (optional), `countryPreference`, `orderFrequency`
- `countryPreference` 유니온 타입: `'china' | 'southeast_asia' | 'europe' | 'japan' | 'any'`
- `orderFrequency` 유니온 타입: `'one_time' | 'monthly' | 'bimonthly_plus'`
- `Supplier` 인터페이스: `rank`, `name`, `platform`, `country`, `url`, `trustScore`, `trustEvidence`, `redFlags`, `productMatch`, `estimatedPrice`, `moq`, `summary`
- `SourcingOutput` 인터페이스: `suppliers`, `recommendation`, `rfqEmail: { en: string; zh: string }`, `disclaimer`, `groundingUsed`
- 모든 타입 export (page.tsx에서 import)

**Test scenarios:**
- Test expectation: none — 순수 타입 선언, 런타임 동작 없음

**Verification:** TypeScript 컴파일 에러 없음

---

- [ ] **Unit 3: 소싱 API Route**

**Goal:** Gemini Google Search Grounding으로 실제 공급자 탐색 + 신뢰도 분석 + RFQ 이메일 생성을 단일 호출로 처리

**Requirements:** R1, R2, R4, R6

**Dependencies:** Unit 2

**Files:**
- Create: `app/api/source/route.ts`
- Delete: `app/api/generate/route.ts` (기존 SafeDoc 로직 삭제)

**Approach:**

*프롬프트 구조:*
- 소싱 에이전트 페르소나 선언 + Google Search로 실제 공급자 탐색 지시
- 입력값 삽입: 제품명(한국어 그대로), 수량, 예산, 원산지 선호, 발주 주기
- 탐색 대상 명시: Alibaba, Made-in-China.com, Global Sources
- 신뢰도 평가 기준 명시 (설립연도, 인증서, 리뷰수, Red flag 패턴)
- 출력 JSON 스키마 예시 포함
- "순수 JSON만 반환, 마크다운 코드블록 없이, 인용번호[1][2] 없이" 강제

*모델 전략:*
```
1차: gemini-2.5-flash + tools: [{ googleSearch: {} }]  → 실시간 그라운딩
2차: gemini-2.5-flash (그라운딩 없이)                  → 503/429 폴백
3차: gemini-2.0-flash-lite (그라운딩 없이)             → 최후 폴백
```
그라운딩 비활성화(400/403) 에러 감지 → 그라운딩 없이 재시도
groundingUsed 플래그를 응답에 포함하여 UI에서 그라운딩 사용 여부 표시

*검증:*
- `suppliers` 배열 비어있으면 500 에러 반환
- `trustScore` 0~100 범위 검사
- 면책 고지(`disclaimer`) 필드 강제

*입력 검증:*
- `productDescription` 필수 (빈 문자열 거부)
- `quantity` 필수
- `budget`, `countryPreference`, `orderFrequency` 옵션

**Patterns to follow:**
- `app/api/generate/route.ts:130-148` (retry + fallback 루프 패턴)
- `app/api/generate/route.ts:150-153` (JSON 마크다운 스트리핑)

**Test scenarios:**
- Happy path: 유효한 소싱 요청 → `{ success: true, data: SourcingOutput }` 반환
- Happy path: `suppliers` 배열 3개 이상 포함
- Happy path: 각 supplier에 `trustScore`, `trustEvidence[]`, `redFlags[]` 존재
- Edge case: `productDescription` 빈 문자열 → 400 에러
- Edge case: Gemini 503 → 다음 모델로 자동 폴백
- Error path: 모든 모델 실패 → 사용자 친화적 한국어 에러 메시지
- Integration: 그라운딩 활성화 시 `groundingUsed: true` 포함

**Verification:** curl 또는 브라우저 DevTools로 POST /api/source 직접 호출 테스트

---

- [ ] **Unit 4: 메인 페이지 UI 전면 교체**

**Goal:** app/page.tsx를 GloSource AI UI로 완전 재작성. 안전교육 관련 요소 전체 제거.

**Requirements:** R1, R2, R3, R4, R5, R6

**Dependencies:** Unit 2, Unit 3

**Files:**
- Modify: `app/page.tsx` (전면 재작성)

**Approach:**

*입력 섹션 (6개 필드):*
1. 제품/자재명 (textarea — 예: "SS400 강판 6T × 1,000장, 건설 현장용")
2. 필요 수량 (text input)
3. 예산 범위 (text input, optional — 예: "개당 $10~15 이하")
4. 원산지 선호 (버튼 선택: 중국 / 동남아 / 유럽 / 일본 / 상관없음)
5. 발주 주기 (버튼 선택: 1회성 / 월 1회 / 월 2회+)
6. 회사명 + 날짜 (PDF 출력용, 결과 생성 전 입력 가능)

*결과 섹션:*
- 공급자 카드 리스트 (trustScore 뱃지: 🟢 80+ / 🟡 60~79 / 🔴 60 미만)
- 선택 공급자 상세: trustEvidence 목록, redFlags 목록, 가격·MOQ 정보
- 탭: [RFQ 이메일 영어] [RFQ 이메일 중국어]
- 복사 버튼, PDF 다운로드 버튼

*PDF 템플릿 (`generateSourcingReportHTML`):*
- 기존 `generatePrintHTML` 패턴 재활용
- 공급자 비교표 (표 형식: 이름, 플랫폼, 신뢰도, 가격, MOQ)
- 각 공급자 신뢰도 근거 목록
- Red flag 섹션
- 추천 공급자 강조
- 면책 고지 필수 포함

*크레딧 시스템:*
- `CREDITS_KEY = 'glosource_credits_v1'` (기존 SafeDoc 키와 분리)
- `FREE_CREDITS = 1`
- 소진 시 결제 유도 모달 (프로 30만원/월 강조)

*히어로 섹션:*
- 메인 카피: "해외 공장, 믿고 직발주하세요."
- 서브카피: "AI가 Alibaba·Made-in-China에서 검증된 공급자를 찾고, 사기 여부를 분석합니다."
- 통계 바: 공급자 탐색 3~5개 / 신뢰도 AI 분석 / RFQ 이메일 자동 생성 / 한국어 리포트

*그라운딩 상태 표시:*
- `groundingUsed: true` → "실시간 웹 검색 기반 분석" 뱃지
- `groundingUsed: false` → "AI 지식 기반 분석 (최신성 미보장)" 안내

**Patterns to follow:**
- 기존 `app/page.tsx` SVG 아이콘 컴포넌트 시스템 재활용
- 기존 `app/page.tsx` 다크 네이비 히어로 + 화이트 본문 레이아웃 패턴
- 기존 크레딧/paywall 모달 패턴

**Test scenarios:**
- Happy path: 제품명+수량 입력 후 생성 → 로딩 → 공급자 카드 표시
- Happy path: 공급자 카드 클릭 → 해당 공급자 상세 + 이메일 탭 활성화
- Happy path: 이메일 탭 전환(영어↔중국어) 정상 동작
- Happy path: PDF 버튼 클릭 → 인쇄 다이얼로그 (공급자 비교표 포함)
- Edge case: 제품명 미입력 → "제품/자재명을 입력해주세요" 에러
- Edge case: 크레딧 0 → 생성 버튼 클릭 시 결제 모달
- Edge case: API 에러 → 에러 메시지 표시 (로딩 해제)
- Integration: 생성 성공 → 크레딧 1 차감 + localStorage 업데이트

**Verification:** 브라우저에서 전체 플로우 실행 (입력→생성→공급자카드→이메일탭→PDF)

---

- [ ] **Unit 5: 환경변수 + Vercel 배포 업데이트**

**Goal:** Vercel에 기존 `GEMINI_API_KEY` 확인 + 필요 시 메타데이터 업데이트. 기존 배포 파이프라인 재활용.

**Requirements:** 배포 인프라

**Dependencies:** Unit 1~4 완료 후

**Files:**
- `app/api/source/route.ts` — 환경변수 `GEMINI_API_KEY` 참조 (기존과 동일)
- `.env.local` — 변경 없음

**Approach:**
- 기존 `GEMINI_API_KEY` 그대로 재사용 (키 교체 불필요)
- `npx vercel --prod` 로 배포 (기존 Vercel project 연결 유지)
- Google Search Grounding은 동일 API key로 동작 (단, 무료 티어 제한 가능 → 폴백 경로로 대응)

**Test scenarios:**
- Happy path: Vercel 배포 성공 후 프로덕션 URL에서 `/api/source` 호출 가능
- Error path: Vercel 환경변수 누락 시 → API route에서 500 에러 명확히 반환

**Verification:** `https://safedoc-ai.vercel.app` (또는 신규 도메인)에서 프로덕션 테스트

---

## System-Wide Impact

- **Interaction graph:** 단일 API route → 단일 Gemini 호출. 외부 콜백·미들웨어 없음
- **Error propagation:** Gemini 실패 → catch → 다음 모델 시도 → 모두 실패 → NextResponse 500
- **State lifecycle risks:** localStorage 크레딧 키가 기존 SafeDoc(`safedoc_credits_v3`)과 다름(`glosource_credits_v1`) → 기존 사용자 크레딧 리셋됨 (신규 서비스이므로 의도적)
- **API surface parity:** 기존 `/api/generate` 삭제 후 `/api/source`로 대체 — 외부 클라이언트 없으므로 안전
- **Integration coverage:** Gemini 그라운딩 실제 동작은 프로덕션 API key로만 검증 가능

---

## Risks & Dependencies

| 리스크 | 완화 방법 |
|--------|-----------|
| Gemini 무료 티어에서 Google Search Grounding 비활성화 | 그라운딩 없는 폴백 경로 필수 구현, UI에 "AI 지식 기반" 표시 |
| 그라운딩 응답에 인용 번호`[1]`가 JSON 오염 | 프롬프트에 "인용 번호 없이 순수 JSON" 강제 + JSON 파싱 실패 시 재시도 |
| Gemini가 가짜 공급자 URL 생성(환각) | 신뢰도 분석은 AI 판단이며 검증되지 않음 — 면책 고지 필수, URL 직접 클릭 안내 |
| 30~60초 생성 시간이 사용자 이탈 유발 | 진행률 메시지 교체 애니메이션 (예: "Alibaba 탐색 중...", "신뢰도 분석 중...") |
| 기존 SafeDoc 유료 사용자 없음 | 없음 — 신규 서비스로 시작, 리스크 없음 |

---

## Documentation / Operational Notes

- Vercel 프로젝트명 변경 고려: `safedoc-ai` → `glosource-ai` (선택 사항)
- 도메인 변경 예정: `safedoc-ai.vercel.app` → `glosource.ai` (구매 필요, MVP 이후)
- 첫 영업 대상: 서원토건 협력사 네트워크에 무료 체험 URL 배포

---

## Phased Delivery

### Phase 1 (이번 구현, 3~4일)
- Unit 1~5 전체 완료
- Vercel 재배포
- 서원토건 협력사 3개사 무료 체험

### Phase 2 (2주 후)
- 크레딧 충전 → Toss Payments 실결제 연동
- 소싱 이력 저장 (localStorage → Supabase)
- 이메일 템플릿 고도화 (산업별 맞춤)

### Phase 3 (1개월 후)
- 구독 관리 대시보드
- 통관 HS코드 자동 제안
- Gemini Phase 2: 실거래가 조회 + 시행사 신용도

---

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-30-glosource-ai-requirements.md](docs/brainstorms/2026-04-30-glosource-ai-requirements.md)
- 재활용 패턴: `app/api/generate/route.ts` (Gemini retry loop)
- 재활용 패턴: `app/page.tsx` (크레딧 시스템, PDF print, SVG 아이콘)
- Gemini Grounding API: `tools: [{ googleSearch: {} }]` — @google/generative-ai v0.24+
