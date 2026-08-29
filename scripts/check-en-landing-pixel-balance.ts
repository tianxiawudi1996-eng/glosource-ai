import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPECTED_EN_BALANCE, type BalanceRole } from './check-en-landing-balance';

export const EN_LANDING_PIXEL_RECEIPT_SCHEMA_VERSION = '1.1.0';

export const EN_LANDING_PIXEL_SOURCE_ROOTS = [
  'app/en',
  'app/components',
  'app/globals.css',
  'app/lib/free-plan.ts',
  'app/lib/plans.ts',
  'app/lib/refundPolicy.ts',
  'next.config.ts',
  'package-lock.json',
  'package.json',
  'postcss.config.mjs',
] as const;

export type LandingPixelRegion = {
  id: string;
  role: BalanceRole;
  top: number;
  height: number;
  width: number;
};

export type EnLandingPixelReceipt = {
  schemaVersion: typeof EN_LANDING_PIXEL_RECEIPT_SCHEMA_VERSION;
  route: '/en';
  sourceDigest: string;
  viewport: { width: number; height: number };
  measuredAt: string;
  regions: LandingPixelRegion[];
};

export type EnLandingPixelBalanceAssessment = {
  errors: string[];
  receipt: EnLandingPixelReceipt | null;
  regionCount: number;
  totalHeight: number;
  productSupportingHeight: number;
  cultureOnlyHeight: number;
  productSupportingHeightPercent: number;
  cultureOnlyHeightPercent: number;
};

const RECEIPT_KEYS = new Set(['schemaVersion', 'route', 'sourceDigest', 'viewport', 'measuredAt', 'regions']);
const VIEWPORT_KEYS = new Set(['width', 'height']);
const REGION_KEYS = new Set(['id', 'role', 'top', 'height', 'width']);
const ISO_8601_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const SHA_256_HEX = /^[a-f0-9]{64}$/;

function collectSourceFiles(path: string): string[] {
  const absolutePath = resolve(path);
  const stat = statSync(absolutePath);
  if (stat.isFile()) return [path.replaceAll('\\', '/')];

  return readdirSync(absolutePath, { withFileTypes: true })
    .flatMap((entry) => collectSourceFiles(`${path}/${entry.name}`))
    .filter((file) => /\.(?:css|ts|tsx)$/.test(file));
}

export function canonicalizeTextForDigest(contents: string): string {
  return contents.replace(/\r\n?/g, '\n');
}

