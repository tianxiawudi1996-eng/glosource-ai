import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type BalanceRole = 'product' | 'mixed' | 'culture';

export const EXPECTED_EN_BALANCE = new Map<string, BalanceRole>([
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
]);

const SOURCES = [
  'app/en/page.tsx',
  'app/components/HeroSection.tsx',
  'app/components/KoreaJourneySection.tsx',
] as const;

export function extractEnBalanceMarkers(source: string) {
  const markers: Array<{ id: string; role: BalanceRole }> = [];
  const pattern = /data-en-balance=(?:"([a-z-]+):(product|mixed|culture)"|\{lang === 'en' \? '([a-z-]+):(product|mixed|culture)' : undefined\})/g;
  for (const match of source.matchAll(pattern)) {
    markers.push({
      id: match[1] ?? match[3],
      role: (match[2] ?? match[4]) as BalanceRole,
    });
  }
  return markers;
}

export function assessEnLandingBalance(markers: Array<{ id: string; role: BalanceRole }>) {
  const errors: string[] = [];
  const found = new Map<string, BalanceRole>();

  for (const marker of markers) {
    if (found.has(marker.id)) errors.push(`Duplicate balance region: ${marker.id}`);
    found.set(marker.id, marker.role);
  }
  for (const [id, role] of EXPECTED_EN_BALANCE) {
    if (found.get(id) !== role) errors.push(`Expected ${id}:${role}`);
  }
  for (const id of found.keys()) {
    if (!EXPECTED_EN_BALANCE.has(id)) errors.push(`Unknown balance region: ${id}`);
  }

  const total = markers.length;
  const productSupporting = markers.filter((marker) => marker.role !== 'culture').length;
  const cultureOnly = markers.filter((marker) => marker.role === 'culture').length;
  const productSupportingPercent = total ? (productSupporting / total) * 100 : 0;
  const cultureOnlyPercent = total ? (cultureOnly / total) * 100 : 0;

  if (productSupportingPercent < 70) errors.push('Product/evidence-supporting regions fell below 70%.');
  if (cultureOnlyPercent > 30) errors.push('Culture-only regions exceeded 30%.');
  if (cultureOnly === 0) errors.push('A restrained culture-only journey region is required.');

  return {
    errors,
    total,
    productSupporting,
    cultureOnly,
    productSupportingPercent,
    cultureOnlyPercent,
  };
}

function main() {
  const root = process.cwd();
  const markers = SOURCES.flatMap((source) =>
    extractEnBalanceMarkers(readFileSync(resolve(root, source), 'utf8')),
  );
  const result = assessEnLandingBalance(markers);
  if (result.errors.length) {
    result.errors.forEach((error) => console.error(`[en-landing-balance] ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(JSON.stringify({ status: 'clean', ...result }, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
