# STATUS

## Snapshot

- Project: GloSource AI Validation OS (기존 K-DEFENSE 증거는 보존)
- Last calibrated: 2026-08-29 Asia/Seoul
- Current branch: codex/p10-provenance-reconstruction
- Exact release candidate: `npm run readiness:release-receipt`가 current clean HEAD와 ignored local receipt를 동적으로 결합해 판정한다. Git object의 SHA를 tracked file에 자가 포함하지 않는다.
- Source state: 무료 entitlement·원자 quota·KR/EN 분리·EN 계약·release guardrail·candidate-bound promotion evidence preflight와 non-self-invalidating local receipt harness를 통합한다. 정확한 archive/receipt 상태는 실행 시점 검사 결과가 우선한다.
- Main synced: false — `origin/master`는 eb7b171da0b79f925926ae6087fd9dc604cc3b98. 승인된 feature branch/PR push만 수행했고 master·workflow dispatch·Production 배포는 수행하지 않았다.
- Current track: full_lifecycle_goal_harness
- Working-tree increment: 2026-08-29 권장 입력 적용. 중복 Vercel 프로젝트의 branch-only Preview build 변수를 최소권한으로 추가하고 Preview를 `Ready`로 복구했다. 격리 PostgreSQL 16에서 6개 SQL migration bundle·합성 backup→restore·rollback-SHA DB 호환성을 검증했다.
- Next READY: 외부 staging target 정보가 제공되기 전까지 없음. 로컬 SQL/recovery rehearsal은 green이지만 `db:migrate` staging receipt가 아니므로 P10 완료에는 별도 staging migration, candidate-bound operational backup→restore, full rollback rehearsal, fresh `G_RELEASE`가 필요하다. workflow dispatch·Production migration·merge·Production 배포는 실행하지 않는다.

## 2026-08-29 Recommended Inputs and Isolated Rehearsal

- 비계약 중복 프로젝트 `mubinkims-projects/glosource-ai-68c4`의 Preview에만 loopback build-only `DATABASE_URL`을 추가하고 동일 실패 deployment를 Preview로 재배포했다. 새 배포는 `Ready`이며 PR #1의 두 Vercel check와 GitHub verify가 모두 통과했다.
- 첫 격리 시도에서 repository `db:migrate`는 `@neondatabase/serverless`가 로컬 TCP PostgreSQL을 지원하지 않아 DDL 전에 fail-closed했다. 원격/Production DB로 우회하지 않았다.
- fallback은 disposable `postgres:16-alpine`에서 journal 순서 SQL 6개를 적용했다. 합성 데이터만 사용한 37,206-byte custom backup의 SHA-256은 `4407cd9fa339045cea1eb3131d100706d4739e2c727b5d6cddac24984e93b9d5`이며 restore `1:1:1`, rollback-SHA legacy insert/read, transaction cleanup `0:0`이 통과했다.
- 이 결과의 claim ceiling은 local SQL bundle/recovery procedure다. 외부 staging `db:migrate`, operational backup receipt, full previous-artifact smoke를 대체하지 않으며 lifecycle blocker 4개는 유지한다.
- 상세: `docs/harness/reports/2026-08-29-p10-recommended-inputs-rehearsal.md`.

## 2026-08-29 Approved Control-plane Execution and Remote Repair

- Vercel `mubinkims-projects/glosource-ai` Preview의 `codex/p10-provenance-reconstruction` 브랜치에만 build-only `DATABASE_URL`을 추가했다. Production DB는 Preview에 연결하지 않았다.
- 승인 시점 후보 `b4e24f154c9427a99845c7820fc0d789808b54b0`를 원격 브랜치와 PR #1에 push했고 exact equality를 확인했다. 이 push의 GitHub verify는 Windows/Linux 줄바꿈에 종속된 EN receipt digest 때문에 276/278, Vercel Preview는 Next 16.3.0 `standalone`+Vercel adapter 충돌 때문에 89/89 생성 뒤 packaging에서 실패했다.
- source digest를 LF canonical text로 계산하도록 바꾸고 기존 실제 360/1440 geometry는 그대로 새 digest에 결합했다. Vercel에서는 사용하지 않는 standalone 출력을 끄고 local immutable release build에서는 유지했다.
- GitHub Production reviewer는 `like2buyglobal-sudo` 1명으로 고정했고 현재 작업자는 reviewer가 아니며 `preventSelfReview=true`, 기존 custom branch policy=true를 확인했다.
- Vercel Production `DATABASE_URL`은 Vercel env-run 프로세스 메모리에서 최소환경 `gh` stdin으로만 전달했다. 값은 파일·명령 인자·stdout·tracked Harness에 기록하지 않았고 GitHub Production Secret 이름 존재만 확인했다.
- 수정 후 전체 279/279, TypeScript, ESLint 오류 0·기존 경고 16, Vercel 모드 build 89/89와 local standalone build 89/89, 구조 및 360/1440 pixel Harness, control-plane `ready`를 확인했다. 최종 exact SHA·remote CI/Preview 결과는 tracked 파일에 자가 포함하지 않고 handoff 시 동적으로 확인한다.
- workflow dispatch·migration·merge·master 승격·Production 배포는 0건이다. 상세: `docs/harness/reports/2026-08-29-p10-continuation-gate.md`.

## 2026-08-29 P10 Completion Continuation

- 누적 화면·Harness 35개 파일을 명시적으로 검토·stage해 local integration candidate를 생성했다. unrelated 삭제·stash·reset은 0건이다.
- 구조 균형은 product-supporting 90%, culture-only 10%이며 source-bound 실제 높이 receipt는 360×800에서 93.9074%/6.0926%, 1440×900에서 93.8228%/6.1772%다.
- 전체 278/278, TypeScript, ESLint 오류 0·기존 경고 16, Next.js 16.3.0 build 89/89, instruction·lifecycle·sensitive·placeholder·STATE·diff 검사를 통과했다.
- clean candidate archive의 manifest·candidate binding·SHA-256/size와 필수 3경로·제품 계약 loopback smoke를 ignored receipt로 검증했다. exact current 증거는 `npm run readiness:release-receipt`가 동적으로 판정한다.
- 2026-08-29 control-plane 재감사: Vercel Production 22/22, GitHub Production reviewer 1명은 current operator, 독립 reviewer 0명, `preventSelfReview=false`, required GitHub environment secret name `DATABASE_URL` 부재다.
- 현재 session의 새 브라우저 제어는 localhost URL 정책에 차단됐다. 우회하지 않았으며, 현재 source digest와 일치하는 기존 360/1440 browser receipt와 새 build 증거를 사용했다.
- push·PR 수정·workflow dispatch·provider mutation·Secret 전송·staging·migration·Production 배포는 아직 0건이다. 상세: `docs/harness/reports/2026-08-29-p10-continuation-gate.md`.

## 2026-08-23 Non-self-invalidating Local Release Receipt

- tracked STATUS/TASK_QUEUE에 exact artifact SHA를 기록해 새 commit이 기존 archive를 stale로 만드는 자기무효화 루프를 제거했다.
- `receipt:release`는 actual `.tgz` 재추출→blocked/all-zero 검사→loopback 필수 3경로→7-route 제품 계약→runtime error-token 0 순서가 모두 통과한 뒤에만 ignored receipt를 원자 기록한다.
- `readiness:release-receipt`는 current 40-character HEAD에서 receipt 경로를 계산하고 clean source·archive SHA-256/size·manifest candidate binding을 다시 검사한다.
- child runtime에는 inherited Secret 전체를 전달하지 않고 OS 실행에 필요한 allowlist와 생성된 smoke-only 값만 전달한다. Receipt와 stdout report에는 Secret·raw log·외부 실행이 없다.
- 이 메커니즘은 local artifact evidence만 보존한다. independent reviewer, self-review prevention, fresh approvals, staging, backup/restore, rollback rehearsal은 계속 별도 P10 gate다.
- 상세: `docs/harness/reports/2026-08-23-non-self-invalidating-release-receipt.md`.

## 2026-08-23 Local Clean Candidate Commit

