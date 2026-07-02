# GloSource AI 오피스 봇 명령문
# (H: 드라이브 마케팅 데이터 → 블로그 발행 자동화)

> 이 명령문을 사무실 H: 드라이브 데스크탑의 Claude Code에 그대로 붙여넣어 실행하세요.
> 집 C: 드라이브 파일에 직접 접근하지 않습니다. GitHub과 Vercel API만 사용합니다.

---

```
[GloSource AI — 오피스 마케팅 자동화 블로그 발행]

## 환경 구분 (반드시 숙지)

- 이 명령은 **사무실 H: 드라이브 PC**에서 실행됨
- GloSource AI 코드는 GitHub에 있음: https://github.com/tianxiawudi1996-eng/glosource-ai
- 집 C: 드라이브는 이 PC에서 접근 불가 — 직접 파일 참조 금지
- 웹사이트 배포: https://glosourceai.com (Next.js 15, Vercel 자동 배포)
- 블로그 발행 API: https://glosourceai.com/api/admin/blog-posts

---

## Step 0: 사전 확인

1. 환경변수 `ADMIN_PUBLISH_SECRET` 값을 준비
   (Vercel 대시보드 → 프로젝트 → Settings → Environment Variables에서 확인)
2. H: 드라이브에 읽을 마케팅 데이터 경로 확인

---

## Step 1: GitHub에서 코드 구조 파악

GitHub에서 다음 파일들의 내용을 WebFetch 또는 curl로 확인:

### BlogPost 타입 (참조용)
```
URL: https://raw.githubusercontent.com/tianxiawudi1996-eng/glosource-ai/master/app/lib/blog-posts.ts
```

확인 내용:
- `BlogPost` 인터페이스 필드 (slug, title, description, publishedAt, readingTimeMin, category, content)
- 기존 발행된 포스트 slug 목록 (중복 발행 방지용):
  - how-to-find-korean-cosmetics-manufacturers
  - ec21-vs-buykorea-vs-tradekorea-comparison
  - korean-supplier-rfq-email-template

---

## Step 2: H: 드라이브 마케팅 데이터 분석

H: 드라이브에서 읽을 데이터:
- `H:\GloSource\` 또는 Codex가 생성한 마케팅 데이터 폴더 탐색
- 바이어 유형, 아웃리치 스크립트, 자주 묻는 질문, 소싱 카테고리 파악

핵심 추출 항목:
1. 타겟 바이어가 가장 많이 묻는 제품 카테고리 (K-beauty? K-food? 산업부품?)
2. 자주 나오는 소싱 관련 질문 (MOQ? 인증? 결제조건?)
3. 아웃리치 스크립트에서 공통 통증 포인트

---

## Step 3: SEO 블로그 포스트 2개 생성

### 타겟 독자
- 해외 바이어 (영어권), 한국 제품 소싱 관심자
- K-beauty/K-food/K-fashion 수입업자, 프라이빗 레이블 창업자

### SEO 키워드 타겟
- "Korean supplier", "K-beauty sourcing", "Korean manufacturer", "source from Korea"
- "MFDS certification", "HACCP Korea", "Korean OEM", "Korean wholesale"

### 포스트 요구사항
각 포스트당:
- slug: URL-safe 영어 소문자 (예: "korean-food-supplier-guide")
- title: SEO 최적화 60자 이내 영어 제목
- description: 150자 이내 요약
- category: "Sourcing Guide" / "Platform Guide" / "Templates" / "Compliance" 중 1개
- publishedAt: "2026-05-16" 형식
- readingTimeMin: 예상 읽기 시간 (정수)
- content: HTML 형식 본문 (800~1200 단어)
  - h2, h3 태그 사용
  - 실용적 팁 5개 이상
  - GloSource AI 언급 1~2곳 (자연스럽게)
  - 투자 권유 표현 절대 금지

### 추천 주제 (H: 드라이브 데이터 기반으로 선택)
옵션 A: Korean food manufacturer guide (HACCP, MOQ, 수출 프로세스)
옵션 B: Korean fashion OEM guide (Dongdaemun, 최소 수량, 납기)
옵션 C: How to verify Korean supplier certifications (MFDS, HACCP, KC, KS)
옵션 D: Korean industrial parts sourcing guide (기계, 자동차 부품, KC/KS)

---

## Step 4: API로 블로그 발행

발행 API 엔드포인트:
```
POST https://glosourceai.com/api/admin/blog-posts
Content-Type: application/json
Authorization: Bearer {ADMIN_PUBLISH_SECRET 값}
```

요청 JSON 형식:
```json
{
  "slug": "your-post-slug",
  "title": "Your Post Title",
  "description": "150자 이내 요약",
  "publishedAt": "2026-05-16",
  "readingTimeMin": 6,
  "category": "Sourcing Guide",
  "content": "<h2>Section heading</h2><p>Content...</p>"
}
```

성공 응답: `{"success": true, "slug": "your-post-slug"}`
실패 응답: `{"error": "메시지"}` → 오류 내용 출력 후 중단

각 포스트 발행 후:
- 발행 완료 slug 확인
- https://glosourceai.com/en/blog/{slug} 에서 확인 가능

---

## Step 5: 발행 확인 & 리포트

각 포스트 발행 완료 후:

1. API 응답 status 확인 (200 = 성공)
2. curl 또는 WebFetch로 발행된 페이지 접근 가능 확인:
   `GET https://glosourceai.com/en/blog/{slug}`
