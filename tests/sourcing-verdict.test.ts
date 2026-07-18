import assert from 'node:assert/strict';
import test from 'node:test';
import type { Supplier } from '../app/api/source/types';
import { getPilotCost } from '../app/lib/sourcing-verdict';

function supplier(estimatedPrice: string, overrides: Partial<Supplier> = {}): Supplier {
  return {
    rank: 1,
    name: 'Acme',
    platform: 'Direct',
    country: 'China',
    url: '',
    trustScore: 80,
    trustEvidence: [],
    redFlags: [],
    productMatch: '',
    estimatedPrice,
    moq: '10 units',
    summary: '',
    verificationStatus: 'ai_estimated',
    productStage: 'finished_product',
    leadTimeDays: '',
    hscode: '',
    exportToKoreaExperience: false,
    ...overrides,
  };
}

test('pilot costs preserve comma-grouped thousands and use the range maximum', () => {
  const pilot = getPilotCost(supplier('¥1,200~1,500 / unit'));
  assert.equal(pilot?.currency, 'CNY');
  assert.equal(pilot?.productCost, 15_000);
});

test('pilot costs preserve decimal unit prices', () => {
  const pilot = getPilotCost(supplier('USD 12.50–19.99 / unit'));
  assert.equal(pilot?.productCost, 200);
});

test('pilot buffers stay proportional in the detected currency', () => {
  const pilot = getPilotCost(supplier('₩1,000 / unit'));
  assert.deepEqual(pilot && {
    currency: pilot.currency,
    freightBuffer: pilot.freightBuffer,
    inspectionBuffer: pilot.inspectionBuffer,
  }, {
    currency: 'KRW',
    freightBuffer: 3_500,
    inspectionBuffer: 1_500,
  });
});

test('pilot costs reject strings without a positive price', () => {
  assert.equal(getPilotCost(supplier('가격 문의')), null);
  assert.equal(getPilotCost(supplier('USD 0')), null);
});
