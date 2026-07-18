# GloSource AI 전수조사 — 최종 종합 리포트

- **작성일:** 2026-07-15
- **대상:** GloSource AI (safedoc-ai) — 바이어↔한국공급자 AI 소싱 중개 SaaS
- **방법:** `/진상고객` 스킬 + 병렬 8개 에이전트 (진상고객 레드팀 5 + 보안·코드리뷰·UI/UX 3)
- **모델:** 조사 착수 Fable 5 → 완성 Opus 4.8 (1M context)
- **선행 문서:** `docs/audit/2026-07-14-redteam-audit-handoff.md` (중간 인수인계본)
- **서비스 성격(고정):** 쇼핑몰 아님. 재고·배송·납품보증 없음. AI 공급자 발굴 + 정부 레지스트리 대조 + RFQ 초안까지. 계약·납품은 당사자끼리.

---

## 0. Executive Summary

8개 에이전트가 실제 코드·UI·약관을 file:line 근거로 검증했다. 전체적으로 **핵심 방어 설계는 우수하다** — 결제 웹훅 서명검증, 프롬프트 인젝션 3중 방어, fail-closed 레이트리밋, 정부 레지스트리 실대조, 실시간 구독 재검증, 다층 면책. 진짜 문제는 두 군데에 몰려 있다:

1. **"돈이 오가는 표면"의 불일치·버그** — 환불 정책이 3곳에서 다르고, Toss 결제는 구독을 아예 안 만들며, 취소하면 남은 기간이 즉시 사라진다.
2. **"검증했다는 주장 vs 실제 검증 범위"의 간극** — WeChat 라우트엔 품질게이트가 없고, "웹 확인" 배지는 URL이 200이라는 뜻일 뿐이며, 헤드라인은 "every supplier verified"인데 FAQ는 "No"라고 답한다.

| 심각도 | 건수(중복 병합 후 대략) |
|--------|------|
| 🔴 상 (즉시) | 14 |
| 🟡 중 (단기~중기) | 40+ |
| 🟢 하 (모니터링) | 20+ |
| ✅ 확인된 강점 | 60+ (트랙별) |

---

## 1. 교차 관통 핵심 테마 (여러 에이전트가 같은 뿌리를 지목)

### 테마 A — "돈 표면"이 서로 다른 말을 한다 (최우선)
- **환불 정책 3중 불일치** *(비교충·납품보증·결과불만충·법무팀 = 4개 교차확인)*: `app/en/page.tsx:543` "14-day refund" vs `app/terms/page.tsx:88~96` §3.4 "48시간+3회 미만" vs `app/en/PolarCheckoutButton.tsx:44` "첫 검색 시 소멸". → 표시광고법·전상법 리스크 + Polar 차지백 패소 요인.
- **지원봇이 약관 밖 환불 자동 약속** *(결과불만충)*: `app/lib/support/scenarios.ts:30~45, 1411~1418`.
- **Toss 결제→구독 미생성** *(코드 P-1)*: `insert(subscriptions)`는 Polar 웹훅 한 곳뿐. Toss 사용자는 payments만 쌓이고 영구 `plan='free'`. KO 빌링 UI는 실제 결제창을 띄움 → **결제받고 권한 미부여**.
- **취소 시 즉시 강등** *(코드 B-1 = 레드팀 M3)*: `app/api/billing/cancel/route.ts:23~31`이 `status:'canceled'` 즉시 기록 → 남은 유료기간 소멸. UI 문구(`BillingActions.tsx:127` "남은 기간 계속 이용")와 정반대.
- **가격/쿼터 화면 드리프트 + 죽은 PaywallModal** *(비교충·결과불만충)*: `UpgradeModal.tsx:64` 30/60/무제한 vs `plans.ts` 40/100/300. `PaywallModal.tsx:86` 19/49/99만원 폐기가격 잔존.

### 테마 B — "검증"을 과장한다 (신뢰·법적·바이럴 리스크)
- **WeChat 라우트 품질게이트 전무** *(캡처충)*: `app/api/source/wechat/route.ts` — grounding 검사·URL 생존검사 없이 AI 생성 결과가 "웹 검색" 라벨로 나감. **바이럴 리스크 최상위.**
- **"웹 확인" 배지 = URL이 HTTP 200** *(캡처충)*: `supplier-verification.ts:18~24`, `source/route.ts:46~71` — 회사명-URL 대조 없음, 403/타임아웃 미벌점.
- **"every supplier verified" vs FAQ "No"** *(법무팀·납품보증)*: `TrustCredibility.tsx:81`, K-Fashion 타일 "verified makers" vs `en/page.tsx:180` "Are suppliers verified? No."
- **Gov-Verified 배지 EN 전용, KO UI 패리티 없음** *(캡처충·UI)*: `SupplierCard.tsx`가 gov 필드 안 읽고 AI `trustEvidence`를 무캡션 에메랄드 체크로 렌더.
- **MFDS/인증 칩이 AI 문자열 정규식 매칭** *(캡처충)*: `EnSourcingTool.tsx:73~90`.

