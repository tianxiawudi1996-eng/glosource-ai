import assert from 'node:assert/strict';
import test from 'node:test';
import type { SourcingOutput, Supplier, WeChatSourcingOutput } from '../app/api/source/types';
import { PLAN_LIMITS } from '../app/lib/db/schema';
import { FREE_SEARCH_LIMIT } from '../app/lib/free-plan';
import {
  buildPlanVisibleSourcingResult,
  redactSourcingOutputForFree,
  redactWeChatSourcingOutputForFree,
} from '../app/lib/free-access';

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

function weChatOutput(): WeChatSourcingOutput {
  return {
    posts: [
      {
        accountName: 'Factory one',
        accountType: 'Factory direct',
        articleTitle: 'First result',
        publishDate: '2026-08-18',
        url: 'https://wechat.example/one',
        summary: 'Full supplier summary with contact details.',
        productKeywords: ['widget'],
        contactHint: 'wechat: factory-one',
        productSpecs: 'alloy grade 6063',
        productEvidence: 'certificate detail',
        priceRange: 'CNY 20-30',
        moq: '500 units',
        location: 'Guangdong',
        relevanceScore: 92,
      },
      {
        accountName: 'Factory two',
        accountType: 'Factory direct',
        articleTitle: 'Second result',
        publishDate: '2026-08-17',
        url: 'https://wechat.example/two',
        summary: 'Hidden supplier.',
        productKeywords: ['widget'],
        contactHint: 'wechat: factory-two',
        relevanceScore: 88,
      },
    ],
    analysis: 'Full comparative analysis with supplier details.',
    searchKeyword: 'widget',
    disclaimer: 'Verify before transacting.',
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
  assert.equal(redacted.suppliers[0]?.productMatch, '');
  assert.equal(redacted.suppliers[0]?.summary, '');
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

test('free WeChat sourcing exposes exactly one contact-free preview', () => {
  const redacted = redactWeChatSourcingOutputForFree(weChatOutput(), 'free', 'kr');

  assert.equal(redacted.posts.length, 1);
  assert.equal(redacted.posts[0]?.accountName, 'Factory one');
  assert.equal(redacted.posts[0]?.url, '');
  assert.equal(redacted.posts[0]?.contactHint, '');
  assert.equal(redacted.posts[0]?.priceRange, '');
  assert.equal(redacted.posts[0]?.moq, '');
  assert.equal(redacted.posts[0]?.productSpecs, '');
  assert.equal(redacted.posts[0]?.summary, '');
  assert.equal(redacted.analysis, '');
});

test('paid WeChat sourcing preserves full post details', () => {
  const visible = redactWeChatSourcingOutputForFree(weChatOutput(), 'starter', 'kr');

  assert.equal(visible.posts.length, 2);
  assert.equal(visible.posts[0]?.url, 'https://wechat.example/one');
  assert.equal(visible.posts[0]?.contactHint, 'wechat: factory-one');
  assert.equal(visible.posts[0]?.priceRange, 'CNY 20-30');
  assert.equal(visible.analysis, 'Full comparative analysis with supplier details.');
});

test('free search history contains only the supplier preview returned to the user', () => {
  const visible = buildPlanVisibleSourcingResult(output(), 'free', 'en');
  const persisted = JSON.parse(visible.resultJson) as SourcingOutput;

  assert.equal(visible.supplierCount, 1);
  assert.equal(visible.topSuppliers, 'Supplier 1');
  assert.equal(persisted.suppliers.length, 1);
  assert.equal(persisted.suppliers[0]?.name, 'Supplier 1');
  assert.equal(persisted.suppliers[0]?.url, '');
  assert.doesNotMatch(visible.resultJson, /Supplier 2|Supplier 3|supplier-2\.example|supplier-3\.example/);
});

test('paid search history keeps the complete purchased result', () => {
  const visible = buildPlanVisibleSourcingResult(output(), 'pro', 'en');

  assert.equal(visible.supplierCount, 3);
  assert.equal(visible.topSuppliers, 'Supplier 1, Supplier 2, Supplier 3');
  assert.match(visible.resultJson, /supplier-3\.example/);
});
