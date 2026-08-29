# TESTS

## Generic Checks

```powershell
git diff --check
npm run harness:instructions
node scripts/check-sensitive-strings.mjs .harness-blocklist.local
node scripts/check-harness-placeholders.mjs docs/harness
node scripts/check-state-json.mjs docs/harness/STATE.json
```

## Project-specific Checks

```powershell
npx tsc --noEmit
npm run lint
npm run build
npm run growth:audit
npm run growth:payments
npm run growth:live-contract
npm run readiness:product
npm run readiness:release-receipt
npm run readiness:control-plane
npm run readiness:promotion-context -- --candidate-sha <candidate-sha> --rollback-sha <rollback-sha>
npm run readiness:promotion-evidence -- <ignored-private-evidence.json> --candidate-sha <candidate-sha> --rollback-sha <rollback-sha>
npm run readiness:remediation-approval -- <preferences.json> <sanitized-audit.json>
npm run growth:acquisition:gate
npm run growth:outreach:preflight
```

작업별 필요한 명령만 선택하되 제품 코드 변경 시 typecheck, lint, build는 필수다. 외부 네트워크 또는 실데이터가 필요한 검사는 gate로 분리한다.

## Proof Metrics

- GloSource: 연락, 응답, 샘플 요청, 인터뷰, 유료 의향, 결제.
- K-DEFENSE: 쇼츠 수·조회수, itch.io 클릭, 플레이, 댓글·공유·저장, 교육자료 요청, 구매.
- 운영 비중: DONE 작업 기준 GloSource 80%, K-DEFENSE 20% 내외.

## Sanity Bands

- 예시·더미·내부 테스트 KPI는 0으로 처리.
- 유료 의향은 가격 제시 후 명시적 의사만 인정.
- 샘플 리포트의 공급사·인증·MOQ는 URL 증거 또는 미확인 표시 필요.
- UI는 360px와 1440px에서 CTA·폼·가격 영역이 사용 가능해야 함.
- EN 결제 링크는 실제 상품명·월 쿼터와 $39/$99/$249 가격이 일치해야 함. KR checkout은 법적 상용화 게이트가 열리기 전까지 비활성 상태여야 함.
- Active SNS launcher는 EN 월 3회 무료 계정 계약과 $39 시작 가격을 사용해야 하며, 역사 보고서의 폐기 문구를 재사용하지 않아야 함.
- 공개 수치·절감률·인증·고객 성과는 재현 가능한 증거가 없으면 예시로 명시하고 정밀 수치를 사용하지 않음.
- K-DEFENSE 반응이 0이면 게임 기능 개발 금지, 후킹 수정만 허용.

## Manual Review Gates

- 외부 발송 대상과 메시지
- 공개 샘플 리포트
- 실제 결제·환불
- Vercel 배포
- 쇼츠·소셜 게시
- 최종 계속/수정/중단 판단

## Last Green Run

2026-08-29 approved control-plane execution and remote repair:

- `npm test`: 279/279 pass, including CRLF/LF source-digest equivalence.
- `npx tsc --noEmit`: pass.
- `npm run lint`: 0 errors, 16 existing warnings.
- `$env:VERCEL=1; npm run build`: Next.js 16.3.0, static generation 89/89, pass; `.next/standalone/server.js` absent by design.
- local `npm run build`: Next.js 16.3.0, static generation 89/89, pass; `.next/standalone/server.js` present for immutable packaging.
- `npm run harness:instructions`, `npm run harness:landing-goal`, structural and 360/1440 pixel balance, P10 receipt-gate Harness, lifecycle, STATE, placeholder, sensitive-string and diff checks: clean.
- The first pushed SHA's GitHub verify failed 276/278 only on `SOURCE_DIGEST_MISMATCH`; the two failures were reproduced as line-ending-dependent provenance and fixed without changing browser geometry.
- The first pushed SHA's target Vercel Preview passed compile, TypeScript and 89/89 page generation, then failed in `onBuildComplete` on missing `.next/next-server.js.nft.json`; conditional standalone output removes that adapter conflict while retaining local packaging.
- Current browser automation could not claim the localhost tab because of the browser URL policy. No workaround was attempted; the tracked 360/1440 receipts remain valid for the current source digest.
- `npm run readiness:control-plane`: ready; Vercel Production 22/22, GitHub reviewer rule 1, `preventSelfReview=true`, branch policy configured, required GitHub Production Secret name present.
- Approved effects: branch-only Preview env 1, feature branch/PR push, Production reviewer/self-review update, Production Secret transfer. Workflow dispatch, staging, DB migration, backup/restore, rollback, merge and Production deployment: 0.

2026-08-23 non-self-invalidating local release receipt harness:

- `npx tsx --test tests/local-release-receipt.test.ts tests/release-packaging.test.ts tests/product-readiness.test.ts`: 15/15 pass.
- `npm test`: 248/248 pass, including Windows signal-terminated child-process cleanup.
- `npx tsc --noEmit`: pass after explicit unknown-number narrowing and child-process environment typing.
- Receipt schema rejects unknown/sensitive fields, dirty source, candidate/hash/size/manifest drift, and archives outside `dist/`.
- Actual post-commit proof requires `npm run package:product`, `npm run receipt:release -- --archive <exact archive>`, and `npm run readiness:release-receipt` on the resulting clean HEAD.
- Receipt output is ignored, sanitized, local-only, and does not authorize Production action.

2026-08-23 local clean candidate consolidation:

- `npm run verify:product`: 242/242 tests, TypeScript exit 0, ESLint errors 0 and existing warnings 16.
- `npm run build`: Next.js 16.3.0, compile/typecheck/static generation 89/89, exit 0; existing Edge Runtime deprecation warning remains.
- `npm run harness:instructions`, `npm run lifecycle:validate`, sensitive-string, placeholder, STATE and `git diff --check`: clean.
- `npm run lifecycle:status`: P10 remains blocked on independent reviewer, self-review prevention and fresh execution approval.
- Browser QA was not repeated in this commit-only loop; the included EN UI state retains the 2026-08-21 1440/390 browser evidence, and the current production build is green.
- Push, PR, workflow dispatch, provider mutation, DB migration, package creation and deployment: 0.

2026-08-23 candidate-bound promotion evidence preflight:

- Final focused release/preflight suite: 17/17 pass.
- Full `npm test`: 242/242 pass; TypeScript pass; ESLint errors 0 and existing warnings 16 in the preceding full verification.
- Context calculation covers the tracked Production target and migrations `0000` through `0005`; the operational CLI correctly remains blocked until the working tree is clean.
- Runtime/UI unchanged, so build and browser QA were not run for this increment.
- No real promotion evidence packet was supplied. Commit, push, dispatch, provider mutation, DB migration, backup, restore, rollback, and deployment: 0.
- P10 remains blocked on dirty provenance, real receipts, independent reviewer/self-review prevention, and fresh approvals.

2026-08-16 P10 release advancement:

- `npm run lifecycle:validate`: clean; active phase remains P10 blocked.
- `npm run readiness:product` after clean packaging: expected blocked only for local-process 17/22; archive present and source clean. This local-process scope does not replace the Vercel Production audit.
- `npm run readiness:control-plane`: Vercel Production 22/22 and target match; GitHub reviewer rule 1, branch policy configured, `preventSelfReview=false`.
- Sanitized GitHub follow-up: the sole reviewer is the current operator, so self-review prevention was not enabled without an independent reviewer.
- `npm run verify:product`: 202/202 tests, TypeScript errors 0, ESLint errors 0 and warnings 16.
- `npm run build`: Next.js 16.3.0, 88 routes, exit 0; existing Edge Runtime deprecation warning remains.
- Local provenance commits: `6ee214d` release/governance and `3c5ca96` UI/visual; no push.
- `npm run package:product` from clean `3c5ca96`: archive `dist/glosource-ai-0.1.0-20260816T135231882Z.tgz`, 73,289,062 bytes, 2,452 files, SHA-256 `359FD0DAF3DAA0EFB3ACBF0EB2F591916706DD57C37F4E6AF949E63293F35C2F`, blocked 0, all-zero 0, `secretsIncluded=false`, `dirty=false`.
- Package smoke with local-only `AUTH_URL` and `AUTH_TRUST_HOST=true`: `/`, `/en`, `/api/auth/session` HTTP 200; `growth:live-contract` 7/7.
- No provider mutation, secret output, push, workflow dispatch, deployment, migration, payment, or external send ran.

2026-08-09 P10 read-only evidence audit:

- `npm run harness:instructions` clean
- `npm run lifecycle:validate` clean
- `npm run lifecycle:status` correctly reports brownfield `P10 / blocked` with four blockers and two pending approvals
- `npm run readiness:product` preflight expected blocked: local process 17/22, clean pre-receipt source, no archive at that time
- `npm run readiness:control-plane` expected blocked: Vercel Production 20/22 with `AUTH_TRUST_HOST` and `DATAGO_SERVICE_KEY` missing; GitHub required reviewer, self-review prevention, and deployment branch policy absent
- `npm run verify:product` green: 201/201 tests, TypeScript 0 errors, ESLint 0 errors and 1 pre-existing warning
- Windows CRLF clean checkout regression: focused agent-instruction tests 4/4 after normalizing instruction input line endings
- `npm run package:product` green: Next.js 15.5.20 production build and standalone diagnostic archive created
- Archive inspection green: 3,080 entries, blocked files 0, all-zero files 0, manifest `secretsIncluded=false`; manifest `dirty=true` keeps it non-promotable
- Package smoke green with existing local environment injected without printing values: `/`, `/en`, `/api/auth/session` HTTP 200 and product contract 7/7
- No provider write, secret entry, commit, push, PR, workflow dispatch, staging, Production deployment, migration, ingest, external send, or paid action ran
- `npm audit --omit=dev --json` read-only audit: production dependencies 98; critical 2, high 6, moderate 5; no `npm audit fix`, install, or lockfile mutation
- npm registry candidate check: Auth.js minimum candidates `next-auth@5.0.0-beta.32`, `@auth/core@0.41.3`, `@auth/drizzle-adapter@1.11.3`; Next.js high advisory candidate `next@15.5.23`
- Auth.js remediation installed only `next-auth@5.0.0-beta.32` and `@auth/drizzle-adapter@1.11.3`; resolved tree dedupes `@auth/core@0.41.3` and updates `jose` to 6.2.8 without major/downgrade
- `npx tsx --test tests/admin-auth.test.ts tests/internal-auth.test.ts tests/session-security.test.ts` 6/6 green
- post-remediation `npm run verify:product`: 201/201, TypeScript 0 errors, ESLint 0 errors and 1 pre-existing warning
- post-remediation production audit: critical 0, high 5, moderate 5, total 10
- post-remediation package: build green; 3,080 archive entries; blocked files 0; all-zero files 0; `/`, `/en`, `/api/auth/session` HTTP 200; product contract 7/7
- Next.js backport 2026-08-10: `next/@next-env 15.5.23` exact, React/React DOM unchanged at 19.2.4, no codemod or major change
- post-backport `npm run verify:product`: 201/201, TypeScript 0 errors, ESLint 0 errors and 1 pre-existing warning
- `npm run build`: Next.js 15.5.23 green, 89 pages; existing Auth.js Edge Runtime CompressionStream warnings remain
- `.next/standalone` smoke: `/`, `/en`, `/api/auth/session` HTTP 200; product contract 7/7
- production audit remains critical 0, high 5, moderate 5; direct Next high remains and npm fix requires `next@16.3.0` semver-major
- no new archive was created after 15.5.23 because the security success criterion failed; prior archive is stale relative to current dependency tree

2026-08-10 Next.js 16 migration and package follow-up:

- Official Next.js 16 upgrade/codemod guidance reviewed; codemod dry-runs were unmodified for this codebase.
- `next`, `@next/env`, `eslint-config-next` exact `16.3.0`; React/React DOM remain `19.2.4`.
- `middleware.ts` migrated to `proxy.ts`; `npm run verify:product` green: 201/201, TypeScript 0 errors, ESLint 0 errors and 16 warnings.
- `npm run build` green: Next.js 16.3.0/Turbopack, 88 routes; only existing Edge Runtime deprecation warning remains.
- Targeted production patch versions `undici@7.29.0` and `dompurify@3.4.13` applied. `npm audit --omit=dev`: critical 0, high 0, moderate 4, total 4. Full audit retains two dev-only high findings and four moderate tooling findings; no force fix or drizzle-kit downgrade was run.
- Initial package attempt failed on Windows symlink privilege (`EPERM`); `scripts/package-release.ts` now copies with `dereference: true`, and focused release tests pass 5/5.
- `npm run package:product` green: archive `dist/glosource-ai-0.1.0-20260809T223844953Z.tgz`, 36,244,023 bytes, 2,845 entries, SHA-256 `6CB653377D92082886EB4472B0A164F4C342A8010E466046F350705FE5B247E8`, manifest `dirty=true`, `secretsIncluded=false`, blocked 0, all-zero 0.
- Local package smoke green without printing environment values: `/`, `/en`, `/api/auth/session` HTTP 200; `growth:live-contract` 7/7.
- `npm run readiness:product` remains expected blocked: local process 17/22 with five missing names and dirty source. No provider write, secret entry, commit, push, PR, workflow dispatch, staging, Production deployment, migration, ingest, external send, or paid action ran.

2026-08-07 P10 provenance reconstruction final verification:

- Increment A focused packaging and sensitive-scanner tests: 7/7 green
- Increment B focused readiness, remediation, and release-governance tests: 30/30 green
- Increment C focused growth-copy and marketing-claim tests: 6/6 green
- Increment C production build: green, 89 routes
- Increment C X, Threads, and Instagram dry-run: green; no post published
- Increment D regenerated DOCX structural audit: green; 70,091 bytes, 23,426 characters, 366 paragraphs, 24 tables, and 15 hyperlinks
- Increment D visual render: not verified because LibreOffice/`soffice` is unavailable
- Final integration `npm test`: 200/200 green
- `npx tsc --noEmit` green
- `npm run lint` 0 errors, 1 pre-existing unrelated warning in `_measure-attach.ts`
- agent-instruction, lifecycle, state JSON, placeholder, sensitive-string, working-tree diff, and staged diff checks green
- No push, PR, provider mutation, external send, workflow dispatch, promotion, staging deployment, Production deployment, or lifecycle phase advancement ran