- 사용자 승인 범위는 현재 dirty 변경의 검토와 단일 local candidate commit 생성까지다.
- 포함 단위는 KR/EN 제품 계약·무료 결과/이력 redaction·원자 quota migration·KR/EN UI·정확한 release target·candidate-bound promotion preflight·Harness 증거다.
- `npm run verify:product`: 242/242, TypeScript 오류 0, ESLint 오류 0·기존 경고 16.
- `npm run build`: Next.js 16.3.0, static generation 89/89, exit 0. 기존 Edge Runtime deprecation 경고는 유지된다.
- instruction·lifecycle·sensitive-string·placeholder·STATE·diff 검사는 모두 clean이다.
- commit 후 `git status -sb`, exact HEAD, rollback ancestry와 promotion context를 다시 확인한다. push·PR·dispatch·migration·provider 변경·배포는 실행하지 않는다.
- 상세: `docs/harness/reports/2026-08-23-clean-candidate-commit.md`.

## 2026-08-23 Candidate-bound Promotion Evidence Preflight

- `db:migrate` 전에 exact clean HEAD·rollback ancestry, 후보/rollback SHA, Production target, migration bundle, staging, backup→restore, rollback rehearsal, control-plane audit와 두 승인 참조를 기계적으로 검증한다.
- evidence는 최대 24시간만 유효하고 backup/audit/approval은 24시간, rehearsal은 30일 이내여야 한다. unknown field·불일치·재사용 승인·만료는 fail-closed다.
- workflow 입력 원문은 출력·커밋하지 않고 runner 임시 파일로만 검증한 뒤 삭제한다.
- 최종 집중 17/17 및 전체 242/242, TypeScript, ESLint 오류 0·기존 경고 16 통과. runtime/UI 변경이 없어 build·브라우저 QA는 생략했다.
- 실제 receipt, 승인, provider 변경, commit, push, dispatch, migration, deployment는 0건이다. P10 blocked 유지.
- 상세: `docs/harness/reports/2026-08-23-p10-promotion-evidence-preflight.md`.

## 2026-08-21 EN Evidence 70 : Korea 30

- `/en`의 Hero·정부 원장 근거·카테고리·문제·샘플·가격 계약을 유지하면서 한국 이미지를 Hero 배경과 Seoul/Busan/Jeju 3장 Journey로 제한했다.
- 정보 순서를 Hero → registry evidence → category → Korea Journey → sourcing problem으로 고정했다. EN 계절·캐릭터 자동 전환과 synthetic `01 / 100` 노출은 제거하고, KR 기존 모션은 유지했다.
- 1440×900에서는 proof panel과 CTA가 우선 노출되고, 390×844에서는 인물 얼굴·계절 switcher가 카피를 가리지 않는다. 두 viewport 모두 양의 page overflow가 없다.
- `npx tsc --noEmit`, lint 오류 0, `npm test` 232/232, Next.js build 89 routes, browser accessibility snapshot이 통과했다. 실제 Journey 포인터 상태 전환은 완료 증거로 기록하지 않는다.
- P10 blocked와 외부 실행 0건은 유지한다. 상세: `docs/harness/reports/2026-08-21-en-evidence-korea-70-30.md`.

## 2026-08-21 EN Restrained Korean-modern Refinement

- `/en`의 한국미를 한복 인물·계절 전환 중심에서 맑은 경복궁 건축·한영 병기·작은 단청 3점 중심으로 전환했다. 기존 영문 카피·CTA·가격·quota·근거 고지는 그대로다.
- EN Hero는 `gyeongbokgung-architecture` static scene이며 host/season control을 DOM에 렌더링하지 않는다. KR seasonal host 경험은 변경하지 않았다.
- EN Journey는 Seoul/Busan/Jeju 3장을 유지하되 중성 배경, 낮은 카드, 완만한 hover와 78% mobile rail로 절제했다.
- 1440×900과 390×844에서 양의 page overflow 없음, host/season controls 0, runtime error/warning 0을 확인했다. `localhost` hydration QA에서 Busan 선택이 dot/card pressed state와 rail `scrollLeft=227`로 반영됐다. 전체 232/232·typecheck·lint 오류 0·build 89 routes 통과.
- 초기 `127.0.0.1`의 Next.js dev-resource cross-origin 차단을 기능 실패와 분리해 재검증했다. P10 blocked와 외부 실행 0건 유지. 상세: `docs/harness/reports/2026-08-21-en-restrained-korean-modern.md`.

## 2026-08-18 Code and Product Review Remediation

- KR 무료 응답·이력에 검색당 공급사 1개 preview와 gated-field redaction을 서버에서 강제했다.
- committed usage와 활성 reservation을 동일 SQL에서 합산해 quota 초과 동시 입장을 차단했다. B가 먼저 완료되는 interleaving 회귀 테스트도 통과했다.
- legacy NULL usage는 명확한 KR-only action만 KR로 보수 귀속하며 EN에는 넣지 않는다. 모호한 `source`는 어느 bucket에도 넣거나 backfill하지 않는다.
- EN 무료 카운터는 월 단위이며 assistant는 Korea-only sourcing 계약을 지킨다.
- release archive의 clean/current-HEAD manifest와 정확한 Vercel/GitHub 대상 계약을 검증하도록 보강했다.
- `verify:product` 229/229, TypeScript 통과, ESLint 오류 0·기존 경고 16, Next.js 16.3.0 build 89 routes, 제품 계약 7/7 통과.
- 로컬 `/`·`/en`은 200이었지만 `/api/auth/session`은 localhost `UntrustedHost`로 500이므로 해당 smoke는 통과로 기록하지 않았다.
- migration `0005`는 운영 미적용이고, promotion workflow에는 후보 결합 backup/restore/rollback evidence preflight가 아직 없다. P10 blocked, 외부 변경 0건.
- 상세 증거: `docs/harness/reports/2026-08-18-code-product-review-remediation.md`.

## 2026-08-16 P10 Release Advancement

- `readiness:control-plane`: Vercel Production 필수 이름 22/22, target match. GitHub Production required reviewer 1명과 branch policy가 확인됐다.
- 현재 required reviewer는 로그인한 운영자 본인이고 `preventSelfReview=false`다. 독립 reviewer 없이 self-review 방지만 켜면 승인자가 사라지므로 provider 설정을 변경하지 않았다.
- `verify:product`: 202/202, TypeScript 오류 0, ESLint 오류 0·경고 16.
- `build`: Next.js 16.3.0, 88 routes, exit 0. 기존 Edge Runtime deprecation 경고는 유지된다.
- 로컬 provenance commits: `6ee214d`와 `3c5ca96`; push 없음.
- `package:product`: `dist/glosource-ai-0.1.0-20260816T135231882Z.tgz`, 73,289,062 bytes, SHA-256 `359FD0DAF3DAA0EFB3ACBF0EB2F591916706DD57C37F4E6AF949E63293F35C2F`.
- package inspection: 2,452 files, blocked 0, all-zero 0, secrets included false, manifest `dirty=false`, commit `3c5ca96bbba6`.
- standalone smoke: 로컬 프로세스에만 `AUTH_URL`·`AUTH_TRUST_HOST=true`를 적용해 `/`, `/en`, `/api/auth/session` 200 및 제품 계약 7/7.
- 상세 증거: `docs/harness/reports/2026-08-16-p10-release-advancement.md`.
- P10은 독립 reviewer, self-review 방지, exact approval references가 없어 blocked다. 로컬 commit 2건을 만들었고 push·dispatch·배포·DB 변경·외부 발송은 0건이다.

## 2026-08-09 P10 Release Readiness Evidence Audit

