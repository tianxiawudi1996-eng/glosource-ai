# 2026-08-21 `/en` Evidence 70 : Korea 30 화면설계 보고서

## 결과

`/en`을 Hero → 정부 원장 근거 → 카테고리 → 한국 여정 → 소싱 문제 순서로 재구성했다. 기존 영문 가치제안, CTA, quota, 가격, sourcing 방향, registry evidence disclaimer는 변경하지 않았다.

## 변경

- Hero: EN 계절·캐릭터 자동 루프를 중단하고 계절은 사용자 선택형으로 유지했다. 배경 이미지의 채도·밝기를 낮추고 proof panel motion을 제거했다.
- Character: EN welcome badge와 synthetic `01 / 100` 노출을 제거했다. 모바일은 경복궁 쪽으로 초점을 옮겨 인물 얼굴이 카피 뒤에 나타나지 않게 했다.
- Journey: EN을 Seoul, Busan, Jeju 3개 장면으로 축소하고 정부 근거·카테고리 다음에 배치했다. KR 6개 장면과 자동 전환은 보존했다.
- Accessibility: EN 계절 선택 버튼과 Hero 설명을 영어로 제공한다. 모든 명소는 영문·한글 이름과 이미지 대체 텍스트를 유지한다.
- Regression: 순서, 3개 장면, 수동 모션, synthetic counter 부재를 정적 테스트로 고정했다.

## 브라우저 증거

- 1440×900: Hero에서 구매 카피·CTA·sample proof panel이 우선 노출되고 EN host badge는 `display:none`; 계절 선택은 표시된다. `scrollWidth=1434`, viewport 1440.
- 데스크톱 heading 순서: Hero 257px → registry evidence 1047px → category 1781px → Korea journey 2607px → sourcing problem 3223px.
- Journey: `data-journey-count=3`; 화면에 Gyeongbokgung, Gamcheon Culture Village, Seongsan Ilchulbong과 한·영 라벨이 함께 보인다.
- 390×844: Hero 제목 폭 336px, CTA top 609/665px, proof panel 폭 336px; host와 계절 switcher는 숨김. `scrollWidth=384`, viewport 390.
- 모바일 Journey: 첫 카드 폭 271px, 후속 장면을 암시하는 가로 레일, page overflow -6px. 접근성 snapshot에서 3개 장면과 previous/next controls를 확인했다.

## 자동 검증

- `npx tsx --test tests/en-visual-balance.test.ts`: 3/3 PASS.
- `npx tsc --noEmit`: PASS.
- `npm run lint`: PASS, 오류 0.
- `npm test`: 232/232 PASS.
- `npm run build`: PASS, Next.js 16.3.0, 89 routes. 기존 Edge Runtime deprecation warning은 유지된다.

## 외부 영향과 잔여 위험

commit, push, PR, provider 변경, 결제, 운영 배포를 실행하지 않았다. P10 Release Readiness는 기존 독립 reviewer·self-review prevention·fresh approval blocker로 계속 blocked다. 로컬 브라우저에서 Journey control의 접근성 구조는 확인했으나 실제 포인터 상태 전환은 이번 자동화에서 완료 증거로 기록하지 않는다.
