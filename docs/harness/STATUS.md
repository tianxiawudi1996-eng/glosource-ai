# STATUS

## Snapshot

- Project: GloSource AI + K-DEFENSE Validation OS
- Last calibrated: 2026-07-12 Asia/Seoul
- Current branch: chore/harness-cal-0623
- Head SHA: b61f5cd
- Main synced: true — `promote.yml`가 브랜치 push마다 빌드+테스트를 돌리고 통과 시에만 master를 FF → Vercel 배포. 병합은 더 이상 수동 게이트가 아니다.
- Current track: outbound_validation
- Head SHA: eed52fd
- Next READY: GLO-FOOD-BIZRNO-REGISTRY(식품 레지스트리 ingest → K-Food 사업자번호를 원장 기반으로). 그 외는 게이트(리드·발송·결제·비공개 분석).

## Last Done Increment (4)

DRIZZLE-MIGRATION-BASELINE @ eed52fd (**prod 이력 정합 완료**) — `db:migrate`가 프로덕션에서 터지는 상태였고, **아무도 안 돌려서 안 터졌을 뿐**이었다. 특히 무서운 건 (2)번: `kr_*` 정부 레지스트리 테이블 8개가 마이그레이션에 아예 없어서, **신규 환경은 제품이 검증에 쓰는 원장 없이 뜬다**. schema.ts를 단일 baseline으로 리셋하되 **그 전에 schema.ts == prod를 컬럼 단위로 확인**했다(어긋난 스키마로 baseline을 깔면 drift를 지우는 게 아니라 축복한다 — 19테이블 전 컬럼 일치). `db:adopt`는 라이브 스키마가 baseline과 다르면 **거부**한다. 실검증: prod에 migrate 2회 정상 통과·스키마 무변경. 재발 방지 테스트가 원래 사고(테이블 추가 후 마이그레이션 누락)를 실제로 잡는다 → 승격 게이트가 master를 막는다.

## Last Done Increment (3)

GLO-EN-SUPPLIER-EVIDENCE @ b61f5cd (**prod 스키마+데이터 반영 완료**) — 레지스트리 대조를 **이름 → 사업자번호**로 전환. 이름 매칭이 샘표 HACCP를 놓친 진범이었다(원장이 공장 단위로 등재). `bizrno` + `bizrno_source`를 저장하는데, **출처를 함께 저장하는 게 핵심**이다: 식약처 원장 7건은 회사명↔번호를 권위 있게 매핑하지만, 식품 9건은 회사가 자사 사이트에 스스로 공개한 번호(국세청 계속사업자 확인 완료)라 근거가 더 약하다 — 둘을 "검증됨"으로 뭉개지 않는다. **제품 이득**: 국세청 실시간 폐업조회가 화장품에만 걸리던 것이 큐레이션 공급사 전체로 확대 → 폐업한 공급사는 배지 대신 red flag. 검증기가 타사 번호 오귀속까지 잡는다. **번호 없는 10건**(식품 7·패션 3)은 조회 불가 — 통과 처리하지 않고 명시.

## Last Done Increment (2)

GLO-SUPPLIER-REVET @ 21d1b79 (**prod 반영 완료**) — 배지가 카테고리마다 다른 뜻이었다. 자율 런이 넣은 20건이 근거 없는 배지를 달고 있었고, 특히 **trustScore 20건 전부가 조작**이었다(78/82/88 = 발견한 인증 조합에 대한 공식이지 실사가 아니다). "NTS-verified"는 인증란에서 HACCP·CGMP 행세를 하고 있었지만 사업자등록이 살아있다는 뜻뿐이다. **HACCP 주장 16건은 전부 진짜였다** — 그건 날조가 아니었고, 샘표는 오히려 원장에 있는데 **놓치고** 있었다(공장명으로 등재돼 정확일치 매칭이 실패). 오소이는 가방·신발 **브랜드**라 배지를 뗐다. K-Fashion은 한국에 의류 제조업 정부 원장이 **없어** 검증이 원천 불가 → 노트에 미검증을 명시(차장님 결정). 기준을 **실행 가능한 코드**로 만들었다: `scripts/verify-curated.ts`가 쓰기 전에 모든 주장을 원장·URL과 대조하고 실패하면 시드를 거부한다.

## Last Done Increment (1)

