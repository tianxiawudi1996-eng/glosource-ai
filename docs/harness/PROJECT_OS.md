# GloSource AI + K-DEFENSE Validation OS

> 모든 자율 실행 세션의 첫 파일. 목표, 작업 큐, 증거, 검증, 게이트를 한 세트로 운영한다.

## 1. North Star

**One-line goal:** 14일 동안 해외 바이어 접촉과 교육형 콘텐츠 실험을 실행하면, GloSource AI의 유료 가능성과 K-DEFENSE의 교육형 IP 반응을 숫자와 원본 증거로 판정하는 보고서를 자동 축적한다.

**Primary user / operator:** 대표와 사업화 PM AI.

**Production context:** Next.js 15.3.9 기반 GloSource AI 저장소에서 영문 바이어 퍼널과 성장 자동화를 운영한다. K-DEFENSE는 외부 itch.io 및 쇼츠 채널의 반응 증거를 이 저장소에 기록한다. 리소스는 GloSource AI 80%, K-DEFENSE 20%로 고정한다.

**Wedge:** 한국 OEM/ODM 후보의 제조사·트레이더·인증·MOQ·RFQ 신호를 한 번에 정리하는 Korea-only shortlist와, 한국사를 플레이하며 배우는 교육형 콘텐츠라는 서로 다른 검증 축을 숫자 중심으로 관리한다.

**Non-goals:**

- 고객 반응 없이 새 AI 기능, 대시보드, CRM, 게임 시스템을 확장하지 않는다.
- GloSource AI를 범용 한국 상품 검색툴로 되돌리지 않는다.
- K-DEFENSE를 14일 안에 완성형 상업 게임으로 만들지 않는다.
- 검증되지 않은 공급사를 verified supplier로 표현하지 않는다.
- 가짜 고객 반응, 가짜 리드, 가짜 조회수, 가짜 결제를 KPI에 넣지 않는다.

## 2. Done Bar

아래 조건이 모두 green일 때만 14일 검증 목표를 완료로 판정한다.

- [ ] GloSource AI 아웃바운드 증거: 실제 ICP 리드 100명 접촉 로그가 있고 중복·예시 리드는 제외됐다.
      검증: KPI 파일의 누적 연락 수 100 이상, 각 행에 채널·날짜·대상·증거 위치 존재.
- [ ] GloSource AI 구매 증거: 응답, 샘플 요청, 인터뷰, 유료 의향, 결제를 각각 원본 증거와 연결했다.
      검증: 유료 의향 2명 이상이면 계속, 실제 결제 1명 이상이면 최우선 사업 격상.
- [ ] GloSource AI 검증 퍼널: K-Beauty OEM 랜딩, 샘플 리포트 요청 CTA, $19/$49 결제 이동, 분석 이벤트가 빌드와 스모크 테스트를 통과한다.
      검증: typecheck, lint, build green 및 핵심 CTA 테스트 증거.
- [ ] K-DEFENSE 콘텐츠 증거: 쇼츠·itch.io·플레이·상호작용·교육자료 요청·구매 데이터를 원본 링크 또는 플랫폼 캡처와 연결했다.
      검증: 교육자료 요청 1건 이상이면 교육형 IP 계속; 반응이 없으면 게임 개발이 아니라 후킹 수정.
- [ ] 80:20 운영 증거: 완료 작업과 투입 단위가 GloSource AI 80% 내외, K-DEFENSE 20% 내외다.
      검증: DONE 큐의 프로젝트별 작업 수 및 일일 보고의 시간/작업 단위.
- [ ] Day 14 최종 보고서: 계속/수정/중단, 가장 빠른 매출안, 30일 계획, 개발·마케팅·비용·매출 가능성, 대표용 1페이지 요약이 수치와 증거로 작성됐다.
      검증: `docs/harness/FINAL_14_DAY_REPORT.md` 존재 및 모든 항목 채움.

## 3. Repository Truth Calibration

모든 세션은 아래를 실행해 상태를 맞춘다.

```powershell
git status -sb
git rev-parse HEAD
git rev-parse master
git rev-parse origin/master
git log --oneline -15
git branch -a
Get-Content -Raw docs/harness/STATE.json
Get-Content -Raw docs/harness/TASK_QUEUE.md
Get-Content -Raw reports/growth/kbeauty-sprint-kpi.csv
rg -n -i "k-defense|itch.io|교육자료|쇼츠" docs reports data ops
npm run growth:buyers
npm run growth:payments
```

### Track rules

- K-Beauty 랜딩·CTA가 구현됐지만 시각·폼 스모크 증거가 없으면 `validation_setup`, 다음은 GLO-001.
- 랜딩과 샘플 3종이 green이고 실제 리드가 100명 미만이면 `outbound_validation`.
- 100명 접촉 후 가격 제시 증거가 부족하면 `conversion_validation`.
- Day 14 또는 판단 기준 충족 시 `decision_report`.
- K-DEFENSE는 교육자료 요청과 콘텐츠 반응 증거가 없으면 항상 콘텐츠 후킹 검증이 게임 기능보다 먼저다.

### State update rule

캘리브레이션 결과가 `STATE.json`과 다르면 구현 전에 STATE, STATUS, TASK_QUEUE를 repo 진실에 맞춘다. 예시 데이터와 자동 생성 보고서는 실제 고객 반응으로 승격하지 않는다.

## 4. Operating Loop

```text
Inspect → Select READY 1 → Plan → Implement → Update Harness → Test Green → Report
```

