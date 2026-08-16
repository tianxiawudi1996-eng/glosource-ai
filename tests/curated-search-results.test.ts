import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Supplier } from '../app/api/source/types';
import { SupplierCard as EnSupplierCard } from '../app/components/EnSourcingTool';
import { SupplierComparisonTable } from '../app/components/SupplierCard';
import {
  mergeCuratedSearchResults,
  queryClusterHistoryCounts,
} from '../app/lib/curated-search-results';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function supplier(rank: number, name: string, url: string, dbVerified = false): Supplier {
  return {
    rank,
    name,
    platform: 'Web',
    country: 'South Korea',
    url,
    trustScore: 70,
    trustEvidence: [],
    redFlags: [],
    productMatch: '',
    estimatedPrice: '',
    moq: '',
    summary: '',
    verificationStatus: 'grounding_confirmed',
    dbVerified,
    productStage: 'finished_product',
    leadTimeDays: '',
    hscode: '',
    exportToKoreaExperience: false,
  };
}

test('curated insertion reports live and curated counts separately', () => {
  const live = [
    supplier(1, 'Live One', 'https://live-one.example/products'),
    supplier(2, 'Live Two', 'https://live-two.example'),
  ];
  const curated = [
    supplier(1, 'Curated One', 'https://curated-one.example', true),
    supplier(2, 'Curated Two', 'https://curated-two.example', true),
    supplier(3, 'Curated Three', 'https://curated-three.example', true),
  ];

  const merged = mergeCuratedSearchResults(live, curated, { repeatQuery: false });

  assert.equal(merged.liveSupplierCount, 2);
  assert.equal(merged.curatedSupplierCount, 2);
  assert.equal(merged.suppliers.length, 4);
  assert.deepEqual(merged.suppliers.map(row => row.rank), [1, 2, 3, 4]);
  assert.equal(merged.suppliers[0]?.repeatQuery, undefined);
});

test('repeated query marks only inserted curated rows with cluster-level disclosure', () => {
  const merged = mergeCuratedSearchResults(
    [supplier(1, 'Live One', 'https://live-one.example')],
    [supplier(1, 'Curated One', 'https://curated-one.example', true)],
    { repeatQuery: true },
  );

  assert.equal(merged.suppliers[0]?.dbVerified, true);
  assert.equal(merged.suppliers[0]?.repeatQuery, true);
  assert.equal(merged.suppliers[1]?.repeatQuery, undefined);
});

test('curated insertion deduplicates by host and fallback company name', () => {
  const live = [
    supplier(1, 'Same Host', 'https://www.same.example/product'),
    supplier(2, 'Same Name Co., Ltd.', ''),
  ];
  const curated = [
    supplier(1, 'Different Label', 'https://same.example', true),
    supplier(2, 'Same Name Co Ltd', '', true),
    supplier(3, 'Fresh Curated', 'https://fresh.example', true),
  ];

  const merged = mergeCuratedSearchResults(live, curated, { repeatQuery: false });

  assert.equal(merged.curatedSupplierCount, 1);
  assert.equal(merged.suppliers[0]?.name, 'Fresh Curated');
});

test('repeat disclosure ignores other signed-in users on a shared IP', () => {
  const rows = [
    { product: 'Korean cosmetic serum', userId: 'buyer-a' },
    { product: 'K-beauty ampoule', userId: 'buyer-b' },
    { product: 'Korean skincare toner', userId: null },
  ];

  assert.deepEqual(queryClusterHistoryCounts(rows, 'K-beauty serum', 'buyer-a'), {
    abuseSimilarCount: 3,
    requesterSimilarCount: 1,
  });
  assert.deepEqual(queryClusterHistoryCounts(rows, 'K-beauty serum', null), {
    abuseSimilarCount: 3,
    requesterSimilarCount: 3,
  });
});

