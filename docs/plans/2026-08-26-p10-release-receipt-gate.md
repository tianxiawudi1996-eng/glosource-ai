# P10 Release Receipt 다음 게이트 계획

## 작업 카드

- ID: `P10-RELEASE-RECEIPT-GATE-20260826`
- 사용자 변화: 운영자가 current candidate의 로컬 artifact 증거와 P10 외부 승인 상태를 혼동하지 않는다.
- 기준선: `npm run readiness:release-receipt`의 sanitized report.
- 성공: `ready` 또는 정확한 blocker의 `blocked`를 재현하고, 허용되지 않은 복구·외부 실행은 0건이다.
- 범위: 전용 실행 메타프롬프트, drift 검사·테스트, read-only receipt 판정, Harness 보고.
- 비범위: source 정리, commit/push, provider/OAuth, migration, staging/Production.

## 현재 관찰

- candidate SHA: 실행 시점 `git rev-parse HEAD`가 정본.
- receipt·archive binding과 smoke는 통과했다.
- working tree가 dirty라 `SOURCE_DIRTY`로 blocked다.
- 큐 계약상 dirty는 자동 package/receipt 복구 대상이 아니며 즉시 중단 조건이다.

## 순서

1. Git/Lifecycle/요구사항/receipt 구현과 테스트를 감사한다.
2. 다음 게이트 실행 메타프롬프트를 strict 계약으로 고정한다.
3. 전용 drift 검사와 반대 사례 회귀 테스트를 추가한다.
4. receipt 판정 결과에 Decision Table을 적용한다.
5. focused/full 정적 검증과 Harness 검사를 실행한다.
6. 실제 blocker와 미실행 작업을 상태·보고서에 동기화한다.

## 완료·중단

현재 Loop는 `SOURCE_DIRTY`를 안전하게 재현하고 package/create를 실행하지 않은 상태에서 로컬 게이트 감사 완료로 판정할 수 있다. 이는 P10 완료가 아니다. clean candidate 생성에는 별도 commit 권한과 변경 소유권 결정이 필요하다.