### 테마 C — 개인정보/컴플라이언스 문구 vs 코드 불일치
- **GA4 쿠키 무동의 로드 + 방침 "인증 쿠키만" 허위** *(법무팀)*: `layout.tsx:147`, `privacy:133`.
- **"IP 익명화" 주장 vs 원본 IP 저장 + 파기 job 없음** *(법무팀·보안 L6)*.
- **계정삭제 cascade로 결제기록 소멸 → 5년 보존 위반** *(법무팀·보안 L6·코드 D-2)*: `schema.ts:105`.

### 테마 D — AI 추정 vs 정부 사실 표시 비대칭
- 신뢰도 점수는 LLM 생성값(0~100 clamp만), KO 게이지엔 "AI 추정" 캡션 없음(EN엔 있음). 모바일 비교카드엔 검증칩·'예상' 라벨 자체가 없음.

---

## 2. 트랙별 상세 (심각도순 요약)

### 트랙 1 — 보안 감사 (🔴2 🟡8 🟢7 + 강점13)
**🔴**
- **H1 로그인 브루트포스 방어 부재** — `auth.ts:34~52`. register/reset엔 레이트리밋 있으나 로그인 credentials엔 없음. → `kvRateLimit` 재사용(이메일+IP 10회/10분). OWASP A07.
- **H2 INTERNAL_API_KEY 전면우회** — `authMiddleware.ts:32~46`. IP 허용목록이 설정 시에만 검사(미설정 시 모든 IP 무제한) + `===` 비상수시간. → fail-closed + `timingSafeEqual`. (현재 프로덕션 미설정=휴면.)

**🟡** M1 관리자 미들웨어가 admin권한 아닌 로그인만 검사(`auth.config.ts:11~24`, 개별 게이트로 현재 차단됨=방어심층 결여) · M2 Toss 웹훅이 클라이언트 `metadata.userId` 신뢰(`toss/webhook:51~60`) · M3 비번변경 시 JWT 미무효화(`auth.ts:68` JWT전략) · M4 `ADMIN_PUBLISH_SECRET` 정적 재사용(`blog-posts`, `waitlist`) · M5 `verifySupplierUrls` 블라인드 SSRF(`source/route.ts:46~71`, 사설IP 차단 없음) · M6 `/api/support` 임의주소 이메일 발송 남용 · M7 `/api/translate` 미인증 AI 비용남용 · M8 `x-forwarded-for` 폴백 IP스푸핑(`kv.ts:77~90`).

**🟢** 비상수시간 비교 산재(L1) · verify-license 브루트포스 무제한(미사용 잔존코드, L2) · 전역 공유 KV 히스토리(L3) · 미인증 DB 쓰기 abuse/waitlist(L4) · FREE_IP_MONTHLY_LIMIT 기본0(L5) · payments cascade(L6) · 상세 에러메시지 노출(L7).

### 트랙 2 — 코드 리뷰 (🔴3 + 🟡다수 + 강점9)
**🔴**
- **B-1 취소 즉시 강등** — `billing/cancel/route.ts:23~31` (테마 A).
- **B-2 factory-direct 상시 424** — `factory-direct/route.ts:14` `googleSearchRetrieval`가 gemini-2.5에서 400 → 게이트 전멸 → "1688 공장직거래" 탭 전체 상시 불능. → `{googleSearch:{}}`로 교체.
- **P-1 Toss 결제→구독 미생성** — 결제받고 free 유지 (테마 A). **신규 발견, 국내 오픈 전 필수.**

**🟡** B-3 `parseMaxPrice` 콤마 미처리 → "¥1,200"이 200으로, 견적 최대 1000× 오차(`sourcing-verdict.ts:22~31`) · B-4 Toss 웹훅 CANCELED→'failed' 오기록(`toss/webhook:57 vs 67`) · B-5 `getPilotCost` 통화 무관 USD 버퍼 합산 · P-2 Polar 이중 결제기록 소지(`polar/webhook:320~348`) · P-3 `findOrCreateUser` select-then-insert 경쟁조건 · A-1 .js 래퍼 타입체크 사각 + 요청당 인증 2회 중복 · M-1 데드코드(PaywallModal, globalMarkets, CsvExportButton 셰임) · D-1 **핫패스 쿼리 인덱스 0건**(`schema.ts` — 매 과금요청마다 usage_logs 풀스캔) · T-1 신뢰코어·결제웹훅 테스트 0건.

