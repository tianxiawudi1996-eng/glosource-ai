# P10 Candidate Rebind·Recovery 실행 체크리스트

정본: `docs/operations/P10_STAGING_RECOVERY_RELEASE_METAPROMPT_2026-08-30.md`

## 현재 상태

- 상태: `PHASE_0_EVIDENCE_COMPLETE — PHASE_1_READY`
- lifecycle: `P10 Release Readiness / blocked`
- 문서 변경 전 기준선: `c9de8dfd44573271c376977195a8b6683e7dbd7b` = upstream
- final candidate: 이 완료 기록 commit의 `git rev-parse HEAD`로 동적 확정
- rollback: `eb7b171da0b79f925926ae6087fd9dc604cc3b98`
- staging: Neon `fancy-thunder-59988165` / `br-odd-shape-aw186zyk`
- 기존 `720e5a3` migration receipt: 통과했으나 candidate drift로 재사용 불가
- stale snapshot: `main at 2026-08-30 11:33:51 UTC (manual)`, 아직 삭제하지 않음
- Phase 0 외부 변경: 승인된 feature branch commit/push만 수행; Production/DB/provider 변경 0건

## Phase Gate Matrix

| Phase | 상태 | 완료 증거 | 다음 READY |
|---|---|---|---|
| 0 계약·후보 동결 | 증거 있는 완료 | `de0ee23` 계약 commit + 이 완료 commit, clean HEAD=upstream | local candidate |
| 1 local candidate | READY | verify/package/archive/receipt green | staging rebind |
| 2 staging rebind | 미착수 | ledger 7, RLS/policy 21, rows/cleanup 0 | backup→restore |
| 3 backup→restore | 차단 | 새 snapshot/restore, mismatch 0 | rollback smoke |
| 4 rollback smoke | 미착수 | exact rollback artifact HTTP/DB green | release gate |
| 5 release gate | 미착수 | fresh `G_RELEASE`, validator ready, P11 | 별도 Production 승인 |

## 공통 게이트

- [ ] 승인 ID와 exact SHA/project/branch/action 일치
- [ ] clean HEAD=upstream, rollback ancestor
- [ ] Production·고객 데이터·유료 변경 0
- [ ] Secret 출력·tracked 저장·raw receipt 0
- [ ] Phase당 READY 한 건, 실패 3회 시 중단

## Phase 0 — 계약·후보

- [x] 후보 drift `720e5a3`→`c9de8df` 탐지
- [x] 기존 snapshot 삭제 전 중단
- [x] 현재 정본을 Neon/candidate rebind 흐름으로 갱신
- [x] prompt strict 8/8·Harness·diff·sensitive 검사
- [x] `P10_REBASE_PHASES_APPROVAL=owner-approval-2026-08-31-01` 수신
- [x] 두 정본 파일만 contract commit `de0ee23`/push
- [x] 이 완료 기록 commit을 final 40자리 candidate로 사용
- [x] feature branch만 push; workflow·merge·Production·DB 변경 0

## Phase 1 — local candidate

- [ ] `npm run verify:product`
- [ ] `npm run package:product`
- [ ] archive blocked/all-zero 0, SHA-256
- [ ] `/`, `/en`, `/api/auth/session`, live contract smoke
- [ ] candidate-bound release receipt ready

## Phase 2 — staging rebind

- [ ] target fingerprint·synthetic-only·업무행 0
- [ ] final migration bundle/`0006` SHA 고정
- [ ] `0006` 멱등 재검증과 ledger 7
- [ ] RLS 21, exact restrictive policy 21, FORCE RLS 0
- [ ] owner write/read/delete, residual 0
- [ ] sanitized staging receipt digest

## Phase 3 — backup→restore

- [ ] stale snapshot exact 대상 action-time 삭제 확인
- [ ] stale snapshot 한 개만 삭제
- [ ] migrated branch의 새 snapshot 생성
- [ ] 새 격리 restore branch 생성; 기존 branch 유지
- [ ] table/column/constraint/index/ledger/row mismatch 0
- [ ] 합성 transaction rollback·residual 0
- [ ] backup·restore receipt가 같은 digest/candidate에 결합

## Phase 4 — rollback artifact

- [ ] rollback SHA artifact integrity
- [ ] restore DB 연결은 메모리 내 Secret만 사용
- [ ] `/`, `/en`, `/api/auth/session` HTTP 200
- [ ] 권한 역조건과 DB 하위호환성
- [ ] 임시 runtime 종료; restore target 삭제는 별도 승인

## Phase 5 — release gate

- [ ] receipt 유효기간·candidate/context equality
- [ ] current control-plane read-only 재감사
- [ ] exact digest 카드로 fresh `G_RELEASE`
- [ ] promotion evidence validator ready
- [ ] lifecycle command로 P10 완료/P11 확인
- [ ] workflow·merge·Production 실행 0

## 사전 승인 입력

```text
P10_REBASE_PHASES_APPROVAL=owner-approval-2026-08-31-01

승인 대상:
- Phase 0 두 정본 파일 commit/push와 final candidate 동결
- Phase 1 로컬 verify/package/release receipt
- Phase 2 Neon synthetic staging migration 멱등 재검증
- Phase 3 새 snapshot 및 새 격리 restore와 정합성 검사
- Phase 4 rollback artifact smoke
- Phase 5 fresh G_RELEASE 전 로컬 evidence 검증

재확인 필수:
- 기존 snapshot 삭제는 실행 직전 exact 대상 재확인
- G_RELEASE는 모든 digest 확정 후 별도 발급

금지:
- Production, workflow dispatch, merge, 유료 변경
- 기존 DB/branch 삭제, 고객 데이터, Secret 기록
승인
```