GLO-EN-DBSEED-EXPAND @ ef082d8 + a4c4b76 (**prod DB 반영 완료**) — 'GloSource Verified' 배지가 대형 ODM 3사에만 붙어, 1,000개 예산의 인디 브랜드를 **주문도 받아주지 않을 공장**으로 안내하고 있었다. 현금화 못 할 신뢰 주장은 배지가 없느니만 못하다. 제품이 공급사를 검증하는 방식 그대로 큐레이션했다: 웹 발굴 → 식약처 제조등록 대조 → CGMP 명단 대조(사업자번호). **레지스트리가 실제로 일을 했다** — 웹에서 "저MOQ 한국 공장"이라 불리는 것 대부분을 탈락시켰고, 특히 최저 MOQ(300개)를 광고하는 라온하세는 제조등록이 없어 배지를 줄 수 없었다(우리 구매자가 빠지는 바로 그 함정). 코스맥스는 2023년 인디 프로그램으로 MOQ가 1만→1,000개로 내려갔는데 기존 노트가 "typically high MOQ"라고 적혀 있어 정작 도우려던 구매자를 쫓아내고 있었다 → 시드를 upsert로 바꿔 정정. 그리고 **시드만으로는 구매자에게 아무것도 안 바뀌었다**: 주입 쿼리에 ORDER BY가 없어 삽입순(대형 ODM)만 노출되고 있었다(a4c4b76에서 MOQ 오름차순으로 수정, prod 실검증).

## Current State

- **배포 파이프라인 자동화됨**(2026-07-11, cdaae3d): 브랜치 push → `promote.yml` 빌드+테스트 → 통과 시 master FF → Vercel. 실패하면 master는 안 움직인다. 탈출구 `[no-promote]`는 커밋 **제목 줄**에만 유효.
- 가격은 이제 `app/lib/plans.ts` 한 곳. 재가격 시 그 파일만 고치면 랜딩·billing·페이월·JSON-LD가 함께 움직이고, 단위테스트가 폐지가 재등장을 막는다.
- 신뢰앵커는 EN에만 적용(KO/국내 미변경). 사업자등록번호 미포함(차장님 지시: 국내 사업자등록 보류).
- KPI 전 항목 0 유지. 실제 고객·결제 증거 없음(조작 없음).

## Open Flags

- 사람 입력 대기(비차단): 창업자 LinkedIn URL + 실사진 → `app/lib/founder.ts` 두 필드.
- GLO-EN-PAYHIST 라이브 확인 미완: `npm run growth:payments:dummy`(DATABASE_URL 필요) + Polar 테스트결제 1회 → 게이트.
- ✅ `npm run db:migrate` 정상화(eed52fd). 스키마 변경 절차: `schema.ts` 수정 → `npm run db:generate` → 커밋. 마이그레이션을 안 만들면 **테스트가 실패하고 승격이 막힌다**(의도된 동작). 기존 DB 신규 편입은 `npm run db:adopt`.
- **자율 런 산출물은 신뢰하지 말 것**: `harness:curate-fallback`이 넣은 20건이 trustScore를 전부 지어냈고 가짜 인증 라벨을 달았다. 앞으로 큐레이션은 `scripts/curated-suppliers.ts` + `verify-curated.ts`를 통과해야만 DB에 들어간다.
- K-Fashion 3건은 **원천적으로 검증 불가**(정부 원장 부재)라 배지 의미가 약하다. 의류 제조 원장이 생기거나 대안 근거(예: 수출입 실적)가 확보되기 전까지는 노트의 미검증 고지가 유일한 방어선.
- 남은 진행 대부분 게이트: 실 ICP 리드, Gmail OAuth, 외부 발송, 결제 확인, 비공개 플랫폼 분석.

## Gates Pending

- GLO-EN-PAYHIST 라이브 결제 확인(더미 DB 테스트 / Polar 테스트결제)
- 실제 아웃바운드 발송 승인 + Gmail OAuth
- 실제 소셜/쇼츠 게시 승인
- 비공개 플랫폼 분석 데이터 접근 승인
- ~~master 병합 승인~~ → `promote.yml`로 자동화(빌드+테스트가 게이트 역할)

## Recent Verification (2026-07-12, GLO-EN-DBSEED-EXPAND)

- 식약처 레지스트리 대조(prod, 읽기): 나우코스·한국코스모·코스메디크·씨티케이 모두 `화장품제조` 등록 확인(사업자번호·공장주소). 라온하세 0건 → 탈락.
- CGMP 명단 대조(사업자번호): 코스맥스·한국콜마·코스메카·나우코스·한국코스모 ✅ / 코스메디크·씨티케이 ✗ → 인증 필드에 그대로 반영(과장 0).
- 시드 실행(prod, 승인 후): 4 insert + 3 update, 재실행 시 7 unchanged(멱등).
- 주입 순서 prod 검증: serum 쿼리 → COSMAX(1,000) + COSMEDIQUE(1,000) 주입(수정 전엔 Kolmar[MOQ 미공개]가 노출됐을 것).
- `npm test` 25/25 (큐레이션 정직성 불변식 6건 신규), tsc·lint 0 errors·build green.

## Earlier Verification (2026-07-11)

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
