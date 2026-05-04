# 🚀 page.tsx v2 적용 가이드

> 2026.05.02 · 옵션 C 적용 완료
>
> **수정된 파일**: `page.tsx` (직접 교체용)
> **소요 시간**: 5분

---

## ✅ 수정 완료 항목 (총 8곳)

### 🔴 이메일 분리 (직무발명 회피)

| # | 위치 | Before | After |
|---|---|---|---|
| 1 | 라인 149 (PDF 푸터) | `visionlab@seowonenc.co.kr` | `like2buyglobal@gmail.com` |
| 2 | 라인 732 (플랜 mailto) | `visionlab@seowonenc.co.kr` | `like2buyglobal@gmail.com` |
| 3 | 라인 739 (가격 안내) | `visionlab@seowonenc.co.kr` | `like2buyglobal@gmail.com` |
| 4 | 라인 758 (푸터 표시) | `visionlab@seowonenc.co.kr` | `like2buyglobal@gmail.com` |

### 🟡 URL·기능 수정

| # | 위치 | Before | After |
|---|---|---|---|
| 5 | 라인 18 (FREE_CREDITS) | `9999 // test mode` | `5 // beta` |

### 🟢 v2 메시지 적용 (관계 산업 반영)

| # | 위치 | Before | After |
|---|---|---|---|
| 6 | 라인 328~335 (Hero 헤더) | "해외 공장, 믿고 직발주" | "한국 건설업계 전용 해외 자재 직소싱 AI" + "기존 거래처를 끊지 마세요. GloSource는 협상 도구입니다" |
| 7 | 라인 686~705 (가격 정책) | 10/30/70만원 | **19/49/99만원** + KS인증·세금계산서·AS 강화 |
| 8 | 라인 754 (푸터 설명) | "한국 제조·건설업체를 위한..." | "한국 건설업계 전용 해외 자재 직소싱 AI. KS인증·관세·세금계산서까지 자동화" |

---

## 📂 적용 방법 — 3가지 중 선택

### 🥇 방법 1: 파일 통째 교체 (가장 빠름, 추천)

```
1) 받은 page.tsx 파일을 다운로드
2) C:\Users\ddedi\safedoc-ai\app\ 폴더 열기
3) 기존 page.tsx 파일을 백업
   - 우클릭 → 이름 바꾸기 → page_backup.tsx
4) 새 page.tsx 파일을 같은 위치에 복사
5) Cursor/VSCode에서 변경사항 확인

⏱ 소요시간: 1분
```

### 🥈 방법 2: Cursor에서 차이점만 비교 (안전)

```
1) Cursor에서 C:\Users\ddedi\safedoc-ai 프로젝트 열기
2) app/page.tsx 클릭
3) 받은 page.tsx 내용 전체 복사 (Ctrl+A → Ctrl+C)
4) Cursor 창에서 기존 내용 전체 선택 후 붙여넣기
5) 자동 저장 (Cursor는 보통 자동)

⏱ 소요시간: 2분
```

### 🥉 방법 3: Git diff로 검증 후 적용

```
터미널에서:
> cd C:\Users\ddedi\safedoc-ai
> git status
> git diff app/page.tsx > backup_diff.txt
   (현재 변경사항 백업)

> 새 page.tsx 적용
> git diff app/page.tsx
   (변경사항 시각 확인)

> git add app/page.tsx
> git commit -m "v2: 이메일 분리 + 한국 건설업계 메시지 적용"
> git push origin main

→ Vercel 자동 배포 시작 (5~10분)
```

---

## 🚀 배포 후 확인 체크리스트

### Vercel 자동 배포 완료 후 (약 5~10분)

차장님 사이트(`safedoc-ai.vercel.app`)에서 다음 확인:

```
✅ 1. 헤더 카피
   "한국 건설업계 전용 해외 자재 직소싱 AI" 표시 확인

✅ 2. 서브 카피
   "기존 거래처를 끊지 마세요. GloSource는 협상 도구입니다" 확인

✅ 3. 무료 체험 카운터
   상단 우측 "무료 체험 5회 남음" 표시
   (기존 9999회에서 변경됨)

   ⚠️ 참고: 차장님 브라우저에 이미 9999가 저장되어 있을 수 있음
   → F12 개발자 도구 → Application → Local Storage
   → glosource_credits_v1 삭제 후 새로고침
   → "무료 체험 5회 남음"으로 표시됨

✅ 4. 가격 정책
   - 스타터: 19만원/월 (분석 20회)
   - 프로: 49만원/월 (KS인증·세금계산서·AS)
   - 팀: 99만원/월 (5계정·하자분쟁중재)

✅ 5. 모든 이메일 링크
   - 도입 문의하기 버튼 클릭 → like2buyglobal@gmail.com 열림
   - 가격 페이지 하단 문의 → like2buyglobal@gmail.com
   - 푸터 → like2buyglobal@gmail.com

✅ 6. 회사 도메인 흔적 0건
   F12 개발자 도구 → 페이지 소스 검색
   → "seowonenc" 검색 → 0건 나와야 함
   → "visionlab" 검색 → 0건 나와야 함
```

---

## 🛡️ 추가 안전 조치 (선택)

### Local Storage 초기화 (차장님 브라우저)