2026-08-07 Root agent-instruction governance verification:

- `npm run harness:instructions` clean
- `npx tsx --test tests/agent-instructions.test.ts` 3/3 green
- `npm test` 200/200 green
- `npx tsc --noEmit` green
- `npm run lint` 0 errors, 1 pre-existing unrelated warning in `_measure-attach.ts`
- `npm run lifecycle:validate` clean
- state JSON, placeholder, sensitive-string, and `git diff --check` checks green
- `npm run build` was not rerun because this increment changes repository instructions, a local drift checker, tests, and harness records rather than application runtime code
- No provider write, external send, commit, push, workflow dispatch, deployment, production migration, or lifecycle phase completion ran

2026-08-07 Full lifecycle Goal Harness verification:

- `npx tsx --test tests/lifecycle-harness.test.ts` 8/8 green
- `npm test -- --runInBand` 197/197 green
- `npm run lifecycle:validate` green
- `npm run lifecycle:status` correctly reports brownfield `P10 / blocked` with its prompt, blockers, and approval boundary
- `npm run lifecycle:start` correctly exits 1 while blocked; lifecycle state hash remains unchanged
- `npx tsc --noEmit` green
- `npm run lint` 0 errors, 1 pre-existing unrelated warning in `_measure-attach.ts`
- state JSON, placeholder, sensitive-string, and `git diff --check` checks green
- `npm run build` was not rerun because this increment changes documentation and a local CLI harness, not the application runtime; the last 2026-08-04 build remains green with 89 routes
- No provider write, external send, push, workflow dispatch, deployment, production migration, or historical phase backfill ran

2026-08-07 Production remediation execution preflight verification:

- `npx tsx --test tests/production-remediation-execution-preflight.test.ts` 6/6 green
- `npx tsx --test tests/production-remediation-approval.test.ts tests/production-remediation-execution-preflight.test.ts` 17/17 green
- `npx tsx --test tests/production-remediation-approval.test.ts` 11/11 green
- `npx tsx --test tests/control-plane-readiness.test.ts` 8/8 green
- `npm test` 189/189 green
- `npx tsc --noEmit` green
- `npm run lint` 0 errors, 1 pre-existing warning
- deferred example packet run expected non-ready: `awaiting_decisions`, audited readiness `blocked`, external mutation authority false, secrets·reviewer identities·commands 미포함
- deferred execution preflight run expected non-ready: `awaiting_preferences`, action code 0, execution approval false, provider mutation authority false, secrets·reviewer identities·exact branch patterns·commands·payloads 미포함
- `npm run readiness:control-plane` expected blocked: Vercel Production 20/22, `AUTH_TRUST_HOST`·`DATAGO_SERVICE_KEY` 누락; GitHub required reviewer·self-review 방지·branch policy 미구성; 값·reviewer 신원 미포함
- `npm run build`는 이번 스크립트·문서 단위에서 재실행하지 않았으며, 마지막 2026-08-04 검증은 green·89 routes였다.
- `npm run growth:audit`, `npm run growth:payments`, `npm run growth:live-contract` green
- `npm run growth:social:dry-run` green for X, Threads, Instagram; report uses the current EN account-based monthly quota copy
- Harness state·sensitive-string·placeholder checks green
- `npm run readiness:product` blocked: 로컬 필수 변수 이름 5개 누락 + dirty source
- Vercel Production read-only audit: 필수 22개 중 20개 존재; `AUTH_TRUST_HOST`, `DATAGO_SERVICE_KEY` 누락; 값 미출력
- `npm run growth:daily` green; 사례 후보 0건을 그대로 기록
- `npm run growth:acquisition:gate` green after current daily-growth and social-dry-run evidence
- GitHub `Production` read-only audit: `protection_rules=[]`, `deployment_branch_policy=null`; required reviewer와 배포 브랜치 보호 미구성

## Known Local Verification Limits

