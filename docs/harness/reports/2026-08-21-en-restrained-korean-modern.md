# 2026-08-21 `/en` 절제된 Korean-modern 화면설계 보고서

## 결과

기존 증거 70 : 한국 여정 30 구조를 유지하면서 한국적 표현의 강도를 다시 낮췄다. EN Hero의 한복 인물·계절 selector·100-state host를 제거하고 인물이 없는 맑은 경복궁 건축 사진 한 장으로 교체했다. Journey는 내용과 3개 지역을 유지하되 중성 배경·낮은 카드·작은 단청 accent로 정돈했다.

## 변경 범위

- `HeroSection`: EN 전용 `seoul-gyeongbokgung.png`, static scene, EN host/season DOM 미렌더링, restrained density contract.
- `KoreaJourneySection`: EN padding/gap 축소, restrained density contract. 기존 텍스트와 Seoul/Busan/Jeju는 유지.
- `globals.css`: EN Hero architecture crop·명암, Journey 중성 배경·16~16.5rem 카드·완만한 hover.
- `en-visual-balance.test.ts`: static palace, EN host/season 부재, restrained density 회귀 계약.
- 변경하지 않음: 가격, quota, CTA, sourcing 방향, registry disclaimer, API, DB, KR 화면.

## 브라우저 증거

- 1440×900 Hero: clean palace asset 적용, `scene=gyeongbokgung-architecture`, `motion=static`, host 0, season controls 0, `scrollWidth=1434 <= 1440`.
- Desktop Journey: neutral `rgb(247,248,248)`, cards 220/216/217px 폭과 약 260px 높이, title 37.6px, page overflow -6px.
- 390×844 Hero: title/CTA 폭 336px, CTA top 609/665px, proof 폭 336px, palace crop 64%, host/season controls 0, `scrollWidth=384 <= 390`.
- Mobile Journey: title 31.2px, first card 257px, 3-card horizontal rail, page overflow -6px.
- `localhost` hydration QA에서 Busan 선택 후 dots가 `[false,true,false]`, Busan card `aria-pressed=true`, rail `scrollLeft=227`로 전환됐다. page overflow -6px, runtime error/warning log 0.

## 검증

- `npx tsc --noEmit`: PASS.
- `npm run lint`: 오류 0.
- `npm test`: 232/232 PASS.
- `npm run build`: PASS, Next.js 16.3.0, 89 routes. 기존 Edge Runtime deprecation warning 유지.

초기 `127.0.0.1` QA는 Next.js dev resource cross-origin 차단으로 client interaction이 hydrate되지 않았다. 기능 실패로 오판하지 않고 개발 서버가 허용하는 `http://localhost:3106/en`에서 다시 검증했다.

## 외부 영향과 게이트

commit, push, PR, provider 변경, 결제, 운영 배포를 실행하지 않았다. P10은 `GITHUB_PRODUCTION_INDEPENDENT_REVIEWER_MISSING`, `GITHUB_PRODUCTION_SELF_REVIEW_PREVENTION_MISSING`, `FRESH_EXECUTION_APPROVAL_ABSENT`로 계속 blocked다.