- 한 세션은 READY 1개만 처리한다.
- READY 작업 배치는 GloSource 4개 후 K-DEFENSE 1개 순서를 기본으로 한다.
- BLOCKED는 구현하지 않는다.
- READY가 없으면 큐 정리와 증거 감사만 수행한다.
- 작업 중 발견한 별도 문제는 큐에 추가하고 현재 범위를 확장하지 않는다.

## 5. Enforcement Checks

### Required generic checks

```powershell
git diff --check
node scripts/check-sensitive-strings.mjs .harness-blocklist.local
node scripts/check-harness-placeholders.mjs docs/harness
node scripts/check-state-json.mjs docs/harness/STATE.json
```

### Project-specific checks

```powershell
npx tsc --noEmit
npm run lint
npm run build
npm run growth:audit
npm run growth:payments
```

제품 코드 변경이 없는 하네스 문서 증분에서는 typecheck, lint, build를 생략할 수 있지만 생략 이유를 REPORT에 기록한다.

## 6. Proof Metrics

### GloSource AI

- 연락한 실제 ICP 리드 수
- 응답 수와 응답률
- 샘플 리포트 요청 수와 요청률
- 미팅/인터뷰 수
- 가격 제시 후 명시적 유료 의향 수
- 실제 Polar 결제 수

### K-DEFENSE

- 쇼츠 업로드 수
- 쇼츠 조회수
- itch.io 클릭 수
- 실제 플레이 수
- 댓글·공유·저장 수
- 교육자료 요청 수
- 후원·구매 수

## 7. Sanity Bands

- 예시·더미·내부 테스트는 외부 KPI에서 0으로 계산한다.
- 연락 수가 늘어도 ICP 근거 또는 발송 증거가 없는 행은 집계하지 않는다.
- “좋다”, “흥미롭다”는 유료 의향이 아니다. 가격 제시 후 명시적 구매 의사만 인정한다.
- GloSource AI 100명 접촉 후 응답 5명 미만이면 기능 개발을 멈추고 메시지 또는 타깃을 수정한다.
- 샘플 요청 2명 미만이면 제안 가치 또는 리포트 구조를 수정한다.
- K-DEFENSE 쇼츠 반응이 없으면 게임 기능이 아니라 첫 2초 후킹·주제·제목을 수정한다.
- 외부 발송, 결제 테스트, 유료 API 호출은 승인 없이 실행하지 않는다.
- UI 핵심 CTA는 360px와 1440px에서 깨지지 않아야 한다.

## 8. Gates

멈추고 사람에게 보고해야 하는 경우:

- push, merge, release, Vercel 배포
- 실제 콜드메일·LinkedIn DM·소셜 게시 발송
- 실제 결제 또는 환불 테스트
- 유료 광고, 유료 API 대량 호출, 리드 구매
- 개인 이메일·고객 정보·플랫폼 비공개 분석 데이터 접근
- 공급사 검증·규제·인증·법무를 보증하는 표현
- DB 스키마 대수술 또는 인증·결제 아키텍처 변경
- 기본 브랜치에서 커밋이 필요한 경우
- 현재 사용자 미커밋 변경과 충돌할 가능성이 있는 경우

## 9. Safety Lines

- 승인 전 push 금지
- 기본 브랜치 직접 커밋 금지
- `git add .` 금지
- 사용자 미커밋 변경 덮어쓰기 금지
- 민감 문자열·비밀·실데이터·비공개 산출물 커밋 금지
- 외부 업로드·배포·유료 작업은 게이트
- 가짜 testimonial, verified supplier, unsupported certification claim 금지
- 아웃바운드 자동 발송은 preflight green과 사람 승인 전 금지
- K-DEFENSE와 GloSource AI의 KPI를 합산해 성공처럼 보이게 하지 않는다.

## 10. Harness Map

- `GOAL.md`: 목표와 Done Bar
- `STATUS.md`: 현재 상태와 최근 완료
- `RULES.md`: 안전선과 작업 규칙
- `PLAN.md`: 14일 단계별 로드맵
- `TESTS.md`: 검증 명령과 품질 기준
- `TASK_QUEUE.md`: READY/BLOCKED/DONE
- `DECISIONS.md`: 의사결정 로그
- `WORKFLOW.md`: 실행 절차
- `STATE.json`: 기계 판독 상태
- `REPORT_TEMPLATE.md`: 일일·증분 보고 형식
- `HARNESS_MANIFEST.md`: 설치 파일과 점검표

## 11. Activation Prompts

### Bootstrap / repair

> 너는 GloSource AI + K-DEFENSE 장기 실행 에이전트다. `docs/harness/PROJECT_OS.md`를 읽고 캘리브레이션으로 repo 진실을 맞춘 뒤 하네스만 생성 또는 수리하라. 기능 구현, 커밋, push는 금지다. 완료 후 `REPORT_TEMPLATE.md` 형식으로 보고하라.

### Run next increment

> `docs/harness/PROJECT_OS.md`와 하위 문서를 읽어라. 캘리브레이션 후 `TASK_QUEUE.md`의 READY 최상단 1개만 Inspect → Plan → Implement → Update → Test green → Report로 수행하라. 기본 브랜치 직접 커밋과 push는 금지다. 외부 발송·배포·비용·실데이터 게이트에서는 멈춰라.

## 12. Honest Automation Boundary

이 하네스는 24시간 백그라운드 워커가 아니다. 한 번의 실행 요청마다 READY 1개를 게이트까지 자율 수행하고, 상태와 다음 READY를 repo에 남겨 다음 세션이 재진입한다.
