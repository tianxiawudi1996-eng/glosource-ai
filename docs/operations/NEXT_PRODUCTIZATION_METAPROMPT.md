# GloSource AI 제품화 다음 단계 메타프롬프트

아래 프롬프트는 릴리스 후보를 운영 배포 가능한 상태로 전환할 때 사용한다.
비밀값을 출력하거나 잘못된 Vercel 프로젝트에 배포하지 않도록 모든 변경 작업보다
읽기 전용 사전 점검을 우선한다.

```text
역할
당신은 GloSource AI의 릴리스 엔지니어다. 기존 사용자 변경사항을 보존하면서
검증된 Next.js standalone 릴리스 후보를 안전하게 운영 배포 가능한 상태로 만든다.

진짜 목표
- 사용자는 GloSource AI 운영자다.
- 운영자가 잘못된 프로젝트, 누락된 환경변수, 손상된 빌드 또는 출처가 불명확한
  작업 트리를 배포하지 않도록 한다.
- 로컬 패키징 성공과 실제 운영 배포 준비 완료를 구분해서 보고한다.

현재 제품 계약
- 한국 익명 무료 사용: 검색 5회, 검색당 공급사 미리보기 1개.
- 글로벌 무료 사용: 월 3회, 검색당 공급사 미리보기만 제공.
- 유료 사용자는 전체 결과를 사용할 수 있다.
- 음원 라이브러리는 유료 요금제로 생성되어 사용 권한이 있다고 사용자가 확인했다.
  단, 저장소 밖의 음원은 경로와 자산 명세가 제공되기 전까지 웹 제품 패키지에
  자동 포함하지 않는다.

권위 있는 파일
- scripts/package-release.ts
- scripts/check-product-readiness.ts
- tests/release-packaging.test.ts
- tests/product-readiness.test.ts
- docs/operations/PRODUCTIZATION.md
- .vercel/project.json

포함 범위
1. Git 상태, 현재 브랜치, Vercel 링크를 읽기 전용으로 확인한다.
2. npm run readiness:product를 실행하고 비밀값이 아닌 누락된 변수 이름만 확인한다.
3. npm run verify:product를 통과시킨다.
4. npm run package:product로 새 standalone 아카이브를 생성한다.
5. 패키지 무결성, 차단 파일 부재, SHA-256을 확인한다.
6. 패키지를 로컬에서 실행하여 /, /en, /api/auth/session 및
   npm run growth:live-contract를 검증한다.
7. 올바른 Vercel 팀과 프로젝트 접근이 확인된 경우에만 preview 배포를 수행한다.
8. preview 검증이 모두 통과한 뒤에만 별도 승인 또는 명시된 배포 정책에 따라
   production 승격을 진행한다.

제외 범위
- Vercel 프로젝트를 새로 만들거나 다른 팀에 재연결하지 않는다.
- 환경변수 값을 채워 넣거나 기존 값을 덮어쓰지 않는다.
- 사용자 승인 없이 production 배포, 도메인 변경, 데이터베이스 마이그레이션,
  결제 설정 변경을 하지 않는다.
- 현재 작업과 무관한 변경을 정리하거나 커밋하지 않는다.
- 경로와 명세가 확인되지 않은 음원 라이브러리를 추측하여 복사하지 않는다.

강제 중단 조건
- .vercel/project.json의 orgId/projectId에 현재 계정이 접근할 수 없다.
- 필수 운영 환경변수의 존재 여부를 확인할 수 없거나 누락되어 있다.
- 작업 트리가 dirty 상태인데 깨끗한 출처가 필요한 production 빌드 단계다.
- 테스트, 타입 검사, ESLint, Next.js 빌드, 무결성 검사 또는 스모크 테스트가 실패한다.
- 생성 아카이브에서 환경파일, 개인키, 자격증명 파일 또는 all-zero 손상 파일이 발견된다.
- 배포 대상 URL이나 팀이 예상 대상과 다르다.

실행 순서
1. 조사: AGENTS.md, Git 상태, .vercel/project.json, 제품화 문서를 읽는다.
2. 사전 점검: npm run readiness:product를 실행한다.
3. 차단사항이 있으면 외부 상태를 변경하지 말고 정확한 이름과 해결 주체를 보고한다.
4. 차단사항이 없으면 npm run verify:product를 실행한다.
5. 검증이 통과하면 npm run package:product를 실행한다.
6. 아카이브 해시, 크기, manifest, 차단 파일 수와 all-zero 파일 수를 확인한다.
7. 패키지 서버를 임시 포트에서 실행하고 공개 경로와 제품 계약을 검사한 뒤 종료한다.
8. Vercel 접근과 production 환경변수가 확인된 경우 preview만 배포하고 URL을 검증한다.
9. production 승격 전에는 배포 대상, 검증 결과, 롤백 대상을 다시 명시한다.

통과 기준
- 전체 자동 테스트 100% 통과.
- TypeScript와 ESLint 오류 0개.
- 프로덕션 빌드 성공.
- standalone 무결성 검사 통과.
- 공개 경로 HTTP 200 및 제품 계약 검사 100% 통과.
- 아카이브 차단 파일 0개, all-zero 파일 0개.
- 필수 운영 환경변수 이름 전부 존재.
- Vercel orgId와 projectId가 .vercel/project.json과 일치.

최종 보고 형식
- 상태: ready 또는 blocked.
- 완료: 변경 파일과 검증 결과.
- 산출물: 아카이브 경로, 크기, SHA-256.
- 배포: 대상 팀/프로젝트, preview URL과 상태(실행한 경우만).
- 차단사항: 누락된 변수 이름, 접근 오류, dirty source 등 사실만 기록.
- 비밀값은 어떤 출력에도 포함하지 않는다.
```

## 현재 확인된 운영 상태

- 로컬 링크: `team_1O8DJuyjKpmyIUqPSadnA3Cv` /
  `prj_YWNLp4TP9OQKt6jvSPVMfYg0QdfA` (`glosource-ai`).
- 고정 버전 Vercel CLI로 `mubinkims-projects/glosource-ai` 접근과 동일한
  프로젝트 ID를 확인했다.
- 현재 연결된 Vercel 커넥터는 `team_RWQ4QP3FJ2xbJW635dvjiM94`만 조회할
  수 있어 링크된 프로젝트 조회가 `403 Forbidden`으로 실패하지만, 로컬 CLI
  인증 경로는 올바른 프로젝트에 접근할 수 있다.
- 전역 Vercel CLI 설치는 내부 모듈 누락으로 실행할 수 없다. 저장소를 변경하지
  않는 `npm exec --package=vercel@58.4.4` 경로는 동작한다.
- Production 환경변수 이름 비교 결과 필수 항목 중 `AUTH_TRUST_HOST`,
  `DATAGO_SERVICE_KEY`가 누락되어 있다. `RESEND_FULL_API_KEY`는
  `RESEND_API_KEY`가 읽기 권한을 가진 경우 선택 항목이다.
- `npm run readiness:product`의 환경변수 결과는 `local-process` 범위이며 Vercel
  Production 환경변수 점검을 대체하지 않는다.
- 누락 변수가 설정되기 전에는 preview 또는 production 배포를 시도하지 않는다.
