# STATUS

## Snapshot

- Project: GloSource AI + K-DEFENSE Validation OS
- Last calibrated: 2026-07-11 22:40 Asia/Seoul
- Current branch: chore/harness-cal-0623
- Head SHA: 8306d94
- Main synced: true — `promote.yml`가 브랜치 push마다 빌드+테스트를 돌리고 통과 시에만 master를 FF → Vercel 배포. 병합은 더 이상 수동 게이트가 아니다.
- Current track: outbound_validation
- Next READY: GLO-EN-DBSEED-EXPAND (저MOQ 실공장 시드 큐레이션). 그 외는 게이트(리드·발송·결제·비공개 분석).

## Last Done Increment

GLO-EN-JSONLD-PRICE @ 8306d94 — 구조화데이터가 폐지된 **$19/$49**를 광고하고 실제 청구는 **$39/$99/$249**였다. 구글이 구매자에게 우리 대신 말해주는 첫 문장이 가격이므로 그게 절반쯤 틀려 있었다. 가격 리터럴이 4벌(랜딩·billing·페이월·JSON-LD) 복제돼 있었고 **아무도 안 보는 사본만** 드리프트했다. 상업적 사실(가격·월쿼터·Polar envKey)을 `app/lib/plans.ts` 단일 소스로 모으고 네 표면 전부 파생하도록 바꿨다(`founder.ts`가 카드+스키마를 먹이는 기존 패턴과 동일). 카피는 표면별 유지, 사실만 공유. contact 티어는 가격 없는 Offer 대신 제외. tsc·lint·test 19/19·build green + 렌더된 `/en` HTML 실검증.

## Current State

- **배포 파이프라인 자동화됨**(2026-07-11, cdaae3d): 브랜치 push → `promote.yml` 빌드+테스트 → 통과 시 master FF → Vercel. 실패하면 master는 안 움직인다. 탈출구 `[no-promote]`는 커밋 **제목 줄**에만 유효.
- 가격은 이제 `app/lib/plans.ts` 한 곳. 재가격 시 그 파일만 고치면 랜딩·billing·페이월·JSON-LD가 함께 움직이고, 단위테스트가 폐지가 재등장을 막는다.
- 신뢰앵커는 EN에만 적용(KO/국내 미변경). 사업자등록번호 미포함(차장님 지시: 국내 사업자등록 보류).
- KPI 전 항목 0 유지. 실제 고객·결제 증거 없음(조작 없음).

## Open Flags

- 사람 입력 대기(비차단): 창업자 LinkedIn URL + 실사진 → `app/lib/founder.ts` 두 필드.
- GLO-EN-PAYHIST 라이브 확인 미완: `npm run growth:payments:dummy`(DATABASE_URL 필요) + Polar 테스트결제 1회 → 게이트.
- 시드 공급사가 대형 ODM 3사뿐 → 저MOQ ICP에게 'Verified' 배지가 붙는 공급사가 부적합(다음 READY).
- 남은 진행 대부분 게이트: 실 ICP 리드, Gmail OAuth, 외부 발송, 결제 확인, 비공개 플랫폼 분석.

## Gates Pending

- GLO-EN-PAYHIST 라이브 결제 확인(더미 DB 테스트 / Polar 테스트결제)
- 실제 아웃바운드 발송 승인 + Gmail OAuth
- 실제 소셜/쇼츠 게시 승인
- 비공개 플랫폼 분석 데이터 접근 승인
- ~~master 병합 승인~~ → `promote.yml`로 자동화(빌드+테스트가 게이트 역할)

## Recent Verification (2026-07-11)

- `npx tsc --noEmit`: exit 0
- `npm run lint`: 0 errors (기존 무관 경고 1건 `_measure-attach.ts`)
- `npm test` (tsx --test): 19/19 pass (plans 7건 신규 포함)
- `npm run build`: exit 0
- **렌더 실검증**(`next start` → `GET /en`): JSON-LD offers = 39/99/249 · 폐지가($19/$49) **0건** · 4개 가격카드 전부 가격/쿼터/CTA 정상 · `/en` 200 · `/en/billing` 302→login(인증게이트 정상)
- `harness-precommit.sh`(sensitive/placeholder/state/lint): clean

## Notes for Next Session

1. 다음 비게이트 READY = GLO-EN-DBSEED-EXPAND(저MOQ 실공장 시드 큐레이션). prod 반영은 DATABASE_URL 게이트지만 큐레이션 자체는 비게이트.
2. 배포는 이제 push로 자동 승격된다 — 별도 병합 요청 불필요. 다만 **실패 시 master가 안 움직인다**는 점이 유일한 안전망이므로 테스트를 계속 실질적으로 유지할 것.
3. 창업자 실사진/LinkedIn 확보 시 `app/lib/founder.ts` 두 필드만 채우면 카드+JSON-LD 동시 반영.
4. 가격 변경 시 `app/lib/plans.ts` 단일 수정 → 4개 표면 자동 반영(테스트가 드리프트 차단).