- exact candidate `70457e7`은 감사 시작 시 clean worktree였으므로 8월 7일의 mixed dirty provenance blocker는 해소됐다.
- 로컬 `master` 대비 25 commits ahead, `origin/master` 대비 15 commits ahead이며 둘 다 behind 0이다.
- `readiness:product`의 사전 결과는 local process 17/22와 archive 부재로 blocked였다. 이후 생성한 archive는 `dirty=true` diagnostic artifact라 Production-ready 판정을 만들지 않는다.
- `readiness:control-plane`은 Vercel Production 20/22(`AUTH_TRUST_HOST`, `DATAGO_SERVICE_KEY` 누락), GitHub Production required reviewer/self-review/branch policy 부재를 재확인했다.
- `verify:product` 201/201, TypeScript/ESLint 오류 0, production build, standalone integrity, `/`·`/en`·`/api/auth/session` 200, 제품 계약 7/7은 통과했다.
- Windows CRLF clean checkout에서 managed Next.js block 검사가 실패하던 오탐을 줄바꿈 정규화와 회귀 테스트로 수정했다.
- archive는 41.75 MiB, 차단 파일 0, all-zero 0이며 SHA-256은 `835C4A06CA13A2CC92C9C7B6CC98299C3FCFE39B47AF13D9B66F25EB00C957D3`다. 단 manifest `dirty=true`라 승격 불가다.
- clean fixed candidate, rollback 승인, `G_RELEASE`, `G_PRODUCTION_CONTROL_PLANE_CHANGE`가 없으므로 P10은 blocked이고 P11은 시작하지 않았다.
- 상세 증거: `docs/harness/reports/2026-08-09-p10-release-readiness-audit.md`.
- provider 변경, secret 입력, commit, push, PR, dispatch, staging, Production 배포는 0건이다. 로컬 build/package와 읽기 전용 smoke만 수행했다.
- production 의존성 감사에서 critical 2, high 6, moderate 5를 확인했다. 자동 fix는 실행하지 않았고 Auth.js critical 최소 수정 메타프롬프트를 `docs/operations/P10_AUTH_SECURITY_REMEDIATION_METAPROMPT.md`에 고정했다.
- Auth.js 최소 수정 실행 완료: `next-auth 5.0.0-beta.32`, `@auth/drizzle-adapter 1.11.3`, `@auth/core 0.41.3`으로 갱신해 production critical을 2→0으로 제거했다. 집중 6/6, 전체 201/201, build/package, 필수 경로 200, 제품 계약 7/7이 통과했다.
- 최신 diagnostic archive는 `glosource-ai-0.1.0-20260809T145408205Z.tgz`, SHA-256 `16733E1A4A06957EA3BD5895AC55A1755D7E7720045FA30742319FABB05A79A9`다. manifest `dirty=true`라 운영 승격용은 아니다.
- 잔여 production audit는 critical 0, high 5, moderate 5다. 직접 high인 `next@15.5.20` 수정은 별도 증분으로 분리한다.
- 2026-08-10 `next/@next-env 15.5.23` 공식 backport를 적용했으나 npm advisory가 모든 15.x를 포함하도록 확대되어 direct Next high는 제거되지 않았다. npm의 유일한 제안은 `next@16.3.0` semver-major다.
- 15.5.23 회귀 검증은 201/201, TypeScript/ESLint 오류 0, production build 89 pages, 필수 3경로 200, 제품 계약 7/7로 green이다. 보안 성공 기준 미충족으로 새 archive는 만들지 않았고 기존 `20260809T145408205Z` archive는 현재 worktree보다 stale하다.

## 2026-08-10 Next.js 16 Migration and Packaging Follow-up

- `next`, `@next/env`, `eslint-config-next`를 `16.3.0` exact로 갱신했다. React/React DOM은 `19.2.4`를 유지했다.
- `middleware.ts`를 `proxy.ts`로 옮겼고 Auth.js wrapper, matcher와 `x-pathname` 헤더 동작을 보존했다. Next middleware 규약 경고는 사라졌고 Edge Runtime deprecation은 별도 잔여 경고다.
- Next 16 flat ESLint config로 전환했다. `verify:product`는 201/201, TypeScript 오류 0, ESLint 오류 0이며 stricter React Hooks 경고 16개가 남아 있다.
- `npm run build`는 Next 16.3.0/Turbopack으로 88 routes에서 성공했다.
- Production-only `npm audit --omit=dev`: critical 0, high 0, moderate 4, total 4. 전체 audit의 high 2건은 dev/tooling 경로로 분리 기록했다.
- Windows symlink 역참조를 추가한 `package-release.ts`로 standalone package 생성 성공: `dist/glosource-ai-0.1.0-20260809T223844953Z.tgz`, 36,244,023 bytes, SHA-256 `6CB653377D92082886EB4472B0A164F4C342A8010E466046F350705FE5B247E8`, entries 2,845, blocked 0, all-zero 0, `dirty=true`.
- package local smoke에서 `/`, `/en`, `/api/auth/session` 모두 HTTP 200, `growth:live-contract` 7/7 통과.
- `readiness:product`는 local 17/22와 dirty source 때문에 계속 blocked다. Vercel 20/22, GitHub 보호 규칙, remediation preferences, fresh approvals와 외부 배포는 변경하지 않았다.

## 2026-08-07 Full Lifecycle Goal Harness

- `docs/harness/lifecycle/PHASES.json`이 P00-P16의 순서·prompt·exit criteria·approval gate·next phase를 정의한다.
- 각 phase는 `docs/harness/lifecycle/prompts/`의 독립 metaprompt로 역할, 입력, 절차, 완료 게이트, 보고 의무, 승인 경계와 중단 조건을 가진다.
- `npm run lifecycle:validate`는 manifest 순서, prompt 구조, state 연속성과 report link를 확인한다.
- `npm run lifecycle:start`는 `ready` phase만 `in_progress`로 바꾸며 blocked phase를 우회하지 않는다.
- `npm run lifecycle:complete -- <evidence.json>`은 현재 in-progress phase의 정확한 criteria와 approval만 받고, 비덮어쓰기 보고서 생성과 state 전이를 한 작업으로 처리한다.
- 현재 제품은 brownfield P10 Release Readiness에서 blocked로 시작하며 P00-P09 과거 이력을 소급 완료하지 않았다.
- dirty release provenance는 승인된 로컬 commit 재구성으로 해소했다. 현재 blocker는 Vercel 필수 이름 2개, GitHub Production 보호 규칙, remediation preferences와 fresh execution approval 부재다.
- 외부 설정, secret 입력, commit, push, staging, Production 배포, 게시, 결제와 retirement 작업은 0건이다.

## 2026-08-07 Root Agent Instruction Upgrade

- 중복 본문과 채팅 타임스탬프가 포함된 범용 전역지침을 그대로 복사하지 않고, 실제 Next.js 15 App Router·React 19·Drizzle/Neon·KR/EN 제품 계약·P00-P16 Lifecycle에 맞춘 단일 루트 `AGENTS.md`로 정규화했다.
- 기존 managed Next.js rule block을 보존하고 설치본에 `node_modules/next/dist/docs/`가 없을 때 읽었다고 주장하지 않는 fallback 경계를 추가했다.
- `npm run harness:instructions`가 필수 섹션, 제품·Lifecycle 기준 링크, package 명령, managed Next block, 중복 제목과 채팅 transcript artifact를 검사한다.
- `scripts/harness-precommit.sh`에 instruction drift 검사를 연결하고 3개 회귀 테스트를 추가했다.
- 제품 runtime, provider 설정, 외부 발송, commit, push와 배포는 변경하거나 실행하지 않았다.

## 2026-08-07 P10 Release Readiness Refresh

- `readiness:product`는 local process 17/22와 dirty source를 확인해 예상대로 blocked다. 로컬 누락 이름은 5개이며 값은 출력하지 않았다.
- Vercel Production read-only 재감사는 20/22로 `AUTH_TRUST_HOST`, `DATAGO_SERVICE_KEY` 누락을 다시 확인했다.
- GitHub Production에는 required reviewer가 없고 self-review 방지와 deployment branch policy가 미구성 상태다.
- 현재 worktree는 tracked 수정 27개와 untracked 56개로, 기존 2026-08-03 archive를 현재 후보 artifact 증거로 재사용할 수 없다.
- P10 exit criteria 4개와 승인 2개는 모두 미충족이므로 P11로 전이하지 않았다.
- 상세 증거: `docs/harness/reports/2026-08-07-p10-release-readiness-refresh.md`.
- provider 변경, secret 입력, build/package, commit, push, dispatch, staging과 Production 배포는 0건이다.