**🟢** B-6 getVerdictStyle default 없음/verify-company 첫 bizrno만 조회 · P-4 Polar 서명 비상수시간/abuse severity 불일치 · A-2 빌링/인증 UI 이중화, GEMINI 키 처리 불일치 · R-1 순차 외부호출 누적지연(maxDuration 120s 근접) · D-2 payments.subscriptionId onDelete 미지정.

### 트랙 3 — UI/UX·접근성 (🔴4 🟡12 🟢6 + 강점7)
**🔴**
- **소싱 폼 라벨 미연결** — `EnSourcingTool.tsx:651~700`. `htmlFor`/`id` 없음. 1차 전환 지점인데 SR·라벨클릭 불가. (참고 모범: `en/login`, `SampleReportLeadForm`.)
- **다크 섹션/푸터 텍스트 대비 WCAG AA 미달** — `en/page.tsx:576` `text-slate-700` ≈1.8:1. 다크 위 하한은 slate-400.
- **EN 콘텐츠 내 한국어 `lang` 누락** — `HaeryeText.tsx`. 영어 음성엔진 오발음.
- **모바일 비교카드 검증칩·'예상' 라벨 누락** — `SupplierCard.tsx:73~85`. 데스크톱엔 있으나 모바일엔 검증칩 없고 단가가 그냥 "단가"(예상 탈락).

**🟡** 히어로 헤드라인 글자단위 span(SR) · smooth scroll reduced-motion 미대응 · 토글/버튼그룹 aria-pressed 없음 · 로딩/에러/결과 live region 없음 · "Everything in Business"(없는 플랜 참조) · KO 페이월 모달 dialog 시맨틱 전무 · WaitlistBanner 라벨없음 · iOS 자동확대(input 14px) · skip-link 없음 · CategorySelector aria-expanded 없음 · TrustCredibility 포커스 트랩/복원 없음 · 모바일 nav 터치타깃 <24px · KO/EN 제품정체성 divergence.

**🟢** 극소폰트(9px) 면책 · bg-hanji 중복정의 · focus ring 다크 대비 약함 · 결과 후 포커스 미이동 등.

### 트랙 4~8 — 진상고객 레드팀 (요약; 상세는 §1 및 핸드오프 문서)
- **결과불만충** 10건 — 환불3중, 지원봇 자동환불, 가격드리프트, 청약철회 앵커 오류, 신뢰점수 UI확신, 취소즉시소멸, 큐레이션 고정노출+과금 등.
- **납품보증요구충** 7건 — 환불3중, "verified makers" 자기모순, Gov-Verified 오독, "AI추천=보증" 프레임, 익명 clickwrap 공백 등.
- **캡처충** 9건 — WeChat 무방비, "웹확인"=URL200, Gov배지 EN전용, 무료 URL제거하되 배지유지, factory-direct 424, MFDS칩 정규식, 점수산식 비공개 등.
- **법무팀** 9건 — 환불3중(표시광고법), GA무동의(GDPR), "every verified"(표시광고법), IP익명화 허위, 계정삭제 보존위반, 전상법§10 사업자표시 불완전, EU철회권 조항유효성, EU대리인 미지정 등.
- **비교충** 9건 — 로딩문구가 무료사이트 자백, 가격드리프트, 무료=유료 동질, ROI 카피 파묻힘, RFQ 가치방어 부재, China Pro 셀링포인트 무차별, 무료횟수 3페이지 불일치, 케이스스터디 전부 데모 등.

---

## 3. 확인된 강점 (진상고객·감사도 뚫지 못한 방어 자산)

**보안/코드**
1. 결제 웹훅 서명검증 견고 — Toss `crypto.subtle.verify`, Polar StandardWebhooks+5분 리플레이 방지, Resend `timingSafeEqual`, 전부 fail-closed.
2. 결제 멱등성 — unique키 + 존재검사, 금액은 서명된 페이로드에서만.
3. 실시간 구독 재검증 — 세션마다 DB에서 active+기간유효 확인(`auth.ts:83~98`). JWT 박제 권한상승 불가.
4. 프롬프트 인젝션 3중 방어 — 한/영/중 필터 + zero-width 제거 + NFKC + temperature 0.
5. 레이트리밋 Redis 공유 + fail-closed.
6. 시크릿 위생 — 하드코딩 0, NEXT_PUBLIC_ 안전값만, voice/token 키 유출 수정완료, 프리커밋 스캐너 fail-open 버그 수정완료.
7. SQL 인젝션 없음(Drizzle 파라미터화), 저장형 XSS 차단(sanitize-html), IDOR 방어(session.user.id 스코프).
8. bcrypt cost 12 + 레거시 SHA-256 자동 업그레이드, 토큰 단일사용·만료·이메일 존재 미노출.

