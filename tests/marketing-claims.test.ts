import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const home = readFileSync('app/HomePageClient.tsx', 'utf8');

test('KR landing does not present unsupported precise savings as observed results', () => {
  assert.doesNotMatch(home, /(?:30~50|~38|~45|~52)%\s*절감/);
  assert.doesNotMatch(home, /가격 범위['"]?\s*[:}]|priceRange:/);
});

test('KR sourcing scenarios are explicitly illustrative and verification-led', () => {
  assert.match(home, /예시 시나리오/);
  assert.match(home, /실제 조건은 공급자 자료와 견적으로 직접 확인/);
  assert.match(home, /독립적으로 확인/);
});

test('scenario cards turn unsupported result fields into buyer checks', () => {
  assert.match(home, /확인할 공급자 범위/);
  assert.match(home, /견적 확인 항목/);
  assert.match(home, /인증 확인 항목/);
});
