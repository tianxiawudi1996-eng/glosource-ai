import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  assessEnLandingBalance,
  extractEnBalanceMarkers,
} from '../scripts/check-en-landing-balance';

const source = [
  'app/en/page.tsx',
  'app/components/HeroSection.tsx',
  'app/components/KoreaJourneySection.tsx',
].map((path) => readFileSync(path, 'utf8')).join('\n');

test('EN landing keeps product/evidence regions above 70% and culture-only below 30%', () => {
  const result = assessEnLandingBalance(extractEnBalanceMarkers(source));
  assert.deepEqual(result.errors, []);
  assert.equal(result.total, 10);
  assert.equal(result.productSupportingPercent, 90);
  assert.equal(result.cultureOnlyPercent, 10);
});

test('EN landing balance fails when culture-only regions exceed the restraint cap', () => {
  const markers = extractEnBalanceMarkers(source).map((marker) =>
    ['registry', 'problem', 'samples'].includes(marker.id)
      ? { ...marker, role: 'culture' as const }
      : marker,
  );
  const result = assessEnLandingBalance(markers);
  assert.ok(result.errors.some((error) => error.includes('exceeded 30%')));
});

test('EN landing balance fails when a required product region loses its role', () => {
  const markers = extractEnBalanceMarkers(source).filter((marker) => marker.id !== 'pricing');
  const result = assessEnLandingBalance(markers);
  assert.ok(result.errors.includes('Expected pricing:product'));
});
