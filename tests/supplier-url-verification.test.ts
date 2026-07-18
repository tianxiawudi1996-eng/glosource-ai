import assert from 'node:assert/strict';
import test from 'node:test';
import type { SourcingOutput, Supplier } from '../app/api/source/types';
import { enforceVerifiedSupplierQualityGate } from '../app/lib/supplier-verification';
import {
  supplierNameMatchesPage,
  verifySupplierUrlIdentities,
} from '../app/lib/supplier-url-verification';

function supplier(overrides: Partial<Supplier> = {}): Supplier {
  return {
    rank: 1,
    name: 'Acme Industrial Co., Ltd.',
    koreanName: '',
    platform: 'Direct',
    country: 'South Korea',
    url: 'https://acme.example/products',
    trustScore: 80,
    trustEvidence: [],
    redFlags: [],
    productMatch: 'OEM',
    estimatedPrice: '',
    moq: '',
    summary: '',
    verificationStatus: 'grounding_confirmed',
    productStage: 'finished_product',
    leadTimeDays: '',
    hscode: '',
    exportToKoreaExperience: false,
    ...overrides,
  };
}

function output(candidate: Supplier): SourcingOutput {
  return {
    suppliers: [candidate],
    recommendation: '',
    rfqEmail: { en: '', zh: '' },
    disclaimer: '',
    groundingUsed: true,
  };
}

test('company-name matching ignores corporate suffixes but requires distinctive tokens', () => {
  assert.equal(
    supplierNameMatchesPage(
      supplier(),
      '<html><title>Acme Industrial | OEM components</title><body>Acme factory</body></html>',
    ),
    true,
  );
  assert.equal(
    supplierNameMatchesPage(
      supplier(),
      '<html><title>Different Trading Company</title><body>OEM components</body></html>',
    ),
    false,
  );
  assert.equal(
    supplierNameMatchesPage(supplier(), '<html><title>Acmeology Components</title></html>'),
    false,
  );
});

test('a live page with a matching company name earns URL-company confirmation', async () => {
  const candidate = supplier();
  await verifySupplierUrlIdentities([candidate], { fetcher: async (_url, init) => {
    assert.equal(init.redirect, 'manual');
    return new Response('<html><title>Acme Industrial</title></html>', {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  } });

  assert.equal(candidate.verificationStatus, 'grounding_confirmed');
  assert.equal(candidate.urlCompanyMatch, true);
});

test('a reachable page for a different company is downgraded and flagged', async () => {
  const candidate = supplier();
  await verifySupplierUrlIdentities([candidate], { fetcher: async () => new Response(
    '<html><title>Different Supplier</title></html>',
    { status: 200, headers: { 'content-type': 'text/html' } },
  ) });

  assert.equal(candidate.verificationStatus, 'ai_estimated');
  assert.equal(candidate.urlCompanyMatch, false);
  assert.match(candidate.redFlags[0] ?? '', /URL-company identity/i);
});

test('blocked, timed-out, and dead pages cannot retain a confirmed badge', async () => {
  for (const fetcher of [
    async () => new Response('', { status: 403 }),
    async () => new Response('', { status: 404 }),
    async () => { throw Object.assign(new Error('slow'), { name: 'TimeoutError' }); },
  ]) {
    const candidate = supplier();
    await verifySupplierUrlIdentities([candidate], { fetcher });
    assert.equal(candidate.verificationStatus, 'ai_estimated');
    assert.equal(candidate.urlCompanyMatch, false);
  }
});

test('private or literal-IP URLs are rejected without an outbound request', async () => {
  for (const url of [
    'http://127.0.0.1/admin',
    'http://192.168.1.5/',
    'http://[::ffff:127.0.0.1]/',
    'http://localhost./',
  ]) {
    const candidate = supplier({ url });
    let calls = 0;
    await verifySupplierUrlIdentities([candidate], { fetcher: async () => {
      calls += 1;
      return new Response('', { status: 200 });
    } });
    assert.equal(calls, 0);
    assert.equal(candidate.verificationStatus, 'ai_estimated');
    assert.equal(candidate.url, '');
  }
});

test('hostnames resolving to private addresses are rejected before fetching', async () => {
  const candidate = supplier({ url: 'https://internal.example/factory' });
  let calls = 0;
  await verifySupplierUrlIdentities([candidate], {
    resolveAddresses: async () => ['127.0.0.1'],
    fetcher: async () => {
      calls += 1;
      return new Response('', { status: 200 });
    },
  });
  assert.equal(calls, 0);
  assert.equal(candidate.verificationStatus, 'ai_estimated');
});

test('URL identity checks cap both concurrency and total outbound requests', async () => {
  const candidates = Array.from({ length: 12 }, (_, index) => supplier({
    rank: index + 1,
    name: `Maker ${index}`,
    url: `https://maker-${index}.example/`,
  }));
  let active = 0;
  let maxActive = 0;
  let calls = 0;

  await verifySupplierUrlIdentities(candidates, { fetcher: async (url) => {
    calls += 1;
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active -= 1;
    const index = new URL(url).hostname.match(/maker-(\d+)/)?.[1] ?? '';
    return new Response(`<html><title>Maker ${index}</title></html>`, {
      status: 200,
      headers: { 'content-type': 'text/html' },
    });
  } });

  assert.equal(calls, 8);
  assert.ok(maxActive <= 5);
  assert.equal(candidates[8].verificationStatus, 'ai_estimated');
});

test('failed URLs do not stop workers from checking later URLs', async () => {
  const candidates = Array.from({ length: 7 }, (_, index) => supplier({
    rank: index + 1,
    name: `Maker ${index}`,
    url: `https://maker-${index}.example/`,
  }));

  await verifySupplierUrlIdentities(candidates, {
    fetcher: async (url) => {
      const index = Number(new URL(url).hostname.match(/maker-(\d+)/)?.[1] ?? 0);
      return index < 5
        ? new Response('', { status: 404 })
        : new Response(`<html><title>Maker ${index}</title></html>`, {
          status: 200,
          headers: { 'content-type': 'text/html' },
        });
    },
  });

  assert.equal(candidates[0].verificationStatus, 'ai_estimated');
  assert.equal(candidates[5].urlCompanyMatch, true);
  assert.equal(candidates[6].urlCompanyMatch, true);
});

test('an expired URL verification deadline fails closed without fetching', async () => {
  const candidate = supplier();
  let calls = 0;

  await verifySupplierUrlIdentities([candidate], {
    deadlineAt: Date.now() - 1,
    fetcher: async () => {
      calls += 1;
      return new Response('', { status: 200 });
    },
  });

  assert.equal(calls, 0);
  assert.equal(candidate.verificationStatus, 'ai_estimated');
  assert.equal(candidate.urlCompanyMatch, false);
});

test('the quality gate rejects LLM self-claims without server or curated evidence', () => {
  const selfClaimed = enforceVerifiedSupplierQualityGate(output(supplier()));
  const pageMatched = enforceVerifiedSupplierQualityGate(output(supplier({ urlCompanyMatch: true })));
  const curatedOutput = output(supplier({ dbVerified: true }));
  curatedOutput.groundingUsed = false;
  const curated = enforceVerifiedSupplierQualityGate(curatedOutput);

  assert.equal(selfClaimed.ok, false);
  assert.equal(pageMatched.ok, true);
  assert.equal(curated.ok, true);
});
