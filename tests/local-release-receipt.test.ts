import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildLocalReleaseReceiptReport,
  hasChildExited,
  resolveArchiveWithinDist,
  type LocalReleaseReceipt,
  type LocalReleaseReceiptContext,
} from '../scripts/local-release-receipt';

test('signal-terminated child processes count as stopped on Windows', () => {
  assert.equal(hasChildExited({ exitCode: 0, signalCode: null }), true);
  assert.equal(hasChildExited({ exitCode: null, signalCode: 'SIGTERM' }), true);
  assert.equal(hasChildExited({ exitCode: null, signalCode: null }), false);
});
import { REQUIRED_PRODUCTION_ENV } from '../scripts/package-release';

const candidateSha = 'a'.repeat(40);
const archiveSha256 = 'b'.repeat(64);
const archivePath = 'dist/glosource-ai-0.1.0-candidate.tgz';

function manifest(commit = candidateSha.slice(0, 12)) {
  return {
    schemaVersion: 1,
    product: 'GloSource AI',
    packageName: 'glosource-ai',
    version: '0.1.0',
    source: { commit, dirty: false },
    requiredEnvironment: [...REQUIRED_PRODUCTION_ENV],
    secretsIncluded: false,
  };
}

function receipt(overrides: Partial<LocalReleaseReceipt> = {}): LocalReleaseReceipt {
  return {
    schemaVersion: 1,
    kind: 'glosource-local-release-receipt',
    candidateSha,
    createdAt: '2026-08-23T07:00:00.000Z',
    archive: {
      path: archivePath,
      sha256: archiveSha256,
      bytes: 123456,
      entryCount: 2883,
      unpackedFileCount: 2460,
      blockedFileCount: 0,
      allZeroFileCount: 0,
      manifest: {
        commit: candidateSha.slice(0, 12),
        dirty: false,
        requiredEnvironmentCount: REQUIRED_PRODUCTION_ENV.length,
        secretsIncluded: false,
      },
    },
    smoke: {
      routes: [
        { path: '/', status: 200 },
        { path: '/en', status: 200 },
        { path: '/api/auth/session', status: 200 },
      ],
      productContract: { passed: 7, total: 7 },
      runtimeErrorTokenCount: 0,
    },
    safety: {
      loopbackOnly: true,
      secretValuesIncluded: false,
      externalActions: 0,
    },
    ...overrides,
  };
}

function context(overrides: Partial<LocalReleaseReceiptContext> = {}): LocalReleaseReceiptContext {
  return {
    currentHead: candidateSha,
    dirty: false,
    archivePath,
    archiveSha256,
    archiveBytes: 123456,
    archiveManifest: manifest(),
    ...overrides,
  };
}

test('a clean candidate-bound archive and smoke receipt is ready', () => {
  const report = buildLocalReleaseReceiptReport({
    receipt: receipt(),
    context: context(),
    receiptPath: `reports/harness/private/local-release-receipts/${candidateSha}.json`,
  });

  assert.equal(report.status, 'ready');
  assert.deepEqual(report.blockerCodes, []);
  assert.equal(report.checks.sourceClean, true);
  assert.equal(report.checks.archiveBound, true);
  assert.equal(report.checks.smokeGreen, true);
});

test('dirty source and candidate, digest, or size drift fail closed', () => {
  const report = buildLocalReleaseReceiptReport({
    receipt: receipt(),
    context: context({
      currentHead: 'c'.repeat(40),
      dirty: true,
      archiveSha256: 'd'.repeat(64),
      archiveBytes: 987654,
      archiveManifest: manifest('c'.repeat(12)),
    }),
    receiptPath: 'reports/harness/private/local-release-receipts/mismatch.json',
  });

  assert.equal(report.status, 'blocked');
  assert.deepEqual(report.blockerCodes, [
    'SOURCE_DIRTY',
    'RECEIPT_CANDIDATE_MISMATCH',
    'RECEIPT_ARCHIVE_DIGEST_MISMATCH',
    'RECEIPT_ARCHIVE_SIZE_MISMATCH',
    'RECEIPT_MANIFEST_MISMATCH',
  ]);
  assert.equal(report.checks.archiveBound, false);
});

test('unknown and sensitive-shaped receipt fields are rejected without reflection', () => {
  const malicious = {
    ...receipt(),
    databaseUrl: ['postgresql', '://should-never-surface'].join(''),
  };
  const report = buildLocalReleaseReceiptReport({
    receipt: malicious,
    context: context(),
    receiptPath: 'reports/harness/private/local-release-receipts/invalid.json',
  });

  assert.equal(report.status, 'blocked');
  assert.ok(report.blockerCodes.includes('LOCAL_RELEASE_RECEIPT_INVALID'));
  assert.doesNotMatch(JSON.stringify(report), /should-never-surface|databaseUrl/);
});

test('release receipt archives must stay inside dist', () => {
  assert.match(
    resolveArchiveWithinDist(process.cwd(), archivePath),
    /dist[\\/]glosource-ai-0\.1\.0-candidate\.tgz$/,
  );
  assert.throws(
    () => resolveArchiveWithinDist(process.cwd(), '../outside.tgz'),
    /inside dist/,
  );
  assert.throws(
    () => resolveArchiveWithinDist(process.cwd(), 'dist/not-an-archive.zip'),
    /inside dist/,
  );
});

test('receipt commands use the existing ignored private harness surface', () => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
    scripts: Record<string, string>;
  };
  const gitignore = readFileSync('.gitignore', 'utf8');
  const source = readFileSync('scripts/local-release-receipt.ts', 'utf8');

  assert.equal(
    packageJson.scripts['receipt:release'],
    'tsx scripts/local-release-receipt.ts create',
  );
  assert.equal(
    packageJson.scripts['readiness:release-receipt'],
    'tsx scripts/local-release-receipt.ts check',
  );
  assert.match(gitignore, /^reports\/harness\/private\/$/m);
  assert.match(source, /local-release-receipts/);
  assert.doesNotMatch(source, /\.\.\.process\.env/);
});
