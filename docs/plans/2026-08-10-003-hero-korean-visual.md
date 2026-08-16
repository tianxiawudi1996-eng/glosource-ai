# GloSource AI Korean Hero Visual Plan

## ROLE

시니어 제품 디자이너 겸 프론트엔드 에이전트.

## GOAL

GloSource AI의 `/`와 `/en` 히어로를 한국적 시각 언어로 고도화하되, 구매자별 제품 카피·CTA·검증 경계는 유지한다.

## USERS

- `/`: 해외 공급자 후보를 찾는 국내 기업과 담당자
- `/en`: 한국 제조사·수출사를 찾는 해외 바이어

## CONTEXT

기존 히어로는 제품 목업과 CSS/SVG 단청 장식이 혼재했다. 사용자 요청에 따라 경복궁 처마, 단청 질감, 한복과 갓, 전통 문양을 실제 비트맵 커버로 통합한다. 제품의 증거·인증·성과 주장은 이미지로 추가하지 않는다.

## SCOPE

- 생성 이미지 `public/images/glosource-hero-gyeongbokgung-dancheong.png` 추가
- `HeroSection`의 기존 SVG 단청 프레임 제거
- 한국적 커버 이미지와 좌측 카피용 잉크 워시 오버레이 적용
- 360px 모바일에서 세로 오버레이와 카피 대비 조정
- 브라우저 데스크톱·모바일·KR/EN 프리뷰

## OUT OF SCOPE

- KR/EN 사용자·가격·quota·결제·검증 카피 변경
- 실제 SNS 게시·외부 발송·배포·provider 변경
- P10 release-readiness state 전이
- 공급사·인증·고객 성과를 나타내는 새 사실 주장

## CONSTRAINTS

- 기존 사용자 working-tree 변경을 되돌리거나 덮어쓰지 않는다.
- 배경 이미지는 장식으로만 사용하고 접근 가능한 전경 카피를 유지한다.
- 텍스트·로고·워터마크가 포함된 이미지를 사용하지 않는다.
- `prefers-reduced-motion` 사용자의 애니메이션 안전성을 유지한다.

## TOOLS

- 저장소 코드·CSS·브라우저 DOM 조사
- 내장 `image_gen` 이미지 생성 경로
- Next.js dev server와 `agent-browser` 데스크톱/모바일 프리뷰

## WORKFLOW

1. 기존 히어로·제품 계약·현재 dirty 범위를 조사한다.
2. 좌측 negative space, 우측 경복궁·단청·한복·갓 구성을 가진 커버를 생성·검토한다.
3. 기존 SVG 단청 프레임을 제거하고 커버·그라디언트 레이어를 연결한다.
4. 타입·린트·diff 검사를 수행한다.
5. `/`, `/en`, 390px 프리뷰를 확인하고 이 영수증에 결과를 기록한다.

## SUCCESS CRITERIA

- `/`와 `/en`이 HTTP 200으로 렌더링되고 기존 CTA·제품 목업이 유지된다.
- 데스크톱에서 단청 처마와 한국 전통 요소가 식별되며 좌측 카피가 읽힌다.
- 모바일에서 헤드라인·CTA·보조 카피가 배경과 충분히 대비된다.
- TypeScript와 ESLint에 오류가 없고 `git diff --check`가 통과한다.
- 외부 게시·배포·결제·provider 변경이 0건이다.

## FAILURE CRITERIA

- 이미지가 카피를 가리거나 한국어·영어 제품 경계를 혼합한다.
- 이미지에 부정확한 텍스트·로고·워터마크가 생긴다.
- 기존 사용자 변경이 손실되거나 P10 상태가 임의로 전이된다.

## OUTPUTS

- `public/images/glosource-hero-gyeongbokgung-dancheong.png`
- `app/components/HeroSection.tsx`
- `app/globals.css`
- 이 설계·검증 문서

## VERIFICATION

- `npx tsc --noEmit`: pass
- `npm test`: 202/202 pass
- `npm run lint`: 0 errors; existing warnings only
- `npm run build`: pass, Next.js 16.3.0, 88 routes
- `git diff --check`: pass
- `agent-browser`: `/` desktop, `/en` desktop, `/` 390×844 mobile screenshots pass
- Visual QA image render: pass; desktop shows palace/dancheong/gat cover, mobile preserves readable copy

## MEMORY UPDATE

영구 메모리에는 기록하지 않는다. 저장소 안의 설계·검증 문서와 현재 diff가 작업 증거다.

## STOP CONDITION

UI 변경과 로컬 검증까지만 수행한다. 배포·게시·외부 설정·P10 완료 처리는 사용자 승인과 별도 증거가 있을 때만 후속 작업으로 연다.
