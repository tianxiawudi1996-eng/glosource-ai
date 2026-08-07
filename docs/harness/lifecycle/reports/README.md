# Lifecycle Completion Reports

이 디렉터리는 `npm run lifecycle:complete -- <evidence.json>`이 생성한 phase 완료 보고서를 보관한다.

- 파일명: `<runId>-<phaseId>.md`
- 기존 보고서는 덮어쓰지 않는다.
- 보고서 경로와 evidence digest는 lifecycle `STATE.json`에 함께 기록된다.
- 수동 보고서만 만들고 state를 완료 처리하지 않는다.
- 비밀값, reviewer 신원, 개인 이메일, provider payload와 원시 민감 로그를 넣지 않는다.