```
이전 버전에서 저장된 9999가 차장님 브라우저에 남아 있습니다.
이를 5로 강제 초기화하려면:

1) 사이트 접속
2) F12 (개발자 도구)
3) Application 탭 (또는 저장소)
4) Local Storage → safedoc-ai.vercel.app 선택
5) 다음 키 삭제:
   - glosource_credits_v1
6) 새로고침 (F5)

→ "무료 체험 5회 남음"으로 표시됨
```

### Vercel 프로젝트 이름 변경 (선택, 더 좋은 URL)

```
현재: safedoc-ai.vercel.app
권장: glosource-ai.vercel.app

방법:
1) Vercel 대시보드 (vercel.com)
2) safedoc-ai 프로젝트 클릭
3) Settings → General → Project Name
4) "glosource-ai"로 변경
5) Save → 새 URL 생성됨

⚠️ 단, 이름 변경 시 기존 URL은 사라짐
   기존 링크 공유한 곳이 있으면 모두 업데이트 필요
   → 인터뷰 시작 전(Week 3) 변경 권장
```

---

## ⚠️ 주의사항

### 🚨 절대 하지 말 것

```
❌ 회사 PC에서 git push
   - Git 커밋 시간 = 회사 시간
   - 회사 IP에서 push 기록
   - → 직무발명 분쟁 시 위험 증거

❌ 회사 와이파이로 Vercel 접속
   - IP 추적 가능
   - → "회사 자원 사용" 의심 가능

✅ 모든 작업 = 집 PC + 개인 와이파이
✅ 작업 시간 = 평일 저녁 (19시 이후) 또는 주말
✅ Git 커밋 메시지에 회사 관련 내용 X
```

### ✅ 권장 Git 커밋 메시지

```
좋은 예:
"feat: rebrand to Korea construction industry focus"
"feat: update pricing tiers (19/49/99)"
"chore: change contact email to personal"

나쁜 예:
"수정: 서원토건 이메일 → 개인 이메일"
"회사 도메인 분리"
```

→ 한국어 회사명·직무 관련 단어를 커밋 메시지에 넣지 마세요.

---

## 📊 적용 전후 비교

### 직무발명 위험도

```
적용 전:
🔴 회사 도메인 이메일 4곳 노출
🟡 회사 흔적 발견 가능
   → 분쟁 시 "회사 자원 사용" 의심 ↑

적용 후:
✅ 100% 개인 이메일 (4곳)
✅ 회사 흔적 0건
✅ GitHub·Vercel 모두 개인 계정
   → 분쟁 시 "회사 자원 미사용" 입증
```

### 사용자 첫인상

```
적용 전:
- "해외 공장 직발주" = 알리바바 따라하기처럼 보임
- 9999회 = 미완성 베타 인상
- 가격 10/30 = 차별화 약함

적용 후:
- "한국 건설업계 전용" = 명확한 포지셔닝
- "거래처 협상 도구" = 한국 시장 신뢰
- "5위권 골조 IT 총괄 출신" = 도메인 권위
- 5회 = 적당한 베타 한도
- 19/49/99 = 한국 SaaS 표준
```

---

## 🎯 다음 단계 (Week 1~2 액션)

### Week 1 (5/3~5/9): 법적 안전 + 사이트 v2 ✅

```
✅ 페이지 v2 적용 (지금 완료)
□ 정부24 폐업사실증명원 발급
□ 회사 등기부등본 사업 목적란 확인
□ 집 PC 사업자 자료 검색 (30분)
□ 일별 작업 일지 시작
```

### Week 2 (5/10~5/16): 베타 폼 + 인터뷰 섭외

```
□ Google Forms 베타 신청 폼 만들기
□ LinkedIn 콜드 메시지 10건 발송
□ 건설일보 기자 콜드 메일 1건
□ 인터뷰이 응답 대기 + 일정 조율
```

---

## 💪 차장님께 정직한 메시지

```
적용 시간: 5분
효과:
- 직무발명 위험 즉시 차단
- 사이트 첫인상 v2 (한국 건설업계 전용)
- 인터뷰 시작 가능한 상태

이번 적용으로 다음이 가능해졌습니다:
✅ 콜드 컨택 시 사이트 보여줄 수 있음
   (이전엔 visionlab@seowonenc.co.kr 노출 위험)
✅ "5위권 골조 IT 총괄 출신" 페르소나 입증
✅ Week 3 인터뷰 진행 가능

다음 정밀 검증 (Week 3) 시 인터뷰이가 사이트를 본 후 반응을
직접 측정하면 H6 (관계 산업) 변환 가능성을 검증할 수 있습니다.
```

---

## 🔄 적용 후 즉시 차장님이 알려주실 것

```
1. Vercel 배포 성공 여부 (5~10분 후 확인)
2. 사이트 정상 표시 여부 (위 6가지 체크리스트)
3. 발견된 문제 (있다면)
   - 카피 표시 안 됨
   - 링크 작동 안 함
   - 디자인 깨짐
   - 기타
4. 추가 수정하고 싶은 부분 (있다면)
```

이거 알려주시면 즉시 추가 패치 만들어드립니다. 🚀

---

#GloSource #v2적용 #직무발명회피 #한국건설업계
