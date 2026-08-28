# GloSource AI Repository Instructions

## 1. Authority and Purpose

이 파일은 GloSource AI 저장소에서 동작하는 코딩 에이전트의 상시 운영 계약이다. 범용 웹개발 원칙은 이 저장소의 실제 제품 계약, 기술 스택, Lifecycle Harness와 충돌하지 않는 범위에서만 적용한다.

우선순위는 다음과 같다.

1. 현재 사용자의 명시적 요구와 승인 범위
2. 안전·보안·개인정보·외부 영향 통제
3. `docs/requirements/GLOSOURCE_PORTFOLIO.md`와 route별 승인된 요구사항
4. `docs/harness/lifecycle/PHASES.json` 및 현재 lifecycle state
5. 이 `AGENTS.md`와 `docs/harness` 운영 규칙
6. 승인된 설계·결정 문서
7. 에이전트의 일반적 추정

충돌은 숨기지 않는다. 확인된 사실, 가정, 미결정 사항과 결과에 미치는 영향을 구분해 보고한다.

## 2. Product Truth and Boundaries

GloSource AI는 하나의 Next.js 애플리케이션에서 서로 다른 두 제품을 운영한다.

- `/`: 한국 기업이 해외 공급처를 찾는 KR 서비스. 무료 베타이며 법적 상용화 게이트가 열리기 전에는 결제를 받지 않는다.
- `/en`: 해외 바이어가 한국 제조사·K-product 공급처를 찾는 EN 서비스. USD와 Polar MoR를 사용하는 상용 서비스다.

다음 불변조건을 지킨다.

- KR과 EN의 사용자, sourcing 방향, quota, 결제, KPI를 섞지 않는다.
- Polar 구독은 EN 서비스만 잠금 해제한다.
- KR Toss checkout은 사업자등록·법적 고지·운영 QA·명시적 출시 승인과 `KR_COMMERCIALIZATION_ENABLED=true` 전까지 fail-closed다.
- 정부 원장 일치는 후보에 대한 증거이지 GloSource의 인증·추천·보증이 아니다.
- 공급사, 제조사 여부, 인증, MOQ, 성과 수치는 재현 가능한 출처가 없으면 `미확인`, `AI 추정`, `예시`로 표시한다.
- 예시·더미·내부 테스트·본인 반응을 실제 리드, 고객 성과, 결제 또는 KPI로 승격하지 않는다.

## 3. Mandatory Session Start

변경 전에 다음을 수행한다.

1. `git status -sb`와 현재 branch/HEAD를 확인하고 dirty worktree의 기존 사용자 변경을 식별한다.
2. `README.md`, 이 파일, 관련 요구사항과 관련 코드·테스트를 읽는다.
3. `docs/harness/lifecycle/LIFECYCLE.md`를 읽고 `npm run lifecycle:validate`, `npm run lifecycle:status`를 실행한다.
4. `docs/harness/STATE.json`, `docs/harness/STATUS.md`, `docs/harness/TASK_QUEUE.md`를 현재 저장소와 대조한다.
5. 사용자, 문제, 기대 상태 변화, 포함·제외 범위, 완료 기준, 검증 명령을 짧게 고정한다.
6. 활성 lifecycle phase와 일치하는 READY 1개만 작업 범위로 잠근다. BLOCKED 작업을 구현하지 않는다.

단순 문구·작은 단일 버그는 필요한 범위만 적용한다. 기능·API·DB·인프라·배포를 함께 다루는 복합 작업은 조사→계획→구현→검증→보고 순서를 명시한다.

## 4. Goal, Specification, and Lifecycle

요구사항은 기능 이름이 아니라 검증 가능한 사용자 상태 변화로 작성한다. 일반·복합 작업에는 가능한 범위에서 다음을 둔다.

- 요구사항 ID와 사용자/목적
- 사전 조건, 입력, 처리 규칙, 출력과 상태 변화
- 정상, 빈 상태, 오류, 재시도, 권한 부족 흐름
- 데이터 변경과 보존·삭제 영향
- 보안, 개인정보, 성능, 접근성, 호환성 조건
- 포함·제외 범위
- 관찰 가능한 인수 기준과 단위·통합·E2E 검증

Lifecycle의 유일한 기계 기준은 `docs/harness/lifecycle/PHASES.json`이다.

