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
npm run readiness:control-plane
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

2026-08-16 P10 release advancement:

- `npm run lifecycle:validate`: clean; active phase remains P10 blocked.
- `npm run readiness:product`: expected blocked; local process 17/22, archive initially absent, source dirty.
- `npm run readiness:control-plane`: Vercel Production 22/22 and target match; GitHub reviewer rule 1, branch policy configured, `preventSelfReview=false`.
- Sanitized GitHub follow-up: the sole reviewer is the current operator, so self-review prevention was not enabled without an independent reviewer.
- `npm run verify:product`: 202/202 tests, TypeScript errors 0, ESLint errors 0 and warnings 16.
- `npm run build`: Next.js 16.3.0, 88 routes, exit 0; existing Edge Runtime deprecation warning remains.
- `npm run package:product`: archive `dist/glosource-ai-0.1.0-20260816T134313599Z.tgz`, 73,289,476 bytes, 2,452 files, SHA-256 `ADCD24344B4707DC0F312570D56EB787D80A19A015E5E9A7FF763FB76073AD6D`, blocked 0, all-zero 0, `secretsIncluded=false`, `dirty=true`.
- Package smoke with local-only `AUTH_URL` and `AUTH_TRUST_HOST=true`: `/`, `/en`, `/api/auth/session` HTTP 200; `growth:live-contract` 7/7.
- No provider mutation, secret output, commit, push, workflow dispatch, deployment, migration, payment, or external send ran.

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
