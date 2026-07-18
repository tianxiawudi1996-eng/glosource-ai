# REPORT — GLO-FOOD-BIZRNO-REGISTRY

## Summary

식품 인허가 원장에 사업자번호가 있다는 잘못된 전제를 폐기하고, 사업자번호를 실제 제공하는 OpenDART 원장 연결을 fail-closed 방식으로 구현했다.

## 1. Task

- ID: GLO-FOOD-BIZRNO-REGISTRY
- Name: K-Food 사업자번호 원장 근거 강화
- Selected from: `docs/harness/TASK_QUEUE.md`

## 2. 오늘 완료한 일

- `kr_dart_firms` 스키마와 재시도 안전 마이그레이션 추가.
- OpenDART corp-code/company-profile 파서, 법인접미사 정규화, 유일 exact match, 번호 충돌 차단.
- 사업자번호가 비어 있는 K-Food 7곳만 대상으로 하는 `npm run db:ingest:opendart` 멱등 수집기 추가.
- curated K-Food 검증기에 OpenDART 번호 누락·충돌·출처 검증 연결.
- 식품안전나라 I2500에 사업자번호가 없다는 공식 필드 구조를 기록.

## 3. 막힌 일

- blocker: 현재 환경에 `DART_API_KEY` 없음.
- 필요한 외부 상태: 키 발급, prod 마이그레이션 승인, 실제 수집 결과 검토.
- 미수행: prod DB 쓰기, 7개 업체 번호 입력, curated prod seed.

## 4. 다음 작업

- 다음 비게이트 READY: 없음.
- 활성화 Done 조건: OpenDART 실수집에서 업체명이 유일 매칭되고 `bizr_no`가 10자리이며 NTS 계속사업자 확인까지 통과한 행만 `opendart-registry`로 승격.

## 5. KPI 변화

- 실제 리드·응답·샘플 요청·인터뷰·유료 의향·결제: 모두 0 → 0.
- K-DEFENSE KPI: 변화 없음.

## 6. Verification

```text
npm test                         109/109 pass
npx tsc --noEmit                exit 0
npm run lint                    0 errors, 1 pre-existing unrelated warning
npm run build                   exit 0 (89 static pages generated)
git diff --check                exit 0 (line-ending warnings only)
sensitive / placeholder / STATE clean
npm run growth:audit            pass
npm run growth:payments         pass
```

## 7. Guardrails

- 실제 사업자번호 추정/하드코딩: 0.
- prod DB 실행: 0.
- 외부 발송·배포·결제: 0.
- 동명이인/복수매칭: 자동 귀속하지 않고 실패.

## 8. Git

- Branch: `chore/harness-cal-0623`
- Head: `c4b3d8b34bff3078521c13ac0f5423a3c42f3730`
- Commit: 없음
- Push: 없음

## 9. 핵심 한 줄

> KPI는 0 그대로지만, K-Food 사업자번호를 추정하지 않고 공식 OpenDART 원장으로만 승격시키는 코드 경로와 차단 테스트를 만들었고 실제 활성화는 키·prod 승인 전까지 잠갔다.
