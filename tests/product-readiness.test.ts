import assert from 'node:assert/strict';
import test from 'node:test';
import { buildProductReadinessReport } from '../scripts/check-product-readiness';

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
    dirty: false,
  });
  assert.equal(ready.status, 'ready');
  assert.deepEqual(ready.blockers, []);

  const blocked = buildProductReadinessReport({
    requiredEnvironment: ['DATABASE_URL'],
    environment: { DATABASE_URL: 'configured' },
    vercelLink: null,
    archivePath: null,
    dirty: true,
  });
  assert.equal(blocked.status, 'blocked');
  assert.deepEqual(blocked.blockers, [
    'Vercel project link is missing or incomplete.',
    'No packaged release archive was found.',
    'The source tree is dirty; create a clean provenance build before production deployment.',
  ]);
});