- phase를 건너뛰거나 과거 phase를 증거 없이 완료 처리하지 않는다.
- phase별 prompt는 `docs/harness/lifecycle/prompts/`에서 읽는다.
- 완료는 모든 exit criterion과 필요한 approval reference가 있을 때만 `npm run lifecycle:complete -- <completion-evidence.json>`로 기록한다.
- approval reference는 외부 작업 권한을 생성하지 않는다.
- 완료 보고서와 state 전이를 수동으로 분리하거나 기존 보고서를 덮어쓰지 않는다.

장기 메타프롬프트는 최소한 `ROLE`, `GOAL`, `USERS`, `CONTEXT`, `SCOPE`, `OUT OF SCOPE`, `CONSTRAINTS`, `TOOLS`, `WORKFLOW`, `SUCCESS CRITERIA`, `FAILURE CRITERIA`, `OUTPUTS`, `VERIFICATION`, `MEMORY UPDATE`, `STOP CONDITION`을 포함한다.

## 5. Technology and Architecture

현재 기준 스택은 npm, Next.js 16 App Router, React 19, TypeScript strict mode, Drizzle ORM, PostgreSQL/Neon, NextAuth, Polar, 조건부 Toss, Vercel이다. 실제 `package.json`, lockfile, 설정과 설치 버전을 우선하며 임의로 프레임워크·패키지 관리자·DB를 교체하지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

현재 설치본에 위 문서 경로가 없으면 읽었다고 주장하지 않는다. 관련 Next.js API를 변경해야 할 때는 설치된 타입·소스와 공식 문서를 확인하고, 확인하지 못한 부분을 보고한다.

이 저장소의 데이터 흐름은 보통 다음 경계를 따른다.

```text
Browser / Server Component
→ App Router page 또는 route handler
→ app/lib의 도메인·권한·검증 로직
→ Drizzle data access
→ PostgreSQL/외부 provider
→ 안전하게 정규화된 응답
```

- UI에서 DB나 secret에 직접 접근하지 않는다.
- route handler는 요청 파싱, 인증·인가, 입력 검증, 안전한 응답에 집중한다.
- 재사용 가능한 업무 규칙과 provider 정규화는 `app/lib`에 둔다.
- 사용자 입력을 SQL 문자열과 결합하지 않고 Drizzle/매개변수 바인딩을 사용한다.
- 외부 모델·검색 결과의 자기주장을 서버 증거로 승격하지 않는다.
- provider 실패, 알 수 없는 응답 shape, grounding 부재는 fail-closed로 처리한다.

## 6. Security, Authentication, and Privacy

- 인증과 인가를 분리한다. UI 숨김은 권한 검사가 아니다.
- API와 데이터 조회 범위에서 소유권·surface·role을 다시 확인한다.
- 로그인·내부 bypass·cron·admin 경로는 설정이 없거나 불명확하면 거부한다.
- 비밀번호는 승인된 강한 해시로만 저장하며 token, session, cookie, API key, secret 원문을 로그·문서·테스트 fixture에 남기지 않는다.
- rate limit은 필요한 계정/IP bucket을 독립적으로 적용하고 식별정보는 정규화·해시한다.
- 민감정보, reviewer 신원, 개인 이메일, provider payload와 비공개 분석 자료는 tracked 파일에 기록하지 않는다.
- 개인정보 수집·보유·삭제 변경에는 목적, 최소수집, 보유기간, 삭제·복구, 감사 경계를 명시한다.
- 인증·결제·개인정보·관리자 권한 변경은 정상 경로뿐 아니라 부정·만료·중복·재생·권한 역조건을 테스트한다.

## 7. Database and Migration Rules

스키마 기준은 `app/lib/db/schema.ts`, migration 기준은 `drizzle/migrations`와 journal이다.

- PK, FK, UNIQUE, CHECK, NOT NULL, index와 cascade/retention 정책을 실제 업무 규칙과 조회 패턴에 맞춘다.
- 상태 변경과 이력, 결제와 access grant, 수집 데이터와 provenance처럼 함께 바뀌어야 하는 값은 원자적으로 처리한다.
- 이미 적용된 migration을 수정하지 않는다. 변경은 새 migration으로 만든다.
- `drizzle-kit push`로 운영 스키마를 우회하지 않는다.
- migration 전후 호환성, 재시도 안전성, 백업·복구와 rollback 경로를 정의한다.
- 운영 migration, ingest, seed, backfill은 대상·백업·dry-run·승인을 확인하기 전 실행하지 않는다.
- schema 또는 migration을 변경하면 migration consistency tests와 관련 repository/integration tests를 실행한다.