export function computeEnLandingPixelSourceDigest(): string {
  const files = EN_LANDING_PIXEL_SOURCE_ROOTS.flatMap(collectSourceFiles).sort();
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(file);
    hash.update('\0');
    // Git may materialize text as CRLF on Windows and LF on Linux. Browser
    // rendering is unchanged, so provenance hashes canonical text instead of
    // binding valid receipts to the checkout operating system.
    hash.update(canonicalizeTextForDigest(readFileSync(resolve(file), 'utf8')));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: Set<string>) {
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isValidMeasuredAt(value: unknown): value is string {
  return typeof value === 'string'
    && ISO_8601_WITH_ZONE.test(value)
    && Number.isFinite(Date.parse(value));
}

function isBalanceRole(value: unknown): value is BalanceRole {
  return value === 'product' || value === 'mixed' || value === 'culture';
}

/**
 * Parses only the documented browser receipt shape. Invalid input is not echoed
 * in errors so a CLI invocation cannot reflect arbitrary text or secret-like data.
 */
export function parseEnLandingPixelReceipt(value: unknown): EnLandingPixelReceipt | null {
  if (!isRecord(value) || !hasOnlyKeys(value, RECEIPT_KEYS)) return null;
  if (value.schemaVersion !== EN_LANDING_PIXEL_RECEIPT_SCHEMA_VERSION || value.route !== '/en') return null;
  if (typeof value.sourceDigest !== 'string' || !SHA_256_HEX.test(value.sourceDigest)) return null;
  if (!isRecord(value.viewport) || !hasOnlyKeys(value.viewport, VIEWPORT_KEYS)) return null;
  if (!isPositiveFiniteNumber(value.viewport.width) || !isPositiveFiniteNumber(value.viewport.height)) return null;
  if (!isValidMeasuredAt(value.measuredAt) || !Array.isArray(value.regions)) return null;

  const regions: LandingPixelRegion[] = [];
  for (const region of value.regions) {
    if (!isRecord(region) || !hasOnlyKeys(region, REGION_KEYS)) return null;
    if (
      typeof region.id !== 'string'
      || !isBalanceRole(region.role)
      || !isPositiveFiniteNumber(region.height)
      || !isPositiveFiniteNumber(region.width)
      || typeof region.top !== 'number'
      || !Number.isFinite(region.top)
      || region.top < 0
    ) return null;
    regions.push({
      id: region.id,
      role: region.role,
      top: region.top,
      height: region.height,
      width: region.width,
    });
  }

  return {
    schemaVersion: EN_LANDING_PIXEL_RECEIPT_SCHEMA_VERSION,
    route: '/en',
    sourceDigest: value.sourceDigest,
    viewport: { width: value.viewport.width, height: value.viewport.height },
    measuredAt: value.measuredAt,
    regions,
  };
}

export function assessEnLandingPixelBalance(
  input: unknown,
  expectedSourceDigest = computeEnLandingPixelSourceDigest(),
): EnLandingPixelBalanceAssessment {
  const receipt = parseEnLandingPixelReceipt(input);
  const errors: string[] = [];
  if (!receipt) {
    return {
      errors: ['INVALID_RECEIPT_SCHEMA'],
      receipt: null,
      regionCount: 0,
      totalHeight: 0,
      productSupportingHeight: 0,
      cultureOnlyHeight: 0,
      productSupportingHeightPercent: 0,
      cultureOnlyHeightPercent: 0,
    };
  }

  if (receipt.sourceDigest !== expectedSourceDigest) errors.push('SOURCE_DIGEST_MISMATCH');

  const found = new Map<string, LandingPixelRegion>();
  let previousTop = -1;
  let previousBottom = -1;
  const expectedOrder = [...EXPECTED_EN_BALANCE.keys()];
  for (const region of receipt.regions) {
    if (found.has(region.id)) errors.push('DUPLICATE_REGION_ID');
    if (!EXPECTED_EN_BALANCE.has(region.id)) errors.push('UNKNOWN_REGION_ID');
    if (region.top <= previousTop) errors.push('REGIONS_NOT_STRICTLY_TOP_ASCENDING');
    if (previousBottom > region.top) errors.push('REGIONS_OVERLAP');
    if (region.width > receipt.viewport.width) errors.push('REGION_WIDTH_EXCEEDS_VIEWPORT');
    previousTop = region.top;
    previousBottom = region.top + region.height;
    found.set(region.id, region);
  }

  if (receipt.regions.some((region, index) => region.id !== expectedOrder[index])) {
    errors.push('REGION_ORDER_MISMATCH');
  }

  for (const [id, role] of EXPECTED_EN_BALANCE) {
    const region = found.get(id);
    if (!region) errors.push('MISSING_REQUIRED_REGION');
    else if (region.role !== role) errors.push('REGION_ROLE_MISMATCH');
  }

  const totalHeight = receipt.regions.reduce((total, region) => total + region.height, 0);
  const productSupportingHeight = receipt.regions
    .filter((region) => region.role !== 'culture')
    .reduce((total, region) => total + region.height, 0);
  const cultureOnlyHeight = receipt.regions
    .filter((region) => region.role === 'culture')
    .reduce((total, region) => total + region.height, 0);
  const productSupportingHeightPercent = totalHeight ? (productSupportingHeight / totalHeight) * 100 : 0;
  const cultureOnlyHeightPercent = totalHeight ? (cultureOnlyHeight / totalHeight) * 100 : 0;

  if (productSupportingHeightPercent < 70) errors.push('PRODUCT_SUPPORTING_HEIGHT_BELOW_70_PERCENT');
  if (cultureOnlyHeightPercent > 30) errors.push('CULTURE_ONLY_HEIGHT_ABOVE_30_PERCENT');

  return {
    errors: [...new Set(errors)],
    receipt,
    regionCount: receipt.regions.length,
    totalHeight,
    productSupportingHeight,
    cultureOnlyHeight,
    productSupportingHeightPercent,
    cultureOnlyHeightPercent,
  };
}

export function toSafePixelBalanceSummary(result: EnLandingPixelBalanceAssessment) {
  return {
    status: result.errors.length === 0 ? 'clean' : 'blocked',
    errors: result.errors,
    calculation: 'height-share-of-receipt-regions',
    regionCount: result.regionCount,
    totalHeight: result.totalHeight,
    productSupportingHeight: result.productSupportingHeight,
    cultureOnlyHeight: result.cultureOnlyHeight,
    productSupportingHeightPercent: result.productSupportingHeightPercent,
    cultureOnlyHeightPercent: result.cultureOnlyHeightPercent,
  };
}

function main() {
  const path = process.argv[2];
  if (!path || process.argv.length !== 3) {
    console.error(JSON.stringify({ status: 'blocked', errors: ['USAGE_REQUIRES_ONE_RECEIPT_PATH'] }));
    process.exitCode = 1;
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(resolve(path), 'utf8')) as unknown;
  } catch {
    console.error(JSON.stringify({ status: 'blocked', errors: ['RECEIPT_FILE_UNREADABLE_OR_INVALID_JSON'] }));
    process.exitCode = 1;
    return;
  }

  const summary = toSafePixelBalanceSummary(assessEnLandingPixelBalance(parsed));
  const output = JSON.stringify(summary);
  if (summary.status === 'clean') console.log(output);
  else {
    console.error(output);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
