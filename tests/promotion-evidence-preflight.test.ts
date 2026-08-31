import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildPromotionEvidencePreflight,
  assertPromotionGitContext,
  readPromotionEvidenceContext,
  type PromotionEvidenceContext,
} from '../scripts/check-promotion-evidence';

const candidateSha = 'a'.repeat(40);
const rollbackSha = 'b'.repeat(40);
const targetDigest = 'c'.repeat(64);
const migrationBundleDigest = 'd'.repeat(64);
const backupDigest = 'e'.repeat(64);
const context: PromotionEvidenceContext = {
  candidateSha,
  rollbackSha,
  targetDigest,
  migrationBundleDigest,
  availableMigrationIds: ['0000_baseline', '0005_handy_iron_fist'],
};
const now = new Date('2026-08-23T12:00:00Z');

function validEvidence() {
  return {
    schemaVersion: 1,
    issuedAt: '2026-08-23T11:00:00Z',
    validUntil: '2026-08-23T18:00:00Z',
    candidateSha,
    rollbackSha,
    targetDigest,
    migration: {
      candidateSha,
      bundleDigest: migrationBundleDigest,
      plannedIds: ['0005_handy_iron_fist'],
      stagingReceiptReference: 'STAGING-MIGRATION-20260823-001',
      stagingReceiptDigest: '1'.repeat(64),
      testedAt: '2026-08-22T10:00:00Z',
    },
    backup: {
      candidateSha,
      receiptReference: 'PROD-BACKUP-20260823-001',
      receiptDigest: backupDigest,
      createdAt: '2026-08-23T10:30:00Z',
    },
    restoreTest: {
      candidateSha,
      backupReceiptDigest: backupDigest,
      receiptReference: 'RESTORE-TEST-20260823-001',
      receiptDigest: '2'.repeat(64),
      testedAt: '2026-08-22T10:30:00Z',
    },
    rollback: {
      candidateSha,
      rollbackSha,
      receiptReference: 'ROLLBACK-REHEARSAL-20260823-001',
      receiptDigest: '3'.repeat(64),
      rehearsedAt: '2026-08-22T11:00:00Z',
    },
    controlPlaneAudit: {
      status: 'ready',
      targetDigest,
      receiptReference: 'CONTROL-PLANE-AUDIT-20260823-001',
      receiptDigest: '4'.repeat(64),
      auditedAt: '2026-08-23T10:45:00Z',
    },
    approvals: {
      release: {
        gate: 'G_RELEASE',
        reference: 'G-RELEASE-20260823-001',
        approvedAt: '2026-08-23T10:50:00Z',
        candidateSha,
        rollbackSha,
      },
      controlPlaneChange: {
        gate: 'G_PRODUCTION_CONTROL_PLANE_CHANGE',
        reference: 'G-CONTROL-PLANE-20260823-001',
        approvedAt: '2026-08-23T10:55:00Z',
        targetDigest,
      },
    },
  };
}

function build(evidence: unknown) {
  return buildPromotionEvidencePreflight({ evidence, context, now });
}

test('accepts fresh evidence bound to candidate, rollback, target, and migration bundle', () => {
  const report = build(validEvidence());
  assert.equal(report.status, 'ready');
  assert.deepEqual(report.blockerCodes, []);
  assert.deepEqual(report.plannedMigrationIds, ['0005_handy_iron_fist']);
  assert.deepEqual(report.safety, {
    rawEvidenceIncluded: false,
    receiptReferencesIncluded: false,
    secretValuesIncluded: false,
    externalActions: 0,
  });
});

test('rejects candidate and rollback drift', () => {
  const evidence = validEvidence();
  evidence.candidateSha = 'f'.repeat(40);
  evidence.rollback.rollbackSha = '9'.repeat(40);
  const report = build(evidence);
  assert.equal(report.status, 'blocked');
  assert.deepEqual(report.blockerCodes, [
    'CANDIDATE_SHA_MISMATCH',
    'ROLLBACK_SHA_MISMATCH',
  ]);
});

test('rejects target, migration bundle, or planned migration drift', () => {
  const evidence = validEvidence();
  evidence.targetDigest = 'f'.repeat(64);
  evidence.migration.bundleDigest = '9'.repeat(64);
  evidence.migration.plannedIds = ['9999_unknown_migration'];
  const report = build(evidence);
  assert.equal(report.status, 'blocked');
  assert.deepEqual(report.blockerCodes, [
    'PRODUCTION_TARGET_MISMATCH',
    'MIGRATION_BUNDLE_MISMATCH',
  ]);
});

