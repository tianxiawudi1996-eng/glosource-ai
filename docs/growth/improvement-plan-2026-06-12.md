# GloSource AI 개선 계획 — 2026-06-12 (EN-first 개정판)

Date: 2026-06-12
Source: 오전(07:09~07:29 KST) Fable 5 풀스캔 진단 — 제품·수익화·마케팅·보안 4축 병렬 에이전트 분석
실행용 JSON: `data/growth/improvement-plan-2026-06-12.json`

## 전략 전제 (차장님 확정)

- **해외 고객 유치가 제1 목표.** 영어 버전(`/en`) + Polar.sh 결제가 유일한 활성 트랙.
- **Toss(국내)는 본 계획에서 배제** — 사업자등록증이 필요하므로, 해외 성과 확인 후 사업자 개설 시점에 별도 계획으로 진행.
- 광고/홍보 채널: LinkedIn · Threads · X(Twitter) · Instagram + YouTube Shorts(Sound of Seoul 연계).
- ⚠️ **현재 실태**: 소셜 채널은 코드상 전부 dry-run 상태로 실제 발행 0건. LinkedIn은 `BUFFER_CHANNEL_LINKEDIN` 누락으로 차단. "광고 진행 중"이 되려면 라이브 전환이 선행되어야 함.

## 스코어카드 (오전 진단)

| 축 | 점수 | 핵심 진단 |
|---|---|---|
| 제품 완성도 | 75/100 | 핵심 소싱 AI 95점급. 라이선스(20점)·이메일 모킹·WeChat 폴백 등 주변부 감점 |
| 마케팅 | 54/100 | SEO/감사 자동화만 LIVE. 소셜 4채널 dry-run 정지, LinkedIn 차단, GA 부재, 고객 증거 0 |
| 수익화 | 42/100 | (Toss 항목 배제 후) Polar DOA 계정 누수 15~20%가 최대 리크. 리텐션·연간결제 부재 |
| 보안 | B+ | 기본기 양호. image-analyze 무과금이 유일한 High |

참고: 오전 진단의 1순위였던 "Toss 구독 갱신 로직 부재"는 전략상 배제됨. **Polar는 MoR(merchant of record)로서 갱신 결제를 Polar가 자체 처리**하므로 해외 트랙에는 갱신 cron이 필요 없음 — webhook 상태 동기화만 유지하면 됨.

## 검증 노트 (06-12 저녁 코드 직접 확인)

- **GA 부재 — 사실**: `gtag`/GTM 코드 app 전체 0건. 광고 효과 측정 불가 상태.
- **소셜 dry-run — 사실**: `growth:social:dry-run` 게이트만 돌고 라이브 발행 실적 파일(buffer-*.json) 없음.
- **이메일 silent fail — 사실**: `app/lib/email.ts`는 `RESEND_API_KEY` 없으면 콘솔 로그만 남기고 통과 → EN 가입 검증 메일 누락 위험.

---

## P0 — 이번 주 (해외 고객 유치 직결)

### P0-1. Polar DOA 계정 수정 ★ 수익화 최우선
- **문제**: `app/api/polar/webhook/route.ts:71-86, 229-233` — Polar 결제로 신규 유저를 랜덤 해시 비밀번호로 자동 생성. 48h 리셋 링크를 못 누르면 접근 불가 계정. **해외 가입의 15~20%가 돈 내고 못 쓰는 상태(DOA)로 추정.**
- **조치**: 리셋 링크 7일 연장 + 48h 리마인드 메일 + `subscription.active` 시 자동 리셋 재발송.
- **수용 기준**: 결제 직후 리셋 미클릭 가입자도 7일 내 접근 가능.
- 예상 2h

### P0-2. 소셜 라이브 발행 전환 (광고 실집행 시작)
- **문제**: 광고 채널 전부 dry-run — Twitter/Threads/Instagram/Reddit credentials 완비 상태에서 발행 0건. LinkedIn(B2B 핵심)은 채널 ID 누락으로 차단.
- **조치**:
  1. `npm run growth:buffer:list-channels` → `.env.local`에 `BUFFER_CHANNEL_LINKEDIN` 추가 (30분)
  2. `npm run growth:acquisition:gate` PASS 확인 후 Twitter/X·Reddit부터 `--dry-run` 제거 첫 라이브 발사
  3. Threads·Instagram·LinkedIn 순차 라이브 → 주간 자동화 등록
  4. YouTube Shorts(Sound of Seoul)와 메시지 톤 정합 — Shorts만 공개 정책 준수
- **수용 기준**: 최소 2개 채널에서 실제 발행 확인, buffer 발송 실적 리포트 생성.
- 예상 1.5h

### P0-3. GA4(또는 Plausible) 설치 — 광고 측정 기반
- **문제**: 분석 도구 전무. 소셜 광고를 라이브로 돌려도 유입→가입→결제 전환을 측정할 수 없음.
- **조치**: GA4 또는 Plausible 설치 + `search → signup → checkout → payment` 4단계 이벤트 정의. UTM 파라미터로 채널별 유입 구분.
- **수용 기준**: 채널별 유입·전환 대시보드에서 확인 가능.
- 예상 1h

