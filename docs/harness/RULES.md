# RULES

## Non-negotiable Safety Lines

- 승인 전 push 금지
- 기본 브랜치 직접 커밋 금지
- `git add .` 금지
- 사용자 미커밋 변경 덮어쓰기 금지
- 비밀·민감문자열·개인정보·비공개 산출물 커밋 금지
- 유료 리소스 생성, 외부 배포, 외부 업로드는 게이트
- BLOCKED 작업 구현 금지
- READY 1개 초과 수행 금지
- 외부 이메일·DM·게시·결제는 사람 승인 전 금지
- 실제 공급사, 인증, MOQ를 증거 없이 단정하지 않는다.

## Work Rules

1. 항상 캘리브레이션 먼저.
2. `TASK_QUEUE.md`의 READY 최상단 1개만 선택.
3. GloSource 4개 완료마다 K-DEFENSE 1개를 우선 배치해 80:20을 유지.
4. 구현 전 done 조건, 수정 범위, 제외 범위, 검증 명령을 고정.
5. 작업 중 발견한 별도 문제는 큐에 추가하고 현재 작업에 끼워 넣지 않는다.
6. 완료는 테스트와 원본 증거로만 주장.
7. STATUS, STATE, TASK_QUEUE를 구현과 함께 갱신.
8. 게이트는 숨기지 않고 묶어서 보고.

## Lifecycle Rules

1. 세션 시작 시 `npm run lifecycle:validate`와 `npm run lifecycle:status`를 실행한다.
2. 현재 lifecycle phase와 READY 작업 범위가 일치하지 않으면 구현하지 않는다.
3. phase를 건너뛰거나 과거 phase를 증거 없이 완료 처리하지 않는다.
4. phase 완료는 manifest의 모든 exit criterion과 approval gate 참조가 있을 때만 기록한다.
5. `npm run lifecycle:complete -- <evidence.json>`이 생성한 보고서와 state 전이를 분리하지 않는다.
6. approval reference는 외부 행동 권한이 아니며 실제 실행은 기존 승인 규칙을 다시 적용한다.
7. lifecycle evidence에는 비밀값, reviewer 신원, 이메일, provider payload, 원시 민감 로그를 넣지 않는다.
8. P16 retirement는 파괴적 작업이므로 별도 사람 승인과 복구·데이터 증거 없이는 시작하지 않는다.

## Data Rules

- 예시·더미·본인 테스트는 외부 KPI에서 제외한다.
- 리드에는 ICP 근거, 출처, 연락 채널, 발송일, 결과, 증거 위치를 기록한다.
- 개인 이메일과 비공개 응답 원문은 `reports/harness/private/` 또는 외부 비공개 저장소에 두고 git에 커밋하지 않는다.
- 공개 repo에는 집계 수치, 익명화된 식별자, 허용된 링크만 남긴다.
- K-DEFENSE 플랫폼 수치는 캡처 시각과 URL 또는 export 파일을 함께 기록한다.
- KPI 수정 시 이전 값을 덮어쓰지 말고 날짜별 누적 기록을 남긴다.

## Commit Rules

- 커밋은 사용자가 명시적으로 승인한 경우에만.
- 제품 변경은 feature branch에서만 커밋.
- 커밋 전 `git status --short`와 staged 파일을 수동 확인.
- `git add <명시 파일>`만 허용.
- 커밋 메시지는 `type(scope): summary` 형식 권장.

## Review Rules

- 랜딩 카피는 K-Beauty OEM 타깃과 risk-reduced shortlist 관점을 유지한다.
- 가격·검색 quota·결제 상품은 실제 배포 설정과 일치해야 한다.
- 샘플 리포트는 사실, 공급사 주장, AI 해석, 미확인을 구분한다.
- K-DEFENSE는 조회수보다 교육자료 요청, 저장, 공유, 플레이 전환을 우선 본다.
- 모든 계속/수정/중단 판단에는 KPI 수치와 증거 위치가 필요하다.
