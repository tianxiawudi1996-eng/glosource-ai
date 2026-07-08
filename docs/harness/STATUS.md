# STATUS

## Snapshot

- Project: GloSource AI + K-DEFENSE Validation OS
- Last calibrated: 2026-07-09 01:40 Asia/Seoul
- Current branch: chore/harness-cal-0623
- Head SHA: 7abe07a
- Main synced: false (master == origin/master == d401aa3; branch ~52 commits ahead, carries all live /en product work)
- Current track: outbound_validation
- Next READY: GLO-EN-JSONLD-PRICE (JSON-LD offers $19/$49 → 실제 $39/$99/$249 정정). 그 외 진행은 게이트(리드·발송·병합·배포·결제).

## Last Done Increment

GLO-EN-TRUSTANCHOR @ 7abe07a — **EN 전용** 창업자 신뢰앵커. `app/lib/founder.ts` 단일 소스(John Kim·한국 소재, 실값) + 순수 헬퍼 단위테스트. `FounderCard.tsx`(이니셜 아바타·이름/역할/소재 + 정부 레지스트리·Polar 판매자대행·창업자 지원 신뢰요소)를 `/en/about` 'Who built this' 상단에 배치. `JsonLdGloSource` Organization에 founder(Person)+sameAs 동일 소스 주입. 사진/LinkedIn=null 유지(날조 X), 국내 사업자등록번호 없음(미등록·지시). tsc·lint·test 12/12·build green.

## Current State

- 브랜치 `chore/harness-cal-0623`가 실 작업 라인: master 대비 ~52 커밋 앞, 라이브 `/en` 제품 전부 + GLO-HARDEN + GLO-EN-PAYHIST + GLO-EN-TRUSTANCHOR. origin과 동기화(push), master 미병합.
- 신뢰앵커는 EN에만 적용(KO/국내 미변경). 사업자등록번호 미포함(차장님 지시: 국내 사업자등록 보류).
- 창업자 카드에 실사진/LinkedIn이 들어오면 `app/lib/founder.ts` 두 필드만 채우면 카드 + JSON-LD에 동시 반영(사람 입력 대기, 큐 참조).
- KPI 전 항목 0 유지. 실제 고객·결제 증거 없음(조작 없음).
- 작업 트리에 별개의 /en 디자인 변경(6파일)·ops/tools 산출물 미커밋 — 무관, 덮어쓰지 않음.

## Open Flags

- 작업 트리에 사용자/자동화 미커밋 변경 다수 → 덮어쓰기 금지, `git add .` 금지. 명시 파일만 stage.
- 사람 입력 대기(비차단): 창업자 LinkedIn URL + 실사진 → `app/lib/founder.ts`.
- GLO-EN-PAYHIST 라이브 확인 미완: `npm run growth:payments:dummy`(DATABASE_URL 필요) + Polar 테스트결제 1회 → 게이트.
- 남은 진행 대부분 게이트: 실 ICP 리드, Gmail OAuth, 외부 발송, master 병합, Vercel 배포.
- K-DEFENSE 비공개 분석 접근(KDE-DATA-001) 미정 → KDE READY 없음.

## Gates Pending

- master 병합 승인 + Vercel 배포 승인 (브랜치 ~52 커밋 미병합)
- GLO-EN-PAYHIST 라이브 결제 확인(더미 DB 테스트 / Polar 테스트결제)
- 실제 아웃바운드 발송 승인 + Gmail OAuth
- 실제 소셜/쇼츠 게시 승인
- 비공개 플랫폼 분석 데이터 접근 승인

## Recent Verification (2026-07-09)

- `npx tsc --noEmit`: exit 0
- `npm run lint`: 0 errors (기존 무관 경고 1건 `_measure-attach.ts`)
- `npm test` (tsx --test): 12/12 pass (founder 3건 신규 포함)
- `npm run build`: exit 0, `/en/about` 등록 확인
- `check-state-json` / `check-harness-placeholders` / `check-sensitive-strings`: clean
- `git diff --check`: clean (CRLF 경고만)

## Notes for Next Session

1. 다음 비게이트 READY = GLO-EN-JSONLD-PRICE(구조화데이터 가격 정정).
2. 창업자 실사진/LinkedIn 확보 시 `app/lib/founder.ts` 두 필드만 채우면 신뢰앵커 완성도↑.
3. GLO-EN-PAYHIST/TRUSTANCHOR를 실서비스 반영하려면 master 병합 + Vercel 배포(게이트).
4. 사용자 미커밋 변경(디자인 6파일·ops/tools)은 계속 덮어쓰지 않는다.