test('source route excludes curated insertions from live-result usage analytics', () => {
  const route = readFileSync('app/api/source/handler.ts', 'utf8');

  assert.match(route, /repeatQuery:\s*\(await priorSimilarSearchCount\) > 0/);
  assert.match(route, /resultComposition\s*=\s*\{\s*liveSupplierCount,\s*curatedSupplierCount\s*\}/);
  assert.match(
    route,
    /await logUsage\(userId,\s*ip,\s*surface,\s*'source',\s*req\.productDescription,\s*liveSupplierCount,/,
  );
  assert.doesNotMatch(
    route,
    /logUsage\(userId,\s*ip,\s*surface,\s*'source',\s*req\.productDescription,\s*output\.suppliers/,
  );
});

test('repeat disclosure remains separate from government verification badges', () => {
  const repeatedGovernmentSupplier = supplier(
    1,
    'Registry Matched Curated',
    'https://registry-curated.example',
    true,
  );
  repeatedGovernmentSupplier.govVerified = true;
  repeatedGovernmentSupplier.govRegistries = ['MFDS'];
  repeatedGovernmentSupplier.govEvidence = ['MFDS registry match'];
  repeatedGovernmentSupplier.repeatQuery = true;

  const koreanMarkup = renderToStaticMarkup(React.createElement(SupplierComparisonTable, {
    suppliers: [repeatedGovernmentSupplier],
    onSelect: () => {},
  }));
  assert.match(koreanMarkup, /정부 레지스트리 확인/);
  assert.match(koreanMarkup, /반복 검색 큐레이션/);

  const englishMarkup = renderToStaticMarkup(React.createElement(EnSupplierCard, {
    s: repeatedGovernmentSupplier,
    rank: 1,
    keyword: 'serum',
    locked: false,
  }));
  assert.match(englishMarkup, /Registry Match/);
  assert.match(englishMarkup, /Repeat query · curated/);
});

test('AI-only certification text is labeled unconfirmed on the chip itself', () => {
  const row = supplier(1, 'Signal Supplier', 'https://signal.example');
  row.trustEvidence = ['The listing mentions MFDS certification.'];

  const markup = renderToStaticMarkup(React.createElement(EnSupplierCard, {
    s: row,
    rank: 1,
    keyword: 'serum',
    locked: false,
  }));

  assert.match(markup, /MFDS mentioned — unconfirmed/);
  assert.match(markup, /AI-detected certification mentions — unverified/);
  assert.match(markup, /Government registry match/);
  assert.match(markup, /15\/100/);
  assert.match(markup, /○<\/span>Government registry match/);
  assert.doesNotMatch(markup, /Registry Match/);
});

test('a matching government registry replaces the duplicate AI-only certification chip', () => {
  const row = supplier(1, 'Signal Supplier', 'https://signal.example');
  row.trustEvidence = ['The listing mentions MFDS certification.'];
  row.govVerified = true;
  row.govRegistries = ['MFDS'];
  row.govEvidence = ['MFDS registry match'];

  const markup = renderToStaticMarkup(React.createElement(EnSupplierCard, {
    s: row,
    rank: 1,
    keyword: 'serum',
    locked: false,
  }));

  assert.match(markup, /Registry Match/);
  assert.match(markup, /40\/100/);
  assert.match(markup, /✓<\/span>Government registry match/);
  assert.doesNotMatch(markup, /MFDS mentioned — unconfirmed/);
});

test('orphan registry labels cannot hide an unconfirmed AI certification mention', () => {
  const row = supplier(1, 'Signal Supplier', 'https://signal.example');
  row.trustEvidence = ['The listing mentions MFDS certification.'];
  row.govVerified = false;
  row.govRegistries = ['MFDS'];

  const markup = renderToStaticMarkup(React.createElement(EnSupplierCard, {
    s: row,
    rank: 1,
    keyword: 'serum',
    locked: false,
  }));

  assert.match(markup, /MFDS mentioned — unconfirmed/);
  assert.doesNotMatch(markup, /Registry Match/);
});
