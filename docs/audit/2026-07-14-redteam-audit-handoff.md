# GloSource 전수조사 — 작업 인수인계 (Handoff)

- **작성일:** 2026-07-14
- **브랜치:** chore/harness-cal-0623
- **대상:** GloSource AI (safedoc-ai) — 바이어↔한국공급자 AI 소싱 중개 SaaS
- **스택:** Next.js 15.5 App Router / React 19 / next-auth v5(beta) / Drizzle+Neon / Upstash Redis / Toss·Polar 결제 / Anthropic·Gemini
- **작업 방식:** `/진상고객` 스킬 + 병렬 8개 에이전트 레드팀 (goal+harness)
- **모델 전환:** Fable 5 에서 조사 착수 → **다음 세션은 Opus 4.8 (1M context)로 이어받음**

---

## 0. 진행 상태 (8개 중 5개 완료, 3개 중단)

| # | 에이전트 | 담당 | 상태 | 결과 |
|---|---------|------|------|------|
| 1 | 비교충 | 가격 대비 가치·이탈 | ✅ 완료 | 이탈 9건 + 차별점 8건 |
| 2 | 납품보증요구충 | 책임전가·면책·보증오해 | ✅ 완료 | 7건 + 방어장점 11건 |
| 3 | 결과불만충 | 결과품질·환불·검색횟수 | ✅ 완료 | 10건 + 장점 12건 |
| 4 | 캡처충 | AI환각·허위공급자·바이럴 | ✅ 완료 | 9건 + 방어장치 12건 |
| 5 | 법무팀 | 표시광고법·GDPR·개인정보 | ✅ 완료 | 9건 + 장점 10건 |
| 6 | **보안 감사** | 인증·결제웹훅·인젝션·시크릿 | ⛔ **중단(미완성)** | 재실행 필요 |
| 7 | **코드 리뷰** | 정확성·아키텍처·에러핸들링·DB | ⛔ **중단(미완성)** | 재실행 필요 |
| 8 | **UI/UX 검수** | 랜딩·소싱툴·a11y·반응형 | ⛔ **중단(미완성)** | 재실행 필요 |

> 6·7·8은 사용자 "정지" 지시로 파일 읽던 중 중단됨. 부분 결과 미수집. Part C의 프롬프트로 재실행.

---

## 1. 완료된 5개 에이전트 — 종합 통합 발견사항 (중복 병합, 심각도순)

### 🔴 상 위험 — 즉시 수정

**R1. 환불 정책 3중 불일치** — *4개 에이전트 교차확인 (비교충·납품보증·결과불만충·법무팀)*
- `app/en/page.tsx:543` — "14-day refund policy" (무조건부)
- `app/terms/page.tsx:88~96` §3.4 — "generally non-refundable … 48시간 이내 AND 3회 미만 사용 시만 환불"
- `app/en/PolarCheckoutButton.tsx:44` — "14-day refund window ends once I run my first search" (제3의 규칙)
- **영향:** 표시광고법 제3조 / 전상법 제21조. Polar 분쟁·차지백에서 소비자 승소 논리로 직결. 차지백 누적 시 Polar 계정 위험.
- **수정:** 한 문장으로 확정 → landing·terms §3.4·체크아웃 동의문 3곳 통일 + `/terms#section-3-4` 링크. `plans.ts`처럼 환불 문구도 단일 소스 상수화.

**R2. 지원봇이 약관 밖 환불을 자동 약속** — *결과불만충#2*
- `app/lib/support/scenarios.ts:30~45` (`refund_after_usage`) — "refund or extended trial 논의" 자동 회신
- `app/lib/support/scenarios.ts:1411~1418` (`refund_policy`) — "case by case 검토" (48h/3회 기준 미언급)
- **영향:** 약관보다 관대한 서면 약속 자동 생성 → 진상고객 최적 공격 루트. 키워드만 맞추면 무한 재발급.
- **수정:** 자동응답에서 "refund" 약속 어휘 제거, §3.4 조건·링크 명시, 판단은 사람에게 escalate.

