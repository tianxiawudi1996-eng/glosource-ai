import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  decideP10ReceiptGate,
  P10_LIFECYCLE_STATE,
  P10_RECEIPT_GATE_PROMPT,
  P10_TASK_QUEUE,
  validateP10ReceiptGateHarness,
} from '../scripts/check-p10-receipt-gate-harness';

const prompt = readFileSync(P10_RECEIPT_GATE_PROMPT, 'utf8');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, unknown>;
};
const context = {
  lifecycleState: JSON.parse(readFileSync(P10_LIFECYCLE_STATE, 'utf8')),
  taskQueue: readFileSync(P10_TASK_QUEUE, 'utf8'),
  packageScripts: packageJson.scripts,
};

test('P10 receipt gate prompt preserves its complete execution contract', () => {
  assert.deepEqual(validateP10ReceiptGateHarness(prompt, context), []);
});

test('P10 receipt gate rejects removal of every required section', () => {
  const headings = [
    '## GOAL:',
    '## SCOPE:',
    '## OUT OF SCOPE:',
    '## STATE MODEL / DECISION TABLE:',
    '## AUTHORITY / PERMISSIONS:',
    '## SUCCESS CRITERIA:',
    '## FAILURE CRITERIA:',
    '## STOP CONDITION:',
  ];
  for (const heading of headings) {
    const drifted = prompt.replace(heading, '## REMOVED:');
    assert.ok(
      validateP10ReceiptGateHarness(drifted, context).some((error) =>
        error.includes(heading),
      ),
      `expected missing heading failure: ${heading}`,
    );
  }
});

test('dirty source is always blocked and never recovery-ready', () => {
  assert.equal(decideP10ReceiptGate({
    status: 'blocked',
    sourceClean: false,
    blockerCodes: ['SOURCE_DIRTY'],
  }), 'blocked');
  const weakened = prompt.replace(
    '즉시 STOP; package/create, stash/reset/cleanup/commit 금지',
    'package를 계속 실행',
  );
  assert.ok(
    validateP10ReceiptGateHarness(weakened, context).some((error) =>
      error.includes('DIRTY_HARD_STOP'),
    ),
  );
});

test('ready avoids rebuild while clean missing or drift allows one local recovery', () => {
  assert.equal(decideP10ReceiptGate({
    status: 'ready',
    sourceClean: true,
    blockerCodes: [],
  }), 'ready');
  assert.equal(decideP10ReceiptGate({
    status: 'blocked',
    sourceClean: true,
    blockerCodes: ['LOCAL_RELEASE_RECEIPT_MISSING'],
  }), 'local_recovery_ready');
  assert.equal(decideP10ReceiptGate({
    status: 'blocked',
    sourceClean: true,
    blockerCodes: ['RECEIPT_ARCHIVE_DIGEST_MISMATCH'],
  }), 'local_recovery_ready');
});

test('unknown, invalid, and contradictory reports fail closed', () => {
  assert.equal(decideP10ReceiptGate({
    status: 'blocked',
    sourceClean: true,
    blockerCodes: ['LOCAL_RELEASE_RECEIPT_INVALID'],
  }), 'blocked');
  assert.equal(decideP10ReceiptGate({
    status: 'ready',
    sourceClean: true,
    blockerCodes: ['SOURCE_DIRTY'],
  }), 'blocked');
  assert.equal(decideP10ReceiptGate({
    status: 'blocked',
    sourceClean: true,
    blockerCodes: [],
  }), 'blocked');
});

test('P10 lifecycle and package script drift are rejected', () => {
  const wrongLifecycle = {
    ...context,
    lifecycleState: { activePhase: 'P11', status: 'ready' },
  };
  assert.ok(validateP10ReceiptGateHarness(prompt, wrongLifecycle).length > 0);

  const wrongScript = {
    ...context,
    packageScripts: {
      ...context.packageScripts,
      'readiness:release-receipt': 'tsx scripts/unsafe.ts',
    },
  };
  assert.ok(
    validateP10ReceiptGateHarness(prompt, wrongScript).some((error) =>
      error.includes('check script drifted'),
    ),
  );
});

test('external authority and evidence ceiling cannot be weakened', () => {
  const authorityDrift = prompt.replace('별도 명시 승인 전 금지', '자동 승인');
  assert.ok(
    validateP10ReceiptGateHarness(authorityDrift, context).some((error) =>
      error.includes('EXTERNAL_AUTHORITY'),
    ),
  );
  const evidenceDrift = prompt.replace(
    'local receipt, build, smoke는 staging·Production·고객 가치·결제 증거가 아니다',
    'local receipt가 Production 배포를 증명한다',
  );
  assert.ok(
    validateP10ReceiptGateHarness(evidenceDrift, context).some((error) =>
      error.includes('EVIDENCE_CEILING'),
    ),
  );
});
