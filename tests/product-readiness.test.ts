import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assessReleaseManifest,
  buildProductReadinessReport,
} from '../scripts/check-product-readiness';

const currentHead = 'a'.repeat(40);

function releaseManifest(
  requiredEnvironment: readonly string[],
  overrides: { commit?: string; dirty?: boolean } = {},
) {
  return {
    schemaVersion: 1,
    product: 'GloSource AI',
    packageName: 'glosource-ai',
    version: '0.1.0',
    source: {
      commit: overrides.commit ?? currentHead.slice(0, 12),
      dirty: overrides.dirty ?? false,
    },
    requiredEnvironment,
    secretsIncluded: false,
  };
}

test('product readiness reports only missing environment names', () => {
  const report = buildProductReadinessReport({
    requiredEnvironment: ['DATABASE_URL', 'AUTH_SECRET'],
    environment: {
      DATABASE_URL: 'postgres://secret-value',
      AUTH_SECRET: '',
    },
    vercelLink: {
      projectId: 'prj_example',
      orgId: 'team_example',
      projectName: 'glosource-ai',
    },
    archivePath: 'dist/glosource-ai.tgz',
    archiveManifest: releaseManifest(['DATABASE_URL', 'AUTH_SECRET']),
    currentHead,
    dirty: false,
  });

  assert.deepEqual(report.environment.missing, ['AUTH_SECRET']);
  assert.equal(report.environment.scope, 'local-process');
  assert.equal(report.status, 'blocked');
  assert.doesNotMatch(JSON.stringify(report), /postgres:\/\/secret-value/);
});

test('product readiness requires link, archive, clean source, and all env names', () => {
  const ready = buildProductReadinessReport({
    requiredEnvironment: ['DATABASE_URL'],
    environment: { DATABASE_URL: 'configured' },
    vercelLink: {
      projectId: 'prj_example',
      orgId: 'team_example',
      projectName: 'glosource-ai',
    },
    archivePath: 'dist/glosource-ai.tgz',
    archiveManifest: releaseManifest(['DATABASE_URL']),
    currentHead,
    dirty: false,
  });
  assert.equal(ready.status, 'ready');
  assert.deepEqual(ready.blockers, []);

  const blocked = buildProductReadinessReport({
    requiredEnvironment: ['DATABASE_URL'],
    environment: { DATABASE_URL: 'configured' },
    vercelLink: null,
    archivePath: null,
    archiveManifest: null,
    currentHead,
    dirty: true,
  });
  assert.equal(blocked.status, 'blocked');
  assert.deepEqual(blocked.blockers, [
    'Vercel project link is missing or incomplete.',
    'No packaged release archive was found.',
    'The source tree is dirty; create a clean provenance build before production deployment.',
  ]);
});

test('product readiness rejects stale, dirty, and malformed archive manifests', () => {
  const common = {
    requiredEnvironment: ['DATABASE_URL'] as const,
    environment: { DATABASE_URL: 'configured' },
    vercelLink: {
      projectId: 'prj_example',
      orgId: 'team_example',
      projectName: 'glosource-ai',
    },
    archivePath: 'dist/glosource-ai.tgz',
    currentHead,
    dirty: false,
  };

  const stale = buildProductReadinessReport({
    ...common,
    archiveManifest: releaseManifest(common.requiredEnvironment, {
      commit: 'b'.repeat(12),
    }),
  });
  assert.equal(stale.status, 'blocked');
  assert.equal(stale.releaseArchive.manifestVerified, true);
  assert.equal(stale.releaseArchive.candidateMatch, false);
  assert.match(stale.blockers.join('\n'), /not bound to the current HEAD/);

  const dirtyArchive = buildProductReadinessReport({
    ...common,
    archiveManifest: releaseManifest(common.requiredEnvironment, { dirty: true }),
  });
  assert.equal(dirtyArchive.releaseArchive.cleanSource, false);
  assert.match(dirtyArchive.blockers.join('\n'), /built from dirty source/);

  const malformed = buildProductReadinessReport({
    ...common,
    archiveManifest: { source: { commit: currentHead } },
  });
  assert.equal(malformed.releaseArchive.manifestVerified, false);
  assert.match(malformed.blockers.join('\n'), /manifest is missing or invalid/);
});

test('release manifest assessment requires the canonical environment contract', () => {
  const assessment = assessReleaseManifest(
    releaseManifest(['DATABASE_URL']),
    currentHead,
    ['DATABASE_URL'],
  );
  assert.deepEqual(assessment, {
    verified: true,
    candidateMatch: true,
    cleanSource: true,
    commit: currentHead.slice(0, 12),
  });

  assert.equal(
    assessReleaseManifest(
      releaseManifest(['AUTH_SECRET']),
      currentHead,
      ['DATABASE_URL'],
    ).verified,
    false,
  );
});
