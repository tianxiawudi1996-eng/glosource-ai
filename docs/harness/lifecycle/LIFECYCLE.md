# GloSource AI Full Lifecycle

## Operating Contract

이 디렉터리는 기존 `docs/harness` 아래에서 제품 생애주기 순서만 담당한다.
제품 목표·READY 큐·증거 규칙·외부 승인 규칙은 기존 하네스가 계속 우선한다.

`PHASES.json`은 phase ID, 순서, exit criteria, approval gate와 prompt 경로의 유일한 기계 기준이다.
`STATE.json`은 한 run의 현재 위치만 기록한다.

## Ordered Phases

| Phase | Name | Primary outcome |
|---|---|---|
| P00 | Intake and Strategy | 사용자·문제·목표·범위·성공지표 확정 |
| P01 | Discovery and Evidence | 현재 상태·근거·리스크·가정 조사 |
| P02 | Requirements | 테스트 가능한 요구사항과 예외·비기능 조건 확정 |
| P03 | Functional Design | 사용자 흐름·상태 전이·오류 복구 설계 |
| P04 | Architecture and Infrastructure | 구성요소·외부 의존성·관측·롤백 설계 |
| P05 | Data, Security and Privacy | 데이터 생명주기·권한·위협·마이그레이션 설계 |
| P06 | UI, UX and Content | 정보구조·상태·반응형·접근성·카피 설계 |
| P07 | Implementation Planning | 수직 구현 단위·의존성·파일·테스트 매핑 |
| P08 | Implementation | 가장 작은 안전한 구현과 단위 검증 완료 |
| P09 | Verification and QA | 통합·회귀·접근성·보안·E2E 판정 |
| P10 | Release Readiness | clean provenance·설정 이름·패키지·롤백 준비 |
| P11 | Staging and UAT | 검증 환경 배포·통합·사용자 인수·복구 연습 |
| P12 | Production Deployment | 승인된 운영 변경과 배포 영수증·스모크 증거 |
| P13 | Post-Deploy Validation | 건강 신호 관찰과 롤백 창 종료 판정 |
| P14 | Operations | runbook·알림·SLO·비용·지원 흐름 운영 |
| P15 | Maintenance and Iteration | 피드백·지표·기술부채로 다음 증분 결정 |
| P16 | Retirement | 종료 승인·데이터 처리·의존성 제거·최종 보고 |

## Session Loop

1. `npm run lifecycle:validate`로 manifest·state·prompt·report 링크를 확인한다.
2. `npm run lifecycle:status`로 활성 phase와 prompt를 확인한다.
3. 기존 `TASK_QUEUE.md`에서 READY 1개만 선택하고 활성 phase 범위와 교차 확인한다.
4. phase prompt의 입력·절차·stop condition을 따른다.
5. 외부 승인이나 민감정보가 필요하면 상태를 blocked로 유지하고 멈춘다.
6. exit criteria가 실제 증거로 충족되면 제한된 completion evidence JSON을 준비한다.
7. `npm run lifecycle:complete -- <evidence.json>`을 실행한다.
8. 명령은 보고서를 먼저 비덮어쓰기 방식으로 생성하고 state를 원자 교체한다.
9. 다음 세션은 새 active phase에서 같은 루프를 재개한다.

## Status Semantics

- `ready`: phase를 시작할 수 있다.
- `in_progress`: 현재 세션 또는 후속 세션이 같은 phase를 이어간다.
- `blocked`: 외부 상태·사람 결정·증거가 없어 완료할 수 없다.
- `complete`: P16까지 완료된 terminal run이다.

상태는 제품 성공이나 Production readiness를 대신하지 않는다.

## Completion Evidence Contract

completion evidence는 정확한 allowlist만 허용한다.

- `schemaVersion`, `runId`, `phaseId`, `completedAt`
- `criteria`: manifest exit criterion ID별 `pass`와 안전한 참조 목록
- `approvals`: manifest approval gate ID별 `approved`와 승인 참조 코드
- `verification`: 검증 코드별 `pass`와 안전한 참조

참조는 repo-relative 경로 또는 영문·숫자·점·슬래시·밑줄·하이픈으로 구성된 외부 증거 코드만 허용한다.
비밀값, reviewer 신원, 이메일, token, provider payload, 원시 로그와 자유서술은 받지 않는다.

## Report Contract

phase 완료 보고서는 `docs/harness/lifecycle/reports/<runId>-<phaseId>.md`에 생성된다.
보고서는 phase 목표, exit criteria, approval gate, 검증 참조, evidence digest, 다음 phase를 포함한다.
기존 보고서를 덮어쓰지 않으며 state의 report index와 일치해야 한다.

## Brownfield Adoption

현재 저장소는 이미 운영 중인 제품과 큰 미커밋 변경을 포함한다.
새 lifecycle은 과거 P00-P09를 통과했다고 소급 주장하지 않는다.
관찰된 현재 경계인 P10 Release Readiness에서 `brownfield` run을 시작하고, dirty provenance와 Production control-plane 차단을 기록한다.

## Recovery

- manifest/state 불일치: 구현을 중지하고 `lifecycle:validate` 오류부터 해결한다.
- report는 있으나 state index가 없음: 자동 완료를 반복하지 말고 파일과 state를 수동 감사한다.
- state는 전이됐으나 report가 없음: 완료 주장을 철회하고 이전 백업 또는 Git 증거로 복구한다.
- 외부 상태가 바뀜: 기존 evidence를 재사용하지 않고 현재 phase의 read-only 검증을 다시 실행한다.
- 과거 phase 결함 발견: 현재 phase를 계속 통과시키지 말고 새 READY 수정 단위를 만들고 필요한 phase로 새 run을 시작한다.

## External Authority Boundary

이 하네스는 Vercel, GitHub, 데이터베이스, 결제, 이메일, SNS 또는 배포 시스템을 호출하지 않는다.
승인 참조를 기록하는 것은 실제 승인과 변경 증거를 연결하는 일이며, 외부 작업 권한을 생성하지 않는다.
