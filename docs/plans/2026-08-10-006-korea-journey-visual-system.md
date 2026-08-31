# GLO-HERO-KOREA-JOURNEY-20260810

## ROLE

GloSource AI 랜딩페이지 비주얼·모션 설계자

## GOAL

한 장면에 머무르지 않는 대한민국 지역 여정을 `/`·`/en` 랜딩페이지에 연결해, 방문자가 스크롤만으로 서울에서 제주까지 이동하는 감각을 경험하게 한다.

## USERS

- `/`: 해외 공급자를 찾는 국내 기업 구매 담당자
- `/en`: 한국 제조사·K-product 공급자를 찾는 해외 바이어

## CONTEXT

- 기존 사계절 경복궁 HeroSection은 유지한다.
- KR/EN sourcing 방향·가격·근거 고지는 변경하지 않는다.
- 이미지는 실제 명소를 기반으로 한 브랜드 editorial asset이며, 관광 위치 인증이나 공급자 증거가 아니다.
- P10 release-readiness는 외부 control-plane과 승인 부재로 blocked이다.

## SCOPE

- 서울 경복궁, 경주 불국사, 전주 한옥마을, 부산 감천문화마을, 강원 설악산, 제주 성산일출봉 이미지 생성
- 공통 `KoreaJourneySection` 컴포넌트로 `/`·`/en`에 연결
- 6.5초 자동 장면 전환, 점·이전·다음 컨트롤, 가로 스냅 레일
- 1440px·390px 반응형, 키보드/ARIA, reduced-motion 대응

## OUT OF SCOPE

- 관광 데이터·지도·실시간 위치·예약 기능
- 이미지에 포함된 랜드마크의 공식 지리 검증
- 캐릭터 샘플의 투명화·리깅·히어로 통합
- 배포, 게시, 외부 provider 변경

## CONSTRAINTS

- 실제 존재하는 명소를 프롬프트에 명시하고, 생성 결과를 `view_image`로 확인한다.
- 텍스트·로고·워터마크·가짜 현대 signage를 이미지에 넣지 않는다.
- 랜딩 카피는 KR/EN 제품 계약과 충돌하지 않는다.
- 자동 전환은 reduced-motion 사용자에게 중지한다.

## TOOLS

- built-in image generation + `view_image`
- `apply_patch`, PowerShell
- Next/Image, CSS scroll-snap
- `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `agent-browser`

## WORKFLOW

1. 지역·명소·계절·광원·구도를 정의한다.
2. 지역별 16:9 극사실주의 이미지 6종을 생성하고 결과를 검토한다.
3. `/`·`/en` 공통 컴포넌트와 지역 카피·경로를 구현한다.
4. 자동 전환·접근성·모바일 스냅·오류 상태를 확인한다.
5. 정적 검사→테스트→build→브라우저 QA→harness 기록 순서로 보고한다.

## SUCCESS CRITERIA

- 6개 지역 장면이 실제 랜드마크명과 함께 노출된다.
- 장면 점/이전/다음 컨트롤이 키보드와 스크린리더에서 이해된다.
- 자동 전환과 사용자의 직접 선택이 모두 작동한다.
- 1440px·390px에서 카드와 카피가 겹치지 않는다.
- `npm test` 202/202, typecheck, lint 오류 0, build 88 routes가 통과한다.

## FAILURE CRITERIA

- 생성 이미지가 야간·어두움·안개로 기존 요구를 역행한다.
- 존재하지 않는 건축물이나 랜드마크를 실제 장소처럼 단정한다.
- 자동 모션이 reduced-motion 설정을 무시한다.
- `/`·`/en` 제품 경계 또는 CTA·가격 카피가 바뀐다.

## OUTPUTS

- `public/images/korea-journey/*.png` 6종
- `app/components/KoreaJourneySection.tsx`
- `app/HomePageClient.tsx`, `app/en/page.tsx`, `app/globals.css`
- 이 문서 및 harness 보고 기록

## VERIFICATION

- 지역 PNG 6종 생성·시각 검토·workspace 복사
- `npm test` 202/202
- `npx tsc --noEmit` green
- `npm run lint` 0 errors, 기존 warning 16개
- `npm run build` Next.js 16.3.0, 88 routes
- `agent-browser`: `/`·`/en` desktop, `/` 390×844, 장면 선택, 오류 없음

## MEMORY UPDATE

실제 방문자 재방문율·관광 전환·이미지 지리 정확도는 측정하거나 주장하지 않는다. 후속 승인·피드백만 작업 큐에 기록한다.

## STOP CONDITION

로컬 랜딩 구현과 검증 보고가 끝나면 중단한다. 배포·게시·외부 데이터 검증은 별도 승인 없이는 실행하지 않는다.