- `release-governance.test.ts`는 push 경로의 쓰기 권한·master push 위치·수동 조건을 검사한다. GitHub API로 production environment 보호 미구성을 확인했지만, 변경된 workflow의 원격 실행은 아직 검증하지 않았다.
- control-plane 감사는 정책을 관찰할 뿐 required reviewer나 branch policy를 설정하지 않는다. 특히 `master` 전용 branch policy는 현재 feature-ref 기반 승격을 막을 수 있어 운영자 설계가 필요하다.
- remediation packet의 `preferences_recorded`는 운영 준비·실행 승인·설정 완료가 아니다. 실제 reviewer 신원, DATAGO 값, branch pattern, provider 변경과 변경 후 기능 검증은 별도 사람 승인과 새 감사가 필요하다.
- remediation preflight의 `handoff_ready`는 사람에게 실행 승인을 요청할 입력이 정합하다는 뜻뿐이며 실행 승인·명령·provider payload를 제공하지 않는다.
- 민감 문자열 검사는 현재 staged·unstaged 추가 라인과 untracked 파일을 fail-closed로 검사한다. clean CI checkout의 기준 브랜치 대비 이미 커밋된 변경 검사는 별도 CI 정책이 필요하다.
- 통합 social dry-run은 X·Threads·Instagram을 실행한다. Reddit·LinkedIn·Discord는 현재 정적 계약 회귀 테스트로만 검증되며 실제 플랫폼 게시 검증이 아니다.
- KR 예시 문구는 정적 주장 회귀 테스트와 production build로 검증했다. 360px/1440px 브라우저 시각·접근성 확인은 이번 로컬 검증에 포함되지 않았다.
- 설치된 Next.js 패키지에는 `node_modules/next/dist/docs/`가 존재하지 않아 저장소 지침이 지정한 내장 가이드를 확인할 수 없었다. 이번 변경은 API나 라우팅이 아닌 기존 Client Component의 정적 문구·데이터 필드 수정으로 제한했다.

## 2026-08-10 Korean Hero Visual Increment

- `public/images/glosource-hero-gyeongbokgung-dancheong.png` 생성·검토: 경복궁 단청 처마, 한복·갓 실루엣, 좌측 카피 여백을 포함한 2,073,031-byte PNG
- `npm test`: 202/202 green
- `npx tsc --noEmit`: green
- `npm run lint`: 0 errors, 16 existing Next 16 React Hooks/style warnings
- `npm run build`: green, Next.js 16.3.0, 88 routes
- `npm run harness:instructions`, `npm run lifecycle:validate`, state/placeholder/sensitive checks, `git diff --check`: green
- `agent-browser`: `/` desktop, `/en` desktop, `/` 390×844 mobile visual checks green; no page errors observed
- Existing P10 blocked state was not advanced. No commit, push, deploy, provider mutation, external send, payment, or SNS publish ran.

2026-08-10 Seasonal Korean host verification:

- Generated and visually inspected four bright Gyeongbokgung seasonal PNGs: spring, summer, autumn, winter.
- `npm test`: 202/202 green
- `npx tsc --noEmit`: green
- `npm run lint`: 0 errors, 16 existing Next 16 React Hooks/style warnings
- `npm run build`: green, Next.js 16.3.0, 88 routes
- `npm run harness:instructions`, `npm run lifecycle:validate`, state JSON, placeholder, sensitive-string, and `git diff --check`: green
- `agent-browser`: `/` 1440px, `/en` 1440px, `/` 390×844, spring selector click, no page errors, vitals LCP loaded the seasonal PNG
- No P10 transition, commit, push, deployment, provider mutation, payment, external send, or SNS publish.

2026-08-10 Independent host character sample pack:

- Built-in image generation produced five standalone samples with distinct gestures and expressions.
- `view_image` inspection completed for all five outputs; hands, facial expression, hanbok palette, and no-text/no-logo constraints were reviewed.
- Files copied to `public/images/glosource-host-samples/` and existence/size verified.
- No HeroSection integration, transparency conversion, rigging, deployment, or external publication ran; user approval is the next gate.

2026-08-10 Korea journey visual system:

- Generated and visually inspected six bright landmark images: Seoul Gyeongbokgung, Gyeongju Bulguksa, Jeonju Hanok Village, Busan Gamcheon Culture Village, Gangwon Seoraksan, Jeju Seongsan Ilchulbong.
- `npm test`: 202/202 green
- `npx tsc --noEmit`: green
- `npm run lint`: 0 errors, 16 existing Next 16 React Hooks/style warnings
- `npm run build`: green, Next.js 16.3.0, 88 routes
- `agent-browser`: `/` 1440px, `/en` 1440px, `/` 390×844, region control interaction, no page errors; dev listener closed after QA
- `npm run lifecycle:validate`, sensitive/placeholder/state checks, and `git diff --check`: green
- No deployment, provider mutation, commit, push, location verification, or external publication.

2026-08-10 Bilingual landmark labels:

- `KoreaJourneySection`의 6개 명소 카드가 모두 한글·영문 명소명을 작은 캡션으로 표시하고 bilingual `alt`를 제공하는지 정적 확인.
- 계절별 경복궁 Hero가 `서울 · SEOUL / 경복궁 · Gyeongbokgung` 위치 라벨과 bilingual `aria-label`을 제공하는지 정적 확인.
- `npx tsc --noEmit`: green; `npm run lint`: 0 errors, 16 existing warnings; `npm run build`: green, Next.js 16.3.0, 88 routes.
- `npm test`: 202/202 green.
- `agent-browser`: `/` 1440px 및 390×844에서 히어로 라벨·지역 카드 bilingual 캡션을 확인했고, `/`·`/en`의 경로/ARIA 텍스트를 snapshot으로 확인했다. lifecycle/상태/placeholder/sensitive/diff 검사도 green.
- 외부 게시·배포 검증은 범위 밖이며 실행하지 않았다.

