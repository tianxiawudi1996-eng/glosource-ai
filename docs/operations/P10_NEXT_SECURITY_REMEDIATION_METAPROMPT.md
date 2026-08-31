# P10 Next.js High Security Remediation Metaprompt

```text
ROLE:
당신은 GloSource AI의 Next.js 보안 릴리스 엔지니어다.

GOAL:
Next.js 15.5.x 보안 패치를 최소 변경으로 적용하고 제품 계약과 standalone
런타임이 회귀하지 않음을 증명한다.

USERS:
KR 무료 베타 사용자, EN 유료 사용자, 관리자와 운영자.

CONTEXT:
- 기준 branch: codex/p10-provenance-reconstruction
- 기준 HEAD: 70457e7f883ef55804ca91129bf913f60a508c7b
- 현재 next/@next-env 15.5.20, React/React DOM 19.2.4.
- Auth.js critical은 beta.32/core 0.41.3으로 제거 완료.
- production audit 잔여: critical 0, high 5, moderate 5.
- npm 공식 후보: next/@next-env 15.5.23.
- 공식 웹 문서는 content-type 오류, 설치본 dist/docs는 부재했다.

SCOPE:
1. Git, lifecycle, package/lockfile 상태를 읽기 전용 확인한다.
2. next와 @next/env만 15.5.23 exact로 갱신한다.
3. lockfile의 예상 밖 major, downgrade, package 추가를 거부한다.
4. 전체 test/typecheck/lint/build를 순차 실행한다.
5. standalone package 무결성과 공개·인증 경로를 smoke한다.
6. production audit의 Next 직접 high 제거 여부를 확인한다.

OUT OF SCOPE:
- React major 변경, codemod, app API/DB/schema 변경.
- undici, DOMPurify, drizzle-kit 등 잔여 transitive 수정.
- provider 설정, secret 입력, commit, push, 배포.

CONSTRAINTS:
- npm audit fix, --force, Next 16 업그레이드 금지.
- 사용자 변경과 KR/EN quota·결제 경계를 보존한다.
- build와 typecheck를 병렬 실행하지 않는다.
- 비밀값, session, reviewer identity를 출력하지 않는다.

TOOLS:
git, npm registry, npm audit, Node test runner, TypeScript, ESLint,
Next.js build, standalone package, 로컬 HTTP smoke.

WORKFLOW:
1. 현재 버전과 npm peer/engine 계약을 확인한다.
2. next@15.5.23 @next/env@15.5.23만 exact 설치한다.
3. package/lockfile diff와 npm ls를 검사한다.
4. npm run verify:product를 실행한다.
5. npm run package:product를 실행한다.
6. archive 차단 파일, all-zero, SHA-256, manifest를 검사한다.
7. /, /en, /api/auth/session과 growth:live-contract를 검사한다.
8. npm audit --omit=dev 결과와 잔여 위험을 기록한다.
9. STATUS/STATE/TASK_QUEUE/TESTS와 P10 보고서를 갱신한다.

SUCCESS CRITERIA:
- Next 직접 high advisory 제거.
- 전체 테스트 100%, TypeScript/ESLint 오류 0, build 성공.
- archive 차단 파일 0, all-zero 0.
- 필수 3경로 HTTP 200, 제품 계약 7/7.

FAILURE CRITERIA:
- major/downgrade, 제품 계약·auth·build 회귀, audit high 잔존,
  외부 설정이나 DB 변경 필요.

OUTPUTS:
버전/lockfile diff, audit 요약, 테스트·package·smoke 증거,
archive 경로·크기·SHA-256, 잔여 위험.

VERIFICATION:
npm run harness:instructions
npm run lifecycle:validate
npm run verify:product
npm run package:product
npm audit --omit=dev
git diff --check

MEMORY UPDATE:
저장소 harness에 실제 결과만 기록하며 secret은 기록하지 않는다.

STOP CONDITION:
동일 원인 3회 실패, 예상 밖 major/downgrade, 데이터·외부 변경 필요,
또는 commit/deploy 승인 지점에서 중단하고 사실만 보고한다.
```
