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
