# Lifecycle Goal

GloSource AI의 모든 작업 단위를 최초 의도 정의부터 운영·유지보수·폐기까지 하나의 검증 가능한 순서로 연결한다.

완료된 phase는 반드시 증거 코드, 안전한 참조, 승인 게이트 상태와 자동 생성 보고서를 남긴다.
다음 세션은 추측이 아니라 `STATE.json`의 활성 phase와 해당 metaprompt에서 재개한다.

## Done Bar

- P00-P16의 순서와 각 phase의 책임이 한 manifest에 존재한다.
- 모든 phase에 독립 metaprompt가 있다.
- 현재 phase만 시작·완료할 수 있고 phase skip은 거부된다.
- 완료 시 보고서와 다음 phase 상태가 함께 생성된다.
- 외부 영향 phase는 사람 승인 참조 없이는 완료되지 않는다.
- 과거 작업은 새 규칙을 통과한 것처럼 소급 기록하지 않는다.
- manifest, state, prompt, report drift를 테스트와 precommit check가 탐지한다.
