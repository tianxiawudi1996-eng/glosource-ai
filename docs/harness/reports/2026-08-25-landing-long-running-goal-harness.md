# 2026-08-25 Landing Long-running Goal + Harness 보고서

## 결과

GloSource AI 랜딩페이지 장기 작업을 단일 Goal과 실행 메타프롬프트로 고정했다. EN은 기존 제품 계약과 카피를 보존하면서 증거 70 : 절제된 한국미 30을 유지한다. 모델 라우팅은 Luna 경량 조사, Terra 일반 구현, Sol 고위험 판단·최종 통합으로 구분하며 기본 단일 에이전트, 단계적 승급, 동일 증거 중복 읽기 방지를 계약으로 삼았다.

현재 제품 Lifecycle은 brownfield P10 `blocked` 상태를 유지한다. 이번 변경은 로컬 Harness 채택이며 P10 완료, commit, push, provider 변경, migration, 게시와 배포를 수행하지 않았다.

## 변경 범위

- `docs/operations/GLOSOURCE_LANDING_LONG_RUNNING_METAPROMPT.md`: 3,175자 장기 실행 계약과 모델 라우팅.
- `docs/harness/GOAL.md`: 활성 랜딩 Goal, P10 경계와 외부 승인 조건.
- `scripts/check-landing-goal-harness.ts`: 필수 계약 섹션, 모델 3종, 70:30 계약, 승인·중단 조건 드리프트 검사.
- `tests/landing-goal-harness.test.ts`: 정상 계약, 모델 경로 삭제, 승인 경계 약화의 3개 회귀 시나리오.
- `package.json`, `AGENTS.md`, `scripts/check-agent-instructions.ts`: `npm run harness:landing-goal` 진입점과 상시 지침 연결.

## 검증 증거

- Prompt strict validator: PASS, 필수 계약 8/8, placeholder 0, warning 0.
- Prompt SHA-256: `8E31C8C92D1020487935EE8F3DF4A4023B3B9057E2329A6094824A5DBC25D653`.
- 집중 Harness/지침 테스트: 8/8 PASS.
- `npm test`: 251/251 PASS.
- `npx tsc --noEmit`: PASS.
- `npm run lint`: exit 0, 오류 0, 기존 경고 16.
- `npm run lifecycle:validate`: clean.
- `npm run lifecycle:status`: P10 blocked; 기존 blocker 3건 유지.

## 생략 검증

제품 UI·runtime 코드를 변경하지 않아 `npm run build`와 브라우저 QA는 실행하지 않았다. 직전 `/en` 화면 변경의 build·1440/390 브라우저 증거는 `docs/harness/reports/2026-08-21-en-restrained-korean-modern.md`에 있으며 이번 Harness 채택의 완료 증거로 재해석하지 않는다.

## 다음 READY

사용자의 다음 화면 변경 요구가 들어오면 메타프롬프트의 단일 Loop로 분해하고, 기본 Terra 구현 전에 Luna 읽기 전용 조사 필요성을 판정한다. 보안·결제·제품 계약 충돌이 없으면 Sol 승급을 사용하지 않는다.