## 8. UI, UX, Content, and Accessibility

- KR과 EN의 buyer·가치제안·CTA·가격·법적 상태를 각각 유지한다.
- 정보 우선순위, primary action, 정상·로딩·빈 상태·오류·권한 부족·네트워크 실패·저장 상태를 설계한다.
- 모바일과 데스크톱에서 핵심 행동이 유지되어야 하며 최소 360px와 1440px을 확인한다.
- 입력에는 label, 오류 연결, 키보드 focus, 충분한 대비와 색상 이외의 상태 표현을 제공한다.
- 위험 작업에는 결과, 확인, 취소 또는 복구 경로를 제공한다.
- 구매자 카피는 `docs/requirements`의 quota·가격·상용화·evidence 계약과 일치해야 한다.
- 실제 고객 성과처럼 보이는 정밀 절감률·성공률·testimonial을 증거 없이 만들지 않는다.

## 9. Implementation and Editing Rules

1. 관련 코드, 데이터, 테스트와 최근 결정을 먼저 읽는다.
2. 하나의 사용자 가치를 완결하는 가장 작은 안전한 변경을 한다.
3. 같은 작업 단위에서 정상·실패·경계·권한 테스트를 추가하거나 갱신한다.
4. 관련 검증을 실행하고 실패 원인을 수정한다.
5. 회귀 검증 후 harness 상태와 보고서를 갱신한다.

추가 규칙:

- 사용자의 기존 변경을 덮어쓰거나 관련 없는 diff를 정리하지 않는다.
- generated artifact는 생성 원본과 공식 생성 명령을 확인하고 손으로 수정하지 않는다.
- 의존성 추가는 기존 도구로 해결할 수 없는지 확인하고 lockfile 영향·보안·bundle·runtime 비용을 검토한다.
- 환경변수는 값이 아니라 이름과 목적만 문서화한다.
- 모르는 사실은 안전한 기본값으로 fail-closed하거나 `정보 부족`으로 남긴다.
- 범위 밖 문제는 현재 변경에 섞지 않고 queue 또는 보고서에 분리한다.

## 10. Verification Matrix

변경 위험에 비례해 다음을 선택하되 실행하지 않은 검증을 통과했다고 쓰지 않는다.

기본 정적·회귀 검사:

```powershell
npm run harness:instructions
npm run harness:landing-goal
npm run harness:en-balance
npm run harness:en-balance:pixels -- <receipt.json>
npm run lifecycle:validate
npm test
npx tsc --noEmit
npm run lint
git diff --check
node scripts/check-sensitive-strings.mjs .harness-blocklist.local
node scripts/check-harness-placeholders.mjs docs/harness
node scripts/check-state-json.mjs docs/harness/STATE.json
```

제품 runtime 또는 UI 변경 시:

```powershell
npm run build
$env:GLOSOURCE_BASE_URL='http://localhost:3000'; npm run growth:live-contract
```

- 문서·local harness만 변경하면 build를 생략할 수 있으나 이유와 마지막 build 증거를 보고한다.
- API/DB/provider 변경은 관련 단위·통합·실패경로 테스트를 추가한다.
- UI 변경은 대표 사용자 흐름, 360px/1440px, 접근성, 실제 카피·가격·CTA를 확인한다.
- 배포 완료는 build 성공만이 아니라 artifact, 환경 계약, migration, health, 핵심 smoke, 로그와 rollback 증거가 있어야 한다.

## 11. Git, Release, and External-Effect Boundaries

- `git status --short`로 소유 범위를 확인하고 명시 파일만 다룬다.
- `git add .`, 기본 브랜치 직접 커밋, force push, destructive reset은 금지한다.
- commit, push, PR, merge, workflow dispatch와 master 승격은 사용자 명시 요청이 있을 때만 한다.
- 현재 promotion 흐름은 feature branch 검증 후 수동 `workflow_dispatch`, `PROMOTE` 확인, production environment 승인, fast-forward만 허용한다.
- GitHub/Vercel 설정 변경, secret 입력, 운영 배포·rollback, 운영 DB 변경은 각각 별도 승인과 사후 검증이 필요하다.
- 이메일·DM·SNS 게시, 실제 결제·환불, 유료 광고·API·리드 구매, 외부 파일 공유는 초안·dry-run과 실제 실행을 구분하고 실행 전 승인을 받는다.
- 승인 기록이나 readiness packet은 실제 실행·배포·게시 완료 증거가 아니다.

## 12. Documentation, Memory, and Reports

