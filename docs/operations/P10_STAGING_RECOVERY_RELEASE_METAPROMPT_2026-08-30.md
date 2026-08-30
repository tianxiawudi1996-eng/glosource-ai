# GloSource AI P10 Staging·Recovery·Release 장기 실행 메타프롬프트

이 문서는 P10의 남은 네 게이트를 여러 세션에서 같은 방식으로 완성하기 위한 실행 계약이다. 승인 참조는 실제 실행 권한을 자동 생성하지 않으며, 아래 승인 카드의 대상·비용·환경·SHA가 모두 일치할 때만 해당 페이즈에 사용한다.

## ROLE:

GloSource AI의 staging 데이터베이스, migration, backup→restore, rollback artifact와 release provenance를 연결하는 P10 실행 오케스트레이터다. 루트 에이전트 한 명만 외부 상태 변경과 최종 판정을 수행한다.

## GOAL:

정확한 clean candidate에 대해 별도 synthetic-only staging PostgreSQL에서 `npm run db:migrate`, candidate-bound backup→restore, 정확한 rollback SHA artifact smoke를 증명하고, 그 증거가 완성된 뒤 fresh `G_RELEASE`를 받아 P10 완료 여부를 fail-closed로 판정한다.

## USERS / EXPECTED CHANGE:

제품 소유자는 운영 DB를 staging으로 재사용하지 않고도 배포 후보의 migration·복구·하위호환성을 판단할 수 있어야 한다. 다음 작업자는 체크리스트와 receipt만으로 완료·차단·재개 지점을 재현해야 한다.

## CONTEXT:

- 시작 기준 branch는 `codex/p10-provenance-reconstruction`, 조사 시점 HEAD는 `5423da504030dcad7907c5ed274040340ff673b0`, rollback은 `eb7b171da0b79f925926ae6087fd9dc604cc3b98`다. 실행 직전 동적으로 다시 확인한다.
- Supabase 조직 `visionlab-safe-link`의 `glosource-staging`, `ap-northeast-2`, 견적 `0/month` 생성은 활성 무료 프로젝트 한도 때문에 실패했다.
- 목록에 보이는 기존 프로젝트 `wzmzpuxpcpuvuacwmslj`(`visionlab-coder's Project`)의 용도는 확인되지 않았다. 명시 승인 전 일시중지하지 않는다.
- Vercel `release/glosource-production` Preview의 `DATABASE_URL`은 non-exportable Secret이다. 값을 Config로 낮추거나 로컬 `.env.local`의 다른 DB를 staging으로 추정하지 않는다.
- Lifecycle 정본은 P10 `blocked`이며 blocker는 staging migration, backup/restore, rollback rehearsal, fresh `G_RELEASE`다.

## SCOPE:

- 정확한 Supabase 프로젝트의 가역적 pause, 승인된 staging 프로젝트 생성과 준비 상태 확인
- provider-supported `DATABASE_URL`을 process memory 또는 gitignored local secret로만 주입
- journal 0000~0005의 repository `npm run db:migrate`와 적용 결과 probe
- synthetic-only backup, 격리 restore, 복원 정합성 검사, exact rollback artifact smoke
- sanitized candidate-bound receipt, promotion-evidence preflight, P10 completion report

## OUT OF SCOPE:

- Production DB 조회·migration·backup·restore, 고객 데이터 복제, seed/ingest
- Secret의 평문 출력·tracked 저장·Vercel Config downgrade
- Supabase 유료 branch·plan upgrade·다른 프로젝트 pause/delete
- workflow dispatch, merge, master 승격, Production 배포·rollback
- 증거 완성 전 `G_RELEASE` 발급 또는 기존 승인 재사용

## INPUTS / SOURCE OF TRUTH:

1. 현재 사용자의 정확한 승인 문장과 비용 확인
2. `AGENTS.md`, `docs/requirements/GLOSOURCE_PORTFOLIO.md`
3. `docs/harness/lifecycle/PHASES.json`, active P10 prompt, `STATE.json`
4. `docs/operations/PROMOTION_EVIDENCE_CONTRACT.md`, migration journal과 SQL
5. 실제 Git·provider·DB·artifact·test 결과

충돌하면 위 순서를 따르되 보안·데이터 손실 방지 조건은 낮추지 않는다. 확인할 수 없는 값은 `정보 부족`으로 남긴다.

## TOOLS:

Supabase connector, Vercel CLI의 이름·범위 조회, PowerShell, Git, npm, Docker PostgreSQL client, Drizzle migration, local artifact runner와 Harness 검사기를 사용한다. Secret은 도구 출력·명령 인자·receipt·Memory에 남기지 않는다.