**R3. 가격/쿼터 화면 간 드리프트 + 죽은 PaywallModal** — *비교충#2, 결과불만충#3*
- `app/lib/plans.ts` = 단일 소스($39/40회·$99/100회·$249/300회)라고 주석까지 있으나 미참조되는 곳 다수
- `app/components/UpgradeModal.tsx:64` (렌더됨, `HomePageClient.tsx:391`) — "Starter 30회·Pro 60회·Enterprise 무제한" ← 전부 불일치
- `app/components/PaywallModal.tsx:86~88` — 구세계 "19/49/99만원 + 라이선스 키" 잔존(참조 0건 죽은 코드지만 재연결 시 폭발)
- **영향:** 스크린샷 한 장이 환불·허위표시 사유. plans.ts 주석에 이미 "$19/$49 드리프트로 Google이 틀린 가격 인용" 전과 기록.
- **수정:** UpgradeModal 푸터를 `plans.ts`의 `searchesLabel()`로 렌더. PaywallModal 삭제. 가격 하드코딩 전면 금지.

**R4. 무료 = 유료 동질성** — *비교충#3*
- 랜딩 무료 티어(`app/en/page.tsx:540`)와 Starter $39(`:81~87`) feature가 사실상 동일(차이=횟수뿐)
- 실제 잠금 게이팅(`EnSourcingTool.tsx:400~404` URL/RFQ/연락처 잠금)이 **가격표엔 한 줄도 없음**
- **수정:** 가격표 무료 행에 "URL/연락처 잠금, RFQ 내보내기 불가" 명시. Starter 첫 항목을 "Unlock full supplier URLs & contact details"로. 횟수가 아니라 '잠금 해제'를 파는 구조로.

**R5. WeChat 소싱 라우트 — 품질 게이트 전무** — *캡처충#1*
- `app/api/source/wechat/route.ts` — 메인 라우트의 `enforceVerifiedSupplierQualityGate`·grounding 검사·`verifySupplierUrls` **전부 미적용**
- `:227~238` grounding 실패 시 순수 LLM 폴백이 동일 스키마로 응답, 프롬프트가 `"sourceType":"web_search"` 예시 지시 → 폴백도 "웹 검색" 자칭
- `:344` `normalizeWeChatOutput` — LLM이 URL만 지어내면 자동 '웹 검색' 승격
- `app/components/WeChatCard.tsx:9~13` — 그 라벨을 파란 "웹 검색" 칩으로 렌더, WeChat ID·가격·MOQ 무검증 노출
- **영향:** 연락처(WeChat ID)는 즉시 검증 가능 → 폭로 가장 쉽고 금전피해 직결. **바이럴 리스크 최상위.**
- **수정:** grounding 없으면 전 post `ai_estimated` 강등, sourceType 서버 판정(프롬프트 예시 제거), URL 생존검사 이식, contactHint "미검증" 캡션.

**R6. "웹 확인(grounding_confirmed)" 배지 = URL이 HTTP 200일 뿐** — *캡처충#2*
- `app/lib/supplier-verification.ts:18~24` — 통과 조건 절반이 "LLM 자기 신고" `verificationStatus`
- `app/api/source/route.ts:46~71` `verifySupplierUrls` — 404/410/DNS 실패만 강등, **페이지 내용-회사명 대조 없음**. 403/타임아웃 미벌점(1688·Alibaba 안티봇 403 일상)
- **영향:** "링크는 진짜인데 회사가 다르다"는 캡처가 가장 반박 어려움.
- **수정:** fetch HTML에서 공급자명 토큰 매칭 실패 시 `ai_estimated` 강등 + "URL-회사 일치 미확인" 플래그. 배지 문구 "URL 접속 확인"으로 정직화.

**R7. GA4 쿠키 무동의 로드 + 개인정보방침 허위기술** — *법무팀#2*
- `app/layout.tsx:147~148` — `<ConsentAnalytics/> <GoogleAnalytics/>` **무조건 렌더**, 쿠키 배너/동의 게이트 없음
- `app/components/GoogleAnalytics.tsx:38~43` — gtag.js 로드, `page_path`에 **query string 포함** 전송(검색어 유출)
- `app/privacy/page.tsx:133~134` — "auth 세션 쿠키만 사용, 광고/추적 픽셀 없음" (코드와 정면 배치) / §4 처리자 목록에 **GA·Polar 누락**
- **영향:** GDPR Art.6·7 / ePrivacy / PIPA. 방침 문구가 기만 주장에 그대로 인용.
- **수정:** EU 트래픽 쿠키 동의 후 GA 로드(Consent Mode), privacy §4·§5에 GA·Polar 추가, GA에서 query strip.

