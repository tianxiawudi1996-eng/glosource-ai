# GloSource AI 한국형 목업 운영 화면 연결

## ROLE

`bamsoft-screen-form-design` 주 스킬을 따르는 GloSource AI KR/EN 랜딩 화면 설계·구현·검증 담당자.

## GOAL

승인된 웹스타일 Mock의 Atelier 정렬, Dancheong 색 띠, Heritage Journey 리듬을 기존 `/`·`/en` 운영 화면에 연결해 한국적이고 역동적인 랜딩 경험을 만든다.

## USERS

- KR 방문자: 중국·해외 공급자 후보를 비교하는 한국 기업.
- EN 방문자: 한국 제조사 후보와 정부 원장 근거를 검토하는 해외 바이어.

## CONTEXT

- `/`와 `/en`의 기존 카피, CTA, quota, 가격, sourcing 방향, 법적 상태는 제품 계약의 정본이다.
- `public/mockups/glo-webstyle-proposals*.html`은 placement/reference이며 운영 라우트 교체본이 아니다.
- P10은 외부 설정·승인 부재로 blocked 상태이며 이번 증분에서 전이하지 않는다.

## SCOPE

- Hero에 목업 기반 단청 띠·편집 장식·증거 패널 깊이 연결.
- KR/EN 네비게이션에 언어별 단청 하단 규칙 연결.
- KR 소싱 채널 스트립에 한지·번호 칩·호버/스크롤 리듬 연결.
- 대한민국 여정의 명소 라벨·진행 컨트롤에 장식선과 가로 중앙 정렬 연결.
- 첫 렌더에서 여정 카드가 문서 전체를 세로 스크롤시키지 않도록 가로 레일 전용 스크롤로 수정.
- EN 모바일에서는 보조 헤더 링크를 접고 로그인·가입·shortlist CTA를 우선 노출.

## OUT OF SCOPE

- 기존 visible copy·CTA·가격·quota·제품 경계 변경.
- API·DB·결제·인증·외부 게시·SNS·배포·commit·push.
- 새 관광 사실, 공급자 보증, 고객 성과 또는 위치 인증 주장.

## ACCEPTANCE CRITERIA

- `/`와 `/en` Hero/Journey가 `data-style-dna`로 시각 방향을 식별한다.
- Hero의 bilingual 경복궁 라벨과 지역 카드 bilingual 캡션이 유지된다.
- 390px 및 1440px에서 양의 수평 오버플로가 없다.
- 모바일 EN 헤더에서 `Sign in`, `Sign up free`, `Get my shortlist →`가 보인다.
- 여정 초기 렌더 후 `window.scrollY`가 0으로 유지되고 카드 이동은 레일 내부 가로 스크롤만 수행한다.
- 브라우저 런타임 오류가 없고 reduced-motion CSS가 기존 동작을 유지한다.

## VERIFICATION EVIDENCE

- `npx tsc --noEmit`: exit 0.
- `npm run lint`: exit 0, 기존 저장소 경고 16개, 신규 오류 0개.
- `npm test`: 229/229 pass.
- `npm run build`: Next.js 16.3.0, 89 routes, exit 0.
- `npm run harness:instructions`, `npm run lifecycle:validate`, state/placeholder/sensitive/diff checks: clean.
- Browser QA: `/`·`/en` 1440px 및 390px. `scrollWidth ≤ innerWidth`, bilingual labels, 6개 journey card, KR 4개 channel chip, EN 모바일 핵심 CTA 노출 확인. 브라우저 오류 로그 0건.

## EXTERNAL EFFECTS

없음. P10 blocked 유지, commit·push·배포·provider 변경·결제·외부 발송 0건.