## AUTHORITY / PERMISSIONS:

- 읽기: 저장소, GitHub/Vercel/Supabase의 비밀 없는 상태와 비용.
- 로컬 쓰기: 현재 READY가 소유한 코드·테스트·ignored private receipt·Harness 문서.
- 사전 승인 가능: 아래 `A-P10-1`~`A-P10-5`의 정확한 대상과 영향만 허용한다.
- 별도 fresh 승인 필수: `G_RELEASE`는 candidate·rollback·receipt digest가 모두 고정된 뒤에만 받는다.
- 승인 무효화: 비용 증가, 프로젝트 ID/조직/리전 변경, Production 접속 가능성, 실제 데이터 발견, SHA 변경, 삭제 범위 확대 시 즉시 중단한다.

## WORKFLOW:

### Phase 0 — 계약·후보 동결

- [ ] `git status -sb`, HEAD/upstream/PR equality, rollback ancestry를 확인한다.
- [ ] lifecycle·promotion context·local release receipt를 재검증한다.
- [ ] 이 문서와 체크리스트 변경을 검증·commit·push한 뒤 final candidate를 다시 고정한다.
- 완료: tracked worktree clean, exact candidate/rollback/context digest 기록.
- 보고: candidate 이전에는 tracked Phase 0 보고서, 이후에는 ignored private receipt만 사용한다.

### Phase 1 — staging 용량 확보

- [ ] `A-P10-1` 승인으로 정확한 기존 Supabase 프로젝트 한 개만 pause한다.
- [ ] pause 상태와 영향 범위를 확인한다. 실패하면 반복하지 않는다.
- [ ] `A-P10-2` 승인과 `0/month` 재확인 후 `glosource-staging`을 생성한다.
- [ ] 조직·프로젝트·리전·상태를 검증한다.
- 완료: 독립 ACTIVE_HEALTHY staging project와 비용 receipt.
- 복구: 새 프로젝트 생성 실패 시 기존 프로젝트 restore; 생성 성공 후에는 임의 rollback하지 않는다.

### Phase 2 — repository migration

- [ ] provider-supported staging URL을 안전한 채널로 주입한다.
- [ ] URL이 staging project와 일치하고 Production이 아님을 비가역 fingerprint로 검증한다.
- [ ] 빈/synthetic-only 정책을 확인하고 `npm run db:migrate`를 정확한 candidate에서 실행한다.
- [ ] migration ledger 0000~0005, public schema와 재실행 안전성을 probe한다.
- 완료: 명령 exit 0, journal 6개, candidate·bundle digest·target fingerprint가 결합된 sanitized receipt.

### Phase 3 — backup→restore

- [ ] migration 완료 target의 synthetic-only backup을 만들고 SHA-256·시각·candidate를 기록한다.
- [ ] provider가 허용하는 별도 restore target에 복원한다. 동일 public schema 덮어쓰기는 금지한다.
- [ ] table/row/constraint/migration-ledger digest와 핵심 읽기·쓰기·transaction cleanup을 비교한다.
- 완료: backup receipt와 동일 digest에 결합된 restore receipt, 정합성 mismatch 0.
- 중단: 실제 고객 데이터, restore target 부재, 비용·권한 추가 필요, destructive overwrite 가능성.

### Phase 4 — rollback artifact smoke

- [ ] rollback SHA의 기존 불변 artifact를 찾고 없으면 격리 worktree에서 새로 package한다.
- [ ] 복원 DB에 rollback artifact를 연결해 `/`, `/en`, `/api/auth/session`과 DB 의존 핵심 경로를 smoke한다.
- [ ] candidate schema가 rollback artifact와 하위호환인지 확인하고 임시 프로세스·target을 안전하게 정리한다.
- 완료: candidate SHA, rollback SHA, restore receipt digest, HTTP/DB smoke가 결합된 rollback receipt.

### Phase 5 — fresh release gate

- [ ] current control-plane audit와 24시간 이내 backup receipt를 갱신한다.
- [ ] staging·restore·rollback receipt가 30일 이내이고 candidate/context와 일치하는지 확인한다.
- [ ] 정확한 candidate·rollback·receipt digest를 제시하고 fresh `G_RELEASE`를 요청한다.
- [ ] private promotion evidence JSON을 생성해 `npm run readiness:promotion-evidence`로 검증한다.
- [ ] P10 completion evidence를 생성하고 lifecycle command로만 완료·보고서·P11 전이를 원자 기록한다.
- 완료: validator ready, P10 exit criteria와 승인 참조 충족, lifecycle active phase P11.

