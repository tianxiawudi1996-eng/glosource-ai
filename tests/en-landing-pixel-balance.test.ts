import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  assessEnLandingPixelBalance,
  canonicalizeTextForDigest,
  computeEnLandingPixelSourceDigest,
  EN_LANDING_PIXEL_RECEIPT_SCHEMA_VERSION,
  toSafePixelBalanceSummary,
  type EnLandingPixelReceipt,
} from '../scripts/check-en-landing-pixel-balance';

const expectedRegions = [
  ['hero', 'mixed'],
  ['registry', 'product'],
  ['categories', 'mixed'],
  ['journey', 'culture'],
  ['problem', 'product'],
  ['samples', 'product'],
  ['tool', 'product'],
  ['process', 'product'],
  ['pricing', 'product'],
  ['faq', 'product'],
] as const;

function receipt(width: number, height: number): EnLandingPixelReceipt {
  return {
    schemaVersion: EN_LANDING_PIXEL_RECEIPT_SCHEMA_VERSION,
    route: '/en',
    sourceDigest: computeEnLandingPixelSourceDigest(),
    viewport: { width, height },
    measuredAt: '2026-08-25T09:00:00.000Z',
    regions: expectedRegions.map(([id, role], index) => ({
      id,
      role,
      top: index * 300,
      height: id === 'journey' ? 200 : 300,
      width,
    })),
  };
}

test('source digest canonicalization treats CRLF, CR, and LF as the same text', () => {
  assert.equal(canonicalizeTextForDigest('first\r\nsecond\rthird\n'), 'first\nsecond\nthird\n');
});

test('accepts valid 360px and 1440px height-share receipts', () => {
  for (const viewport of [[360, 800], [1440, 900]] as const) {
    const result = assessEnLandingPixelBalance(receipt(viewport[0], viewport[1]));
    assert.deepEqual(result.errors, []);
    assert.equal(result.productSupportingHeightPercent, (2700 / 2900) * 100);
    assert.equal(result.cultureOnlyHeightPercent, (200 / 2900) * 100);
  }
});

test('fails closed when culture-only height exceeds 30 percent', () => {
  const candidate = receipt(1440, 900);
  candidate.regions = candidate.regions.map((region) =>
    region.id === 'journey' ? { ...region, height: 2000 } : region,
  );
  const result = assessEnLandingPixelBalance(candidate);
  assert.ok(result.errors.includes('CULTURE_ONLY_HEIGHT_ABOVE_30_PERCENT'));
  assert.ok(result.errors.includes('PRODUCT_SUPPORTING_HEIGHT_BELOW_70_PERCENT'));
});

test('fails closed for missing, duplicate, invalid geometry, and unordered regions', () => {
  const missing = receipt(360, 800);
  missing.regions = missing.regions.filter((region) => region.id !== 'faq');
  assert.ok(assessEnLandingPixelBalance(missing).errors.includes('MISSING_REQUIRED_REGION'));

  const duplicate = receipt(360, 800);
  duplicate.regions[1] = { ...duplicate.regions[1], id: 'hero' };
  assert.ok(assessEnLandingPixelBalance(duplicate).errors.includes('DUPLICATE_REGION_ID'));

  const invalidGeometry = receipt(360, 800);
  invalidGeometry.regions[0].height = Number.POSITIVE_INFINITY;
  assert.deepEqual(assessEnLandingPixelBalance(invalidGeometry).errors, ['INVALID_RECEIPT_SCHEMA']);

  const unordered = receipt(360, 800);
  unordered.regions[1].top = unordered.regions[0].top;
  assert.ok(assessEnLandingPixelBalance(unordered).errors.includes('REGIONS_NOT_STRICTLY_TOP_ASCENDING'));

  const overlap = receipt(360, 800);
  overlap.regions[1].top = overlap.regions[0].top + overlap.regions[0].height - 1;
  assert.ok(assessEnLandingPixelBalance(overlap).errors.includes('REGIONS_OVERLAP'));

  const tooWide = receipt(360, 800);
  tooWide.regions[0].width = 361;
  assert.ok(assessEnLandingPixelBalance(tooWide).errors.includes('REGION_WIDTH_EXCEEDS_VIEWPORT'));

  const wrongOrder = receipt(360, 800);
  [wrongOrder.regions[0], wrongOrder.regions[1]] = [wrongOrder.regions[1], wrongOrder.regions[0]];
  wrongOrder.regions[0].top = 0;
  wrongOrder.regions[1].top = 300;
  assert.ok(assessEnLandingPixelBalance(wrongOrder).errors.includes('REGION_ORDER_MISMATCH'));
});

test('fails closed for role, route, and schema mismatches', () => {
  const roleMismatch = receipt(1440, 900);
  roleMismatch.regions[0].role = 'product';
  assert.ok(assessEnLandingPixelBalance(roleMismatch).errors.includes('REGION_ROLE_MISMATCH'));

  const wrongRoute = { ...receipt(1440, 900), route: '/kr' };
  assert.deepEqual(assessEnLandingPixelBalance(wrongRoute).errors, ['INVALID_RECEIPT_SCHEMA']);

  const wrongSchema = { ...receipt(1440, 900), schemaVersion: '2.0.0' };
  assert.deepEqual(assessEnLandingPixelBalance(wrongSchema).errors, ['INVALID_RECEIPT_SCHEMA']);
});

test('safe summaries exclude receipt text and unrecognized input fields', () => {
  const result = assessEnLandingPixelBalance({
    ...receipt(360, 800),
    note: 'token=do-not-reflect',
  });
  const summary = JSON.stringify(toSafePixelBalanceSummary(result));
  assert.match(summary, /INVALID_RECEIPT_SCHEMA/);
  assert.doesNotMatch(summary, /do-not-reflect/);
});

test('fails closed when a receipt is stale for the current EN source', () => {
  const stale = receipt(360, 800);
  stale.sourceDigest = '0'.repeat(64);
  assert.ok(assessEnLandingPixelBalance(stale).errors.includes('SOURCE_DIGEST_MISMATCH'));
});

test('the tracked synthetic CLI fixture obeys the strict receipt schema', () => {
  const fixture = JSON.parse(
    readFileSync('tests/fixtures/en-landing-pixel-receipt.synthetic.json', 'utf8'),
  ) as unknown;
  assert.deepEqual(assessEnLandingPixelBalance(fixture).errors, []);
});

test('tracked browser receipts are bound to the same current EN source digest', () => {
  const paths = [
    'docs/harness/evidence/en-landing-pixel-360-20260825.json',
    'docs/harness/evidence/en-landing-pixel-1440-20260825.json',
  ];
  const receipts = paths.map((path) => JSON.parse(readFileSync(path, 'utf8')) as unknown);
  const parsed = receipts.map((candidate) => assessEnLandingPixelBalance(candidate));
  assert.deepEqual(parsed.flatMap((result) => result.errors), []);
  assert.equal(parsed[0].receipt?.sourceDigest, parsed[1].receipt?.sourceDigest);
});
