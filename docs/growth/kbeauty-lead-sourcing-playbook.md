# GLO-003 — K-Beauty OEM 리드 소싱 플레이북 (실행 SOP)

Date: 2026-06-23 · Goal: 실제 ICP 바이어 리드를 **intent 채널**에서 확보 → `outreach-targets.json` → preflight → 발송.
Rule: 가짜/추정 리드 금지. 콜드 스크래핑은 운영사만 잡혀 부적합([outreach-icp.md](outreach-icp.md)). 각 리드엔 **출처(provenance)** 필수.

## 0. 누가 ICP인가 (빠른 판정)
✅ 잡아라: 한국 공급망이 **아직 없는** — 인디/DTC 뷰티 창업자, K-뷰티 PB 검토 Amazon FBA 셀러, 첫 한국 라인 준비 소형 수입사.
⛔ 버려라: 기성 한국 직거래 유통사, 한국 제조사 본인, 소싱 에이전시/무역대행.
판정 신호: "looking for OEM/ODM", "private label", "MOQ", "Korean manufacturer", 신규 출시 의도.

## 1. 채널별 실행 쿼리 (복붙용)

### A. LinkedIn (역할·의도 기반 — 최우선)
- People 검색: `("indie beauty" OR "skincare brand") founder` + 최근 게시 "Korea OR OEM OR manufacturer OR sourcing"
- `"private label" skincare` / `"K-beauty" "private label" founder`
- `Amazon FBA` + `beauty` + `Korea` (셀러)
- 글(Posts) 검색: `"looking for" Korean manufacturer skincare` / `"Korean OEM" recommendations`
- 판정: 프로필에 출시 의도·창업자/구매역할 보이면 채택. 회사가 기성 유통사면 제외.

### B. 커뮤니티 (의도 가시 — 질문하는 사람 = 강한 리드)
- Reddit: r/FulfillmentByAmazon, r/AmazonSeller, r/beautyentrepreneur, r/Entrepreneur, r/skincareaddiction(창업 문의), r/cosmeticchemistry
  - 검색: `Korean manufacturer`, `K-beauty OEM`, `private label Korea`, `MOQ Korea`
- Quora: "How to find Korean cosmetics suppliers", "Korean OEM for skincare brand"
- Indie Beauty Discord / Facebook groups (private label, indie beauty founders)
- 판정: 소싱 질문 올린 사람 = 1순위. 댓글로 도움 + 무료 샘플 리포트 제안(홍보 X).

### C. 인바운드 (자기선별 — 가장 높은 전환, 배포 후 가동)
- 배포된 `/en` + 블로그 SEO("how to find Korean cosmetics manufacturers" 등 이미 발행)로 유입 → 샘플 리포트 폼 제출자 = 검증된 리드.

### D. 이벤트/디렉터리
- Amazon K-Beauty Seller 행사, 인디 뷰티 박람회 참가자, 신규 뷰티 브랜드 디렉터리.

## 2. 인테이크 — `data/growth/outreach-targets.json` 스키마
각 리드 1건 = 객체. **contactSource(출처) 필수.** 도메인 불일치 시 contactSourceNote.
```json
{
  "company": "브랜드/회사명",
  "category": "indie skincare brand exploring Korean OEM",
  "country": "US",
  "url": "https://...(회사/프로필)",
  "contact": "이메일 또는 LinkedIn URL",
  "contactSource": "어디서 찾았는지 (예: LinkedIn post 2026-06-23, r/FBA thread URL)",
  "contactSourceNote": "도메인 불일치 등 설명(선택)",
  "icpSignal": "exploring/private label/MOQ 질문 등 채택 근거"
}
```

## 3. 게이트 워크플로우 (발송 전 필수)
```bash
# 리드 20건 채운 뒤:
npm run growth:outreach:preflight   # provenance·도메인·중복·이미발송 검사
# green + 사람 승인(EXT-001) 후에만 발송. 발송 자체는 게이트.
```

## 4. 타깃 & 카덴스 (스프린트)
- 1차 배치 **20명** (LinkedIn 10 + 커뮤니티 10) → preflight → 승인 → 발송.
- 응답 분류(GLO-005) → 다음 30명 개선(GLO-006).
- 누적 100명까지. 일일 캡 10~15(딜리버리 보호).
- 메시지: [kbeauty-oem-sales-messages.md](kbeauty-oem-sales-messages.md) (문제해결 톤, CTA=무료 샘플 1개).

## 5. 왜 자율로 20명을 못 채우나 (정직)
실 바이어는 "한국 공급사 필요" 페이지를 안 만들어서 스크래핑에 안 잡힌다. intent 채널(LinkedIn/커뮤니티)에서 **사람이 판정·수집**해야 하거나, 인바운드(배포 후)로 자기선별돼야 한다. 그래서 이 플레이북이 그 수집을 빠르게 만들고, 수집분은 preflight 게이트로 안전하게 흘린다. (자동 수집은 LinkedIn/커뮤니티 접근 = 게이트.)
