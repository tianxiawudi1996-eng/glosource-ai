import assert from 'node:assert/strict';
import test from 'node:test';
import type { SourcingOutput, Supplier } from '../app/api/source/types';
import {
  FACTORY_DIRECT_MODEL_ATTEMPTS,
  FACTORY_DIRECT_POST_MODEL_RESERVE_MS,
  FACTORY_DIRECT_ROUTE_BUDGET_MS,
  GOOGLE_SEARCH_TOOLS,
  groundingSourceHosts,
} from '../app/lib/gemini-grounding';
import {
  isRetryableFactoryError,
  normalizeFactoryOutput,
  parseFactoryDirectRequest,
  verifyFactoryDirectOutput,
} from '../app/lib/factory-direct-verification';

function supplier(overrides: Partial<Supplier> = {}): Supplier {
  return {
    rank: 1,
    name: 'Guangzhou Acme Manufacturing Co., Ltd.',
    platform: '1688',
    country: '중국',
    url: 'https://acme.example/factory',
    trustScore: 80,
    trustEvidence: [],
    redFlags: [],
    productMatch: 'OEM',
    estimatedPrice: '¥38/unit',
    moq: '200개',
    summary: '',
    verificationStatus: 'grounding_confirmed',
    productStage: 'finished_product',
    leadTimeDays: '15일',
    hscode: '',
    exportToKoreaExperience: false,
    ...overrides,
  };
}

function parsed(candidate: Supplier): Omit<SourcingOutput, 'groundingUsed'> {
  return {
    suppliers: [candidate],
    recommendation: '',
    rfqEmail: { en: '', zh: '' },
    disclaimer: '',
  };
}

test('factory-direct uses the current Gemini Google Search tool', () => {
  assert.deepEqual(GOOGLE_SEARCH_TOOLS, [{ googleSearch: {} }]);
  assert.equal('googleSearchRetrieval' in GOOGLE_SEARCH_TOOLS[0], false);
});

test('every factory-direct model attempt is grounded and stays inside the route budget', () => {
  assert.ok(FACTORY_DIRECT_MODEL_ATTEMPTS.length >= 2);
  assert.ok(FACTORY_DIRECT_MODEL_ATTEMPTS.every((attempt) => attempt.tools === GOOGLE_SEARCH_TOOLS));
  const modelBudget = FACTORY_DIRECT_MODEL_ATTEMPTS.reduce((total, attempt) => total + attempt.ms, 0);
  assert.ok(modelBudget <= FACTORY_DIRECT_ROUTE_BUDGET_MS - FACTORY_DIRECT_POST_MODEL_RESERVE_MS);
});

test('a grounded factory page must match the supplier identity before passing', async () => {
  const result = await verifyFactoryDirectOutput(
    parsed(supplier()),
    true,
    {
      groundingHosts: ['acme.example'],
      fetcher: async () => new Response('<html><title>Guangzhou Acme Manufacturing</title></html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.output.suppliers[0]?.urlCompanyMatch, true);
});

test('a mismatched factory page is downgraded and rejected', async () => {
  const result = await verifyFactoryDirectOutput(
    parsed(supplier()),
    true,
    {
      groundingHosts: ['acme.example'],
      fetcher: async () => new Response('<html><title>Shenzhen Different Factory</title></html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.output.suppliers.length, 0);
  assert.match(result.output.qualityGate?.rejectionReasons.join(' ') ?? '', /server-confirmed/i);
});

test('missing grounding fails closed without spending an outbound URL check', async () => {
  let calls = 0;
  const result = await verifyFactoryDirectOutput(
    parsed(supplier()),
    false,
    {
      fetcher: async () => {
        calls += 1;
        return new Response('', { status: 200 });
      },
    },
  );

  assert.equal(calls, 0);
  assert.equal(result.ok, false);
});

test('private factory URLs are rejected without an outbound request', async () => {
  let calls = 0;
  const result = await verifyFactoryDirectOutput(
    parsed(supplier({ url: 'http://127.0.0.1/admin' })),
    true,
    {
      groundingHosts: ['127.0.0.1'],
      fetcher: async () => {
        calls += 1;
        return new Response('', { status: 200 });
      },
    },
  );

  assert.equal(calls, 0);
  assert.equal(result.ok, false);
  assert.equal(result.output.suppliers.length, 0);
});

test('factory-direct rejects a supplier URL absent from its grounding sources', async () => {
  let calls = 0;
  const result = await verifyFactoryDirectOutput(parsed(supplier()), true, {
    groundingHosts: ['different.example'],
    fetcher: async () => {
      calls += 1;
      return new Response('<title>Guangzhou Acme Manufacturing</title>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      });
    },
  });
  assert.equal(calls, 0);
  assert.equal(result.ok, false);
});

test('grounding source hosts recover domains from Gemini proxy titles', () => {
  const response = {
    candidates: [{ groundingMetadata: { groundingChunks: [
      { web: { uri: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc', title: 'detail.1688.com' } },
      { web: { uri: 'https://acme.example/factory', title: 'Acme' } },
    ] } }],
  } as never;
  assert.deepEqual(groundingSourceHosts(response).sort(), ['acme.example', 'detail.1688.com']);
});

test('factory-direct request parsing and model output normalization fail closed', () => {
  assert.equal(parseFactoryDirectRequest(null), null);
  assert.equal(parseFactoryDirectRequest([]), null);
  assert.equal(parseFactoryDirectRequest({ productDescription: 'item', quantity: 12 }), null);
  assert.deepEqual(
    parseFactoryDirectRequest({ productDescription: 'item', quantity: '200', budget: 12 }),
    { productDescription: 'item', quantity: '200' },
  );
  const normalized = normalizeFactoryOutput({
    suppliers: [null, 42, supplier()],
    rfqEmail: null,
  }, true);
  assert.equal(normalized.suppliers.length, 1);
});

test('SDK abort timeouts retry unless the client request was aborted', () => {
  const timeout = new Error('Request aborted when fetching from the Gemini API: operation was aborted');
  assert.equal(isRetryableFactoryError(timeout, false), true);
  assert.equal(isRetryableFactoryError(timeout, true), false);
  assert.equal(isRetryableFactoryError(new Error('invalid response'), false), false);
});