## 2026-08-07 P10 Provenance Partition

- P10 dirty snapshot 83개를 release package integrity 6, Production governance 18, public claims/growth 11, SNS whitepaper 3, lifecycle/root harness 45의 5개 증분으로 83/83 분류했다.
- `package.json`과 `docs/harness` 상태 문서는 마지막 integration 증분에 두어 중간 후보의 목적과 검증 범위를 흐리지 않도록 했다.
- 순서는 A release integrity → B governance/readiness → C claims/growth → D whitepaper → E lifecycle/harness다.
- 분할은 제안만 했으며 stage, commit, reset, checkout, branch 생성, push와 배포는 실행하지 않았다.
- 상세: `docs/harness/reports/2026-08-07-p10-provenance-partition.md`.

## 2026-08-07 P10 Provenance Reconstruction

- 사용자 승인 후 `codex/p10-provenance-reconstruction` branch를 만들고 A `252d6cb`, B `9edbd83`, C `54b1f37`, D `d0d3ba8`의 4개 domain commit을 순서대로 생성했다.
- E lifecycle/root harness integration은 전체 200/200 회귀검증과 instruction·lifecycle·state·placeholder·sensitive-string·diff guard를 통과했으며 최종 로컬 commit에 포함한다.
- C는 focused 6/6, typecheck, lint, production build 89 routes, X·Threads·Instagram dry-run을 통과했다.
- D의 기존 DOCX는 최신 builder 계약과 어긋나 초기 audit가 실패했지만 builder 재생성 후 구조 감사 전 항목을 통과했다. LibreOffice 부재로 PNG visual QA는 미검증이다.
- 원본 branch를 reset·삭제하지 않았고 remote push, PR, provider 변경, dispatch, promotion, staging, Production 배포는 0건이다.
- 상세: `docs/harness/reports/2026-08-07-p10-provenance-reconstruction.md`.

## 2026-08-07 Production Remediation Execution Preflight

- `npm run readiness:remediation-preflight -- <preferences.json> <sanitized-audit.json>`은 기존 approval packet을 다시 계산하고 사람 실행 승인 요청 준비 여부만 판정한다.
- 현재 read-only control-plane 재감사는 Vercel Production 20/22와 GitHub 보호 규칙 부재를 다시 확인했으며 판정은 `blocked`다.
- 추적 예시는 모든 선호와 digest를 보류하므로 `awaiting_preferences`, action code 0개다.
- 모든 선호가 현재 digest에 기록된 경우에도 결과는 `handoff_ready`일 뿐이며 `executionApprovalPresent=false`, `providerMutationAuthorized=false`, `mutationStatus=not_attempted_by_design`이다.
- action code는 변경 범주만 나타내며 비밀값·reviewer 신원·정확한 branch pattern·명령·provider payload를 포함하지 않는다.
- Vercel/GitHub 변경, secret 입력, push, workflow dispatch, 승격, 배포와 외부 발송은 0건이다.

## 2026-08-05 Production Remediation Preference Packet

- `npm run readiness:remediation-approval -- <preferences.json> <sanitized-audit.json>`은 로컬 파일만 읽고 provider·network·subprocess adapter 없이 비식별 패킷을 stdout으로 반환한다.
- 추적 예시는 네 선택과 context digest를 모두 보류한다. 현재 결과는 `awaiting_decisions`이며 Production readiness는 기존 감사의 `blocked`를 그대로 유지한다.
- audit·`REQUIRED_PRODUCTION_ENV`·`promote.yml`로 context digest를 만들며, 이전 digest와 다르면 `stale`이다.
- `protected_master_only`는 feature-ref에서 승인 후 `master`로 fast-forward하는 현재 흐름과 호환되지 않아 선택 완료로 인정하지 않는다.
- 선택을 모두 기록해도 provider mutation 권한은 false이고 fresh execution approval과 post-change audit가 계속 필요하다.
- 실제 preference packet은 이미 ignore된 `reports/harness/private/` 또는 `reports/harness/tmp/`에만 둔다. 비밀값·reviewer 신원·branch pattern은 입력 계약에서 받지 않는다.
- Vercel/GitHub 설정 변경, push, workflow dispatch, 승격, 배포와 외부 발송은 0건이다.

## 2026-08-05 Production Control Plane Audit

- `npm run readiness:control-plane`은 Vercel·GitHub 원시 출력을 버리고 이름·개수·boolean만 반환하도록 구현됐다.
- 실감사 결과 Vercel Production은 필수 22개 중 20개가 확인됐고 `AUTH_TRUST_HOST`, `DATAGO_SERVICE_KEY`가 누락됐다. 값은 보고서에 포함되지 않았다.
- GitHub Production은 조회됐지만 required-reviewer 규칙이 없고 self-review 방지는 미구성이며 deployment branch policy도 없다.
- 현재 판정은 의도된 `blocked`다. Vercel/GitHub 설정 변경, push, workflow dispatch, 승격과 배포는 실행하지 않았다.
- `master` 전용 branch policy는 현재 feature-ref 승인 후 fast-forward하는 workflow를 막을 수 있어 자동 설정 대상에서 제외했다.

## 2026-08-04 Evidence Boundary

- 오늘 확인된 기술 증거: 164개 테스트, TypeScript, lint(오류 0·기존 경고 1), production build, growth audit, Polar 상품 계약, 운영 URL 7개 계약, X·Threads·Instagram social dry-run, daily growth audit, acquisition readiness가 통과했다.
- 오늘 확인된 차단 증거: 로컬 product readiness는 필수 환경변수 이름 5개 누락과 dirty source로 blocked다. Vercel Production에는 필수 22개 중 20개가 있으며 `AUTH_TRUST_HOST`, `DATAGO_SERVICE_KEY`가 없다. 값은 조회하지 않았다. 오늘 사례 후보 추출은 0건이며 이를 고객 성과나 traction으로 확대 해석하지 않는다.
- 마지막 구매자 활동 캡처는 2026-07-18 보고서다. 당시 users_7d=0, searches_7d=0, payments=0, active_subscriptions=0이며 현재 시장 상태로 확대 해석하지 않는다.
- Polar 상품·링크 health 통과는 실제 결제·취소·환불 또는 수요 증거가 아니다.

## Final 14-Day Decision

- 판정: **수정 후 조건부 계속** — 전체 Done Bar 3/6.
- GloSource: 신규 기능을 멈추고 실제 ICP 100명에게 현재 Pro $99를 판매하는 30일 founder-led 검증만 진행.
- K-DEFENSE: 교육자료 요청 1건 또는 비공개 전환 증거 전까지 게임 개발 중단, 콘텐츠 후킹 실험만 20% 유지.
- 보고서: `docs/harness/FINAL_14_DAY_REPORT.md`

## Last Done Increment (5)

GLO-FOOD-BIZRNO-REGISTRY @ working-tree (**로컬 구현 완료·prod 미실행**) — 공식 식품 인허가 원장은 사업자번호를 제공하지 않는다는 전제 오류를 먼저 바로잡았다. 사업자번호를 실제 제공하는 금융감독원 OpenDART 기업개황을 `kr_dart_firms`로 연결하고, K-Food curated 검증기가 원장에 번호가 있는데 누락하거나 다른 번호를 쓰면 시드를 거부하도록 했다. 동명이인은 자동 귀속하지 않는다. 수집기는 `DART_API_KEY`가 있어야 실행되며 prod DB에는 적용하지 않았다.

## Last Done Increment (4)

