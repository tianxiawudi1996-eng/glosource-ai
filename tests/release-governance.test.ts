import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync('.github/workflows/promote.yml', 'utf8');
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

test('promotion remains fast-forward only', () => {
  assert.match(workflow, /git merge-base --is-ancestor origin\/master HEAD/);
  assert.match(workflow, /git push origin HEAD:master/);
  assert.doesNotMatch(workflow, /--force(?:-with-lease)?/);
});