3. 리포트 출력:
   - 발행 성공: [slug] — [title]
   - 발행 실패: [slug] — [오류 메시지]

---

## 주의사항

1. **집 C: 드라이브 경로 참조 금지** — C:\Users\ddedi\... 같은 경로는 이 PC에 없음
2. **코드 수정 금지** — API 호출만 할 것 (코드 변경은 집 PC 담당)
3. **기존 slug 중복 발행 금지** — Step 1에서 확인한 slug 재사용 불가
4. **투자 권유 금지** — "확실한 수익", "보장", "무조건" 등 표현 금지
5. **발행 전 content HTML 검토** — 깨진 태그, 한국어 섞임 여부 확인

---

## 빠른 테스트 (발행 전 API 연결 확인)

```bash
curl -X GET https://glosourceai.com/api/admin/blog-posts \
  -H "Authorization: Bearer {ADMIN_PUBLISH_SECRET}"
```

성공 시: `{"posts": [...]}` 반환
실패 시: 오류 메시지 → ADMIN_PUBLISH_SECRET 값 재확인
```

---

## Polar API 403 수동 수정 필요 (별도 작업)

주간 리포트에서 발견된 심각 이슈:
```
Critical: POLAR_STARTER_PRODUCT_ID cannot be read with POLAR_ACCESS_TOKEN. Status: 403
Critical: POLAR_PRO_PRODUCT_ID cannot be read with POLAR_ACCESS_TOKEN. Status: 403
Critical: POLAR_AGENCY_PRODUCT_ID cannot be read with POLAR_ACCESS_TOKEN. Status: 403
```

**수동 수정 방법** (Vision 씨가 Polar 대시보드에서 직접 처리):
1. https://polar.sh 로그인
2. Settings → Access Tokens → 기존 토큰 확인
3. 새 토큰 발급:
   - 이름: `glosource-vercel-prod`
   - Scopes: `products:read`, `subscriptions:read`, `subscriptions:write`, `orders:read`
4. 새 토큰 값 복사
5. Vercel 대시보드 → glosource-ai 프로젝트 → Settings → Environment Variables
   - `POLAR_ACCESS_TOKEN` 값을 새 토큰으로 업데이트
6. 다음 배포 시 자동 적용 (또는 Vercel에서 Redeploy)

이 수정 없이는 Polar.sh 유료 구독 API 연동이 동작하지 않음.
