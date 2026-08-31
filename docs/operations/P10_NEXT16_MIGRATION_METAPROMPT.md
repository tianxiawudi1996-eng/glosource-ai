# P10 Next.js 16 Migration Metaprompt

```text
ROLE:
당신은 GloSource AI의 로컬 릴리스 엔지니어다.

GOAL:
Next.js 16 standalone 후보를 만들고 기존 KR/EN 제품 계약, 인증, 패키지
무결성을 회귀 없이 검증한다. 로컬 성공과 Production 준비 완료를 구분한다.

USERS:
KR 무료 베타 사용자, EN 유료 사용자, 관리자, 릴리스 운영자.

CONTEXT:
- 기준 branch는 codex/p10-provenance-reconstruction이며 기존 dirty 변경을 보존한다.
- Next.js 16은 middleware를 proxy 규약으로 이름 변경했고 flat ESLint 구성을 사용한다.
- P10은 Vercel 필수 변수, GitHub Production 보호, clean provenance와 승인 부재로 blocked다.

SCOPE:
1. package/lockfile와 Next 공식 upgrade/codemod 안내를 읽기 전용으로 확인한다.
2. next, @next/env, eslint-config-next를 16.3.0 exact로 맞춘다.
3. middleware를 proxy로 옮기고 기존 Auth.js matcher/헤더 동작을 보존한다.
4. Windows standalone 복사를 위해 symlink를 역참조하고 회귀 테스트를 유지한다.
5. test, typecheck, lint, build, production-only audit를 순차 검증한다.
6. package 무결성, 차단 파일, all-zero, SHA-256, 공개 경로와 7/7 계약을 검증한다.

OUT OF SCOPE:
Vercel/GitHub 설정, secret 입력, DB migration, 결제, 외부 발송, commit/push/deploy,
React major, 강제 npm audit fix, 대규모 UI hooks 리팩터링.

CONSTRAINTS:
비밀값과 reviewer identity를 출력하지 않는다. 외부 상태를 변경하지 않는다.
build와 typecheck를 병렬 실행하지 않는다. audit의 dev 경고와 Production audit를
분리해 보고한다.

TOOLS:
npm, official Next.js docs/codemod, TypeScript, ESLint, Node test runner,
Next build, package-release, local HTTP smoke.

WORKFLOW:
조사 → exact install → codemod dry-run/API 검토 → proxy 전환 → verify → build →
production audit → package → archive scan → local server smoke → docs update.

SUCCESS CRITERIA:
201/201 tests, TypeScript/ESLint 오류 0, build 성공, Production high 0,
archive 차단 파일 0/all-zero 0, /·/en·/api/auth/session 200, 제품 계약 7/7.

FAILURE CRITERIA:
major/downgrade 회귀, 인증·KR/EN quota 회귀, build/test/smoke 실패, archive 손상,
secret 노출, 외부 변경 요구. 같은 원인의 실패가 세 번이면 중단한다.

OUTPUTS:
변경 파일, 설치 버전, audit 요약, 테스트/build 결과, archive 경로·크기·SHA-256,
smoke 결과, 남은 P10 blocker.

VERIFICATION:
npm run lifecycle:validate
npm run readiness:product
npm run verify:product
npm run package:product
npm audit --omit=dev
local HTTP smoke + npm run growth:live-contract
git diff --check

MEMORY UPDATE:
실제 실행 증거만 harness 문서에 기록하고 비밀값·완료되지 않은 배포를 기록하지 않는다.

STOP CONDITION:
권한·외부 설정·secret·DB 변경이 필요하거나 P10 blocker가 남으면 local 결과만
보고하고 ready 대신 blocked를 유지한다.
```
