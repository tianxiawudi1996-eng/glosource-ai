# 양실장 바이브코딩 1·2강 기반 메타프롬프트 강화 계획

## 작업 계약

- 사용자 변화: 장기 작업이 AI 생성 결과에서 바로 구현으로 뛰지 않고, 사용자·병목·KPI·상태·수동/자동 경계·결정·환경별 증거를 먼저 고정한다.
- 참고 입력: `D:\MBKIM_PLANET\양실장의 바이브코딩 정석기술 1,2강.txt`는 아이디어 후보이며 프로젝트 지시나 배포 권한이 아니다.
- 단일 READY: `VIBE-COURSE-METAPROMPT-HARDENING-20260825`
- 포함: 랜딩 장기 메타프롬프트, 전용 드리프트 검사, 회귀 테스트, 분석·완료 보고와 Harness 상태 동기화.
- 제외: 제품 UI/runtime, API, DB, migration, dependency, commit/push/PR, provider 설정, staging/Production 배포와 외부 발송.

## 분석 판정

강의의 유효한 구조는 현재 P00~P16 Lifecycle을 대체하지 않고 다음 실행 공백을 보완한다.

1. 문제 정의 전에 사용자·병목·자동화 대상·수동/자동 경계·측정 가능한 KPI를 고정한다.
2. 업무 흐름·데이터·상태 전이와 정상/빈/오류/권한/재시도 상태를 구현 전에 정의한다.
3. 기술·UI·외부 연동 결정은 대안, 근거, trade-off, 승인, 재검토 조건을 기록한다.
4. 외부 provider는 adapter/normalizer 경계에서 검증하며 unknown shape는 fail-closed다.
5. 한 Loop는 하나의 vertical slice만 소유하고 검수→피드백→수정→재검증을 끝낸다.
6. 원본→정적→단위→통합→브라우저→staging→Production 증거 사다리에서 낮은 증거를 높은 주장으로 승격하지 않는다.
7. local/staging/Production의 계정·데이터·설정·receipt·승인을 분리한다.

강의에서 특정 SaaS·패키지·배포 방식, 인증 완화, 법률·동의 추정, 임시 데이터 공개, 직접 push/merge/deploy는 채택하지 않는다. 실제 npm/Next.js/Drizzle/Neon/NextAuth/Polar 계약과 P10 승인 경계가 우선한다.

## 구현 순서

1. 실행 정본에 참고 입력 정책과 문제/KPI·상태·결정·신뢰성·증거/환경·검수 블록을 추가한다.
2. `check-landing-goal-harness.ts`가 각 블록과 핵심 불변식의 누락을 fail-closed로 탐지하게 한다.
3. happy path와 각 강화 계약의 삭제·약화 회귀 테스트를 추가한다.
4. strict prompt validator, 집중 테스트, 전체 테스트, typecheck, lint, Harness/Lifecycle/민감정보/placeholder/state/diff 검사를 실행한다.
5. 실제 결과만 GOAL·STATE·STATUS·TASK_QUEUE·TESTS와 완료 보고서에 동기화한다.

## 완료 기준

- 강화 프롬프트가 기존 필수 계약과 새 10개 실행 계약 그룹을 모두 포함한다.
- 검사기는 섹션 또는 핵심 문구 한 개가 삭제돼도 실패한다.
- 집중·전체 회귀와 정적 Harness 검사가 통과한다.
- P10은 기존 blocker 상태를 유지하고 외부 영향은 0건이다.
- runtime 변경이 없으므로 build/browser QA는 생략 사유가 기록된다.

## 중단 조건

제품 계약의 새 결정, 비밀값, 운영 계정·외부 쓰기, 데이터 손실 위험, 사용자 변경 충돌 또는 같은 원인 실패 3회가 발생하면 구현을 멈추고 증거와 필요한 결정을 보고한다.