### P0-4. image-analyze 과금·리밋 적용 (비용 방어)
- **문제**: `app/api/source/image-analyze/route.ts:39` — `BILLABLE_ACTIONS`(`app/lib/authMiddleware.ts:13`) 미포함. 익명도 10MB 이미지 무제한 → 해외 트래픽 늘면 Gemini Vision 비용 직격.
- **조치**: `BILLABLE_ACTIONS` 추가 + 익명 `kvConsumeFreeCredit(ip)` + IP 리밋.
- **수용 기준**: 무료 한도 소진 후 402/429 반환.
- 예상 1h

### P0-5. 무료 한도 표기 통일 + Resend 강제 (EN 가입 플로우 보호)
- **문제 1**: 스키마 `free=10회`(`app/lib/db/schema.ts:190`) vs `HeroSection.tsx:15` "5회 무료" 불일치.
- **문제 2**: `app/lib/email.ts:14-16` — API 키 없으면 silent skip → 해외 가입자 검증 메일 미발송 시 조용히 이탈.
- **조치**: 5회로 통일. 프로덕션 `RESEND_API_KEY` 미설정 시 기동 경고/에러 + 발송 실패 로깅.
- 예상 1h

**P0 합계: 약 6.5h** (광고 라이브 + 측정 + 누수 차단이 한 묶음)

## P1 — 1~2주 (해외 전환·리텐션 강화)

| # | 작업 | 핵심 | 예상 |
|---|---|---|---|
| P1-1 | 이메일 인증 소프트 게이트 | 인증 대기 중 2회 검색 허용 (`authMiddleware.ts:68-86`). +8~12% 활성화 | 1~2h |
| P1-2 | 리텐션 메일 시퀀스 | Day 3/10/20/45 EN 템플릿 + `emailCohort` + 일일 cron. +3~6% 전환 | 3~4h |
| P1-3 | Polar 연간 결제 옵션 | Polar에 annual 프로덕트 추가 + PLANS 토글, 10~15% 할인. +12~18% LTV | 1~2h |
| P1-4 | 실고객 증거 확보 | 초기 유저 5~10명 → 사례 3건 승인 → case_study 차단 해제 → paid ads 본격화 | 운영 |
| P1-5 | translate Redis 리밋 | 인메모리 Map(`translate/route.ts:15-27`)은 서버리스에서 무력 → Upstash 전환 | 1h |
| P1-6 | 블로그 sanitize + JSON-LD 이스케이프 | `blog/[slug]/page.tsx:99` rehype-sanitize. `<` 치환 통일 | 2h |
| P1-7 | WeChat 소싱 폴백 | Sogou 실패 시 Gemini 순수 검색 폴백 (제품 60점 보강) | 2h |
| P1-8 | 쿼터 초과 업셀 컨텍스트 | 차단 대신 추천 플랜/할인 노출. +5~8% 업그레이드 | 1h |

## P2 — 백로그

- 라이선스 동적 발급 시스템 (`licenses` 테이블 + 발급 API + 어드민) — 해외 B2B 대량 판매 채널 열 때
- 리퍼럴 (초대당 +5 free searches)
- waitlist 이메일 시퀀스
- Organization JSON-LD, 접근성(aria) 보강, Anthropic SDK 의존성 정리, US/EU/BR 현지화
- 보안 Low 일괄: Polar 서명 `timingSafeEqual`, abuse/track 리밋, legacy SHA-256 폴백 제거, free credit INCR 전환, admin 하위 페이지 layout 가드, `INTERNAL_API_ALLOWED_IPS` 필수화

## 보류 — 국내 진출 시 재개 (사업자등록 이후)

> Toss 트랙 전체. 코드·스키마는 이미 준비돼 있으므로 사업자 개설 후 아래만 실행하면 됨.

1. **Toss 구독 갱신 cron** — billingKey 정기 결제 실행기 (`tossBillingKey`·`currentPeriodEnd` 필드 기존재, 갱신 cron만 추가)
2. **Toss 활성화 갭 수정** — webhook 기준 멱등 구독 생성 (`billing/success/page.tsx` 의존 제거)
3. Toss 취소 시 기간 말까지 active 유지 (`billing/cancel/route.ts:27`)
4. Toss dunning/재시도 플로우 (`renewalAttempts`/`dunningStatus`)
5. KO 가격 페이지·국내 마케팅 재활성화

## 운영 연계

- paid_ads·product_hunt·high_volume_outbound 블럭은 해제 상태. 단 **case study 0건**으로 공개 증거 게시는 계속 차단 — P1-4로 해소.
- 라이브 발사 전 `npm run growth:acquisition:gate` PASS 확인 (P0-2 게이트).
- 진단 원문: `~/.claude/projects/C--Users-ddedi-safedoc-ai/8c67ab5c-.../tool-results/bc7e8w64f.txt`
