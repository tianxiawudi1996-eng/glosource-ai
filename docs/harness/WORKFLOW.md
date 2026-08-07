# WORKFLOW

## Session Start

1. `PROJECT_OS.md`와 `lifecycle/LIFECYCLE.md` 읽기.
2. `npm run lifecycle:validate`와 `npm run lifecycle:status` 실행.
3. 캘리브레이션 명령 실행.
4. git, STATE, STATUS, TASK_QUEUE와 lifecycle STATE 대조.
5. 기본 브랜치와 dirty worktree 위험 확인.
6. 활성 phase와 일치하는 READY 최상단 1개 범위 잠금.

## Increment Loop

```text
Validate Lifecycle → Read Active Prompt → Select READY 1 → Work Phase → Verify Exit Gate → Complete + Report → Next Phase
```

## Project Allocation

- 기본 작업 단위는 GloSource 4, K-DEFENSE 1.
- 외부 게이트로 GloSource가 막힌 경우 KDE READY가 있으면 20% 범위 안에서 진행 가능.
- 한 세션에서 두 프로젝트 작업을 섞지 않는다.
- FINAL 작업은 양쪽 KPI를 읽되 새로운 기능을 구현하지 않는다.

## Evidence Update

1. KPI 숫자를 갱신한다.
2. 각 숫자의 증거 링크 또는 로컬 비공개 위치를 기록한다.
3. 예시·더미·내부 테스트를 제외한다.
4. 가설이 바뀌면 DECISIONS에 남긴다.
5. STATUS, STATE, TASK_QUEUE를 함께 갱신한다.

## Session End

1. 모든 변경 파일 확인.
2. 테스트·guardrail 결과 기록.
3. phase가 완료됐다면 제한된 evidence JSON으로 `lifecycle:complete`를 실행해 보고서와 다음 상태를 함께 생성.
4. 미완료 또는 blocked면 lifecycle STATE를 완료로 바꾸지 않고 blocker를 보고.
5. STATE, STATUS, TASK_QUEUE 갱신.
6. `REPORT_TEMPLATE.md` 형식으로 보고하고 lifecycle phase report를 연결.
7. 커밋·push·외부 행동은 게이트로 요청.

## Failure Handling

- 테스트 실패: 현재 READY 범위 안에서 수정 후 재실행.
- 민감 문자열 감지: 값을 출력하지 않고 제거 후 재실행.
- placeholder 감지: 현재 프로젝트 값으로 채우거나 `TODO_USER_INPUT:`으로 명시.
- state 불일치: 제품 구현 중지, 상태 문서부터 수리.
- 사용자 변경 충돌 위험: 즉시 중지하고 파일과 위험을 보고.
- 외부 KPI 증거 부재: 0으로 기록하고 추정하지 않는다.
- READY가 거짓: BLOCKED로 이동하고 다음 READY를 재검증.
- lifecycle manifest/state/report 불일치: 기능 작업을 중지하고 `npm run lifecycle:validate` 오류부터 수리.
- phase 완료 보고서 생성 실패: 상태 전이를 완료로 주장하지 않고 report/state 파일을 함께 감사.
