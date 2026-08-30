# P10 Staging·Recovery·Release 실행 체크리스트

정본 메타프롬프트: `docs/operations/P10_STAGING_RECOVERY_RELEASE_METAPROMPT_2026-08-30.md`

## 현재 상태

- 상태: `PHASE_0_APPROVED — CANDIDATE_FREEZE_IN_PROGRESS`
- 활성 lifecycle: `P10 Release Readiness`
- 조사 기준 candidate: `5423da504030dcad7907c5ed274040340ff673b0`
- rollback: `eb7b171da0b79f925926ae6087fd9dc604cc3b98`
- 외부 DB 변경: 없음
- Secret 기록: 없음
- 승인 참조: `owner-approval-2026-08-30-p10-phases`
- 첫 READY: Phase 0 문서 commit/push와 final candidate 재동결
- 소유권 불명 변경: ignored/private로 이동 보존 완료, SHA-256 `524fcab8085719d99d932da718abb4e81e3f6a87f67fa2d66eea6b372cfbb206`

## Phase Gate Matrix

| Phase | 상태 | 완료 증거 | 실패 시 복구 | 다음 게이트 |
|---|---|---|---|---|
| 0 계약·후보 동결 | 진행 중 | prompt strict, Harness clean, clean pushed SHA | tracked 변경 재검증 | A-P10-1~5 |
| 1 staging 용량 | 차단 | pause receipt, new project ACTIVE_HEALTHY, 0/month | paused project restore | provider URL |
| 2 db:migrate | 미착수 | exact candidate, command exit 0, journal 6 | 새 staging만 복구/재생성 | backup |
| 3 backup→restore | 미착수 | backup digest, isolated restore mismatch 0 | restore target만 정리 | rollback smoke |
| 4 rollback smoke | 미착수 | exact rollback artifact HTTP/DB green | 임시 runtime 종료 | fresh receipts |
| 5 G_RELEASE·P10 | 미착수 | promotion validator ready, lifecycle P11 | stale evidence 폐기 | P11 별도 실행 |

## 공통 사전 점검

- [ ] 승인 ID, 정확한 대상 ID, 조직, 리전, 비용이 일치한다.
- [ ] `git status -sb`가 clean이고 candidate가 upstream/PR과 일치한다.
- [ ] Production DB·고객 데이터·다른 프로젝트를 사용하지 않는다.
- [ ] Secret은 process memory 또는 gitignored local secret에만 존재한다.
- [ ] Phase 완료 전 다음 Phase를 시작하지 않는다.
- [ ] tracked 변경 발생 시 candidate receipt를 폐기하고 Phase 0으로 돌아간다.

## Phase 0

- [x] 현재 lifecycle P10/blocker 4개 재확인
- [x] Supabase 생성 실패 원인과 Vercel Secret non-exportable 확인
- [x] 장기 실행 메타프롬프트·체크리스트 작성
- [x] strict prompt 8/8
- [x] Harness·sensitive·placeholder·STATE·diff 검사
- [x] 소유권 불명 메타프롬프트의 ignored/private 이동 보존
- [x] 사용자 사전 승인 `A-P10-1`~`A-P10-5`
- [ ] tracked 변경 commit/push와 final candidate 재고정

## Phase 1

- [ ] pause 전 `wzmzpuxpcpuvuacwmslj` 상태 기록
- [ ] 정확한 프로젝트 한 개 pause
- [ ] pause 후 상태 확인
- [ ] project 비용 0/month 재확인·confirm_cost
- [ ] `glosource-staging` 생성
- [ ] 조직/리전/상태 확인
- [ ] Phase 1 sanitized private report

## Phase 2

- [ ] provider-supported URL 안전 주입
- [ ] staging fingerprint·Production 비사용 확인
- [ ] `npm run db:migrate`
- [ ] migration journal 0000~0005
- [ ] schema·재실행 안전성 probe
- [ ] Phase 2 receipt digest

## Phase 3

- [ ] synthetic-only 확인
- [ ] candidate-bound backup와 SHA-256
- [ ] isolated restore target 확인
- [ ] restore 실행
- [ ] table/row/constraint/ledger mismatch 0
- [ ] 핵심 write/read/transaction cleanup
- [ ] Phase 3 receipt digests

## Phase 4

- [ ] rollback SHA artifact 확인 또는 격리 package
- [ ] restore DB 연결
- [ ] `/`, `/en`, `/api/auth/session` HTTP smoke
- [ ] DB 의존 핵심 경로와 하위호환성 smoke
- [ ] 임시 runtime/restore target의 승인 범위 내 정리
- [ ] Phase 4 receipt digest

## Phase 5

- [ ] 24시간 이내 backup·control-plane audit
- [ ] 30일 이내 staging·restore·rollback receipts
- [ ] candidate/rollback/context/digest equality
- [ ] exact evidence card로 fresh `G_RELEASE` 요청
- [ ] private promotion evidence JSON strict validation
- [ ] lifecycle completion command
- [ ] P10 report와 active P11 확인

## 금지 확인

- [ ] workflow dispatch 안 함
- [ ] merge/master 승격 안 함
- [ ] Production migration/deploy 안 함
- [ ] 유료 plan/branch 안 만듦
- [ ] 다른 project pause/delete 안 함
- [ ] Secret/provider payload를 문서·로그·Memory에 남기지 않음