2026-08-10 Landmark label HTML mock:

- `public/mockups/glo-landmark-label-layout.html`가 6개 지역 이미지의 bilingual caption과 경복궁 hero label을 렌더링하는지 `agent-browser` snapshot으로 확인.
- 1440px·390px screenshot에서 좌상단 hero label, 우상단 season switcher, 우하단 host badge, 모바일 가로 카드 rail을 시각 확인.
- 겨울 season 버튼 클릭 후 `aria-pressed="true"` 및 겨울 PNG CSS 변수 전환을 확인.
- mock은 정적 로컬 설명물이며 production build·배포·외부 게시 대상이 아니다.
- 저장소 회귀 확인: `npm run build` green, Next.js 16.3.0, 88 routes.

2026-08-10 KR/EN visual alignment:

- `/` and `/en` hero labels verified as KR-first and EN-first respectively; existing visible hero copy remained present.
- `/` and `/en` journey cards verified with KR/EN language-first bilingual captions and matching `data-lang` visual variants.
- `agent-browser` at 1440px and 390px: no horizontal overflow (`scrollWidth === viewport`), label visible, EN bilingual card text starts with English.
- `npx tsc --noEmit`: green; `npm run lint`: 0 errors, 16 existing warnings; `npm test`: 202/202; `npm run build`: green, Next.js 16.3.0, 88 routes.
- `npm run lifecycle:validate`, state, placeholder, sensitive-string, and `git diff --check` remain green. No deployment or external publication.

2026-08-10 face-safe hero layout:

- `agent-browser` 1440×900: `/` panel bounds `left=873,right=1272,top=310,bottom=761,width=399`; `/en` `left=873,right=1272,top=338,bottom=833,width=399`; face-safe panel stays in the right column and no horizontal overflow occurred.
- `agent-browser` 390×844: `/` and `/en` both reported `scrollWidth=390`, `viewport=390`; mobile seasonal cover uses KR 75% / EN 65% focal positions and bilingual landmark labels remain present.
- `npx tsc --noEmit`: green; `npm run lint`: 0 errors, 16 existing warnings; `npm test`: 202/202; `npm run build`: green, Next.js 16.3.0, 88 routes.
- `npm run harness:instructions`, `npm run lifecycle:validate`, state/placeholder/sensitive-string checks, and `git diff --check`: green.

2026-08-11 web style reference proposals:

