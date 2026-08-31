# GloSource AI 웹스타일 레퍼런스 5종 제안 메타프롬프트

## ROLE:
GloSource AI의 KR/EN 제품 경계와 기존 카피를 보존하는 시니어 UI/UX 설계자 겸 검증 담당자.

## GOAL:
첨부 `웹스타일 레퍼런스.pptx`의 전체 슬라이드에서 구조·리듬·타입·색채 DNA를 추출하고, 이를 한국적 명소·단청·한지 시각 언어와 결합한 5가지 정적 HTML Mock으로 제안한다.

## USERS:
- 대표/제품 의사결정자: 다섯 방향을 비교하고 다음 화면설계 방향을 선택한다.
- KR 방문자: 한국 기업으로서 중국·해외 공급자 후보를 탐색한다.
- EN 방문자: 해외 바이어로서 한국 제조사·K-product 공급처를 탐색한다.

## CONTEXT:
- `/`는 KR 무료 베타이며 결제를 받지 않는다.
- `/en`은 해외 바이어용 상용 서비스이며 USD/Polar를 사용한다.
- 정부 원장 일치는 후보에 대한 근거이지 GloSource 인증·추천·보증이 아니다.
- 기존 `HeroSection.tsx`의 카피·CTA·가격·쿼터를 변경하지 않는다.
- 활성 lifecycle P10은 외부 릴리스 설정·승인 부재로 blocked이며 이 작업으로 전이하지 않는다.

## SCOPE:
- `웹스타일 레퍼런스.pptx` 33슬라이드의 XML 텍스트·내장 이미지·스타일 카테고리 분석.
- 3~5개 레퍼런스 조합을 가진 5개 제안안과 공통 CSS 토큰.
- `public/mockups/`의 정적 HTML, 360/1440 브라우저 QA, 접근성·overflow 확인.
- `docs/harness`와 reference matrix 보고서 갱신.

## OUT OF SCOPE:
- 운영 `/`·`/en` 라우트 교체, API/DB 연결, 결제·인증 변경.
- 외부 사이트 게시, SNS 발송, 유료 광고, 배포, commit/push.
- PPTX 원본 수정 또는 레퍼런스 사이트 카피·이미지의 픽셀 복제.

## CONSTRAINTS:
- 사용자 첨부 원본은 읽기 전용으로 보존한다.
- 기존 KR/EN sourcing 방향과 상용 상태를 섞지 않는다.
- 숫자 성과·후기·공급사 보증을 발명하지 않는다.
- 모든 명소 이미지에는 한글·영문 라벨과 접근 가능한 alt를 둔다.
- 정적 목업은 `overflow-x: clip`, `minmax(0, 1fr)`, `prefers-reduced-motion`, `:focus-visible`을 포함한다.
- Hallmark 토큰과 4pt spacing을 사용하고 가짜 브라우저 크롬을 그리지 않는다.

## TOOLS:
- PowerShell, `apply_patch`, PPTX ZIP/XML 읽기.
- `presentations` 스킬의 source inventory 원칙과 `hallmark` 스킬의 preflight·slop 방지 원칙.
- Next dev + agent-browser, npm test/typecheck/lint/build, lifecycle harness.

## WORKFLOW:
1. git/README/AGENTS/requirements/lifecycle/state/queue를 읽고 dirty 범위를 고정한다.
2. lifecycle `validate/status`를 실행한다. READY가 없고 P10이 blocked인지 확인한다.
3. PPTX 전체 33슬라이드의 텍스트·색·내장 이미지 목록을 수집한다. artifact-tool이 없으면 대체 경로와 한계를 기록한다.
4. 스타일 DNA를 5안별로 3~5개씩 매핑한다.
5. 공통 토큰 CSS와 5개의 독립 HTML Mock 및 overview를 추가한다.
6. 360px·1440px에서 각 파일을 열어 수평 스크롤·타이틀·이미지 alt·CTA·언어 표면을 확인한다.
7. 정적 회귀 검증과 문서/queue 기록을 갱신한다. 운영 route와 lifecycle P10은 건드리지 않는다.

## SUCCESS CRITERIA:
- 33슬라이드의 분석 결과와 검사 한계가 보고서에 남는다.
- 5개 HTML Mock이 각각 4~5개의 실제 PPTX 스타일 참조를 표시한다.
- KR/EN 카피·CTA·상용 상태가 제품 계약과 일치한다.
- 명소명 한글·영문 표기, 360/1440 overflow 없음, reduced-motion/focus 상태가 확인된다.
- `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, harness checks가 실제 실행 결과로 기록된다.
- 외부 게시·배포·결제·P10 전이는 0건이다.

## FAILURE CRITERIA:
- PPTX 원본 또는 운영 라우트가 수정된다.
- KR/EN sourcing 방향·가격·상용 상태가 섞인다.
- 가짜 지표·후기·보증 표현이 추가된다.
- 360px에서 horizontal scroll, 깨진 이미지, 두 줄 CTA, focus 누락이 남는다.
- 실행하지 않은 검증을 통과로 보고한다.

## OUTPUTS:
- `public/mockups/glo-webstyle-proposals.html`
- `public/mockups/glo-webstyle-proposals.css`
- `public/mockups/glo-webstyle-proposal-01-atelier.html`
- `public/mockups/glo-webstyle-proposal-02-dancheong.html`
- `public/mockups/glo-webstyle-proposal-03-journey.html`
- `public/mockups/glo-webstyle-proposal-04-workbench.html`
- `public/mockups/glo-webstyle-proposal-05-edit.html`
- `docs/plans/2026-08-11-webstyle-reference-matrix.md`
- 브라우저 QA 스크린샷 및 `docs/harness` 기록.

## VERIFICATION:
- 정적 HTML 구조/참조 자산 존재 확인.
- agent-browser에서 5안 overview와 각 5안의 360/1440 viewport 확인.
- DOM `scrollWidth === innerWidth`, title, `img[alt]`, reference chip 수를 수집.
- `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run harness:instructions`, `npm run lifecycle:validate`, state/placeholder/sensitive/diff 검사.

## MEMORY UPDATE:
이번 작업은 기존 메모리 파일을 직접 수정하지 않는다. 다음 세션이 재사용할 수 있도록 본 계획·matrix·harness 보고서에 결정·검증·미완료 항목을 남긴다.

## STOP CONDITION:
artifact-tool 또는 렌더러가 없으면 대체 분석의 한계를 기록하고, 외부 권한·P10 승인·사용자 선택이 필요해지는 순간 정지한다. 동일 원인의 검증 실패가 3회 반복되면 사용자 결정을 요청한다.