## CONSTRAINTS:

- 한 Loop에는 한 Phase의 측정 가능한 READY 하나만 둔다.
- tracked 파일이 바뀌면 candidate-bound receipt를 폐기하고 Phase 0으로 돌아간다.
- synthetic/local/staging 증거를 Production 완료나 고객 가치로 승격하지 않는다.
- 같은 원인의 실패가 세 번 반복되면 재시도를 멈춘다.
- pause·create·migration·restore·cleanup은 정확한 ID와 사전/사후 상태를 기록한다.

## SUCCESS CRITERIA:

- 별도 staging project에서 repository `db:migrate`가 실제 실행되고 journal 6개가 확인된다.
- backup과 restore receipt가 같은 backup digest와 exact candidate에 결합되고 mismatch가 0이다.
- rollback artifact smoke가 exact rollback SHA와 restore target에서 green이다.
- fresh `G_RELEASE`와 current control-plane evidence가 promotion validator를 통과한다.
- P10 완료 보고서와 P11 전이가 lifecycle command로 생성된다.

## FAILURE CRITERIA:

Production 접속, 비용·대상 drift, 실제 데이터 발견, Secret 노출, migration/restore mismatch, rollback smoke 실패, stale approval, dirty SHA 또는 불완전 receipt는 실패다. 실패한 Phase 이후 단계는 실행하지 않는다.

## VERIFICATION / EVIDENCE:

- 공통: `npm run lifecycle:validate`, `npm run lifecycle:status`, `git status -sb`, `git diff --check`.
- candidate: `npm run readiness:release-receipt`, `npm run readiness:promotion-context`.
- DB: repository `npm run db:migrate`, provider 상태, migration ledger와 schema probe.
- recovery: backup SHA-256, restore comparison, rollback artifact HTTP/DB smoke.
- final: `npm run readiness:promotion-evidence -- <ignored-private-json> --candidate-sha <exact-sha> --rollback-sha <exact-sha>`.
- 실행 출력은 sanitized receipt에 상태·SHA·digest·시각·exit code만 남긴다.

## OUTPUTS / FORMAT:

- 실행 계약: 이 문서.
- 상태 체크리스트: `docs/harness/P10_STAGING_RECOVERY_RELEASE_CHECKLIST.md`.
- candidate 동결 전 보고서: `docs/harness/reports/`.
- candidate 동결 후 receipt: `reports/harness/private/p10-execution/<candidate-sha>/`.
- 각 Phase 보고 순서: 상태 → 대상·변경 → 검증 → 실패/복구 → 다음 READY·필요 승인.

## MEMORY UPDATE:

실제 외부 상태나 lifecycle이 바뀐 경우에만 STATUS·TASK_QUEUE·TESTS와 관련 report를 갱신한다. candidate 동결 후에는 승격 완료 전 tracked 상태 문서를 수정하지 않는다. Secret·provider payload·개인정보는 기록하지 않는다.

## STOP CONDITION:

승인 카드와 실제 대상이 다르거나, fresh `G_RELEASE`가 아직 발급될 수 없거나, Production/실데이터 가능성·새 비용·삭제·새 자격증명이 발생하면 현재 Phase의 안전 지점에서 중단하고 한 개의 정확한 결정을 요청한다.

## PRE-APPROVAL CARD:

- `A-P10-1`: Supabase project `wzmzpuxpcpuvuacwmslj`를 pause한다. 알려지지 않은 기존 서비스가 중단될 수 있으며 Supabase restore로 복구한다.
- `A-P10-2`: 조직 `vhbfoqrknvvqebdzavmb`에 `glosource-staging`, `ap-northeast-2`, 확인 견적 `0/month` project를 한 개 생성한다.
- `A-P10-3`: 새 staging project에서 synthetic-only `npm run db:migrate`와 read/write probe를 실행한다.
- `A-P10-4`: 새 staging 범위 안에서 candidate-bound backup→isolated restore와 rollback artifact smoke를 실행하고, 이번 작업이 만든 임시 restore target·프로세스만 정리한다.
- `A-P10-5`: 이 문서·체크리스트·Phase 0 보고서의 검증된 tracked 변경을 현재 feature branch와 PR #1에 commit/push한다.

`A-P10-1`~`A-P10-5`는 workflow dispatch, merge, Production migration·배포, 유료 변경, 다른 프로젝트 pause/delete, fresh `G_RELEASE`를 승인하지 않는다.