DRIZZLE-MIGRATION-BASELINE @ eed52fd (**prod 이력 정합 완료**) — `db:migrate`가 프로덕션에서 터지는 상태였고, **아무도 안 돌려서 안 터졌을 뿐**이었다. 특히 무서운 건 (2)번: `kr_*` 정부 레지스트리 테이블 8개가 마이그레이션에 아예 없어서, **신규 환경은 제품이 검증에 쓰는 원장 없이 뜬다**. schema.ts를 단일 baseline으로 리셋하되 **그 전에 schema.ts == prod를 컬럼 단위로 확인**했다(어긋난 스키마로 baseline을 깔면 drift를 지우는 게 아니라 축복한다 — 19테이블 전 컬럼 일치). `db:adopt`는 라이브 스키마가 baseline과 다르면 **거부**한다. 실검증: prod에 migrate 2회 정상 통과·스키마 무변경. 재발 방지 테스트가 원래 사고(테이블 추가 후 마이그레이션 누락)를 실제로 잡는다 → 승격 게이트가 master를 막는다.

## Last Done Increment (3)

GLO-EN-SUPPLIER-EVIDENCE @ b61f5cd (**prod 스키마+데이터 반영 완료**) — 레지스트리 대조를 **이름 → 사업자번호**로 전환. 이름 매칭이 샘표 HACCP를 놓친 진범이었다(원장이 공장 단위로 등재). `bizrno` + `bizrno_source`를 저장하는데, **출처를 함께 저장하는 게 핵심**이다: 식약처 원장 7건은 회사명↔번호를 권위 있게 매핑하지만, 식품 9건은 회사가 자사 사이트에 스스로 공개한 번호(국세청 계속사업자 확인 완료)라 근거가 더 약하다 — 둘을 "검증됨"으로 뭉개지 않는다. **제품 이득**: 국세청 실시간 폐업조회가 화장품에만 걸리던 것이 큐레이션 공급사 전체로 확대 → 폐업한 공급사는 배지 대신 red flag. 검증기가 타사 번호 오귀속까지 잡는다. **번호 없는 10건**(식품 7·패션 3)은 조회 불가 — 통과 처리하지 않고 명시.

## Last Done Increment (2)

GLO-SUPPLIER-REVET @ 21d1b79 (**prod 반영 완료**) — 배지가 카테고리마다 다른 뜻이었다. 자율 런이 넣은 20건이 근거 없는 배지를 달고 있었고, 특히 **trustScore 20건 전부가 조작**이었다(78/82/88 = 발견한 인증 조합에 대한 공식이지 실사가 아니다). "NTS-verified"는 인증란에서 HACCP·CGMP 행세를 하고 있었지만 사업자등록이 살아있다는 뜻뿐이다. **HACCP 주장 16건은 전부 진짜였다** — 그건 날조가 아니었고, 샘표는 오히려 원장에 있는데 **놓치고** 있었다(공장명으로 등재돼 정확일치 매칭이 실패). 오소이는 가방·신발 **브랜드**라 배지를 뗐다. K-Fashion은 한국에 의류 제조업 정부 원장이 **없어** 검증이 원천 불가 → 노트에 미검증을 명시(차장님 결정). 기준을 **실행 가능한 코드**로 만들었다: `scripts/verify-curated.ts`가 쓰기 전에 모든 주장을 원장·URL과 대조하고 실패하면 시드를 거부한다.

## Last Done Increment (1)

GLO-EN-DBSEED-EXPAND @ ef082d8 + a4c4b76 (**prod DB 반영 완료**) — 'GloSource Verified' 배지가 대형 ODM 3사에만 붙어, 1,000개 예산의 인디 브랜드를 **주문도 받아주지 않을 공장**으로 안내하고 있었다. 현금화 못 할 신뢰 주장은 배지가 없느니만 못하다. 제품이 공급사를 검증하는 방식 그대로 큐레이션했다: 웹 발굴 → 식약처 제조등록 대조 → CGMP 명단 대조(사업자번호). **레지스트리가 실제로 일을 했다** — 웹에서 "저MOQ 한국 공장"이라 불리는 것 대부분을 탈락시켰고, 특히 최저 MOQ(300개)를 광고하는 라온하세는 제조등록이 없어 배지를 줄 수 없었다(우리 구매자가 빠지는 바로 그 함정). 코스맥스는 2023년 인디 프로그램으로 MOQ가 1만→1,000개로 내려갔는데 기존 노트가 "typically high MOQ"라고 적혀 있어 정작 도우려던 구매자를 쫓아내고 있었다 → 시드를 upsert로 바꿔 정정. 그리고 **시드만으로는 구매자에게 아무것도 안 바뀌었다**: 주입 쿼리에 ORDER BY가 없어 삽입순(대형 ODM)만 노출되고 있었다(a4c4b76에서 MOQ 오름차순으로 수정, prod 실검증).

## Current State

- **배포 파이프라인은 수동 승격형으로 로컬 수정됐지만 보호 환경 승인은 미구성**(2026-08-05 working tree): 브랜치 push는 검증만 수행하고 master FF는 수동 dispatch·`PROMOTE` 확인을 요구한다. `npm run readiness:control-plane`은 `Production` 환경에 required reviewer·self-review 방지·branch policy가 없음을 fail-closed로 확인한다. commit·push·배포는 하지 않았다.
- 가격은 이제 `app/lib/plans.ts` 한 곳. 재가격 시 그 파일만 고치면 랜딩·billing·페이월·JSON-LD가 함께 움직이고, 단위테스트가 폐지가 재등장을 막는다.
- 신뢰앵커는 EN에만 적용(KO/국내 미변경). 사업자등록번호 미포함(차장님 지시: 국내 사업자등록 보류).
- KPI 전 항목 0 유지. 실제 고객·결제 증거 없음(조작 없음).
- K-Food 사업자번호 원장 연결은 코드·마이그레이션·검증기까지 준비됨. 활성화는 `DART_API_KEY` + prod 마이그레이션/수집 게이트이며 실제 번호 7건은 아직 확정하지 않았다.

## Open Flags

- 사람 입력 대기(비차단): 창업자 LinkedIn URL + 실사진 → `app/lib/founder.ts` 두 필드.
- GLO-EN-PAYHIST 라이브 확인 미완: `npm run growth:payments:dummy`(DATABASE_URL 필요) + Polar 테스트결제 1회 → 게이트.
- ✅ `npm run db:migrate` 정상화(eed52fd). 스키마 변경 절차: `schema.ts` 수정 → `npm run db:generate` → 커밋. 마이그레이션을 안 만들면 **테스트가 실패하고 승격이 막힌다**(의도된 동작). 기존 DB 신규 편입은 `npm run db:adopt`.
- **자율 런 산출물은 신뢰하지 말 것**: `harness:curate-fallback`이 넣은 20건이 trustScore를 전부 지어냈고 가짜 인증 라벨을 달았다. 앞으로 큐레이션은 `scripts/curated-suppliers.ts` + `verify-curated.ts`를 통과해야만 DB에 들어간다.
- K-Fashion 3건은 **원천적으로 검증 불가**(정부 원장 부재)라 배지 의미가 약하다. 의류 제조 원장이 생기거나 대안 근거(예: 수출입 실적)가 확보되기 전까지는 노트의 미검증 고지가 유일한 방어선.
- 남은 진행 대부분 게이트: 실 ICP 리드, Gmail OAuth, 외부 발송, 결제 확인, 비공개 플랫폼 분석.
- 식품 인허가 원장에는 사업자번호가 없으므로 OpenDART를 사용한다. 키가 없거나 회사명이 유일 매칭되지 않으면 번호를 넣지 않는다.

## Evidence Audit (2026-07-18)

- `npm run growth:today`: 5개 daily 항목 중 4개 pass, reply triage 1개만 Gmail OAuth 부재로 fail; post-run ops sync pass.
- 결제 안전성: checkout 3개 reachable, Polar product 3개 readable, critical/warning 0.
- buyer activity: 총 사용자 3, 최근 24시간/7일 사용자 0, 최근 24시간/7일 검색 0, 결제 0, active subscription 0.
- 사례 후보 0. 소셜 9건은 dry-run만 생성했고 외부 게시 0.
- Slack/Notion은 outbox만 생성; 외부 발송 0.
- STATE·placeholder·민감정보·diff 검사 clean.
- 보고서: `docs/harness/reports/2026-07-18-evidence-audit.md`.

## Recent Verification (2026-07-17, GLO-FOOD-BIZRNO-REGISTRY)

