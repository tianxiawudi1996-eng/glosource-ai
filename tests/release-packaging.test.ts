import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildReleaseManifest,
  REQUIRED_PRODUCTION_ENV,
} from '../scripts/package-release';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, string>;
};
const nextConfig = readFileSync('next.config.ts', 'utf8');

test('product packaging builds a standalone Next.js release', () => {
  assert.equal(
    packageJson.scripts['package:product'],
    'npm run build && tsx scripts/package-release.ts',
  );
  assert.equal(
    packageJson.scripts['release:product'],
    'npm run verify:product && npm run package:product',
  );
  assert.match(nextConfig, /output:\s*['"]standalone['"]/);
  assert.match(
    readFileSync('scripts/package-release.ts', 'utf8'),
    /mkdir\(distRoot,\s*\{\s*recursive:\s*true\s*\}\)/,
  );
});

test('release manifest documents runtime and required production configuration', () => {
  const manifest = buildReleaseManifest({
    version: '1.2.3',
    commit: 'abc123',
    dirty: true,
    builtAt: '2026-07-29T00:00:00.000Z',
    nodeVersion: 'v24.12.0',
  });

  assert.equal(manifest.product, 'GloSource AI');
  assert.equal(manifest.version, '1.2.3');
  assert.equal(manifest.runtime.startCommand, 'node server.js');
  assert.equal(manifest.source.dirty, true);
  assert.deepEqual(manifest.requiredEnvironment, REQUIRED_PRODUCTION_ENV);
  const requiredEnvironment: readonly string[] = REQUIRED_PRODUCTION_ENV;
  for (const key of [
    'DATABASE_URL',
    'AUTH_SECRET',
    'GEMINI_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'POLAR_WEBHOOK_SECRET',
    'CRON_SECRET',
  ]) {
    assert.ok(requiredEnvironment.includes(key), `${key} must be documented`);
  }
});
