# GOAL

## Lifecycle Continuity Goal

모든 신규 GloSource 작업은 `docs/harness/lifecycle/PHASES.json`의 P00-P16 순서를 따른다. 각 phase는 전용 metaprompt, exit criteria, approval gate와 완료 보고서를 가지며 `npm run lifecycle:validate`가 연결 상태를 검사한다.

현재 제품은 brownfield 기준선 P10 Release Readiness에서 blocked다. 과거 P00-P09를 새 하네스에서 완료한 것처럼 소급 기록하지 않는다.

## Completed Local Landing Goal — 2026-08-25

기존 KR/EN 제품 계약과 문구를 보존하면서 `/en`을 증거 중심 70%, 절제된 한국적 이미지·여정 30%로 고도화하고, 단계별 메타프롬프트·모델 라우팅·검증 증거·완료 보고를 Repository Harness로 연결한다.

- 실행 계약: `docs/operations/GLOSOURCE_LANDING_LONG_RUNNING_METAPROMPT.md`
- 완료 증거: `/en` 구조 90:10, source-bound 360×800·1440×900 실제 높이 receipt, 263/263 회귀 테스트, 반응형 browser QA와 최종 완료 감사 보고서
- 완료 감사: `docs/harness/reports/2026-08-25-landing-goal-completion-audit.md`
- 현재 Lifecycle: P10 `blocked`; 이 Goal은 phase를 우회하거나 완료 처리하지 않는다.
- 외부 영향: commit, push, provider 변경, migration, 게시와 배포는 별도 명시 승인 전 금지한다.

## Completed Vibe-course Metaprompt Hardening Goal — 2026-08-25

양실장의 바이브코딩 정석기술 1·2강을 비권위 참고 입력으로 분석하고, 유효한 문제정의·병목·KPI·상태·수동/자동·결정·신뢰성·증거/환경·검수 원칙을 현재 GloSource 장기 실행 정본과 드리프트 Harness에 결합한다.

- 실행 정본: `docs/operations/GLOSOURCE_LANDING_LONG_RUNNING_METAPROMPT.md`
- 단일 READY: `VIBE-COURSE-METAPROMPT-HARDENING-20260825`
- 완료 증거: strict prompt 8/8, 강화 회귀 11/11, 전체 271/271, typecheck, lint error 0
- 완료 보고서: `docs/harness/reports/2026-08-25-vibe-course-metaprompt-hardening.md`
- 현재 Lifecycle: P10 `blocked`; 강의의 push·배포·인증 완화·법률 추정은 적용하지 않았다.
- 외부 영향: commit, push, provider 변경, OAuth, migration, 게시와 배포 0건.

## Completed P10 Release Receipt Next-gate Goal — 2026-08-26

current candidate의 local release receipt를 장기 Goal+Harness로 판정하고, `ready`/clean recovery/dirty·unknown 차단 경계를 실행 메타프롬프트와 회귀 검사로 고정한다.

- 실행 정본: `docs/operations/GLOSOURCE_P10_RELEASE_RECEIPT_GATE_METAPROMPT.md`
- 단일 READY: `P10-RELEASE-RECEIPT-GATE-20260826`
- 실제 판정: `blocked / SOURCE_DIRTY`; receipt valid, archive bound, smoke green
- 안전 결과: package/create/commit/push/provider/migration/staging/Production 0건
- 완료 증거: focused 13/13, 전체 278/278, typecheck, lint error 0
- 보고서: `docs/harness/reports/2026-08-26-p10-release-receipt-gate.md`
- Lifecycle: P10 `blocked` 유지; 이 로컬 Goal 완료는 phase 완료가 아니다.

## One-line Goal

14일 동안 해외 바이어 접촉과 교육형 콘텐츠 실험을 실행하면, GloSource AI의 유료 가능성과 K-DEFENSE의 교육형 IP 반응을 숫자와 원본 증거로 판정하는 보고서를 자동 축적한다.

## Why This Matters

두 프로젝트 모두 기능을 더 만드는 것이 아니라 실제 고객과 시청자의 행동으로 다음 투자 여부를 결정해야 한다. GloSource AI는 결제 가능성이, K-DEFENSE는 교육형 콘텐츠/IP의 반응이 핵심 불확실성이다.

## Primary User / Buyer / Operator

- 운영자: 대표와 사업화 PM AI
- GloSource 구매자: 미국·유럽 인디 뷰티 브랜드 창업자, Amazon FBA 뷰티 셀러, 소형 수입사
- K-DEFENSE 사용자: 한국사·전략 콘텐츠에 반응하는 학습자, 교사, 학부모, 역사 콘텐츠 시청자

## Production Context

GloSource AI는 이 Next.js 저장소의 `/en` 퍼널, Polar 결제, 성장 스크립트를 사용한다. K-DEFENSE는 외부 itch.io 게임과 쇼츠 채널의 반응을 검증하며, 이 저장소에는 실행 큐와 증거 링크만 관리한다.

## Wedge

- GloSource AI: AI 검색이 아니라 risk-reduced Korean OEM shortlist.
- K-DEFENSE: 상업 게임이 아니라 한국사를 플레이하며 배우는 교육형 콘텐츠 IP.

## Done Bar

- [ ] 실제 ICP 100명 접촉 및 원본 발송 증거
- [ ] GloSource 응답·샘플 요청·인터뷰·유료 의향·결제 증거
- [x] K-Beauty OEM 랜딩·샘플 CTA·현재 $39/$99/$249 결제 퍼널 green (`$19/$49`는 폐기된 가격)
- [ ] K-DEFENSE 쇼츠·클릭·플레이·상호작용·교육자료 요청·구매 증거
- [x] GloSource 80%, K-DEFENSE 20% 작업 비중 증거
- [x] 14일 계속/수정/중단 최종 보고서

## Non-goals

- 반응 없는 기능 확장
- 범용 공급사 검색 포지셔닝
- K-DEFENSE 완성형 게임 개발
- 가짜 증거 또는 보증성 공급사 표현

## Quality Bar

| Weak PoC | Production-grade target |
|---|---|
| 보고서 템플릿만 있음 | 매일 원본 증거와 KPI가 누적됨 |
| 예시 리드가 집계됨 | 실제 ICP와 발송 증거만 집계됨 |
| “관심 있다”를 구매 의사로 봄 | 가격 제시 후 명시적 구매 의사만 인정 |
| 자동화가 외부 발송까지 수행 | 외부 행동은 승인 게이트에서 멈춤 |
| 두 프로젝트를 같은 지표로 평가 | B2B 구매와 교육 IP 반응을 분리 판정 |