- 공식 데이터 구조 확인: 식품안전나라 I2500 출력에는 사업자번호 없음. OpenDART 기업개황은 `bizr_no` 제공.
- OpenDART 순수 테스트: 법인접미사 정규화·유일매칭·동명이인 fail-closed·10자리 번호 검증.
- 마이그레이션 테스트: `kr_dart_firms` snapshot/journal 일치, name/bizrno 인덱스, 재시도 안전 DDL.
- 전체 검증: `npm test` 109/109, TypeScript, lint(0 errors), Next build, diff/sensitive/placeholder/STATE, growth audit/payment audit 모두 통과.
- prod DB/실제 OpenDART 수집/curated 번호 변경: 미실행(외부 키·DB 게이트).

## Gates Pending

- GLO-EN-PAYHIST 라이브 결제 확인(더미 DB 테스트 / Polar 테스트결제)
- 실제 아웃바운드 발송 승인 + Gmail OAuth
- 실제 소셜/쇼츠 게시 승인
- 비공개 플랫폼 분석 데이터 접근 승인
- GitHub `Production` environment에 required reviewer·self-review 방지·허용 브랜치 정책 구성 + 변경된 `promote.yml` 원격 실행 검증

## Recent Verification (2026-07-12, GLO-EN-DBSEED-EXPAND)

- 식약처 레지스트리 대조(prod, 읽기): 나우코스·한국코스모·코스메디크·씨티케이 모두 `화장품제조` 등록 확인(사업자번호·공장주소). 라온하세 0건 → 탈락.
- CGMP 명단 대조(사업자번호): 코스맥스·한국콜마·코스메카·나우코스·한국코스모 ✅ / 코스메디크·씨티케이 ✗ → 인증 필드에 그대로 반영(과장 0).
- 시드 실행(prod, 승인 후): 4 insert + 3 update, 재실행 시 7 unchanged(멱등).
- 주입 순서 prod 검증: serum 쿼리 → COSMAX(1,000) + COSMEDIQUE(1,000) 주입(수정 전엔 Kolmar[MOQ 미공개]가 노출됐을 것).
- `npm test` 25/25 (큐레이션 정직성 불변식 6건 신규), tsc·lint 0 errors·build green.

## Earlier Verification (2026-07-11)

- `npx tsc --noEmit`: exit 0
- `npm run lint`: 0 errors (기존 무관 경고 1건 `_measure-attach.ts`)
- `npm test` (tsx --test): 19/19 pass (plans 7건 신규 포함)
- `npm run build`: exit 0
- **렌더 실검증**(`next start` → `GET /en`): JSON-LD offers = 39/99/249 · 폐지가($19/$49) **0건** · 4개 가격카드 전부 가격/쿼터/CTA 정상 · `/en` 200 · `/en/billing` 302→login(인증게이트 정상)
- `harness-precommit.sh`(sensitive/placeholder/state/lint): clean

## Notes for Next Session

1. 다음 비게이트 READY는 없음. 게이트가 열릴 때까지 자동 세션은 오늘자 증거 감사만 수행한다.
2. Gmail OAuth 4개 값이 생기면 `growth:replies`로 reply 탐지부터 재개하되 발송은 별도 승인 전 0건 유지.
3. OpenDART key + prod migration 승인이 생기면 K-Food 7곳 수집/검증을 재개.
4. 실제 ICP 채널 접근·발송 승인·실결제·K-DEFENSE private analytics 없이는 KPI를 올리지 않는다.

## 2026-08-10 Korean Hero Visual Increment

- 기존 SVG 단청 프레임과 한옥 canopy를 제거하고 `public/images/glosource-hero-gyeongbokgung-dancheong.png`를 `/`·`/en` 공통 HeroSection 커버로 연결했다.
- 커버는 경복궁 단청 처마, 우측 한복·갓 실루엣과 전통 문양을 사용하며 좌측 잉크 워시 그라디언트로 제품 카피 대비를 보존한다. 모바일은 세로 그라디언트와 `background-position`을 별도 적용한다.
- `/`·`/en` desktop과 `/` 390×844 browser preview를 확인했고, build 88 routes·test 202/202·typecheck·lint(오류 0)·harness guards가 통과했다.
- 이 증분은 P10 release-readiness를 완료하거나 phase를 전이하지 않는다. 현재 사용자 working-tree의 Next 16/package/harness 변경을 보존하고 외부 영향은 0건이다.
- 상세 설계·검증: `docs/plans/2026-08-10-003-hero-korean-visual.md`.

## 2026-08-10 Seasonal Korean Host Increment

- 밝고 맑은 경복궁 사계절 커버 4종을 생성·검토해 `public/images/`에 저장했다. 봄·여름·가을·겨울 모두 좌측 카피 여백과 우측 한복 환영 캐릭터 구도를 유지한다.
- `HeroSection`에 월별 초기 계절, 18초 자동 순환, 계절 선택 점, `prefers-reduced-motion` 중지, 10×10 조합의 결정적 100상태(포즈·표정)를 연결했다. 100개의 별도 AI 프레임을 생성했다는 의미는 아니다.
- `app/globals.css`에 밝은 계절 전환, 청량한 광원, 호스트 환영 배지, 우아한 미세 모션, 390px 모바일 초점 보정을 추가했다.
- `agent-browser`: `/` 1440px, `/en` 1440px, `/` 390×844, 계절 점 클릭, 오류/vitals를 확인했다. 오류 없음, LCP는 계절 PNG로 확인됐다.
- `npm test` 202/202, typecheck, lint(오류 0·기존 경고 16), build(Next.js 16.3.0·88 routes), lifecycle/상태/placeholder/sensitive/diff 검사를 통과했다.
- P10 blocked 상태는 전이하지 않았다. 커밋·push·배포·provider 변경·외부 발송·결제·SNS 게시 0건.
- 상세 설계·메타프롬프트: `docs/plans/2026-08-10-004-hero-seasonal-host.md`.

## 2026-08-10 Independent Host Character Samples

- 기존 계절 배경과 분리된 동일 디자인 언어의 한국 환영 캐릭터 PNG 5종을 생성·검토했다.
- 샘플 방향: ① 손 내밀어 환영 ② 정중한 인사 ③ 기회 가리키기 ④ 자신감 있는 엄지척 ⑤ 손을 심장에 얹은 신뢰 표현.
- 자산은 `public/images/glosource-host-samples/`에 저장했으며 아직 HeroSection에 통합하지 않았다.
- 사용자 샘플 승인 전 최종 투명화·리깅·100상태 통합은 보류한다. 외부 게시·배포·커밋·push 0건.
- 상세 메타프롬프트: `docs/plans/2026-08-10-005-character-sample-pack.md`.

## 2026-08-10 Korea Journey Visual System

- `/`·`/en` HeroSection 다음에 서울·경주·전주·부산·강원·제주 6개 명소를 잇는 `KoreaJourneySection`을 추가했다.
- 각 장면은 실제 명소명을 기준으로 생성한 밝은 극사실주의 editorial 이미지이며, 6.5초 자동 전환·점/이전/다음 컨트롤·가로 스냅·키보드/ARIA·reduced-motion을 지원한다.
- 1440px `/`, 1440px `/en`, 390×844 `/`에서 카드·카피·컨트롤을 확인했고 브라우저 오류는 없었다.
- `npm test` 202/202, typecheck, lint(오류 0·기존 경고 16), build 88 routes 통과.
- 관광 위치 인증·실제 재방문율·외부 게시·배포·commit·push는 실행하지 않았다. P10 blocked 유지.
- 상세 메타프롬프트: `docs/plans/2026-08-10-006-korea-journey-visual-system.md`.
- 모든 지역 카드 이미지에 작은 `한글 명소명 · English landmark name` 캡션과 bilingual `alt`를 추가했고, 계절별 경복궁 Hero에도 `서울 · SEOUL / 경복궁 · Gyeongbokgung` 라벨을 고정했다. 제품 작업공간·로고 같은 비명소 이미지는 의미가 맞지 않아 관광 명칭을 덧씌우지 않았다.
- 이 후속 변경은 로컬 화면·카피 범위이며 외부 게시·배포·commit·push는 실행하지 않았다.

