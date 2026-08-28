# `/en` Evidence 70 : Korean Visual 30 측정 계약

## 목적

70:30을 임의의 픽셀 계산이나 감상평으로 주장하지 않고, 제품·증거가 정보 위계를 지배하며 문화 전용 구간이 화면을 압도하지 않는지 반복 검사한다.

## 정의

- `product`: 구매 판단, evidence, 문제, 사용, 가격 또는 FAQ가 주목적인 영역.
- `mixed`: 제품 행동이 주목적이지만 절제된 한국 건축·문자·재료를 배경으로 사용하는 영역.
- `culture`: 한국 명소와 여정 자체가 주목적인 영역.

자동 계약에서 `product + mixed`는 전체 상위 영역의 70% 이상이어야 하고 `culture` 전용 영역은 30% 이하여야 한다. 이 값은 editorial hierarchy guard이며 실제 pixel 면적이나 체류시간을 의미하지 않는다.

반복 UI chrome인 nav와 footer는 분모에서 제외한다. 두 영역은 제품 이동·법적 경계를 보조하지만 독립적인 구매 판단 section이나 문화 여정 section이 아니기 때문이다.

## 현재 영역

| 순서 | ID | 역할 | 근거 |
|---:|---|---|---|
| 1 | hero | mixed | shortlist·registry proof가 주행동, 정적 경복궁은 배경 |
| 2 | registry | product | 정부 원장 evidence와 disclaimer |
| 3 | categories | mixed | category/registry 선택이 목적, 한지·기와·글자형은 accent |
| 4 | journey | culture | Seoul/Busan/Jeju 명소 여정 |
| 5 | problem | product | 바이어의 sourcing risk |
| 6 | samples | product | 결제 전 출력 형식 확인 |
| 7 | tool | product | 실제 shortlist 입력·결과 |
| 8 | process | product | 사용 단계와 한계 |
| 9 | pricing | product | USD/Polar와 quota |
| 10 | faq | product | 구매·사용 질문 |

현재 구조 계약은 product-supporting 9/10(90%), culture-only 1/10(10%)이다. 이는 “한국미 최대 30%” 제한을 만족하지만 “화면 픽셀이 정확히 70:30”임을 증명하지 않는다. Hero mixed와 여러 product 영역의 작은 단청·한지 accent가 나머지 문화적 인상을 제공한다.

## 검증

- `npm run harness:en-balance`: 필수 10영역, 역할, 중복·미등록, product 70% floor, culture 30% cap 검사.
- `npm run harness:en-balance:pixels -- <receipt.json>`: 실제 브라우저 bounding rectangle receipt의 schema, route, viewport, 10영역 역할·순서, 양수 geometry, 비중을 fail-closed로 검사.
- `tests/en-visual-balance.test.ts`: Hero→registry→categories→Journey 순서와 restrained Hero/Journey 계약.
- 브라우저 수동 QA: 360px·1440px에서 실제 section 높이, 이미지 점유, CTA 가시성, overflow와 접근성 확인.

### Pixel-height receipt

브라우저에서 `[data-en-balance]` 10영역을 DOM 순서로 읽어 다음 제한된 JSON만 저장한다.

```json
{
  "schemaVersion": "1.1.0",
  "route": "/en",
  "sourceDigest": "64 lowercase hexadecimal SHA-256 characters",
  "viewport": { "width": 360, "height": 800 },
  "measuredAt": "2026-08-25T00:00:00.000Z",
  "regions": [
    { "id": "hero", "role": "mixed", "top": 0, "height": 800, "width": 360 }
  ]
}
```

실제 receipt에는 현재 계약의 10영역과 현재 EN 렌더 소스의 `sourceDigest`가 모두 필요하다. digest는 `app/en`, 공유 `app/components`, global CSS, 가격·무료·환불 계약과 Next/PostCSS/package lock을 canonical 순서로 결합한 SHA-256이다. 현재 digest와 다르면 `SOURCE_DIGEST_MISMATCH`로 실패하므로 UI·스타일·의존성 변경 뒤에는 실제 브라우저 측정을 다시 수행해야 한다. 자유서술, URL query, cookie, 계정·세션·환경값은 넣지 않는다. 집계 단위는 영역의 세로 `height`이며 screenshot 색상 면적이나 mixed 내부의 문화 비율을 추정하지 않는다.

## 2026-08-25 실제 측정 기준선

| Viewport | Product-supporting | Culture-only | Receipt |
|---|---:|---:|---|
| 360×800 | 93.90740692221028% | 6.092593077789714% | `docs/harness/evidence/en-landing-pixel-360-20260825.json` |
| 1440×900 | 93.8228156229608% | 6.177184377039204% | `docs/harness/evidence/en-landing-pixel-1440-20260825.json` |

두 receipt는 같은 current source digest에 결합되어 있으며 구조 계약 90:10과 함께 70% floor·30% cap을 통과한다.

## 실패·중단

- culture-only가 30%를 넘거나 evidence보다 앞서면 실패한다.
- 픽셀·체류시간 측정 없이 “정확히 70:30”이라고 보고하지 않는다.
- 카피·가격·quota·sourcing·결제 의미를 바꿔 비율을 맞추지 않는다.