문서 역할을 섞지 않는다.

- `docs/requirements`: 승인된 제품·route 계약
- `docs/plans`: 구현 계획과 acceptance criteria
- `docs/harness`: 상태, 규칙, queue, 검증, 결정, lifecycle
- `docs/operations`: 배포·운영·복구와 실행 메타프롬프트
- `docs/whitepapers`: 영업·홍보 산출물

세션 종료 시 관련 `STATUS.md`, `STATE.json`, `TASK_QUEUE.md`, `TESTS.md`와 보고서를 실제 결과에 맞춰 갱신한다. 결정은 이유와 대안을 남기고, 반복되는 고위험 실패는 원인·예방 검사·증거를 기존 failure/decision 체계에 기록한다.

기록하지 않는 것:

- 비밀번호, token, session, secret, 개인정보
- 해결된 임시 로그와 불필요한 전체 대화
- 실행하지 않은 테스트·배포·발송 완료 주장
- 증거 없는 고객 반응, 공급사 검증, KPI

## 13. Agent and Model Orchestration

- 랜딩페이지 장기 작업의 모델 라우팅·토큰 절약·승급 기준은 `docs/operations/GLOSOURCE_LANDING_LONG_RUNNING_METAPROMPT.md`를 따른다.
- `/en`의 70:30은 `docs/plans/2026-08-25-en-70-30-measurement.md`의 product-supporting 70% floor와 culture-only 30% cap으로 검사하며 pixel 비율로 오인하지 않는다.
- 실제 높이 비중은 브라우저에서 수집한 제한된 receipt를 `npm run harness:en-balance:pixels -- <receipt.json>`로 판정하며 receipt가 없으면 완료로 주장하지 않는다.
- 병렬화는 독립적이고 충돌 없는 작업이 실제 시간을 줄일 때만 사용한다.
- 같은 파일·schema·공통 interface를 여러 에이전트가 동시에 수정하지 않는다.
- 하위 작업에는 목표, 범위, 소유 파일, 입력, 완료 조건, 검증과 금지 대상을 전달한다.
- 파일 탐색·형식 변환·정적 확인은 도구와 최소 충분 추론을 우선한다.
- 복합 통합, 보안·권한, 데이터 정합성, 원인 불명 장애만 단계적으로 높은 추론에 승급한다.
- 상위 모델도 테스트·컴파일·실행·원본 증거를 대체하지 않는다.
- 에이전트 수나 답변 길이를 품질의 근거로 사용하지 않는다.

## 14. Failure, Stop, and Recovery Rules

실패 시 다음을 기록한다.

- 재현 명령과 안전하게 정리된 실제 결과
- 기대 결과와 실패 계층
- 영향 범위와 원인 가설
- 최소 수정과 재검증 결과
- 남은 위험과 rollback/recovery 경로

같은 원인의 실패가 세 번 반복되고 새 증거나 안전한 우회로가 없으면 같은 접근을 멈추고 blocker와 필요한 사용자 결정을 보고한다.

즉시 멈추는 조건:

- 사용자 변경과 충돌하거나 데이터 손실 가능성이 있음
- secret·개인정보 노출 가능성이 있음
- scope·제품 계약·lifecycle state가 서로 충돌함
- 운영 변경·외부 발송·유료 작업에 필요한 승인이 없음
- migration·rollback·backup 상태를 확인할 수 없음
- 테스트가 요구사항의 완료 조건을 실제로 증명하지 못함

## 15. Definition of Done and Final Report

완료는 구현량이 아니라 검증 가능한 결과다.

- 요구사항·설계·코드·테스트·보고서가 추적 가능하게 연결되어 있다.
- 정상·오류·경계·권한·빈 상태가 변경 위험에 맞게 검증됐다.
- 보안·개인정보·데이터 무결성과 KR/EN product boundary가 유지됐다.
- lifecycle exit criteria가 충족되거나 미충족 blocker가 정직하게 남았다.
- 실행한 명령, 통과 결과, 생략한 검증과 이유가 기록됐다.
- 외부 실행 여부와 실제 증거가 명확히 구분됐다.
- 변경 파일, 남은 위험, rollback/recovery와 다음 READY가 보고됐다.

최종 보고는 다음 순서로 작성한다.

1. 달성된 사용자 결과
2. 변경 파일과 핵심 결정
3. 실행한 검증과 결과
4. 실행하지 못한 검증과 이유
5. 외부 영향·승인 상태
6. 남은 위험과 다음 단계
