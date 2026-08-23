# GloSource AI 다음 진행 게이트 메타프롬프트

`다음진행` 요청을 여러 세션에서 동일하게 실행하기 위한 재개 계약이다. 이 문서는 구현 승인을 대신하지 않으며, 현재 Lifecycle과 실제 증거가 우선이다.

ROLE:

GloSource AI 저장소의 Lifecycle·Harness를 준수하는 실행 에이전트. 완료 주장보다 관찰 가능한 증거와 승인 경계를 우선한다.

GOAL:

현재 저장소에서 실행 가능한 `READY` 작업을 정확히 한 건 선택해 가장 작은 사용자 가치 단위를 완결한다. `READY`가 없으면 차단 작업을 구현하지 않고 재개 조건, 증거 공백과 사용자 결정을 보고한다.

USERS / EXPECTED CHANGE:

제품 소유자와 개발 담당자가 다음 작업을 즉시 재개할 수 있어야 한다. 작업 상태는 `미착수 / 진행 중 / 증거 있는 완료 / 승인된 보류 / 차단` 중 하나로 남기며, KR(`/`)과 EN(`/en`) 제품 경계와 기존 사용자 변경을 보존한다.

CONTEXT:

단일 정본은 `docs/harness/lifecycle/PHASES.json`이며 보조 상태는 `docs/harness/STATE.json`, `STATUS.md`, `TASK_QUEUE.md`, `TESTS.md`다. 현재 P10 Release Readiness는 다음 외부 게이트로 차단되어 있다.

- `GITHUB_PRODUCTION_INDEPENDENT_REVIEWER_MISSING`
- `GITHUB_PRODUCTION_SELF_REVIEW_PREVENTION_MISSING`
- `FRESH_EXECUTION_APPROVAL_ABSENT`

따라서 로컬 food-registry 활성화, 운영 배포·migration·ingest, 외부 발송은 현재 `READY`가 아니다.

SCOPE:

- `git status -sb`로 기존 변경을 식별하고 보존한다.
- README, 프로젝트 `AGENTS.md`, 관련 요구사항·Harness·Lifecycle prompt를 읽는다.
- `npm run lifecycle:validate`, `npm run lifecycle:status`로 현재 상태를 재확인한다.
- `TASK_QUEUE.md`에서 실행 가능한 `READY` 정확히 한 건만 잠근다.
- READY가 있으면 요구사항 ID, 수용조건, 실패·권한·접근성 경로를 고정하고 최소 변경→관련 검증→문서 보고 순서로 실행한다.
- READY가 없으면 본 메타프롬프트와 증거 보고서만 갱신하고 멈춘다.

OUT OF SCOPE:

P10 차단 우회, 상태 수동 승격, 운영·외부 시스템 변경, DB migration/ingest, 결제·OAuth·Secret 사용, commit/push/deploy, 이메일·DM·SNS 게시, 완료되지 않은 테스트·성과의 PASS/실적 표기.

INPUTS / SOURCE OF TRUTH:

1. 현재 사용자 요청과 승인 범위
2. `docs/harness/lifecycle/PHASES.json` 및 현재 lifecycle state
3. `docs/harness/STATUS.md`, `TASK_QUEUE.md`, `TESTS.md`
4. 실제 코드·실행 명령·테스트 결과

TOOLS:

PowerShell, `rg`, `git`, `apply_patch`, 저장소 npm scripts, Lifecycle/Harness 검사기. 외부 앱·네트워크·운영 계정은 명시 승인이 있을 때만 사용한다.

AUTHORITY / PERMISSIONS:

- 읽기: 저장소 코드·문서·Harness와 로컬 실행 결과.
- 로컬 쓰기: 승인된 문서·테스트·코드 범위의 최소 변경.
- 외부 쓰기·배포·삭제·결제·자격증명: 현재 승인 없음. 정확한 대상·환경·권한을 별도로 승인받기 전에는 실행하지 않는다.

WORKFLOW:

`Inspect → 상태표 → READY 1건 → 수용조건 → 작업 1건 → 관련 검증 → 증거 보고 → 문서 갱신`.

READY가 없거나 동일 원인의 실패가 세 번 반복되면 즉시 `STOP`하고 blocker와 필요한 결정을 기록한다. 검증이 변경 위험을 실제로 증명하지 못하면 PASS라고 쓰지 않는다.

CONSTRAINTS:

- 한 Loop에는 측정 가능한 작업 단위 하나만 둔다.
- 사실·가정·미결정·승인을 구분한다.
- 사용자 dirty 변경과 완료 산출물을 덮어쓰지 않는다.
- 비밀번호·토큰·쿠키·개인정보를 기록하지 않는다.
- 실제 고객·공급사·결제·KPI 증거가 없으면 예시 또는 미확인으로 표시한다.

SUCCESS CRITERIA:

- 이 계약에 따라 현재 상태를 재현할 수 있다.
- READY 작업은 하나만 선택되고 수용조건·검증 결과·변경 파일이 추적된다.
- READY가 없으면 차단 사유와 재개에 필요한 승인/구성이 명확히 보고되고 코드·운영 상태는 변하지 않는다.
- 메타프롬프트는 4,000자 이내이며 필수 섹션과 검증 명령이 누락되지 않는다.

FAILURE CRITERIA / STOP CONDITION:

Lifecycle·제품 계약·승인 범위가 충돌하거나, READY 근거가 없거나, 운영/외부 변경 승인이 없거나, 테스트가 완료를 증명하지 못하면 구현하지 말고 `BLOCKED`로 보고한다.

OUTPUTS / FORMAT:

- 상태: `READY`, `BLOCKED`, 또는 `증거 있는 완료`
- 선택 작업과 수용조건, 변경 파일, 실행 명령·실제 결과
- 생략한 검증과 이유, 외부 게이트, 남은 위험, 다음 READY 또는 사용자 결정
- 관련 `docs/harness` 보고서와 이 메타프롬프트 경로

VERIFICATION / EVIDENCE:

문서·Harness 변경 후 최소 `npm run harness:instructions`, `npm run lifecycle:validate`, `node scripts/check-sensitive-strings.mjs .harness-blocklist.local`, `node scripts/check-harness-placeholders.mjs docs/harness`, `node scripts/check-state-json.mjs docs/harness/STATE.json`, `git diff --check`를 실행한다. 코드/UI 변경이 있을 때만 관련 test, typecheck, lint, build, 브라우저 QA를 추가한다.

MEMORY UPDATE:

실제 상태가 바뀐 경우에만 관련 Harness 문서와 승인·실패 증거를 갱신한다. 장기 기억에는 결정·증거·미완료·재개 행동만 남기며 Secret과 전체 대화는 남기지 않는다.

STOP CONDITION:

현재 `READY`가 없으면 이 Loop를 `승인된 보류/차단`으로 종료하고 사용자에게 새 로컬 READY 작업 지정 또는 P10 외부 게이트 해결 중 하나를 요청한다. 승인 전에는 다음 Loop에서 동일 blocked 작업을 반복 실행하지 않는다.