## 2026-08-10 Landmark Label HTML Mock

- `public/mockups/glo-landmark-label-layout.html`에 실제 랜딩페이지의 명소 라벨 배치를 독립 실행형 HTML mock으로 정리했다.
- 히어로 좌상단 `서울 · SEOUL / 경복궁 · Gyeongbokgung`, 우상단 계절 점, 우하단 환영 배지, 지역 카드 하단 `한글 · English` 캡션을 한 화면에서 비교할 수 있다.
- 1440px·390px 브라우저 프리뷰와 겨울 계절 버튼 전환, bilingual alt/ARIA snapshot을 확인했다. 로컬 mock만 추가했으며 외부 게시·배포·commit·push는 실행하지 않았다.

## 2026-08-10 KR/EN Visual Alignment

- 기존 `/`·`/en`의 화면 카피와 라우트는 유지하고, 새 명소 라벨의 언어 우선순위만 구분했다. KR은 `서울 · SEOUL / 경복궁 · Gyeongbokgung`, EN은 `SEOUL · 서울 / Gyeongbokgung · 경복궁` 순서다.
- EN Hero는 같은 경복궁 계절 자산을 더 차분한 쿨 톤·오른쪽 중심 crop으로 처리하고, EN Korea Journey는 쿨한 종이 배경·레지스트리 톤 route를 사용한다. KR은 기존 따뜻한 한지·현지 발견 톤을 유지한다.
- visible copy, CTA, quota, pricing, sourcing direction, legal state는 수정하지 않았다. `HeroSection`·`KoreaJourneySection`·global CSS의 시각 레이어만 조정했다.
- `/`·`/en` 1440px/390px browser QA에서 label order, journey language order, `scrollWidth === viewport`를 확인했다. P10 blocked와 외부 실행 경계는 유지한다.
- 상세 설계·메타프롬프트: `docs/plans/2026-08-10-007-kr-en-visual-alignment.md`.

## 2026-08-10 Face-safe Hero Layout

- 기존 얼굴·이미지·카피 자산은 유지하고, 데스크톱 `gs-face-safe-panel`을 오른쪽 열 안에서 아래쪽·약 60px 왼쪽으로 재배치했다. 계절 커버를 세로 110%·하단 정렬로 크롭해 얼굴을 패널 위에 고정하고, 하단 여백을 예약해 제품 패널이 호스트 얼굴을 가리지 않도록 했다.
- 패널 폭은 오른쪽 열의 95%로 줄여 얼굴·경복궁 배경을 더 노출하면서 영문 검증 헤더가 한 줄로 유지되게 했다.
- 모바일은 패널을 밀지 않고 계절 커버의 초점을 KR 75%·EN 65%로 고정해 텍스트·CTA·얼굴이 같은 영역에 겹치지 않게 했다. KR/EN 모두 기존 라벨·카피·CTA·가격·쿼터를 수정하지 않았다.
- `agent-browser` 1440×900 및 390×844 `/`·`/en`에서 패널 위치·라벨·가로 넘침을 확인했다. DOM 기준 `scrollWidth === viewport`(1440/390)이며 외부 게시·배포·commit·push는 실행하지 않았다.

## 2026-08-11 Web Style Reference Proposals

- 첨부 `웹스타일 레퍼런스.pptx`의 33슬라이드(27개 스타일 카드 + 조합 가이드)를 읽기 전용으로 분석했다. 번들 `@oai/artifact-tool`의 `package.json` 부재와 PowerPoint/LibreOffice 미설치로 자동 PNG 렌더는 실행되지 않았으며, XML·내장 이미지 기반 분석 한계를 `docs/plans/2026-08-11-webstyle-reference-matrix.md`에 기록했다.
- `public/mockups/`에 overview와 5개 독립 HTML Mock을 추가했다: Atelier Map, Dancheong Bento, Heritage Journey, Evidence Workbench, Korea Edit. 각 안은 PPTX의 4~5개 슬라이드 DNA를 화면에 표시하고 기존 경복궁·대한민국 명소 로컬 자산을 사용한다.
- `/` KR(무료 베타·해외 공급자 탐색)과 `/en` EN(USD/Polar·한국 공급자 탐색)의 카피·가격·CTA·근거 경계를 Mock 안에서 분리했다. 기존 운영 라우트·API·결제·배포는 변경하지 않았다.
- 360/375/414/768/1440 viewport에서 5개 파일을 agent-browser로 열어 `scrollWidth === viewport`, 이미지 naturalWidth, bilingual alt, reference chip 수, CTA 높이를 확인했다. reduced-motion 및 keyboard focus ring CSS를 포함한다.
- P10 Release Readiness는 외부 설정·승인 부재로 계속 blocked이며 lifecycle state를 전이하지 않았다. 외부 게시·SNS 발송·배포·commit·push 0건.
- 상세 메타프롬프트: `docs/plans/2026-08-11-webstyle-reference-proposals.md`; 매핑: `docs/plans/2026-08-11-webstyle-reference-matrix.md`.

## 2026-08-18 Korean Mock Production Bridge

- 승인된 Web Style Mock의 Atelier 정렬·Dancheong 색 띠·Heritage Journey 리듬을 기존 `/`·`/en` 운영 화면에 연결했다. 기존 visible copy, CTA, quota, 가격, sourcing 방향과 법적 상태는 변경하지 않았다.
- Hero에 단청 하단 띠·편집 장식·증거 패널 깊이를 추가하고, KR/EN 네비게이션에 언어별 단청 규칙을 적용했다. KR 채널 스트립은 한지 배경·번호 칩·호버/스크롤 리듬으로 확장했고, 여정 헤더·진행 캡슐을 목업 형상과 맞췄다.
- 기존 여정 초기 effect가 문서 전체를 카드 위치로 세로 스크롤하던 문제를 발견해, `useRef` 기반 레일 내부 가로 `scrollTo`로 교정했다. 모바일 첫 화면에서 Hero가 유지된다.
- `/`·`/en` 1440px·390px 브라우저 QA에서 양의 수평 오버플로 없음, bilingual 경복궁/지역 명소 라벨, EN 모바일 핵심 CTA와 브라우저 오류 0건을 확인했다.
- `npx tsc --noEmit`, `npm run lint`(오류 0·기존 경고 16), `npm test` 229/229, `npm run build`(89 routes), harness/lifecycle/state/placeholder/sensitive/diff 검사가 통과했다. P10 blocked와 외부 실행 0건은 유지한다.
- 상세 설계·증거: `docs/plans/2026-08-18-korean-mock-production-bridge.md`.

## 2026-08-19 Next Progress Gate Audit

- `다음진행` 요청에 따라 Lifecycle·Harness·Task Queue를 재확인했다. 실행 가능한 `READY`는 없고 P10 Release Readiness는 `GITHUB_PRODUCTION_INDEPENDENT_REVIEWER_MISSING`, `GITHUB_PRODUCTION_SELF_REVIEW_PREVENTION_MISSING`, `FRESH_EXECUTION_APPROVAL_ABSENT`로 계속 `blocked`다.
- 차단 작업을 구현하거나 상태를 승격하지 않고, 재개 조건·권한·검증·STOP 규칙을 담은 `docs/operations/NEXT_PROGRESS_GATE_METAPROMPT_2026-08-19.md`를 저장했다. 3,439자, strict 계약검증 8/8 PASS, placeholder 0이다.
- Harness·Lifecycle·sensitive-string·placeholder·state·diff 검사는 모두 clean이다. 코드·UI 변경과 외부 실행은 0건이므로 typecheck/lint/test/build/browser QA는 이번 Loop에서 생략했다.
- 보고서: `docs/harness/reports/2026-08-19-next-progress-gate.md`.

## 2026-08-25 Landing Long-running Goal + Harness

