# 2026-08-25 `/en` Evidence 70 : Korean Visual 30 계약 보고서

## 결과

`/en`의 70:30 원칙을 자동 검사 가능한 editorial hierarchy guard로 고정했다. 제품·증거를 지원하는 `product + mixed` 영역은 최소 70%, 문화 자체가 목적인 `culture` 전용 영역은 최대 30%여야 한다. 실제 pixel 면적·체류시간과 혼동하지 않도록 측정 한계를 문서와 검사 출력에 명시했다.

현재 10개 본문 영역은 product 7, mixed 2, culture 1이다. 따라서 product-supporting 9/10(90%), culture-only 1/10(10%)로 구조 가드를 만족한다. Hero는 mixed, categories는 mixed, Seoul/Busan/Jeju Journey만 culture-only다. nav/footer는 반복 UI chrome이므로 분모에서 제외한다.

## 모델 분담

- Luna: nav부터 footer까지 섹션·시각 레이어·근거 line을 읽기 전용으로 분류하고 pixel 비율을 추정하지 않음.
- 루트: 측정 정의, source marker, 검사기, 회귀 테스트, 전체 검증과 Harness 보고를 통합.
- Terra/Sol: 이번 Loop에 불필요해 승급하지 않음.

## 변경 범위

- `app/en/page.tsx`, `HeroSection.tsx`, `KoreaJourneySection.tsx`: 비가시 `data-en-balance="id:role"` marker 추가.
- `scripts/check-en-landing-balance.ts`: 필수 10영역, 역할, 중복·미등록, 70% floor와 30% cap 검사.
- `tests/en-landing-balance.test.ts`: 정상, culture cap 초과, 필수 product region 누락 3개 시나리오.
- `docs/plans/2026-08-25-en-70-30-measurement.md`: 역할 정의, 영역 표, 측정 한계와 브라우저 검증 경계.
- `package.json`, `AGENTS.md`, instruction drift checker: `npm run harness:en-balance` 상시 진입점 연결.

visible copy, CTA, 가격, quota, sourcing 방향, 결제, registry 의미, 이미지와 레이아웃은 변경하지 않았다.

## 검증 증거

- `npm run harness:en-balance`: clean, total 10, product-supporting 90%, culture-only 10%.
- 집중 EN balance/visual/instruction 테스트: 12/12 PASS.
- `npm run build`: PASS, Next.js 16.3.0, 89/89 routes; 기존 Edge Runtime warning 유지.
- `npx tsc --noEmit`: PASS.
- `npm test`: 255/255 PASS.
- `npm run lint`: exit 0, 오류 0, 기존 경고 16.
- localhost:3106 dev server 재기동 완료.

## 미검증·한계

브라우저 URL 보안 정책이 직전 Loop의 localhost reload를 거부했으므로 동일 접근을 우회하지 않았다. 이번 Loop에서 새 pixel 높이·screenshot segmentation은 실행하지 않았으며 exact 70:30 pixel 완료를 주장하지 않는다. 직전 동일 화면의 360/400/1440 QA는 `docs/harness/reports/2026-08-25-en-mobile-nav-360.md`에 분리돼 있다.

## Lifecycle·외부 경계

P10 blocked를 유지한다. commit, push, PR, provider 변경, migration, 게시와 배포는 실행하지 않았다.

## 다음 READY

브라우저 접근이 정상화되면 `data-en-balance` region의 bounding rectangle을 360px·1440px에서 수집해 product/mixed/culture 실제 높이를 별도 관찰값으로 기록한다. 이 수치는 editorial guard를 대체하지 않는다.
