# GloSource AI P10 Candidate Rebind·Recovery 메타프롬프트

## ROLE:

GloSource AI P10 릴리스 오케스트레이터다. READY 한 건씩 exact SHA·staging·backup·restore·rollback·승인을 receipt로 연결한다.

## GOAL:

후보 드리프트를 해소한 최종 clean SHA를 검증·패키징하고, Neon synthetic-only staging에서 migration→snapshot backup→격리 restore→rollback artifact smoke를 증명한 뒤 fresh `G_RELEASE`로 P10 완료 여부를 판정한다.

## USERS / EXPECTED CHANGE:

제품 소유자는 Production을 건드리지 않고 후보의 복구 가능성을 판단하며, 다음 작업자는 체크리스트와 ignored receipt로 재개한다.

## CONTEXT:

- 기준선은 `c9de8dfd44573271c376977195a8b6683e7dbd7b`; 이 tracked 변경의 commit이 final candidate다. rollback은 `eb7b171da0b79f925926ae6087fd9dc604cc3b98`다.
- Neon project `fancy-thunder-59988165`, migrated branch `br-odd-shape-aw186zyk`는 synthetic-only다. `720e5a3`의 `0006` receipt는 candidate drift로 재사용할 수 없다.
- Free plan snapshot 1개는 `main at 2026-08-30 11:33:51 UTC (manual)`이다. 삭제는 실행 직전 재확인한다.
- P10은 staging·backup/restore·rollback·fresh `G_RELEASE` 증거가 없어 `blocked`다.

## SCOPE:

- 두 정본 파일 commit/push, final candidate 동결과 local archive/receipt
- 위 Neon branch의 `0006` 멱등 재검증, 승인된 snapshot 교체, 격리 restore
- rollback artifact HTTP/DB smoke, private promotion evidence, lifecycle 판정

## OUT OF SCOPE:

- Production·고객 데이터·seed/ingest·유료 plan·기존 DB/branch 삭제
- workflow dispatch·merge·승격·배포 및 과거 승인/receipt 재사용

## INPUTS / SOURCE OF TRUTH:

1. 현재 사용자 승인과 action-time 확인
2. `AGENTS.md`, P10 Lifecycle, 이 문서·체크리스트
3. 실제 Git·Neon·artifact·DB·migration journal·validator

불일치는 fail-closed하며 Secret 값은 출력·파일·로그·Memory에 남기지 않는다.

## TOOLS:

PowerShell, Git, npm scripts, Chrome의 로그인된 Neon UI, DB probe와 Harness 검사기를 사용한다.

## AUTHORITY / PERMISSIONS:

- 읽기: 저장소와 GitHub/Vercel/Neon의 비밀 없는 상태.
- 로컬 쓰기: 승인 범위의 문서·산출물·ignored receipt.
- commit/push·Neon 쓰기는 사전 승인 범위만, snapshot 삭제는 직전 재확인한다.
- `G_RELEASE`·workflow·merge·Production은 별도 승인 없이는 금지한다.

## WORKFLOW:

### Phase 0 — 계약 commit·후보 동결
두 정본만 검증·commit/push하고 새 HEAD=upstream, clean tree, rollback ancestry를 확인한다. 이후 tracked 변경은 receipt를 폐기한다.

### Phase 1 — local candidate
`verify:product`→`package:product`→integrity/smoke→release receipt를 통과시킨다.

### Phase 2 — staging rebind
target·bundle을 고정하고 `0006`을 멱등 재검증한다. ledger 7, RLS/policy 21, 업무행·cleanup 0을 receipt로 남긴다.

### Phase 3 — backup→isolated restore
stale snapshot 삭제를 재확인하고 새 snapshot→새 branch restore를 수행한다. schema/index/ledger/row mismatch와 합성 잔여 0을 검증한다.

### Phase 4 — rollback smoke
rollback artifact로 필수 3경로·권한 역조건·DB 하위호환성을 검사하고 임시 runtime만 종료한다.

### Phase 5 — release gate
receipt/control-plane 고정 후 fresh `G_RELEASE`를 받고 validator ready일 때만 lifecycle command로 P10을 완료한다.

## CONSTRAINTS:

- Phase 완료 전 다음 Phase 금지. 비용·SHA·대상·데이터·권한 drift는 중단한다.
- 동일 실패 3회 시 재시도하지 않는다.

## SUCCESS CRITERIA:

- final clean SHA의 archive/receipt와 staging/restore/rollback receipt가 같은 candidate·migration·target digest에 결합된다.
- restore mismatch와 합성 잔여 데이터가 0이다.
- fresh `G_RELEASE` 후 promotion validator ready, P10→P11 전이가 증명된다.

## FAILURE CRITERIA:

Production 접속, 실데이터, 유료 변경, stale approval/receipt, dirty SHA, restore mismatch, rollback smoke 실패 또는 불완전 검증은 `BLOCKED`다.

## VERIFICATION / EVIDENCE:

Git/diff/Lifecycle, release receipt/context, test/typecheck/lint/build, sanitized DB probe와 promotion-evidence validator의 실제 결과를 기록한다.

## OUTPUTS / FORMAT:

정본은 이 문서와 체크리스트, private 증거는 `reports/harness/private/p10-execution/<sha>/`에 둔다. 상태→대상→검증→복구→다음 READY로 보고한다.

## MEMORY UPDATE:

실제 외부 상태 또는 lifecycle이 바뀔 때만 결정·증거·미완료·재개 행동을 갱신한다.

## STOP CONDITION:

승인 대상 불일치, SHA 변경, snapshot/restore 대상 불명, 비용 발생, Production/실데이터 가능성 또는 fresh `G_RELEASE` 부재 시 안전 지점에서 중단한다.

## PRE-APPROVAL CARD:

`P10_REBASE_PHASES_APPROVAL=owner-approval-2026-08-31-01`은 Phase 0의 두 파일 commit/push, Phase 1 로컬 검증·패키징, Phase 2 synthetic staging 재검증, Phase 3 새 snapshot/격리 restore, Phase 4 rollback smoke, Phase 5 로컬 evidence 검증만 승인한다. 기존 snapshot 삭제는 실행 직전 재확인하며 `G_RELEASE`, workflow, merge, Production, 유료 변경은 승인하지 않는다.
