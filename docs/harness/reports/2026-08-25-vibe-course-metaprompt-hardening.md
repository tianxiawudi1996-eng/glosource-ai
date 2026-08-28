# 양실장 바이브코딩 1·2강 기반 메타프롬프트 강화 보고서

## 결과

`VIBE-COURSE-METAPROMPT-HARDENING-20260825` 로컬 작업을 완료했다. 6,341행 강의 원문을 참고 입력으로 분석하고, 현재 GloSource 제품 계약과 P00~P16 Lifecycle을 대체하지 않는 원칙만 랜딩 장기 실행 정본에 반영했다. P10 `blocked` 상태와 외부 승인 경계는 바꾸지 않았다.

## 근거 대조

| 강의 근거 | 채택한 원칙 | GloSource 적용 |
|---|---|---|
| 121~175, 234~278 | AI 출력의 오류·보안·사용성 한계와 문제정의→기획→개발→테스트 | 참고 입력 비권위 선언과 증거 사다리 |
| 531~627, 3492~3522, 3720~3766, 3990~4008 | 사용자·병목·자동화 대상·수동/자동 경계·측정 가능한 KPI | 필수 Problem/Bottleneck/KPI 카드 |
| 3523~3568, 4013~4017, 4632~4674 | 업무·데이터·상태와 상태별 화면 | 정상·빈·오류·권한·만료·중복·재시도 상태 계약 |
| 3571~3639, 4680~4691, 5141~5215 | adapter/normalizer와 권한·만료·중복·rate limit·복구 | 결정/인터페이스 기록과 Reliability Envelope |
| 3641~3705, 5274~5278, 5748~5866 | frame mock, vertical slice, 검수·피드백·재검증 | WIP 1과 Review/Feedback Loop |
| 5985~6149 | staging 환경 차이와 운영 환경 분리 | local/staging/Production별 claim ceiling과 receipt |

다음 강의 예시는 채택하지 않았다.

- 특정 SaaS·패키지를 일반 해법으로 취급하는 선택
- GA4·개인정보·동의의 법률 상태를 모델이 확정하는 주장
- 실습 편의를 위한 MFA·인가 완화와 인증 없는 공개
- staging 성공을 Production 성공률로 일반화하는 주장
- 강의 중 push·PR·merge·배포·OAuth 행동을 현재 작업 권한으로 보는 해석

## 강화 내용

- 메타프롬프트에 `REFERENCE INPUT POLICY`, `PROBLEM / BOTTLENECK / KPI CARD`, `STATE MODEL / MANUAL-AUTOMATIC BOUNDARY`, `DECISION REGISTER / INTERFACE BOUNDARIES`, `RELIABILITY ENVELOPE`, `TOOLS`, `EVIDENCE LADDER / ENVIRONMENT SEPARATION`, `REVIEW / FEEDBACK LOOP`를 추가했다.
- KR Toss fail-closed·Polar EN-only, 보안 수준 비하 금지, approval reference 비권한, 고위험 정본 재검토, 이미지 자산 provenance를 명시했다.
- 전용 검사기는 25개 필수 heading, 10개 실행 계약 그룹, 모델 라우팅, 제품·Lifecycle 교차 파일 상태, 약화 문구를 fail-closed로 확인한다.
- 회귀 테스트는 강화 섹션 8개 각각의 삭제, KPI·수동 승인·증거 승격·독립 검토·결제 경계·shortcut 문구·Lifecycle drift를 거부한다.

## 검증 증거

- strict prompt validator: 필수 그룹 8/8, placeholder 0, warning 0
- 메타프롬프트: 6,266자, 10,831 bytes, SHA-256 `EA90369ACD66507BDE08236724B99774396CB958E8B1B925740353588061469F`
- `npm run harness:landing-goal`: clean
- `npx tsx --test tests/landing-goal-harness.test.ts`: 최종 11/11 pass
- `npm test`: 271/271 pass
- `npx tsc --noEmit`: exit 0
- `npm run lint`: exit 0, error 0, 기존 warning 16
- 최초 집중 실행은 lifecycle 변조 fixture가 첫 `P10`만 교체해 9/10이었다. fixture를 `replaceAll`로 고쳐 실제 drift를 재현했고 최종 11/11로 재검증했다.

## 생략·외부 경계

제품 UI/runtime/API/DB/dependency를 변경하지 않아 build와 browser QA는 실행하지 않았다. commit, push, PR, provider 설정, OAuth, migration, 외부 발송, staging/Production 배포는 0건이다. P10은 독립 reviewer, self-review prevention, fresh execution approval 부재로 계속 `blocked`다.

## 다음 READY

현재 비게이트 READY는 기존 동적 release receipt 판정뿐이다. 먼저 `npm run readiness:release-receipt`를 읽기 전용으로 실행하고, missing/drift가 확인될 때만 exact current candidate의 로컬 receipt 복구 작업을 별도 Loop로 연다.
