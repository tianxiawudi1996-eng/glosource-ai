# EN Pixel Balance Receipt Harness Report

## 결과/상태

- `/en`의 실제 렌더 높이를 360px·1440px viewport별로 제출받아 product-supporting 70% 이상, culture-only 30% 이하를 판정하는 로컬 receipt Harness를 구현했다.
- 현재 구조 marker 판정은 product-supporting 9/10(90%), culture-only 1/10(10%)로 유지된다.
- 실제 브라우저 receipt를 360×800과 1440×900에서 확보했다. 각각 product-supporting 93.9074% / culture-only 6.0926%, product-supporting 93.8228% / culture-only 6.1772%로 70% floor·30% cap을 통과한다.
- 두 receipt는 current EN render-source SHA-256에 결합되어 UI·CSS·관련 계약·빌드 의존성이 바뀌면 `SOURCE_DIGEST_MISMATCH`로 실패한다. synthetic fixture는 계속 schema·CLI 실패 경로 검증용이며 실제 화면 증거와 구분한다.

## 변경 범위

- `scripts/check-en-landing-pixel-balance.ts`: strict receipt parser, 필수 10영역 대조, geometry/order/overlap/width 검증, height-share 판정, 원문 비반사 safe summary CLI.
- `tests/en-landing-pixel-balance.test.ts`: 360/1440 정상, 30% 초과, 누락·중복·geometry·순서·overlap·폭·route·role·schema 오류, 안전한 출력 회귀검증.
- `tests/fixtures/en-landing-pixel-receipt.synthetic.json`: 명시적 합성 fixture.
- `docs/harness/evidence/en-landing-pixel-360-20260825.json`, `docs/harness/evidence/en-landing-pixel-1440-20260825.json`: 실제 localhost `/en` browser rectangle receipt.
- `package.json`, `AGENTS.md`, `scripts/check-agent-instructions.ts`, 측정 계획과 Harness 원장에 명령·경계를 연결했다.
- visible copy, 레이아웃, 이미지, API, DB, 결제, provider와 운영 상태는 변경하지 않았다.

## 판정 계약

- schema version `1.1.0`, route `/en`, current source digest, 양의 유한 viewport·region geometry와 timezone 포함 ISO 측정시각만 허용한다.
- 구조 Harness의 필수 10개 id·role과 정확히 일치해야 하며 unknown key/id, 누락, 중복, role drift, 비상승 top, 겹침, viewport보다 넓은 region을 fail-closed 처리한다.
- 높이 합계 기준 product+mixed가 70% 미만이거나 culture가 30%를 초과하면 실패한다.
- receipt의 source digest가 현재 EN 렌더 소스 digest와 다르면 `SOURCE_DIGEST_MISMATCH`로 실패한다.
- 출력은 region 수와 높이·비율·오류 코드만 포함하며 receipt의 자유 텍스트나 민감해 보이는 필드를 반사하지 않는다.

## 검증 증거

- `npx tsx --test tests/en-landing-pixel-balance.test.ts tests/en-landing-balance.test.ts tests/agent-instructions.test.ts`: 16/16 통과.
- `npm test`: 263/263 통과.
- `npx tsc --noEmit`: 통과.
- `npm run lint`: 종료 코드 0, 오류 0, 기존 경고 16.
- `npm run harness:en-balance:pixels -- tests/fixtures/en-landing-pixel-receipt.synthetic.json`: 종료 코드 0, region 10, total height 3800, product-supporting 92.10526315789474%, culture-only 7.894736842105263%.
- 무인자 CLI: 예상대로 종료 코드 1, `USAGE_REQUIRES_ONE_RECEIPT_PATH`.
- 직전 `/en` marker 통합 후 `npm run build`: Next.js 16.3.0, 89/89 통과. 이번 루프에는 제품 runtime/UI 변경이 없어 다시 실행하지 않았다.
- in-app browser 360×800: `scrollWidth=354 <= 360`, region 10, shortlist CTA visible, signup hidden, host 0, season control 0, runtime error/warning 0. 전체 lazy image를 스크롤 후 `naturalWidth>0`로 확인했고 Busan button/card가 `aria-pressed=true`로 전환됐다.
- in-app browser 1440×900: `scrollWidth=1434 <= 1440`, region 10, shortlist CTA visible, host 0, season control 0, runtime error/warning 0. 전체 lazy image 로딩을 확인했다.
- 실제 360 receipt CLI: total height 14908.984375, product-supporting 93.90740692221028%, culture-only 6.092593077789714%, clean.
- 실제 1440 receipt CLI: total height 8524.3125, product-supporting 93.8228156229608%, culture-only 6.177184377039204%, clean.

## 미완료·위험·외부 게이트

- 이 Harness는 section 높이 비율을 측정하며 screenshot의 색상 면적이나 mixed 영역 내부의 문화 이미지 점유율을 측정하지 않는다.
- 측정은 허용된 in-app browser localhost 연결로 수행했으며 다른 browser surface나 보안 정책을 우회하지 않았다.
- P10은 기존 독립 reviewer, self-review 방지, fresh execution approval 부재로 계속 blocked다.
- commit, push, provider 변경, migration, 게시, 배포는 실행하지 않았다.

## 다음 READY

- 제품 UI·CSS·관련 계약·빌드 의존성이 변경되면 digest mismatch를 확인한 뒤 동일 360×800·1440×900 측정을 다시 수행한다. 현재 pixel evidence gap은 닫혔다.
