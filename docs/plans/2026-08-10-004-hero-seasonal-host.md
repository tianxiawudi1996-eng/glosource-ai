# GLO-HERO-SEASONAL-HOST-20260810

## ROLE

GloSource AI UI/UX·브랜드 모션 엔지니어

## GOAL

어두운 단일 영웅 커버를 밝고 청량한 경복궁 사계절 커버로 교체하고, 한국적 환영 캐릭터와 우아한 모션을 `/`·`/en`에 안전하게 연결한다.

## USERS

- `/`: 중국 현지 채널에서 공급자를 찾는 국내 기업·구매 담당자
- `/en`: 한국 제조사·K-product 공급처를 찾는 해외 바이어

## CONTEXT

- 제품 경계·카피·가격·근거 고지는 기존 route 계약을 그대로 유지한다.
- 생성 이미지는 장식용 커버이며, 공급자 인증·추천·성과 증거가 아니다.
- 현재 P10 release-readiness는 외부 control-plane/승인 부재로 blocked이며 phase를 전이하지 않는다.

## SCOPE

- 맑은 낮의 경복궁 사계절 커버 이미지 4종 생성·저장
- 월별 초기 계절 선택 + 18초 순환 + 사용자가 선택할 수 있는 계절 점
- 10개 포즈 × 10개 표정 = 재현 가능한 100개 호스트 환영 상태
- reduced-motion, 모바일 390px, 접근 가능한 버튼/레이블 및 100상태 표시

## OUT OF SCOPE

- 100개의 별도 AI 프레임 렌더링 또는 외부 이미지·영상 게시
- 실제 캐릭터 모델 API, 음성, 계정·결제·provider·DB 변경
- 커밋·push·배포·SNS 게시

## CONSTRAINTS

- `public/images`에 생성 원본을 복사하고 기존 사용자 변경을 덮어쓰지 않는다.
- KR/EN의 sourcing 방향·무료/유료·근거 표현을 섞지 않는다.
- hydration-unsafe random state를 사용하지 않는다.
- 모션은 `prefers-reduced-motion`에서 정지한다.

## TOOLS

- built-in image generation + `view_image` 검토
- `apply_patch`, PowerShell
- `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`
- `agent-browser` desktop/mobile visual QA

## WORKFLOW

1. 사계절 이미지를 동일한 좌측 카피 여백·우측 호스트 구도로 생성한다.
2. `SeasonalHeroCover`에 계절 설정과 100상태 조합을 연결한다.
3. 밝은 오버레이·호스트 환영 배지·계절 선택 점·reduced-motion CSS를 구현한다.
4. 정적 검사→테스트→빌드→`/`, `/en` 1440px→`/` 390px→오류/vitals 순서로 검증한다.
5. 결과·미완료 외부 게이트를 harness 문서에 기록한다.

## SUCCESS CRITERIA

- 사계절 PNG 4개가 workspace에 존재하고 브라우저 커버로 로드된다.
- 방문 월의 계절이 초기 선택되며 18초마다 다음 계절로 순환한다.
- 계절 점 클릭으로 원하는 장면을 즉시 선택할 수 있다.
- `KOREAN_HOST_STATES`가 100개이며 상태 ID·포즈·표정이 결정적이다.
- 1440px·390px에서 카피, CTA, 호스트 이미지, 계절 컨트롤이 겹치지 않는다.
- `npm test`, typecheck, lint(오류 0), build 및 browser errors가 통과한다.

## FAILURE CRITERIA

- 어두운/구름 낀/안개 낀 장면이 기본 커버로 남는다.
- 계절 순환이 hydration mismatch, 콘솔 오류 또는 레이아웃 점프를 만든다.
- reduced-motion 사용자의 화면에서 자동 모션이 계속된다.
- 100상태를 실제 100개 AI 렌더링 결과처럼 허위 보고한다.

## OUTPUTS

- `public/images/glosource-hero-gyeongbokgung-{spring,summer,autumn,winter}.png`
- `app/components/HeroSection.tsx`
- `app/globals.css`
- 이 계획서 및 harness 검증 기록

## VERIFICATION

- `npm test` 202/202
- `npx tsc --noEmit` green
- `npm run lint` 0 errors (기존 warning 유지)
- `npm run build` Next.js 16.3.0, 88 routes
- `agent-browser`: `/`·`/en` desktop, `/` 390×844, season click, errors/vitals

## MEMORY UPDATE

이번 증분은 저장소 문서와 코드로 남긴다. 외부 게시·배포·결제·실제 고객 반응은 기록하지 않는다.

## STOP CONDITION

이미지 생성·로컬 UI·검증이 끝나면 중단한다. P10 승인·provider 설정·배포·게시가 없으면 다음 phase로 이동하지 않는다.
