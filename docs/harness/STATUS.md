# STATUS

## Snapshot

- Project: GloSource AI + K-DEFENSE Validation OS
- Last calibrated: 2026-07-09 01:10 Asia/Seoul
- Current branch: chore/harness-cal-0623
- Head SHA: 406b411
- Main synced: false (master == origin/master == d401aa3; branch ~50 commits ahead, carries all live /en product work)
- Current track: outbound_validation
- Next READY: GLO-EN-TRUSTANCHOR (신뢰앵커 — 일부 사람 입력 필요). 그 외 진행은 게이트(리드·발송·병합·배포·결제).

## Last Done Increment

GLO-EN-PAYHIST @ 406b411 — Polar `order.*` 이벤트 결제 기록을 구현해 `/en/billing`의 "No payment history yet." 문제를 해소했다. 결제 금액은 Polar가 subscription이 아니라 `order.*`로 보내는데 웹훅이 이를 무시하고 있었다. `app/lib/polarOrder.ts`(의존성 없는 순수 매핑, 단위테스트 4건) + 웹훅 `order.*` 멱등 upsert(주문 id 기준). subscription 생명주기 처리는 그대로. 전 게이트 green(tsc·lint·test 9/9·build). 직전 증분 GLO-HARDEN(a1e8f62)은 테스트 가능한 라우트 핸들러 분리·`xlsx` 제거·`next` 15.5.20·tsx 테스트 러너.

## Current State

- 브랜치 `chore/harness-cal-0623`가 실 작업 라인이다: master 대비 ~50 커밋 앞서 있고 라이브 `/en` 제품 전부 + GLO-HARDEN + GLO-EN-PAYHIST 포함. origin/chore/harness-cal-0623와 동기화(push 완료). master로는 미병합.
- STATE가 이전(2026-06-23)엔 master/5501951로 기록돼 stale했으나 이번에 repo 진실(chore/harness-cal-0623 @ 406b411)로 재보정했다.
- 결제 내역 포착 경로가 코드상 end-to-end 완성됨: Polar `order.*` → `payments` → `/en/billing` 내역 표. 라이브 확인은 게이트(아래).
- KPI 전 항목 0 유지. 실제 고객·결제 증거 없음(예시/더미 제외, 조작 없음).
- 작업 트리에는 여전히 별개의 /en 디자인 변경(6파일)과 ops/tools 산출물이 미커밋으로 남아 있다 — 이번 증분과 무관, 덮어쓰지 않음.

## Open Flags

- 작업 트리에 사용자/자동화 미커밋 변경 다수 → 덮어쓰기 금지, `git add .` 금지. 명시 파일만 stage.
- GLO-EN-PAYHIST 라이브 확인 미완: `npm run growth:payments:dummy`(DATABASE_URL + dev 서버 필요, 실 Neon 기록) + Polar 테스트결제 1회 → 둘 다 게이트.
- 남은 진행 대부분 게이트: 실 ICP 리드, Gmail OAuth, 외부 발송, master 병합, Vercel 배포.
- K-DEFENSE 비공개 분석 접근(KDE-DATA-001) 미정 → KDE READY 없음.

## Gates Pending

- master 병합 승인 + Vercel 배포 승인 (브랜치 ~50 커밋 미병합)
- GLO-EN-PAYHIST 라이브 결제 확인(더미 DB 테스트 / Polar 테스트결제)
- 실제 아웃바운드 발송 승인 + Gmail OAuth
- 실제 소셜/쇼츠 게시 승인
- 비공개 플랫폼 분석 데이터 접근 승인

## Recent Verification (2026-07-09)

- `npx tsc --noEmit`: exit 0
- `npm run lint`: 0 errors (기존 무관 경고 1건 `_measure-attach.ts`)
- `npm test` (tsx --test): 9/9 pass (polar-order 4건 신규 포함)
- `npm run build`: exit 0, `/api/polar/webhook` 등록 확인
- `check-state-json` / `check-harness-placeholders` / `check-sensitive-strings`: clean
- `git diff --check`: clean (CRLF 경고만)

## Notes for Next Session

1. 다음 비게이트 READY = GLO-EN-TRUSTANCHOR(신뢰앵커). 단 실명/사진/LinkedIn/사업자등록번호는 사람 입력 필요분이 있으니 확보 가능한 실데이터만 반영하고 나머지는 `TODO_USER_INPUT:`로 표기(날조 금지).
2. GLO-EN-PAYHIST를 실서비스에 반영하려면 master 병합 + Vercel 배포(게이트) 후 Polar 테스트결제로 end-to-end 확인.
3. 사용자 미커밋 변경(디자인 6파일·ops/tools)은 계속 덮어쓰지 않는다.
