# SEO Changelog — GloSource AI

> 자비스 자율 /loop 작업 누적 기록 (차장님 위임 기반).
> 검색·소셜·보안 신호를 단계별 점진 강화.

---

## 2026-05-27 (Tue 새벽 자율 진행) — 자비스 v5.2 /loop iter 1~12

차장님 5/26 22:35 위임 → 새벽 자율 12 commit 누적. 모든 변경은 master push 완료.

### SEO 메타·구조 (8 iter)

| iter | commit | 영역 | 변경 |
|---|---|---|---|
| 1 | `8cd1bac` | Schema.org | JSON-LD: Organization + WebSite + SoftwareApplication 3종 inline. 가격·이메일·로고 명시. |
| 2 | `5c5095d` | Sitemap | `/en/billing` 제거 (robots disallow와 충돌), `/en/support` 추가. |
| 3 | `f91a250` | hreflang | `/en` root에 `en-US` + `x-default` languages 명시. 한국어 ko-KR placeholder. |
| 4 | `bd18e32` | hreflang | about·case-studies·blog 자식 페이지 일관성. |
| 5 | `00c1abf` | metadata | `metadataBase` URL (Next.js 권장) + keywords 10건 + authors/creator/publisher + og:image explicit + twitter:creator. |
| 7 | `1bb71cd` | keywords | 자식 페이지 (about·case-studies·blog) 페이지별 맞춤 keywords (각 9~10건). |
| 8 | `d96f2c7` | Schema.org | `JsonLdBreadcrumb` 컴포넌트 + 자식 3 페이지 적용. Home > About / Examples / Blog. |
| 9 | `7893bec` | OG | 자식 페이지 (about·case-studies·blog) OG + twitter card 페이지별 맞춤. |

### UX·디바이스 (1 iter)

| iter | commit | 영역 | 변경 |
|---|---|---|---|
| 6 | `9ec5bec` | viewport | Next.js 14+ 별도 export const viewport. themeColor 라이트/다크 (#FFFFFF / #0D1B2A). maxScale 5 (접근성). colorScheme: light dark. |

### 사용자 경험·404 (1 iter)

| iter | commit | 영역 | 변경 |
|---|---|---|---|
| 10 | `4690bed` | 404 | `/en/not-found.tsx` 신규. 브랜드 일관성 + CTA 2개 (Home / Blog) + noindex robots. 이메일 contact. |

### 보안·robots (2 iter)

| iter | commit | 영역 | 변경 |
|---|---|---|---|
| 11 | `40d28e1` | security headers | HSTS (max-age 2년 + preload), Cross-Origin-Opener-Policy: same-origin, X-DNS-Prefetch-Control: on. |
| 12 | `585a32c` | robots.ts | disallow 6 → 11 확장 (`/en/dashboard`, `/en/billing`, `/en/reset-password`, `/auth/`, `/.well-known/`). GPTBot·CCBot 명시 차단 (LLM 무단 학습 방지). host 디렉티브 추가. |

### 문서·PWA·Article (3 iter)

| iter | commit | 영역 | 변경 |
|---|---|---|---|
| 13 | `cb7eeaa` | docs | `docs/SEO_CHANGELOG.md` 신규 — iter 1~12 종합 기록 (이 문서). |
| 14 | `13684f1` | PWA | `app/manifest.ts` — Add to Home Screen + iOS Safari 호환. standalone display, 브랜드 색, 카테고리 (business/productivity/shopping). |
| 15 | `e2f1a3e` | Schema.org | blog post `[slug]/page.tsx`에 BlogPosting + BreadcrumbList 추가. headline, author, publisher, datePublished, articleSection, timeRequired, inLanguage. |

---

## 측정 기대 효과

### 즉시 (배포 후)
- ✅ Lighthouse SEO 점수 ↑ (`metadataBase`, viewport, themeColor, hreflang, structured data)
- ✅ Lighthouse 보안 점수 ↑ (HSTS, COOP, CSP 기존)
- ✅ Mozilla Observatory A 또는 A+ 가능
- ✅ Twitter/X·Slack·LinkedIn 공유 카드 정확 (자식 페이지까지)
- ✅ Google 리치 결과: 가격·BreadcrumbList·sitelinks search box·knowledge panel 후보

### 1~4주 (인덱싱 반영)
- Google Search Console에 hreflang 통합 인식
- 자식 페이지 SERP CTR 상승 (breadcrumb·풍부한 메타)
- AI 학습 크롤러 차단 (GPTBot·CCBot 트래픽 0)

### E-E-A-T 신호 강화
- Organization JSON-LD (logo, contactPoint, sameAs)
- authors/creator/publisher 명시
- 자식 페이지 일관된 도메인 신뢰

---

## 가드레일 준수

| 가드레일 | 적용 |
|---|---|
| 차장님 결정 필요 작업 우회 | ✅ LinkedIn URL (sameAs placeholder), Polar 토큰, case-study publication 미진행 |
| 회사 영역 분리 | ✅ safedoc-ai = GloSource 개인 영역만. mbkim-planet·visionlab-coder 무관 |
| 비밀 노출 0 | ✅ API key·token·credential 없음 |
| 외부 API 비용 0 | ✅ 신규 구독·결제 0건 (#20) |
| 비파괴 | ✅ 모든 변경 idempotent + reversible (commit revert 가능) |

---

## 미진행 (차장님 결정 필요)

- LinkedIn 공식 URL → `JsonLdGloSource.tsx`의 `sameAs[]`에 추가
- Polar Organization Access Token → `payment-health` cron 정상화
- case-study publication → `acquisition-readiness` blockedAction 해제
- Vercel 배포 검증 (Lighthouse 실측, 다음 deploy 후)

---

## 누적 통계 (iter 1~15)

- **16 commits** master push (이 문서 갱신 commit 포함)
- 누적 변경 ~530 lines (insertions)
- 새 컴포넌트 2건: `JsonLdGloSource.tsx`, `JsonLdBreadcrumb.tsx`
- 새 페이지 2건: `app/en/not-found.tsx`, `app/manifest.ts`
- 새 문서 1건: `docs/SEO_CHANGELOG.md` (이 문서)
- 모든 변경 비파괴·idempotent

## 차장님 06:00 알람 직전 자율 종료

5/26 22:35 위임 → 5/27 05:30경까지 7시간 자율 작업. 16 commit 누적.

차장님 일어나면 한 줄로 종합 확인 가능:
```
cd C:\Users\ddedi\safedoc-ai && git log --oneline -20
```

또는 이 문서 정독:
```
cat docs/SEO_CHANGELOG.md
```

---

*— 자비스 v5.2 /loop 자율 작업 · 2026-05-27 새벽 · Claude Opus 4.7 (1M context)*
*— 차장님 30분 검토 한도 활용 위해 압축된 형식*
