import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const trustSurfaces = [
  'app/en/page.tsx',
  'app/components/HeroSection.tsx',
  'app/components/TrustCredibility.tsx',
  'app/components/EnSourcingTool.tsx',
  'app/components/SourcingChatWidget.tsx',
];

test('buyer-facing trust copy describes evidence without claiming verified suppliers', () => {
  for (const file of trustSurfaces) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /Gov-Verified/i, file);
    assert.doesNotMatch(source, /Every Korean candidate/i, file);
  }
});

test('English funnel no longer contains retired free-search promises', () => {
  const files = [
    'app/en/page.tsx',
    'app/en/register/page.tsx',
    'app/en/case-studies/page.tsx',
    'app/en/assistant/page.tsx',
    'app/en/about/page.tsx',
  ];

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /10 free searches/i, file);
    assert.doesNotMatch(source, /5 anonymous trial searches/i, file);
    assert.doesNotMatch(source, /5 free searches a day/i, file);
  }
});

test('the shared brand mark cannot collapse to zero width in crowded navigation', () => {
  const source = readFileSync('app/components/BrandLogo.tsx', 'utf8');
  assert.match(source, /shrink-0/);
  assert.match(source, /w-\[41px\]/);
});

test('buyer-facing source selectors preserve the two opposite product directions', () => {
  const globalTool = readFileSync('app/components/EnSourcingTool.tsx', 'utf8');
  const koreanTool = readFileSync('app/HomePageClient.tsx', 'utf8');

  assert.doesNotMatch(globalTool, /China add-on|Find China Suppliers|China sourcing/);
  assert.doesNotMatch(koreanTool, /value: 'korea', label: '한국'/);
});

test('Korean buyer surfaces cannot present a live paid checkout before registration', () => {
  const billing = readFileSync('app/billing/page.tsx', 'utf8');
  const upgrade = readFileSync('app/components/UpgradeModal.tsx', 'utf8');
  const waitlist = readFileSync('app/components/WaitlistBanner.tsx', 'utf8');

  assert.doesNotMatch(billing, /<UpgradeButton/);
  assert.match(billing, /무료 베타 운영 중/);
  assert.doesNotMatch(upgrade, /href="\/billing"/);
  assert.match(waitlist, /id="waitlist"/);
  assert.doesNotMatch(waitlist, /첫 달 무료/);
});

test('Korean free access copy promises five searches and one supplier preview', () => {
  const home = readFileSync('app/HomePageClient.tsx', 'utf8');
  const koreanContract = readFileSync('docs/requirements/GLOSOURCE_KR_OUTBOUND.md', 'utf8');
  const portfolioContract = readFileSync('docs/requirements/GLOSOURCE_PORTFOLIO.md', 'utf8');

  assert.match(home, /무료 결과는 공급자 \{KR_FREE_RESULT_PREVIEW_COUNT\}개 미리보기/);
  assert.match(koreanContract, /Verified free member: 5 searches per month/);
  assert.match(koreanContract, /Free result: one supplier preview/);
  assert.match(portfolioContract, /\| Free member use \| 5 searches per month \| 3 searches per month \|/);
  assert.match(portfolioContract, /\| Free result \| One supplier preview \| One supplier preview \|/);
  assert.doesNotMatch(koreanContract, /10 searches per month/);
  assert.doesNotMatch(portfolioContract, /10 searches per month/);
});

test('Polar health checks enforce current quotas and avoid verified-supplier claims', () => {
  const audit = readFileSync('scripts/growth/audit-polar-health.js', 'utf8');
  const sync = readFileSync('scripts/growth/sync-polar-product-descriptions.js', 'utf8');

  for (const quota of ['40 supplier shortlist searches', '100 supplier shortlist searches', '300 supplier shortlist searches']) {
    assert.match(audit, new RegExp(quota));
    assert.match(sync, new RegExp(quota));
  }
  assert.doesNotMatch(audit, /verified Korean suppliers/i);
  assert.doesNotMatch(sync, /verified Korean suppliers/i);
});
