import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  assertPackagePathSafe,
  assertStandaloneIntegrity,
  buildReleaseManifest,
  OPTIONAL_PRODUCTION_ENV,
  packageRelease,
  REQUIRED_PRODUCTION_ENV,
} from '../scripts/package-release';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, string>;
};
const nextConfig = readFileSync('next.config.ts', 'utf8');
const eslintConfig = readFileSync('eslint.config.mjs', 'utf8');

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
  assert.match(eslintConfig, /['"]dist\/\*\*['"]/);
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
    'AUTH_URL',
    'AUTH_TRUST_HOST',
    'GEMINI_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'RESEND_FULL_API_KEY',
    'RESEND_WEBHOOK_SECRET',
    'POLAR_WEBHOOK_SECRET',
    'CRON_SECRET',
  ]) {
    if (key === 'RESEND_FULL_API_KEY') {
      assert.equal(requiredEnvironment.includes(key), false, `${key} must remain optional`);
      assert.ok(OPTIONAL_PRODUCTION_ENV.includes(key), `${key} must be documented`);
    } else {
      assert.ok(requiredEnvironment.includes(key), `${key} must be documented`);
    }
  }
});

test('release packaging fails closed on common credential files', () => {
  for (const path of [
    '.env.production',
    '.envrc',
    'secrets/private.pem',
    'deploy/service-account-prod.json',
    'deploy/service_account_prod.json',
    'oauth/client_secret_123.apps.googleusercontent.com.json',
    'gcloud/application_default_credentials.json',
    '.npmrc',
    'credentials.json',
  ]) {
    assert.throws(
      () => assertPackagePathSafe(path),
      /Refusing to package sensitive file/,
    );
  }
  assert.equal(assertPackagePathSafe('public/logo.svg'), true);
});

test('packageRelease creates an inspectable archive and cleans failed output', async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), 'glosource-release-'));
  try {
    await Promise.all([
      mkdir(join(projectRoot, '.next', 'standalone'), { recursive: true }),
      mkdir(join(projectRoot, '.next', 'static'), { recursive: true }),
      mkdir(join(projectRoot, 'public'), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(join(projectRoot, 'package.json'), '{"version":"9.9.9"}\n'),
      writeFile(join(projectRoot, '.next', 'standalone', 'server.js'), 'server\n'),
      writeFile(join(projectRoot, '.next', 'static', 'app.js'), 'static\n'),
      writeFile(join(projectRoot, 'public', 'logo.svg'), '<svg />\n'),
    ]);

    const release = await packageRelease(projectRoot);
    const manifest = JSON.parse(
      await readFile(join(release.packageDirectory, 'RELEASE-MANIFEST.json'), 'utf8'),
    ) as { version: string; secretsIncluded: boolean };
    const archive = spawnSync('tar', ['-tzf', release.archivePath], {
      encoding: 'utf8',
    });

    assert.equal(manifest.version, '9.9.9');
    assert.equal(manifest.secretsIncluded, false);
    assert.equal(archive.status, 0, archive.stderr);
    assert.match(archive.stdout, /server\.js/);
    assert.match(archive.stdout, /public\/logo\.svg/);
    assert.match(archive.stdout, /\.next\/static\/app\.js/);

    await writeFile(join(projectRoot, 'public', '.env.production'), 'SECRET=value\n');
    await assert.rejects(
      packageRelease(projectRoot),
      /Refusing to package sensitive file/,
    );
    const distEntries = await readdir(join(projectRoot, 'dist'));
    assert.equal(
      distEntries.filter((entry) => !entry.endsWith('.tgz')).length,
      1,
      'failed packaging must remove its partial directory',
    );
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test('standalone integrity check rejects interrupted all-zero build output', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'glosource-corrupt-build-'));
  try {
    await writeFile(join(directory, 'valid.js'), 'module.exports = true;\n');
    await writeFile(join(directory, 'corrupt.js'), Buffer.alloc(32));
    await assert.rejects(
      assertStandaloneIntegrity(directory),
      /Corrupt standalone build artifact \(all zero bytes\)/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
