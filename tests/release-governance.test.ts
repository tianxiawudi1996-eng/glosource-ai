import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync('.github/workflows/promote.yml', 'utf8');
const productionTarget = JSON.parse(
  readFileSync('docs/operations/PRODUCTION_TARGET.json', 'utf8'),
) as {
  schemaVersion: number;
  vercel: { orgId: string; projectId: string; projectName: string };
  github: { repository: string; environment: string; requiredSecretNames: string[] };
};
const verifyJob = workflow.match(/^  verify:\r?\n([\s\S]*?)(?=^  promote:)/m)?.[1] ?? '';
const promoteJob = workflow.match(/^  promote:\r?\n([\s\S]*)$/m)?.[1] ?? '';

test('ordinary branch pushes verify but cannot promote master', () => {
  assert.match(workflow, /push:\s*[\s\S]*branches-ignore:\s*[\s\S]*- master/);
  assert.match(workflow, /jobs:\s*[\s\S]*verify:/);
  assert.match(workflow, /promote:\s*[\s\S]*if:.*workflow_dispatch/);
  assert.doesNotMatch(verifyJob, /contents:\s*write|git push|HEAD:master/);
  assert.equal(workflow.match(/git push origin HEAD:master/g)?.length, 1);
});

test('CI build uses a valid isolated database URL', () => {
  const declaration = verifyJob.match(/DATABASE_URL:\s*(.+)/)?.[1].trim() ?? '';
  assert.equal(
    declaration,
    "${{ format('{0}://{1}:{2}@{3}:{4}/{5}', 'postgresql', 'ci', 'ci', '127.0.0.1', 5432, 'ci') }}",
  );
  const url = new URL(['postgresql', '://', 'ci:ci@127.0.0.1:5432/ci'].join(''));
  assert.match(url.hostname, /^(?:127\.0\.0\.1|localhost)$/);
});

test('production promotion requires typed confirmation and protected environment', () => {
  assert.match(workflow, /workflow_dispatch:\s*[\s\S]*confirm_production:/);
  assert.match(workflow, /inputs\.confirm_production == 'PROMOTE'/);
  assert.match(workflow, /environment:\s*production/);
  assert.match(workflow, /needs:\s*verify/);
  assert.match(promoteJob, /if: github\.event_name == 'workflow_dispatch' && inputs\.confirm_production == 'PROMOTE'/);
  assert.match(promoteJob, /permissions:\s*[\s\S]*contents:\s*write/);
});

test('production promotions share one repository-wide serialization lock', () => {
  assert.doesNotMatch(workflow, /^concurrency:/m);
  assert.match(promoteJob, /concurrency:\s*[\s\S]*group:\s*glosource-production-promotion/);
  assert.match(promoteJob, /cancel-in-progress:\s*false/);
  assert.doesNotMatch(promoteJob, /concurrency:[\s\S]*github\.ref/);
});

test('tracked Production target has exact non-placeholder provider identity', () => {
  assert.equal(productionTarget.schemaVersion, 1);
  assert.match(productionTarget.vercel.orgId, /^team_[A-Za-z0-9]+$/);
  assert.match(productionTarget.vercel.projectId, /^prj_[A-Za-z0-9]+$/);
  assert.equal(productionTarget.vercel.projectName, 'glosource-ai');
  assert.equal(
    productionTarget.github.repository,
    'tianxiawudi1996-eng/glosource-ai',
  );
  assert.equal(productionTarget.github.environment, 'production');
  assert.deepEqual(productionTarget.github.requiredSecretNames, ['DATABASE_URL']);
  for (const name of productionTarget.github.requiredSecretNames) {
    assert.match(promoteJob, new RegExp(`secrets\\.${name}`));
  }
});

test('production migration succeeds before master can advance', () => {
  const evidencePreflight = promoteJob.indexOf('npm run readiness:promotion-evidence');
  const migration = promoteJob.indexOf('npm run db:migrate');
  const push = promoteJob.indexOf('git push origin HEAD:master');

  assert.ok(evidencePreflight >= 0, 'candidate-bound evidence must be validated');
  assert.ok(migration > evidencePreflight, 'migration must wait for evidence preflight');
  assert.ok(migration >= 0, 'the production job must apply tracked migrations');
  assert.ok(push > migration, 'master must not advance before migrations succeed');
  assert.match(promoteJob, /DATABASE_URL:\s*\$\{\{ secrets\.DATABASE_URL \}\}/);
  assert.match(promoteJob, /if \[ -z "\$DATABASE_URL" \]/);
});

test('promotion remains fast-forward only', () => {
  assert.match(workflow, /git merge-base --is-ancestor origin\/master HEAD/);
  assert.match(workflow, /git push origin HEAD:master/);
  assert.doesNotMatch(workflow, /--force(?:-with-lease)?/);
});