- PPTX inventory: 33 slides, 30 embedded JPGs, 27 named style cards plus combination guidance. Automatic artifact-tool render was unavailable because the bundled package path lacked `package.json`; no render-pass completion was claimed.
- `agent-browser` desktop: overview + five proposal pages at 1440×900; all reported `scrollWidth=1440`, all images `naturalWidth>0`, all images had bilingual or contextual `alt` text.
- `agent-browser` responsive: five proposal pages at 360, 375, 414, and 768px; every page reported `scrollWidth === viewport`, `overflow=false`, reference chips 4 or 5, and CTA boxes remained one-line at desktop / full-width at mobile.
- Keyboard focus: proposal workbench anchor received `outline-style=solid`, `outline-width=3px`, `outline-offset=3px`.
- Screenshots: `C:\Users\ddedi\AppData\Local\Temp\glo-webstyle-overview-full.png` and per-proposal 1440/360 captures were created for local QA only.
- Existing regression: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run harness:instructions`, `npm run lifecycle:validate`, state/placeholder/sensitive-string checks, and `git diff --check` were run after implementation; results recorded in the final handoff.
- No production route replacement, external publication, deployment, payment, provider mutation, commit, or push.

2026-08-18 Korean mock production bridge:

- `npx tsc --noEmit`: green; `npm run lint`: 0 errors, 16 existing warnings; `npm test`: 229/229; `npm run build`: green, Next.js 16.3.0, 89 routes.
- `/` and `/en` browser QA at 1440px and 390px: `scrollWidth <= viewport`, Hero/Journey `data-style-dna` present, bilingual landmark labels present, KR channel chips = 4, Journey cards = 6, EN mobile `Sign in`/`Sign up free`/`Get my shortlist →` visible, runtime error logs = 0.
- A pre-existing initial-scroll regression was reproduced and fixed: the Journey effect now scrolls only its horizontal rail; after returning to top, `window.scrollY` stayed 0 for 2.5 seconds and Hero remained visible.
- `npm run harness:instructions`, `npm run lifecycle:validate`, state/placeholder/sensitive-string checks and `git diff --check`: green. P10 remains blocked; no commit, push, deployment, provider mutation, payment, or external publication.

2026-08-19 next progress gate audit:

- `python C:\Users\ddedi\.codex\skills\bamsoft-prompt-engineering\scripts\validate_prompt_contract.py docs/operations/NEXT_PROGRESS_GATE_METAPROMPT_2026-08-19.md --strict --json`: PASS, required groups 8/8, placeholders 0.
- Prompt length: 3,439 characters; SHA-256 `500D459BF6EE698A82AABBAAF4D6864B079F2A44DA7352CFD8D8AD983C80C7BA`.
- `npm run harness:instructions`, `npm run lifecycle:validate`, `node scripts/check-sensitive-strings.mjs .harness-blocklist.local`, `node scripts/check-harness-placeholders.mjs docs/harness`, `node scripts/check-state-json.mjs docs/harness/STATE.json`, `git diff --check`: clean.
- No code/UI change; typecheck/lint/test/build/browser QA intentionally not run in this gate. P10 remains blocked and no external effect occurred.

2026-08-21 EN evidence 70 : Korea 30:

- `npx tsx --test tests/en-visual-balance.test.ts`: 3/3; source order, compact three-stop journey, EN manual hero motion and English season accessibility names are fixed by regression tests.
- `npx tsc --noEmit`: green; `npm run lint`: 오류 0; `npm test`: 232/232; `npm run build`: green, Next.js 16.3.0, 89 routes.
- In-app browser 1440×900: host hidden, season controls visible, Journey count 3, heading order Hero → registry → category → journey → problem, `scrollWidth=1434 <= 1440`.
- In-app browser 390×844: host and season controls hidden, Hero/CTA/proof widths fit 336px, Journey rail has three bilingual cards, `scrollWidth=384 <= 390`.
- Accessibility snapshot exposes English season description, 3/3 Journey state, Previous/Next and Seoul/Busan/Jeju selection names. Pointer-driven Journey state transition was not recorded as completed evidence.
- No commit, push, deployment, payment, provider mutation, or external publication.

2026-08-21 EN restrained Korean-modern refinement:

- `npx tsc --noEmit`: green; `npm run lint`: 오류 0; `npm test`: 232/232; `npm run build`: green, Next.js 16.3.0, 89 routes.
- In-app browser 1440×900: clean Gyeongbokgung architecture scene, static motion, host 0, season controls 0, compact 3-card Journey, `scrollWidth=1434 <= 1440`.
- In-app browser 390×844: Hero/CTA/proof width 336px, palace crop 64%, host/season controls 0; Journey first card 257px with next-card affordance, `scrollWidth=384 <= 390`.
- `localhost` hydrated browser: `View Busan scene` click 후 dots `[false,true,false]`, Busan card pressed, rail `scrollLeft=227`; page overflow -6px and runtime error/warning log 0.
- 초기 `127.0.0.1` 접근은 Next.js dev-resource cross-origin 차단으로 hydration되지 않아 기능 판정에서 제외했다.
- No commit, push, deployment, payment, provider mutation, or external publication.

2026-08-25 Landing long-running Goal + Harness:

- strict prompt validator: 8/8 required groups, placeholders 0, warnings 0; 3,175 characters; SHA-256 `8E31C8C92D1020487935EE8F3DF4A4023B3B9057E2329A6094824A5DBC25D653`.
- `npm run harness:landing-goal`: clean; focused landing/agent-instruction tests 8/8 pass.
- `npm test`: 251/251 pass; `npx tsc --noEmit`: pass; `npm run lint`: exit 0 with 0 errors and 16 pre-existing warnings.
- `npm run lifecycle:validate`: clean; `npm run lifecycle:status`: P10 blocked with the existing three blockers.
- No product UI/runtime change; build and browser QA intentionally skipped. No commit, push, provider mutation, migration, publication, or deployment.

2026-08-25 EN 360px mobile navigation:

- `npx tsx --test tests/en-visual-balance.test.ts`: 4/4 pass, including the under-400px secondary signup hide and persistent shortlist CTA contract.
- Browser 360×800: shortlist `left=202,right=330,width=128`, nav right 354, signup hidden, `scrollWidth=354`, overflow false.
- Browser 400×800: signup `left=150,right=244`, shortlist `left=256,right=384`, `scrollWidth=394`; both visible.
- Browser 1440×900: full nav visible, overflow false; static Gyeongbokgung scene, EN host 0, season controls 0, Busan pressed, error/warn log 0.
- `npm run build`: Next.js 16.3.0, 89/89; `npx tsc --noEmit`: pass; `npm test`: 252/252; `npm run lint`: exit 0, errors 0, existing warnings 16.
- Dev server restarted on localhost:3106. Final browser reload was rejected by the browser URL policy and was not bypassed. No external effects.

2026-08-25 EN 70:30 balance contract:

- `npm run harness:en-balance`: clean; 10 content regions, product-supporting 9/10 (90%), culture-only 1/10 (10%).
- Focused EN balance, visual, and instruction tests: 12/12 pass, including culture cap overflow and missing required product region failures.
- `npm run build`: Next.js 16.3.0, 89/89; `npx tsc --noEmit`: pass; `npm test`: 255/255; `npm run lint`: exit 0, errors 0, existing warnings 16.
- Exact pixel ratio was not measured because localhost Browser Use remained policy-blocked; the restriction was not bypassed. Dev server restarted on localhost:3106.
- No visible copy, layout, API, DB, provider, commit, push, publication, or deployment change.

2026-08-25 EN pixel balance receipt harness:

- `npx tsx --test tests/en-landing-pixel-balance.test.ts tests/en-landing-balance.test.ts tests/agent-instructions.test.ts`: 16/16 pass.
- `npm test`: 263/263 pass; `npx tsc --noEmit`: pass; `npm run lint`: exit 0, errors 0, existing warnings 16.
- `npm run harness:en-balance:pixels -- tests/fixtures/en-landing-pixel-receipt.synthetic.json`: exit 0, 10 regions, total height 3800, product-supporting 92.10526315789474%, culture-only 7.894736842105263%.
- CLI without a receipt path: expected exit 1 with `USAGE_REQUIRES_ONE_RECEIPT_PATH`.
- The synthetic fixture validates schema, aggregation, and failure behavior. Actual source-bound 360×800 and 1440×900 browser receipts are tracked separately under `docs/harness/evidence/`.
- Product runtime/UI did not change in this loop, so build was not rerun; the immediately preceding marker integration build remains green at 89/89 routes.
- No browser policy bypass, commit, push, provider mutation, migration, publication, or deployment ran.
- Actual 360×800 receipt: total height 14908.984375, product-supporting 93.90740692221028%, culture-only 6.092593077789714%, clean.
- Actual 1440×900 receipt: total height 8524.3125, product-supporting 93.8228156229608%, culture-only 6.177184377039204%, clean.
- Receipt schema 1.1.0 requires the current EN render-source SHA-256; a stale digest fails with `SOURCE_DIGEST_MISMATCH`, and both tracked browser receipts must share the same current digest.
- Browser 360×800: `scrollWidth=354`, primary shortlist CTA visible, signup hidden, host/season controls 0, Busan dot/card pressed, full lazy-image load, error/warning logs 0.
- Browser 1440×900: `scrollWidth=1434`, primary shortlist CTA visible, host/season controls 0, full lazy-image load, error/warning logs 0.

2026-08-25 Vibe-course metaprompt hardening:

- strict prompt validator: required groups 8/8, placeholders 0, warnings 0; 6,266 characters; SHA-256 `EA90369ACD66507BDE08236724B99774396CB958E8B1B925740353588061469F`.
- `npm run harness:landing-goal`: clean; strengthened focused tests 11/11 pass.
- `npm test`: 271/271 pass; `npx tsc --noEmit`: pass; `npm run lint`: exit 0, errors 0, existing warnings 16.
- Initial focused run was 9/10 because the lifecycle-drift test mutated only the first `P10`; the fixture was corrected to replace all occurrences and final verification passed 11/11.
- Product runtime/UI/API/DB/dependencies unchanged, so build and browser QA were not run. Lifecycle remains P10 blocked; commit, push, provider/OAuth change, migration, external send, publication and deployment: 0.

2026-08-26 P10 release receipt next gate:

- `npm run readiness:release-receipt`: expected exit 1, `blocked / SOURCE_DIRTY`; current-SHA receipt found, receipt valid, archive bound, manifest verified/candidate match, smoke green, secret/raw log absent, external action 0.
- strict prompt validator: required groups 8/8, placeholders 0, warnings 0; 5,866 characters; SHA-256 `0EC6AAF87ACDCF064B9EDB3C52AD62356850A09632E81569C4D77AA54C2FB2D2`.
- `npx tsx scripts/check-p10-receipt-gate-harness.ts`: clean; focused gate+receipt tests 13/13 pass.
- Initial focused run 12/13 exposed a loose lifecycle phase/status check; exact pair validation fixed it. Initial full run 276/278 exposed package.json-driven EN pixel receipt staleness; the new npm script line was removed and direct checker execution preserves the prior source digest.
- Final `npm test`: 278/278 pass; `npx tsc --noEmit`: pass; `npm run lint`: exit 0, errors 0, existing warnings 16.
- `package:product`, `receipt:release`, build/browser, commit/push, provider/OAuth, migration, staging/Production were not run. P10 remains blocked.
