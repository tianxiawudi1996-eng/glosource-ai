# WORKFLOW

## Session Start

1. `PROJECT_OS.md` 읽기.
2. 캘리브레이션 명령 실행.
3. git, STATE, STATUS, TASK_QUEUE 대조.
4. 기본 브랜치와 dirty worktree 위험 확인.
5. READY 최상단 1개 범위 잠금.

## Increment Loop

```text
Inspect → Select READY 1 → Plan → Implement → Update → Test → Report
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
3. STATE, STATUS, TASK_QUEUE 갱신.
4. `REPORT_TEMPLATE.md` 형식으로 보고.
5. 커밋·push·외부 행동은 게이트로 요청.

## Failure Handling

- 테스트 실패: 현재 READY 범위 안에서 수정 후 재실행.
- 민감 문자열 감지: 값을 출력하지 않고 제거 후 재실행.
- placeholder 감지: 현재 프로젝트 값으로 채우거나 `TODO_USER_INPUT:`으로 명시.
- state 불일치: 제품 구현 중지, 상태 문서부터 수리.
- 사용자 변경 충돌 위험: 즉시 중지하고 파일과 위험을 보고.
- 외부 KPI 증거 부재: 0으로 기록하고 추정하지 않는다.
- READY가 거짓: BLOCKED로 이동하고 다음 READY를 재검증.