**R8. "every supplier verified" 헤드라인 vs FAQ "No"** — *법무팀#3, 납품보증#2*
- `app/components/TrustCredibility.tsx:81` — 모달 제목 "How **every supplier here is verified**"
- `app/en/page.tsx:355` — K-Fashion 타일 "Curated **verified** makers" (바로 아래 `:332`가 "패션은 대조할 공개 등록부 없음"이라 자인)
- `app/en/page.tsx:179~181` — FAQ "Are the suppliers verified? **No.**"
- **영향:** 표시광고법 제3조. 사이트 자체 모순이 기만 정황 증거.
- **수정:** 제목 "How results are **cross-checked**", K-Fashion "Manually curated candidates". "verified"는 Gov-Verified 배지(등록부 실매칭)에만 한정.

### 🟡 중 위험 — 중기 개선

- **M1. Gov-Verified 배지 EN 전용, KO UI 패리티 없음** (캡처충#3) — `EnSourcingTool.tsx:261~307`·`AssistantExperience.tsx`에만 존재, `SupplierCard.tsx`는 gov 필드 안 읽고 AI `trustEvidence`를 무캡션 에메랄드 체크로 렌더. 모바일 카드엔 확인상태 칩 자체 없음. → EN 배지·"unverified" 캡션 KO 이식.
- **M2. factory-direct 라우트 깨진 grounding 툴 → 상시 424** (캡처충#5) — `app/api/source/factory-direct/route.ts:14` `googleSearchRetrieval` = gemini-2.5에서 400. fail-safe긴 하나 유료 기능 상시 실패. → `{googleSearch:{}}`로 교체 + 검증 파이프라인 이식.
- **M3. 레거시 취소 API가 남은 유료기간 즉시 소멸** (결과불만충#6) — `app/api/billing/cancel/route.ts:23~31`이 `cancelAtPeriodEnd:true`와 동시에 `status:'canceled'` 즉시 기록(정당한 클레임 유발). Polar 경로(`cancel-polar:76~78`)는 올바름. → 즉시 status 변경 제거, 만료 시점 크론 전환.
- **M4. 신뢰도 점수 UI 확신 > 면책** (결과불만충#5, 납품보증#4, 캡처충#7) — 점수는 LLM 생성값(0~100 clamp만, `route.ts:643`), 증거문에 출처 링크 없음. KO 게이지엔 "AI 추정" 캡션 없음(EN `:327`엔 있음). → KO 상시 캡션 추가, evidence에 grounding URL, "낮음"→"낮음(AI 추정)".
- **M5. "IP 익명화" 주장 vs 원본 IP 저장 + 파기 cron 없음** (법무팀#4) — `privacy:82~84` "IP anonymised, 90일" vs `schema.ts:90` `usageLogs.ip` 원본 저장. 90일/6개월/12개월 파기 job 부재. → IP 해시/트렁케이트 또는 방침 문구 수정 + purge job.
- **M6. 계정삭제 cascade로 결제기록 소멸 → 5년 보존 위반** (법무팀#5) — `schema.ts:105` `payments onDelete:cascade` vs `privacy:79` "Payment ref 5년 보존". `usageLogs`는 set null이라 원본 IP+검색어 무기한 잔존. → payments cascade 해제+익명화 5년 보존, usageLogs 삭제 시 ip/product 익명화.
- **M7. 익명 무료 사용자 clickwrap 공백** (납품보증#5) — `terms:78` 익명 5회 가능하나 검색 실행 버튼에 약관 동의 절차 없음 → 면책의 계약 구속력 약화. → 첫 검색 시 경량 clickwrap.
- **M8. EU 청약철회 "첫 검색 소멸" 조항 유효성** (법무팀#7) — `terms:103~105`. 월구독 SaaS는 '서비스'로 해석 여지 커 EU CRD상 무효 위험. → "이용분 비례 공제 후 환불" 구조로.
- **M9. 전자상거래법 §10 사업자 표시 불완전** (법무팀#6) — `terms:180~191` 운영자명+이메일만. 주소·전화·사업자번호·통신판매업번호 없음. KRW 플랜 UI(PaywallModal)·Toss 경로 살아있어 "국내 미영업" 주장과 충돌. → 국내 결제 UI 비활성 or 신고 완료.
- **M10. 큐레이션 상위 2개 고정 노출 + 쿼터 차감** (결과불만충#7) — `route.ts:988~1002` 카테고리 매칭 큐레이션 2개를 LLM 후보 앞에 삽입 → 동일 카테고리 재검색 시 항상 동일. 성공은 항상 과금(`:1181~1182`). → 재검색 시 기노출분 구분 라벨, 삽입분 카운트 제외.
- **M11. MFDS/인증 칩이 AI 문자열 정규식 매칭** (캡처충#6) — `EnSourcingTool.tsx:73~90` `CERT_PATTERNS` — AI `trustEvidence`에 "MFDS/식약처" 포함되면 칩 생성(gov 대조 무관). → gov 매칭 실패 칩은 "MFDS 언급(미확인)" 또는 제외.
- **M12. 무료 플랜: URL 제거하되 "웹 확인" 배지 유지** (캡처충#4) — `route.ts:774~807` `lockSupplierDetailsForFree`가 `url:''`로 스트립하되 `grounding_confirmed` 유지 → 증거 없는 확인 주장. → 호스트명 마스킹 표시 or "업그레이드 후 공개" 명시.
- **M13. 무료 체험 횟수 카피 3페이지 불일치** (비교충#6, 납품보증#6) — landing "5 anonymous" vs case-studies "5 a day" vs about 무표기. `en/page.tsx:238`이 비로그인도 `freeSearchLimit=10` 전달 → 서버 익명 5회와 어긋나 429 발생 구조. → 상수 통일, `isLoggedIn?10:5` 분기.
- **M14. 마케팅/가치 카피 갭** (비교충#4,5,8) — 90초 ROI 카피가 about에만 파묻힘 / RFQ 가치 방어 논리 부재("ChatGPT 공짜"에 무방비) / Pro의 "China sourcing" 셀링포인트는 정부대조가 한국 전용이라 차별점 0. → 랜딩 ROI 명시, RFQ 방어카피, Pro 셀링포인트 재구성.

### 🟢 하 위험 — 모니터링

- 환불/해지 이메일 창구 2갈래(`glosourceai@gmail.com` vs `hello@glosourceai.com`) — 통일 (결과불만충#10, 법무팀 연관)
- MOQ/단가 '추정' 라벨 KO 모바일 카드만 누락 (결과불만충#9, 캡처충#9)
- 케이스스터디 3건 전부 'illustrative' 데모 — 실증 사회적 증거 0 (비교충#9)
- 이메일 템플릿 구세대 카피("중국 공급자", 490,000원 영수증, 수신거부 없음) (법무팀#8)
- GDPR Art.27 EU 대리인 미지정(자인) (법무팀#9)
- AEO 리스트 2023/2024 하드코딩, staleness (캡처충#8)
- 신뢰도 점수 산식 비공개 — 툴팁으로 기준 공개 권장 (캡처충#7)
- "공급자 무응답" 면책이 약관에만, 결과화면엔 없음 (결과불만충#8)

---

## 2. 확인된 강점 (진상고객도 못 뚫은 방어 자산)

1. **정부 레지스트리 실 대조가 진짜 해자** — MFDS/HACCP/CGMP + **국세청(NTS) 실시간 사업자 상태**. buyKorea·알리바바·Thomasnet 어디에도 없음. 코드로 실구현(`app/lib/mfds.ts`, `app/lib/nts.ts`).
2. **AI 추정 vs 정부 사실 필드 분리** — `govEvidence`/`govRegistries`를 `trustEvidence`와 별도 보관, 판정 상한(cap): `ai_estimated`는 아무리 높아도 '조건부 검토'.
3. **실패한 검색은 무과금** — 쿼터는 `usage_logs` 성공시에만(`route.ts:1181`), 품질게이트 전멸 시 424+무과금 폴백. "결과 없는데 횟수 깎였다" 원천봉쇄.
4. **품질 게이트** — grounding+실 URL 있는 후보만 통과, 없으면 정직하게 424(가짜로 안 채움).
5. **약관 §1·§2 면책 최상단 배치** — "재고·배송·중개 아님", "trust score는 verified certification 아님", "응답·거래성사 무보증", 배상 상한 = 직전 30일 결제액.
6. **급진적 정직성** — "AI Estimate — Not Search-Grounded", FAQ "verified? No.", About "is not" 4연타, 샘플리포트 디스클레이머. 진상 "속았다" 공격표면 원천차단.
7. **프롬프트 인젝션 방어** — 한/영/중 3언어 필터 + zero-width 제거 + "점수 조작 요청 무시", temperature 0.
8. **동의 증적 체계 수집** — 가입 시 ToS/데이터/GDPR/연령 4개 필수 타임스탬프 DB 저장. 청약철회 별도 체크박스.
9. **가격 단일 소스 아키텍처(EN)** — plans.ts에서 JSON-LD·랜딩·툴 파생(단 KO 모달만 이탈, R3).
10. **RFQ 3언어 + 명함 자동삽입 + 파일럿 예산 위젯** — 경쟁 무료툴에 없는 실무 기능.

---

## 3. 중단된 3개 에이전트 — 재실행 프롬프트 (다음 세션에서 그대로 병렬 투입)

> `general-purpose` 또는 특화 에이전트로 병렬 실행. 작업 디렉토리 `C:\Users\ddedi\safedoc-ai`. 각 에이전트가 실제 파일 읽고 file:line 근거로만 보고. 한국어 마크다운, 서두 생략. **장점 섹션 필수.**

### 에이전트 6 — 보안 감사 (권장: `compound-engineering:review:security-sentinel`)
집중: ① 인증/인가 (`auth.ts`, `auth.config.ts`, `app/lib/authMiddleware.ts`, `app/lib/licenseAuth.ts`, `app/api/auth/*`, reset-password) — 세션/쿠키/CSRF/bcrypt/토큰. ② 관리자 (`app/admin/*`, `app/api/admin/*`) — 모든 admin API 권한검사 실재 여부, 하드코딩 관리자 계정. ③ 결제 웹훅 (`app/api/payments/toss/webhook`, `app/api/polar/webhook`, `polarOrder.ts`) — 서명검증·멱등성·금액위변조. ④ 인젝션/SSRF (`app/api/**/route.ts`, 특히 factory-direct/wechat/verify-company 외부 fetch, AI 프롬프트 인젝션). ⑤ 시크릿 노출 (하드코딩 키, NEXT_PUBLIC_ 오용, promote.yml + 커밋 89146fe "secret scanner failing open on large diffs"). ⑥ 레이트리밋/어뷰즈 (`chatRateLimit.ts`, `abuse.ts`, `app/api/abuse/track`) — 무료 5회 우회. ⑦ IDOR (`app/api/history/*`, `account`, `source`) — 타 사용자 데이터 접근. ⑧ 크론/보이스토큰 (`app/api/cron/*` 인증헤더, `voice/token`, `verify-license`). 각 발견: 심각도/파일:라인/공격시나리오/수정안/OWASP 매핑. **보안 강점 별도 섹션.**
> 중단 시점 메모: "licenseAuth와 INTERNAL_API_KEY의 실제 사용처, waitlist 확인" 직전이었음.

### 에이전트 7 — 코드 리뷰 (`general-purpose`)
집중: ① 정확성/버그 (`sourcing-verdict.ts`, `supplier-verification.ts`, `verify-company.ts`, `mfds.ts`, `nts.ts`, `plans.ts`, `api/source/route.ts`, `api/source/factory-direct`, `chat/handler.ts`) — 엣지케이스·null·async 경쟁. ② 결제/구독 상태 일관성 (`billing/*`, `polarOrder.ts`, `payments/toss/*`) — 이중결제·이중크레딧. ③ 아키텍처: .js/.ts 라우트 혼재(`chat/route.js` vs `handler.ts`, `chatRouteWrapper.js`, `imageAnalyzeRouteWrapper.js`) 타입안전성 손실, 중복(app/billing vs app/en/billing). ④ 에러핸들링/신뢰성 — 외부 API(Gemini/Anthropic/MFDS/NTS/Resend/결제) 타임아웃·재시도·폴백. ⑤ 유지보수성 — 데드코드(PaywallModal, globalMarkets 참조 0건), 거대 컴포넌트(HomePageClient.tsx, EnSourcingTool.tsx). ⑥ DB 스키마 인덱스·관계·마이그레이션. ⑦ 테스트 커버리지(`tests/`). 각 발견: 심각도/파일:라인/실패시나리오/수정안. **잘 설계된 부분 별도.**

### 에이전트 8 — UI/UX·디자인·접근성 (`general-purpose`, `web-design-guidelines` 스킬 로드)
집중: ① 랜딩/히어로 EN-first (`app/en/page.tsx`, `en/layout.tsx`, `HomePageClient.tsx`, `HeroSection.tsx`, `TrustCredibility.tsx`, `TrustScoreGauge.tsx`). ② 소싱툴 UX (`EnSourcingTool.tsx`, `CategorySelector.tsx`, `SupplierCard.tsx`, `RFQComposer.tsx`, `SourcingChatWidget.tsx`, `en/assistant/*`) — 검색→결과→RFQ 플로우, 로딩/빈/에러 상태. ③ 가격/페이월/전환 (`PaywallModal.tsx`, `UpgradeModal.tsx`, `PolarCheckoutButton.tsx`). ④ 폼/인증 (`app/auth/*`, `en/login`, `en/register`, `WaitlistBanner.tsx`). ⑤ a11y (색대비·시맨틱·aria·키보드·포커스·alt·라벨, `globals.css`). ⑥ 반응형/모바일. ⑦ 디자인 시스템 일관성 (`BrandLogo.tsx`, `icons.tsx`, KoreanOrnaments/YetHangul/HaeryeText가 EN 전환에 도움/방해). ⑧ i18n (/en vs / 정합성). 각 발견: 심각도/파일:라인/사용자임팩트/개선안. **디자인 강점 별도.**
> 중단 시점 메모: "체크리스트 항목 검증 grep" 직전이었음.

---

## 4. 우선순위 수정 액션 (착수 순서 제안)

**즉시 (문구 몇 줄 = 리스크 급락, 코드 위험 낮음):**
1. **환불 정책 통일** (R1) — landing/terms/checkout 3곳 + 지원봇(R2) 한 번에. 단일 소스 상수.
2. **"verified" 헤드라인 정리** (R8) — TrustCredibility 제목 + K-Fashion 타일.
3. **가격/쿼터 통일 + 죽은 PaywallModal 삭제** (R3).
4. **GA 쿠키 동의 + privacy 처리자 목록 갱신** (R7).

**단기 (코드 수정, 반나절~1일):**
5. **WeChat 라우트 품질게이트 이식** (R5) — 바이럴 리스크 최상위.
6. **"웹 확인" 배지 정직화 + URL-회사명 대조** (R6).
7. **무료=유료 차별화 (잠금 노출)** (R4).
8. **레거시 취소 API 즉시소멸 버그 수정** (M3).
9. **Gov-Verified 배지 KO 패리티** (M1).

**중기:** M2·M4~M14 (개인정보 파기 job, 계정삭제 보존 정합, factory-direct 툴 교체, 카피 개선 등).

**보류:** 중단된 보안·코드·UI 에이전트(Part 3) 재실행 후 위 리스트에 병합.

---

## 5. 다음 세션 재개 가이드 (Opus 4.8)

1. 이 문서를 먼저 읽는다: `docs/audit/2026-07-14-redteam-audit-handoff.md`
2. 원하는 진행 방향 3택:
   - **(A) 8개 완성** → Part 3 프롬프트로 에이전트 6·7·8 병렬 재실행 → 전체 종합 리포트.
   - **(B) 수정 착수** → Part 4 "즉시" 4건부터. 환불 정책(R1)이 최우선.
   - **(C) 종합 리포트만** → 완료된 5개(Part 1)로 최종 문서 확정.
3. 서비스 성격 고정: 쇼핑몰 아님. AI 소싱 중개(공급자 탐색+신뢰도분석+RFQ 초안). 배송·재고·납품보증 없음.
4. 관련 메모리: `project_glosource_verification_overlay`(정부 레지스트리 오버레이 구조), `project_glosource_domain_billing_email`(가격 $39/$99/$249, Polar), `feedback_no_2_0_update`(safedoc-ai에서 "2.0 업데이트" 언급 금지).
5. 커밋/promote 주의: master push 시 promote.yml 자동 배포. 이 문서는 docs라 빌드 무해하나, 커밋은 사용자 승인 후에만.

---

*원본 5개 에이전트 상세 리포트는 이 대화 세션 트랜스크립트에 전문 보존됨. 위 Part 1은 중복 병합 요약본.*
