# P10 Auth.js Critical Security Remediation Metaprompt

```text
ROLE:
당신은 GloSource AI의 인증 보안 릴리스 엔지니어다.

GOAL:
Auth.js production audit의 critical 취약점을 최소 호환 업그레이드로 제거하고,
인증·세션·권한의 fail-closed 계약을 회귀 없이 증명한다.

USERS:
KR 무료 베타 사용자, EN 유료 사용자, 관리자와 운영자.

CONTEXT:
- 기준 branch: codex/p10-provenance-reconstruction
- 기준 HEAD: 70457e7f883ef55804ca91129bf913f60a508c7b
- 2026-08-09 `npm audit --omit=dev`: critical 2, high 6, moderate 5.
- critical 경로: next-auth 5.0.0-beta.31 -> @auth/core <=0.41.2.
- 공식 npm 후보: next-auth 5.0.0-beta.32,
  @auth/core 0.41.3, @auth/drizzle-adapter 1.11.3.
- 현재 P10은 외부 control-plane과 clean provenance가 없어 blocked다.

SCOPE:
1. Git/lifecycle/package-lock 상태를 읽기 전용으로 확인한다.
2. Auth.js 계열만 최소 버전으로 갱신한다.
3. lockfile diff에서 예상 밖 package 추가·downgrade를 거부한다.
4. malformed Bearer, provider cookie binding, email normalization,
   session expiry, admin fail-closed 회귀를 테스트한다.
5. 전체 test/typecheck/lint/build와 로컬 auth session smoke를 수행한다.
6. production audit에서 Auth.js critical 0을 확인한다.

OUT OF SCOPE:
- Next.js, PostCSS, sharp, undici, DOMPurify 취약점 수정.
- DB schema/migration, provider 설정, secret 입력.
- commit, push, PR, preview/production 배포.

CONSTRAINTS:
- `npm audit fix` 및 `--force` 금지.
- package.json과 package-lock.json 외 의존성 파일을 임의 변경하지 않는다.
- 기존 사용자 변경과 KR/EN 제품 경계를 보존한다.
- secret, session, reviewer identity를 출력하지 않는다.

TOOLS:
git, npm 공식 registry, npm audit, Node test runner, TypeScript, ESLint,
Next.js build, standalone local smoke.

WORKFLOW:
1. git status, lifecycle validate/status, 현재 버전을 확인한다.
2. npm 공식 registry에서 후보 버전을 다시 확인한다.
3. Auth.js 3개 package만 명시적으로 설치한다.
4. package/lockfile diff와 `npm ls`를 검사한다.
5. focused auth negative-path test를 실행하고 부족한 회귀 테스트를 추가한다.
6. `npm run verify:product`, `npm run build`를 순차 실행한다.
7. `npm audit --omit=dev`에서 Auth.js critical 제거를 확인한다.
8. `/api/auth/session`, 로그인 페이지, 관리자 fail-closed를 로컬 smoke한다.
9. 실제 결과를 STATUS/STATE/TASK_QUEUE/TESTS와 P10 보고서에 기록한다.

SUCCESS CRITERIA:
- Auth.js critical 0.
- 자동 테스트 100%, TypeScript/ESLint 오류 0, build 성공.
- 익명 session endpoint 200, malformed 인증은 안전한 4xx/무세션 처리.
- lockfile에 예상 밖 downgrade·major 변경 0.

FAILURE CRITERIA:
- critical 잔존, 인증/세션/권한 회귀, schema 변경 요구,
  audit fix가 drizzle-kit downgrade를 제안, build/smoke 실패.

OUTPUTS:
변경 파일, 버전 diff, audit 요약, 테스트 증거, 잔여 high/moderate 목록.

VERIFICATION:
npm run harness:instructions
npm run lifecycle:validate
npm run verify:product
npm run build
npm audit --omit=dev
git diff --check

MEMORY UPDATE:
저장소 harness 문서만 실제 결과로 갱신하며 비밀값은 기록하지 않는다.

STOP CONDITION:
동일 원인 3회 실패, 예상 밖 major/downgrade, 데이터·외부 설정 변경 필요,
또는 commit/deploy 승인이 필요한 지점에서 즉시 중단하고 사실만 보고한다.
```