**제품/신뢰**
9. 정부 레지스트리 실대조가 진짜 해자 — MFDS/HACCP/CGMP + 국세청(NTS) 실시간. 경쟁사에 없음.
10. AI 추정 vs 정부 사실 필드 분리 + 판정 상한(ai_estimated는 최대 '조건부 검토').
11. 실패한 검색 무과금 + 품질게이트(없으면 정직하게 424).
12. 급진적 정직성 — FAQ "verified? No", About "is not" 4연타, 다층 디스클레이머 → "속았다" 공격표면 원천차단.

**UI/디자인**
13. 접근성 내장 애니메이션 시스템(prefers-reduced-motion 게이팅, TrustScoreGauge sr-only+색+숫자 병기).
14. 정직성 중심 트러스트 디자인(emerald=정부검증/amber=AI추정 의미색 규약).
15. EN 인증폼 + SampleReportLeadForm이 라벨·autocomplete·aria 모범(이 수준을 소싱폼·KO모달로 확산하면 됨).

---

## 4. 우선순위 조치 로드맵

### 즉시 (문구·설정 = 리스크 급락, 위험 낮음)
1. **환불 정책 단일화** — landing/terms/checkout 3곳 + 지원봇 한 번에. 단일 소스 상수화.
2. **"verified" 과장 정리** — TrustCredibility 제목, K-Fashion 타일.
3. **가격/쿼터 통일 + 죽은 PaywallModal·globalMarkets 삭제.**
4. **GA 쿠키 동의 게이트 + privacy 처리자 목록(GA·Polar) 갱신.**
5. **로그인 레이트리밋 추가**(H1, 기존 kvRateLimit 재사용).

### 단기 (코드 수정, 반나절~2일)
6. **Toss 결제→구독 프로비저닝 구현 또는 KO 결제버튼 비활성**(P-1) — 국내 오픈 전 필수.
7. **취소 즉시강등 버그 수정**(B-1) — cancelAtPeriodEnd만, 강등은 만료시점.
8. **WeChat 라우트 품질게이트 이식**(캡처충 R5) — 바이럴 최우선.
9. **factory-direct 툴 교체**(B-2) — `{googleSearch:{}}`.
10. **parseMaxPrice 콤마 버그**(B-3) — 견적 1000× 오차.
11. **"웹 확인" 배지 정직화 + SSRF 사설IP 차단**(캡처충 R6 + 보안 M5).
12. **소싱 폼 라벨 연결 + 다크/푸터 대비 + 모바일 검증칩 복구**(UI 🔴).
13. **usage_logs 핫패스 인덱스 추가**(D-1).

### 중기
- INTERNAL_API_KEY fail-closed(H2), 관리자 미들웨어 admin검사(M1), Toss 웹훅 귀속 서버조회(M2), 비번변경 세션무효화(M3), IP파기 job·계정삭제 보존정합(테마 C), 신뢰코어·웹훅 테스트 추가(T-1), Gov배지 KO 패리티, KO 모달 a11y, 마케팅 카피(ROI·RFQ 방어·Pro 셀링포인트).

### 국내(Toss/KRW) 오픈 전 게이트
- 사업자등록·통신판매업 신고(전상법 §10), P-1 구독 프로비저닝, 청약철회 앵커 오류, KO 페이월 가격정합.

---

## 5. 커버리지 & 재개 메모
- 8개 트랙 전부 완료. 각 에이전트 원문 상세는 이 세션 트랜스크립트에 보존.
- 서비스 성격 고정(§ 상단). 관련 메모리: `project_glosource_verification_overlay`, `project_glosource_domain_billing_email`, `feedback_no_2_0_update`.
- **커밋 주의:** master push 시 `promote.yml` 자동배포. 수정 반영은 사용자 승인 후. 이 문서는 docs라 빌드 무해.
- 코드 정적검수라 대비값·런타임 동작은 근사 — 반영 후 axe/Lighthouse·실결제 테스트로 재확인 권장.
