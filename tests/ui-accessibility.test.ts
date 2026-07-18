import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sourcingTool = readFileSync('app/components/EnSourcingTool.tsx', 'utf8');
const landingPage = readFileSync('app/en/page.tsx', 'utf8');
const supplierCard = readFileSync('app/components/SupplierCard.tsx', 'utf8');

test('sourcing form labels target named controls and region buttons expose selection', () => {
  for (const id of ['source-product', 'buyer-market', 'source-quantity', 'source-budget']) {
    assert.match(sourcingTool, new RegExp(`htmlFor=["']${id}["']`));
    assert.match(sourcingTool, new RegExp(`id=["']${id}["']`));
  }
  assert.match(sourcingTool, /aria-pressed=\{region === btn\.value\}/);
  assert.match(sourcingTool, /aria-live="polite"/);
});

test('dark landing sections avoid low-contrast slate text', () => {
  const darkRegistry = landingPage.slice(
    landingPage.indexOf('GOVERNMENT REGISTRY CROSS-CHECK'),
    landingPage.indexOf('CATEGORIES —'),
  );
  const footer = landingPage.slice(landingPage.indexOf('<footer'));
  assert.doesNotMatch(darkRegistry, /text-slate-[567]00/);
  assert.doesNotMatch(footer, /text-slate-[567]00/);
});

test('mobile supplier cards retain a visible verification-state chip', () => {
  const mobileView = supplierCard.slice(
    supplierCard.indexOf('모바일 카드 뷰'),
    supplierCard.indexOf('데스크탑 테이블'),
  );
  assert.match(mobileView, /verification\.label/);
});

test('Korean supplier risk and trust evidence are explicitly labeled as AI estimates', () => {
  assert.match(supplierCard, /낮음 \(AI 추정\)/);
  assert.match(supplierCard, /AI 추정 신뢰 신호/);
});
