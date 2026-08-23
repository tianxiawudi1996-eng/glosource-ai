# `/en` 절제된 Korean-modern 화면설계

## 목표

해외 바이어가 첫 화면에서 공급사 탐색 가치와 근거를 먼저 이해하면서도, 서비스가 한국 현지에서 만들어졌다는 인상을 궁궐 건축·단청 색·한영 병기로 기억하게 한다. 한국미는 정보의 배경이며 상품보다 앞서지 않는다.

## 디자인 시스템 8요소

1. **브랜드 아이덴티티**: Korea-based sourcing intelligence. 관광·한류 소개가 아니라 한국 공급사 조사 도구다.
2. **제품 성격**: 근거 중심 B2B research product. 신뢰, 명료함, 신속한 다음 행동이 우선이다.
3. **디자인 유형**: restrained Korean-modern editorial. 궁궐의 선과 여백을 현대적인 product UI 주변에 제한적으로 배치한다.
4. **색상·대비**: navy/white/orange 전환 팔레트를 유지하고, 단청 red/gold/celadon은 3개의 작은 accent로만 쓴다. Journey 배경은 중성 `#F7F8F8`이다.
5. **그래픽·폰트**: EN Hero는 인물이 없는 맑은 경복궁 건축 사진 하나만 사용한다. serif display heading과 sans-serif 본문·데이터 UI의 역할을 구분한다.
6. **레이아웃·간격**: Hero의 copy/proof 2열은 유지한다. Journey는 Seoul/Busan/Jeju 3장, desktop 약 16.5rem, mobile 16rem의 compact rail이다.
7. **컴포넌트**: 기존 CTA, registry proof panel, category cards, Journey arrows/dots를 유지하며 새 계절 selector나 캐릭터 badge를 EN에 렌더링하지 않는다.
8. **반복·상태 표현**: `data-cultural-density="restrained"`, `data-scene="gyeongbokgung-architecture"`, `data-motion-mode="static"`으로 EN 계약을 테스트 가능하게 고정한다.

## UI-EN-01 Hero

- 사용자/목적: 해외 바이어가 5초 안에 한국 공급사 shortlist 상품과 근거 범위를 이해한다.
- 우선 행동: `Get My Korean Supplier Shortlist`, `See a Free Sample Report`.
- 데이터/API: 기존 영문 카피·CTA·proof sample. API와 데이터 계약 변경 없음.
- 형상: 왼쪽 구매 제안, 오른쪽 registry sample panel, 배경은 인물이 없는 경복궁 건축 한 장.
- 상태: 정상/초기 로딩은 기존 화면 유지. EN 배경은 자동 전환하지 않아 읽기 중 시각 상태가 변하지 않는다.
- 반응형: desktop은 처마와 건물 실루엣, mobile은 텍스트 아래 기와선만 남긴다.
- 접근성: landmark label은 `Gyeongbokgung · 경복궁`; scene 설명은 영문. EN DOM에 host와 season controls가 없다.
- 성공 기준: 기존 카피·CTA·proof가 가려지지 않고 1440/390에서 양의 overflow가 없다.

## UI-EN-02 Korea Journey

- 사용자/목적: 제품 근거를 확인한 바이어에게 한국 현지성의 기억점을 짧게 제공한다.
- 진입 순서: Hero → registry evidence → category → Journey.
- 형상: 중성 배경, 작은 단청 3점, Seoul/Busan/Jeju 3장 compact rail.
- 상태: 첫 장면 selected, previous/next와 지역 dot 선택, horizontal scroll. 자동 전환 없음.
- 반응형: desktop 세 장 동시 노출, mobile 첫 장 78% + 다음 장 일부 노출.
- 접근성: 지역별 영문 선택 이름, 명소 한·영 병기 alt, `aria-pressed` 상태 유지.
- 성공 기준: 문화 섹션이 다음 sourcing problem보다 짧고 page overflow를 만들지 않는다.

## 상태 매트릭스

| 상태 | Hero | Journey |
|---|---|---|
| 정상 | 고정 경복궁 + 영문 가치제안 + proof | 3개 지역, Seoul selected |
| 이미지 로딩 | navy 배경과 카피·CTA 유지 | 카드 배경색과 텍스트 유지 |
| 이미지 오류 | 정보·CTA 동작에 영향 없음 | alt와 명소 텍스트로 의미 유지 |
| reduced motion | 이미 static | smooth effect가 auto로 축소 |
| 모바일 | 인물·selector 없음, 기와선만 노출 | 78% 카드 rail, page overflow 없음 |
| 키보드/스크린리더 | 링크 focus와 landmark 설명 | arrows/dots/cards에 이름·pressed 상태 |

## 비범위

기존 영문 카피·가격·quota·Polar checkout·registry claim·API·DB·KR 화면·운영 배포는 변경하지 않는다.
