import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  buildLifecycleTransition,
  completeLifecyclePhase,
  loadLifecycleManifest,
  loadLifecycleState,
  validateLifecycleFiles,
  validateLifecyclePointer,
  validateLifecycleState,
} from '../scripts/lifecycle-harness';

const manifest = loadLifecycleManifest();
const currentState = loadLifecycleState();

function p00State() {
  return {
    schemaVersion: '1.0.0',
    lifecycleId: manifest.lifecycleId,
    runId: 'TEST-RUN-001',
    mode: 'standard',
    baselinePhase: 'P00',
    activePhase: 'P00',
    status: 'in_progress',
    phaseStartedAt: '2026-08-07T00:00:00.000Z',
    completedPhases: [],
    reportIndex: [],
    blockers: [],
    approvalsPending: [],
    lastValidatedAt: null,
  } as const;
}

function p00Evidence() {
  return {
    schemaVersion: 1,
    runId: 'TEST-RUN-001',
    phaseId: 'P00',
    completedAt: '2026-08-07T01:00:00.000Z',
    criteria: [
      { id: 'GOAL_DEFINED', status: 'pass', references: ['docs/requirements/goal.md'] },
      { id: 'SCOPE_BOUNDARY_DEFINED', status: 'pass', references: ['docs/requirements/scope.md'] },
      { id: 'SUCCESS_METRICS_DEFINED', status: 'pass', references: ['docs/requirements/metrics.md'] },
    ],
    approvals: [],
    verification: [
      { id: 'P00_REVIEW', status: 'pass', reference: 'EVIDENCE-P00-001' },
    ],
  } as const;
}

test('manifest defines an unbroken P00 through P16 lifecycle', () => {
  assert.equal(manifest.phases.length, 17);
  assert.deepEqual(
    manifest.phases.map((phase) => phase.id),
    Array.from({ length: 17 }, (_, index) => `P${String(index).padStart(2, '0')}`),
  );
  for (const [index, phase] of manifest.phases.entries()) {
    const expectedNext: string | null = index === manifest.phases.length - 1
      ? null
      : manifest.phases[index + 1].id;
    assert.equal(phase.next, expectedNext);
  }
});

test('every phase has a complete phase-specific metaprompt', () => {
  const result = validateLifecycleFiles(manifest, process.cwd());
  assert.deepEqual(result, []);
  for (const phase of manifest.phases) {
    const source = readFileSync(phase.prompt, 'utf8');
    for (const heading of [
      '## Role',
      '## Objective',
      '## Required Inputs',
      '## Workflow',
      '## Exit Gate',
      '## Report Obligation',
      '## Approval Boundary',
      '## Stop Conditions',
    ]) {
      assert.match(source, new RegExp(`^${heading}$`, 'm'));
    }
  }
});

test('brownfield baseline is valid at blocked P10 without invented history', () => {
  assert.deepEqual(validateLifecycleState(manifest, currentState), []);
  assert.equal(currentState.mode, 'brownfield');
  assert.equal(currentState.baselinePhase, 'P10');
  assert.equal(currentState.activePhase, 'P10');
  assert.equal(currentState.status, 'blocked');
  assert.deepEqual(currentState.completedPhases, []);
  const mainState = JSON.parse(readFileSync('docs/harness/STATE.json', 'utf8'));
  assert.deepEqual(
    validateLifecyclePointer(manifest, mainState),
    [],
  );
});

test('one complete phase advances exactly once and builds its report', () => {
  const result = buildLifecycleTransition(manifest, p00State(), p00Evidence());
  assert.equal(result.nextState.activePhase, 'P01');
  assert.equal(result.nextState.status, 'ready');
  assert.equal(result.nextState.completedPhases.length, 1);
  assert.equal(result.reportPath, 'docs/harness/lifecycle/reports/TEST-RUN-001-P00.md');
  assert.match(result.reportContent, /# P00 Intake and Strategy Completion Report/);
  assert.match(result.reportContent, /Evidence digest:/);
  assert.doesNotMatch(result.reportContent, /token|secret|reviewer@/i);
});

test('wrong phase, missing criteria, and unknown sensitive fields fail closed', () => {
  assert.throws(
    () => buildLifecycleTransition(manifest, p00State(), { ...p00Evidence(), phaseId: 'P01' }),
    /active phase/i,
  );
  assert.throws(
    () => buildLifecycleTransition(manifest, p00State(), {
      ...p00Evidence(),
      criteria: p00Evidence().criteria.slice(0, 2),
    }),
    /criteria/i,
  );
  assert.throws(
    () => buildLifecycleTransition(manifest, p00State(), {
      ...p00Evidence(),
      secret: 'must-not-be-accepted',
    }),
    /completion evidence/i,
  );
});

test('external-effect phases require every declared approval gate', () => {
  const p12 = manifest.phases.find((phase) => phase.id === 'P12');
  assert.ok(p12);
  const state = {
    ...p00State(),
    runId: 'TEST-RUN-P12',
    mode: 'brownfield',
    baselinePhase: 'P12',
    activePhase: 'P12',
    approvalsPending: [...p12.approvalGates],
  };
  const evidence = {
    schemaVersion: 1,
    runId: state.runId,
    phaseId: 'P12',
    completedAt: '2026-08-07T01:00:00.000Z',
    criteria: p12.exitCriteria.map((criterion) => ({
      id: criterion.id,
      status: 'pass',
      references: [`EVIDENCE-${criterion.id}`],
    })),
    approvals: [],
    verification: [{ id: 'PRODUCTION_VERIFY', status: 'pass', reference: 'EVIDENCE-P12-001' }],
  };
  assert.throws(
    () => buildLifecycleTransition(manifest, state, evidence),
    /approval/i,
  );
});

test('completion writer creates report and state together without overwrite', async () => {
  const root = mkdtempSync(join(tmpdir(), 'glo-lifecycle-'));
  const statePath = join(root, 'STATE.json');
  const reportDirectory = join(root, 'reports');
  writeFileSync(statePath, `${JSON.stringify(p00State(), null, 2)}\n`, 'utf8');

  try {
    const result = await completeLifecyclePhase({
      manifest,
      statePath,
      reportDirectory,
      evidence: p00Evidence(),
    });
    assert.equal(result.nextState.activePhase, 'P01');
    assert.ok(existsSync(join(reportDirectory, 'TEST-RUN-001-P00.md')));
    assert.equal(JSON.parse(readFileSync(statePath, 'utf8')).activePhase, 'P01');
    writeFileSync(statePath, `${JSON.stringify(p00State(), null, 2)}\n`, 'utf8');
    await assert.rejects(
      completeLifecyclePhase({
        manifest,
        statePath,
        reportDirectory,
        evidence: p00Evidence(),
      }),
      /active phase|in_progress|already exists/i,
    );
    assert.equal(JSON.parse(readFileSync(statePath, 'utf8')).activePhase, 'P00');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('lifecycle engine has no provider, network, subprocess, or deployment adapter', () => {
  const source = readFileSync('scripts/lifecycle-harness.ts', 'utf8');
  assert.doesNotMatch(
    source,
    /from ['"](?:node:)?(?:child_process|http|https|net|tls)['"]|\b(?:fetch|spawn|exec|execa)\s*\(/,
  );
  assert.doesNotMatch(source, /vercel\s+|gh\s+api|git\s+push|workflow_dispatch/i);
});