test('rejects a restore receipt that is not linked to the approved backup', () => {
  const evidence = validEvidence();
  evidence.restoreTest.backupReceiptDigest = 'f'.repeat(64);
  assert.deepEqual(build(evidence).blockerCodes, ['BACKUP_RESTORE_LINK_MISMATCH']);
});

test('rejects expired promotion evidence and stale operational receipts', () => {
  const evidence = validEvidence();
  evidence.validUntil = '2026-08-23T11:30:00Z';
  evidence.backup.createdAt = '2026-08-21T10:00:00Z';
  evidence.controlPlaneAudit.auditedAt = '2026-08-21T10:00:00Z';
  evidence.rollback.rehearsedAt = '2026-07-01T10:00:00Z';
  evidence.approvals.release.approvedAt = '2026-08-21T10:00:00Z';
  assert.deepEqual(build(evidence).blockerCodes, [
    'PROMOTION_EVIDENCE_EXPIRED',
    'BACKUP_RECEIPT_STALE',
    'CONTROL_PLANE_AUDIT_STALE',
    'APPROVAL_EVIDENCE_STALE',
    'RECOVERY_REHEARSAL_STALE',
  ]);
});

test('requires distinct approval references for the two approval gates', () => {
  const evidence = validEvidence();
  evidence.approvals.controlPlaneChange.reference = evidence.approvals.release.reference;
  assert.deepEqual(build(evidence).blockerCodes, ['APPROVAL_REFERENCE_REUSED']);
});

test('rejects unknown or sensitive-shaped fields without reflecting them', () => {
  const evidence = {
    ...validEvidence(),
    secret: 'must-not-surface',
  };
  const report = build(evidence);
  assert.equal(report.status, 'blocked');
  assert.deepEqual(report.blockerCodes, ['EVIDENCE_CONTRACT_INVALID']);
  assert.doesNotMatch(JSON.stringify(report), /must-not-surface/);
});

test('repository context binds the tracked target and migration contents', async () => {
  const actual = await readPromotionEvidenceContext(
    process.cwd(),
    candidateSha,
    rollbackSha,
  );
  assert.equal(actual.candidateSha, candidateSha);
  assert.equal(actual.rollbackSha, rollbackSha);
  assert.match(actual.targetDigest, /^[a-f0-9]{64}$/);
  assert.match(actual.migrationBundleDigest, /^[a-f0-9]{64}$/);
  assert.ok(actual.availableMigrationIds.includes('0005_handy_iron_fist'));
});

test('git context requires exact HEAD, a clean tree, and rollback ancestry', async () => {
  const calls: string[][] = [];
  await assertPromotionGitContext('.', candidateSha, rollbackSha, async (args) => {
    calls.push(args);
    if (args[0] === 'rev-parse') return `${candidateSha}\n`;
    return '';
  });
  assert.deepEqual(calls, [
    ['rev-parse', 'HEAD'],
    ['status', '--porcelain', '--untracked-files=all'],
    ['merge-base', '--is-ancestor', rollbackSha, candidateSha],
  ]);

  await assert.rejects(
    assertPromotionGitContext('.', candidateSha, rollbackSha, async (args) => {
      if (args[0] === 'rev-parse') return `${candidateSha}\n`;
      if (args[0] === 'status') return ' M app/example.ts\n';
      return '';
    }),
    /clean worktree/,
  );
  await assert.rejects(
    assertPromotionGitContext('.', candidateSha, rollbackSha, async (args) => {
      if (args[0] === 'rev-parse') return `${'f'.repeat(40)}\n`;
      return '';
    }),
    /does not match HEAD/,
  );
});

test('promotion workflow validates sanitized evidence before migration', () => {
  const workflow = readFileSync('.github/workflows/promote.yml', 'utf8');
  const preflight = workflow.indexOf('npm run readiness:promotion-evidence');
  const migration = workflow.indexOf('npm run db:migrate');
  assert.match(workflow, /promotion_evidence_json:/);
  assert.match(workflow, /PROMOTION_EVIDENCE_JSON: \$\{\{ inputs\.promotion_evidence_json \}\}/);
  assert.match(workflow, /--candidate-sha "\$GITHUB_SHA"/);
  assert.match(workflow, /--rollback-sha "\$ROLLBACK_SHA"/);
  assert.ok(preflight >= 0);
  assert.ok(migration > preflight);
  assert.match(workflow, /trap 'rm -f "\$evidence_file"' EXIT/);
});
