# 웹스타일 레퍼런스 분석 및 GloSource AI 5안 매핑

## Source and inspection boundary

- 원본: `C:\Users\ddedi\Downloads\Telegram Desktop\웹스타일 레퍼런스.pptx`
- 확인: 33개 슬라이드 XML, 내장 JPG 30개, 27개 스타일 카드와 마지막 조합 가이드.
- 슬라이드 크기: 12,191,695 × 6,858,000 EMU(16:9).
- 사용한 분석: PowerPoint 원본 복사본의 ZIP/XML 텍스트·색·관계(media) 추출과 내장 JPG 시각 확인.
- 제한: 현재 번들 `@oai/artifact-tool` 패키지 경로에 `package.json`이 없어 `inspect_template_deck.mjs`의 자동 PNG 렌더가 실패했다. LibreOffice/PowerPoint COM도 이 환경에 없었다. 따라서 슬라이드 렌더 완료로 주장하지 않고, XML/내장 이미지 기반 분석으로 한계를 고정한다. 원본 PPTX는 수정하지 않았다.

## Extracted style DNA

| 슬라이드 | 스타일 | 관찰된 핵심 | GloSource 적용 원칙 |
|---:|---|---|---|
| 04 | Minimalist · COS | 넓은 여백, 절제된 색, 제품 중심 히어로 | KR의 첫 행동을 조용하게 강조 |
| 05 | Corporate · IBM | 정보 계층, 신뢰 색, 솔루션 중심 구조 | 근거·상태·CTA의 우선순위 고정 |
| 06 | Swiss · Vitra | 그리드, 정렬, 산세리프 | 카드와 라벨의 정렬 기준 |
| 07 | Flat / Material | 토큰, 컴포넌트 상태, 미세 고도 | 로딩·샘플·AI 신호를 명시 |
| 09 | Bento Grid · Apple | 혼합 카드 크기, 제품 타일, 명확한 CTA | 후보·MOQ·RFQ를 한 질문씩 분리 |
| 10 | Japanese / Zen · HOSHINOYA | 낮은 대비, 비대칭 여백, 느린 호흡 | 한국 명소 레일에 여백과 속도 적용 |
| 12 | Luxury · Cartier | 세리프, 깊은 컬러, 고급 제품 연출 | EN의 바이어 검토를 차분하게 편집 |
| 14 | Dark Modern · Linear | 다크 배경, 은은한 글로우, 정밀한 UI | EN 증거 워크벤치의 집중면 |
| 18 | Gradient · Stripe | 큰 색면, 가치 제안, 제품 UI 겹침 | 단청색을 CTA/상태 포인트로 제한 |
| 19 | Playful · Duolingo | 캐릭터, 밝은 색, 환영형 진입 | 기존 한국 호스트를 과장 없이 환영 요소로 사용 |
| 20 | Editorial · Monocle | 잡지형 헤드라인, 다단 편집, 콘텐츠 밀도 | Korea Edit의 읽기 리듬 |
| 21 | Parallax · Firewatch | 레이어드 풍경, 스크롤 서사 | 대한민국 한 바퀴 journey rail |
| 22 | Terminal · Terminal.shop | 고정폭, 명령어형 상태, 전문 무드 | evidence label을 짧고 분명하게 |
| 24 | Glassmorphism · Supaste | 반투명 레이어, 블러, 빛 번짐 | 증거 패널의 깊이(과용 금지) |
| 27 | Art Deco · The Ned | 건축적 대칭, 세리프, 클래식 고급감 | 명소 라벨과 section divider에 절제 적용 |
| 29 | Industrial · G-Star RAW | 제조 소재감, 강한 제품컷 | sourcing 업무의 단단한 질감 |
| 30 | Vintage Rustic · The Old Mill | 목재, 수공예, 지역성 | 한국 지역 레일의 장소 기억 |
| 31 | Organic · Aesop | 자연색, 제품 그리드, 절제된 질감 | 한지·셀라돈 팔레트와 실제 이미지 |

## Five proposal recipes

| 제안 | 조합 레퍼런스(슬라이드) | 제품 역할 | 구조적 차이 |
|---|---|---|---|
| 01 Atelier Map | 04 COS + 05 IBM + 06 Vitra + 07 Material | KR 중심의 정제된 B2B 입구 | 두 열 히어로 → 근거 rail → 지역 rail |
| 02 Dancheong Bento | 09 Apple + 18 Stripe + 31 Aesop + 07 Material | KR/EN 후보·상태를 단청색으로 분리 | 한 열 히어로 → 불규칙 Bento → 라벨 rail |
| 03 Heritage Journey | 10 HOSHINOYA + 21 Firewatch + 30 Old Mill + 27 Art Deco | 한국 명소를 통한 서사형 탐색 | 좌우 비율이 다른 히어로 → 6개 지역 journey |
| 04 Evidence Workbench | 14 Linear + 24 Supaste + 05 IBM + 22 Terminal | EN 바이어의 검토와 독립 확인 | 다크 히어로 → evidence workbench → 장소 rail |
| 05 Korea Edit | 20 Monocle + 12 Cartier + 31 Aesop + 29 G-Star + 19 Duolingo | 한·영 카피의 편집적 차별화 | 편집형 커버 → 이미지 story → 조용한 CTA |

## Product-copy guardrails

- KR 표면: `1688 · Baidu 爱采购 · Alibaba · WeChat` 후보 비교, 무료 5회/미리보기, 무료 베타·결제 없음.
- EN 표면: Korean manufacturer shortlist, government-registry evidence, MOQ/source links, English RFQ, USD/Polar.
- 공통: registry match는 evidence이며 GloSource 보증이 아니다. 예시/샘플 데이터는 실제 고객 성과로 승격하지 않는다.
- 모든 지역 이미지는 한글·영문 명소명과 alt를 함께 둔다.

## Decision

다음 단계는 다섯 안 중 한 방향을 승인받아 실제 앱의 P06 컨셉아트 → HTML Mock → 브라우저 프리뷰 → 사용성 수정 순서로 연결하는 것이다. 이번 산출물은 승인 전 제안이며 운영 라우트·API·결제·배포에는 연결하지 않는다.
