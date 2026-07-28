import assert from 'node:assert/strict';
import test from 'node:test';
import type { SourcingOutput, Supplier } from '../app/api/source/types';
import { PLAN_LIMITS } from '../app/lib/db/schema';
import { FREE_SEARCH_LIMIT } from '../app/lib/free-plan';
import { redactSourcingOutputForFree } from '../app/lib/free-access';

function supplier(rank: number, overrides: Partial<Supplier> = {}): Supplier {
  return {
    rank,
    name: `Supplier ${rank}`,
    platform: 'BuyKorea',
    country: 'KR',
    url: `https://supplier-${rank}.example`,
    trustScore: 80,
    trustEvidence: ['Evidence 1', 'Evidence 2', 'Evidence 3'],
    redFlags: ['Flag 1', 'Flag 2'],
    productMatch: 'Long product match detail',
    estimatedPrice: '$1',
    moq: '100 units',
    summary: 'Summary',
    verificationStatus: 'grounding_confirmed',
    urlCompanyMatch: true,
    govEvidence: ['Gov 1', 'Gov 2', 'Gov 3'],
    productStage: 'finished_product',
    leadTimeDays: '20 days',
    hscode: '3304',
    exportToKoreaExperience: true,
    ...overrides,
  };
}

function output(): SourcingOutput {
  return {
    suppliers: [supplier(1), supplier(2), supplier(3)],
    recommendation: 'Full notes',
    rfqEmail: { en: 'RFQ draft', zh: 'RFQ draft zh' },
    disclaimer: 'Disclaimer',
    groundingUsed: true,
    aeoMatches: { korea: [], china: [] },
    marketRiskFlags: [{ code: 'risk', severity: 'medium', title: 'Risk', detail: 'Detail' }],
  };
}

test('free plan search quota is three', () => {
  assert.equal(FREE_SEARCH_LIMIT, 3);
  assert.equal(PLAN_LIMITS.free.monthly, 3);
});

test('global free sourcing output exposes only a search preview', () => {
  const redacted = redactSourcingOutputForFree(output(), 'free', 'en');

  assert.equal(redacted.access?.supplierDetailsLocked, true);
  assert.equal(redacted.access?.hiddenSupplierCount, 2);
  assert.equal(redacted.suppliers.length, 1);
  assert.equal(redacted.suppliers[0]?.url, '');
  assert.equal(redacted.suppliers[0]?.urlCompanyMatch, false);
  assert.equal(redacted.suppliers[0]?.verificationStatus, 'ai_estimated');
  assert.equal(redacted.suppliers[0]?.estimatedPrice, '');
  assert.equal(redacted.suppliers[0]?.moq, '');
  assert.deepEqual(redacted.suppliers[0]?.trustEvidence, ['Evidence 1', 'Evidence 2']);
  assert.equal(redacted.rfqEmail.en, '');
  assert.equal(redacted.recommendation, '');
  assert.equal(redacted.marketRiskFlags, undefined);
});

test('Korean free sourcing exposes only a search preview', () => {
  const full = output();
  const visible = redactSourcingOutputForFree(full, 'free', 'kr');

  assert.equal(visible.access?.supplierDetailsLocked, true);
  assert.equal(visible.access?.hiddenSupplierCount, 2);
  assert.equal(visible.suppliers.length, 1);
  assert.equal(visible.suppliers[0]?.url, '');
  assert.equal(visible.rfqEmail.en, '');
  assert.equal(visible.recommendation, '');
});

for (const independentVerification of [
  { name: 'government', overrides: { govVerified: true } },
  { name: 'curated database', overrides: { dbVerified: true } },
  { name: 'non-URL grounding', overrides: { urlCompanyMatch: false } },
] satisfies Array<{ name: string; overrides: Partial<Supplier> }>) {
  test(`free preview preserves ${independentVerification.name} verification while hiding URL evidence`, () => {
    const full = output();
    full.suppliers[0] = supplier(1, independentVerification.overrides);

    const visible = redactSourcingOutputForFree(full, 'free', 'kr');

    assert.equal(visible.suppliers[0]?.urlCompanyMatch, false);
    assert.equal(visible.suppliers[0]?.verificationStatus, 'grounding_confirmed');
    assert.equal(visible.suppliers[0]?.govVerified, independentVerification.overrides.govVerified);
    assert.equal(visible.suppliers[0]?.dbVerified, independentVerification.overrides.dbVerified);
    assert.deepEqual(visible.suppliers[0]?.govEvidence, ['Gov 1', 'Gov 2']);
  });
}

test('paid sourcing output keeps full details unlocked', () => {
  const full = output();
  const redacted = redactSourcingOutputForFree(full, 'starter', 'en');

  assert.equal(redacted.access?.supplierDetailsLocked, false);
  assert.equal(redacted.suppliers.length, 3);
  assert.equal(redacted.suppliers[0]?.url, 'https://supplier-1.example');
  assert.equal(redacted.rfqEmail.en, 'RFQ draft');
});