- `/en` 증거 70 : 절제된 한국미 30과 KR/EN 계약 보존을 장기 Goal로 고정하고, `docs/operations/GLOSOURCE_LANDING_LONG_RUNNING_METAPROMPT.md`를 실행 정본으로 연결했다.
- Luna는 읽기 전용 경량 조사, Terra는 일반 UI·문서·집중 테스트, Sol은 보안·결제·계약 충돌·원인 불명 회귀와 최종 통합에만 사용하도록 단계적 승급 규칙을 정했다.
- `harness:landing-goal`과 3개 회귀 테스트가 필수 섹션, 모델 경로, 70:30 계약, 외부 승인과 3회 실패 중단 조건의 드리프트를 fail-closed로 탐지한다.
- strict prompt 8/8, 집중 8/8, 전체 251/251, typecheck, lint 오류 0, lifecycle clean. 제품 UI 변경이 없어 build와 브라우저 QA는 생략했다.
- P10은 기존 blocker 3건으로 계속 blocked이며 commit, push, provider 변경, migration, 게시와 배포는 실행하지 않았다.

## 2026-08-25 EN 360px Mobile Navigation

- Luna 읽기 전용 계약 감사와 루트 브라우저 QA에서 `/en` 360px 고정 헤더의 primary shortlist CTA가 우측에서 잘리는 첫 증거 공백을 확인했다.
- 400px 미만에서는 secondary `Sign up free`만 숨겨 logo, `Sign in`, `Get my shortlist`를 한 줄에 유지했다. 기존 카피·가격·quota·sourcing·registry·Hero/Journey 계약은 변경하지 않았다.
- 수정 후 360px CTA right 330/nav right 354/overflow false, 400px signup+shortlist 동시 노출, 1440px 전체 nav 노출을 확인했다. EN Hero static palace/host 0/season 0, Busan `aria-pressed=true`, runtime log 0도 재확인했다.
- 집중 4/4, 전체 252/252, typecheck, lint 오류 0, build 89/89 통과. build 후 서버 재기동은 성공했지만 마지막 탭 reload는 브라우저 URL 정책이 거부해 우회하지 않았다.
- P10 blocked와 외부 실행 0건은 유지한다. 보고서: `docs/harness/reports/2026-08-25-en-mobile-nav-360.md`.

## 2026-08-25 EN Evidence 70 : Korean Visual 30 Contract

- Luna 읽기 전용 inventory를 기반으로 `/en` 본문 10영역을 product 7, mixed 2, culture 1로 분류했다. nav/footer는 반복 UI chrome으로 분모에서 제외한다.
- `data-en-balance` marker와 `harness:en-balance`가 product-supporting 70% floor, culture-only 30% cap, 필수 영역·역할·중복·미등록 drift를 fail-closed로 검사한다.
- 현재 구조는 product-supporting 90%, culture-only 10%다. 이는 편집 위계와 문화 전용 section 제한이며 실제 pixel 70:30을 의미하지 않는다.
- visible copy·CTA·가격·quota·sourcing·결제·registry·이미지·레이아웃은 변경하지 않았다.
- 집중 12/12, 전체 255/255, typecheck, lint 오류 0, build 89/89 통과. localhost:3106 서버는 재기동했다.
- 브라우저 URL 정책을 우회하지 않아 신규 pixel 측정은 보류했다. P10 blocked와 외부 실행 0건은 유지한다.

## 2026-08-25 EN Pixel Balance Receipt Harness

- Terra가 strict receipt validator와 집중 테스트를 구현하고 루트가 synthetic fixture, geometry·순서·overlap·width 실패 경로와 문서 연결을 통합했다.
- `/en` 실제 360px·1440px section 높이 receipt를 받아 product-supporting 70% floor와 culture-only 30% cap을 판정한다. 필수 10영역·role·schema·route·기하를 fail-closed로 검증하고 출력은 집계와 오류 코드만 허용한다.
- 합성 fixture 판정은 10영역, product-supporting 92.10526315789474%, culture-only 7.894736842105263%이며 Harness 동작 검증일 뿐 실제 화면 측정이 아니다.
- 집중 16/16, 전체 263/263, typecheck, lint 오류 0·기존 경고 16, instruction/lifecycle/state/placeholder/sensitive/diff 검사를 통과했다. 제품 runtime/UI 변경이 없어 직전 성공 build 89/89를 재실행하지 않았다.
- 허용된 in-app browser 연결로 실제 360×800·1440×900 receipt를 확보했다. 높이 비중은 각각 product-supporting 93.9074% / culture 6.0926%, 93.8228% / 6.1772%로 통과했다.
- 두 receipt는 schema 1.1.0의 current EN render-source digest에 결합되어 UI·CSS·관련 계약·빌드 의존성 drift를 fail-closed로 막는다. 360/1440 overflow 없음, runtime log 0, lazy image 전체 로딩, 모바일 CTA와 Busan pressed 전환도 확인했다.
- P10 blocked, commit·push·provider 변경·migration·게시·배포 0건을 유지한다. 보고서: `docs/harness/reports/2026-08-25-en-pixel-balance-receipt-harness.md`.

## 2026-08-25 Landing Long-running Goal Completion Audit

- KR/EN 계약·visible copy 보존, `/en` 구조·실측 70% floor/30% cap, 360/1440 반응형·이미지·CTA·여정 상호작용, source-bound stale 방지, 메타프롬프트·모델 라우팅·Harness 보고 연결을 요구사항별로 재감사해 로컬 목표를 증거 있는 완료로 판정했다.
- 집중 16/16, 전체 263/263, typecheck, lint 오류 0·기존 경고 16, 직전 동일 UI build 89/89, browser runtime log 0과 모든 Harness 검사가 근거다.
- Production promotion은 원래 비범위이며 P10 blocker 3건과 approval 2건을 그대로 유지한다. commit, push, provider 변경, migration, 게시, 배포는 실행하지 않았다.
- 완료 감사: `docs/harness/reports/2026-08-25-landing-goal-completion-audit.md`.

## 2026-08-25 Vibe-course Metaprompt Hardening

- 양실장 바이브코딩 정석기술 1·2강 6,341행을 프로젝트 명령이 아닌 참고 입력으로 분석했다. 문제·병목·KPI, 상태·수동자동 경계, 결정·인터페이스, 신뢰성, vertical slice, 증거 사다리·환경 분리, 검수·피드백 원칙만 채택했다.
- 특정 SaaS 교체, GA4·법률/동의 추정, MFA·인가 완화, 인증 없는 공개, staging→Production 성공률 일반화, push·merge·배포 예시는 거부했다.
- 장기 실행 정본과 검사기에 새 8개 section·10개 실행 계약 그룹, 제품/Lifecycle 교차 검증과 shortcut 약화 탐지를 추가했다.
- strict prompt 8/8, 강화 회귀 11/11, 전체 271/271, typecheck, lint error 0·기존 warning 16을 확인했다. 제품 runtime 변경이 없어 build/browser QA는 생략했다.
- P10 blocked와 외부 영향 0건을 유지한다. 보고서: `docs/harness/reports/2026-08-25-vibe-course-metaprompt-hardening.md`.

## 2026-08-26 P10 Release Receipt Next Gate

- current SHA의 ignored receipt, archive digest/size, manifest candidate binding과 smoke는 유효했다. 현재 worktree가 dirty라 최종 판정은 `blocked / SOURCE_DIRTY`다.
- Decision Table에 따라 `package:product`, `receipt:release`, stash/reset/cleanup/commit을 실행하지 않았다.
- 전용 장기 메타프롬프트, 8개 fail-closed 계약 그룹, ready/no-rebuild·dirty/STOP·clean recovery·unknown/blocked 상태 분류와 7개 회귀 시나리오를 추가했다.
- 최초 focused 12/13은 phase/status 결합 검사로 고쳐 13/13 통과했다. 최초 full 276/278은 package script 추가가 EN pixel digest를 stale로 만든 원인이었고, script 추가를 되돌려 최종 278/278을 통과했다.
- typecheck 통과, lint error 0·기존 warning 16, lifecycle/instruction/landing Harness clean. P10 blocked·외부 실행 0건 유지.
- 보고서: `docs/harness/reports/2026-08-26-p10-release-receipt-gate.md`.
