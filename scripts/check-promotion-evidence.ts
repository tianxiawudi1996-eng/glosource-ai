import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { parseProductionTargetContract } from './check-production-control-plane-readiness';

const SHA_PATTERN = /^[a-f0-9]{40}$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const SAFE_REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{2,127}$/;
const MIGRATION_ID_PATTERN = /^\d{4}_[a-z0-9_]+$/;
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const CLOCK_SKEW_MS = 5 * 60 * 1000;
const PROMOTION_WINDOW_MS = 24 * 60 * 60 * 1000;
const FRESH_RECEIPT_MS = 24 * 60 * 60 * 1000;
const REHEARSAL_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const execFileAsync = promisify(execFile);

type PromotionEvidence = {
  schemaVersion: 1;
  issuedAt: string;
  validUntil: string;
  candidateSha: string;
  rollbackSha: string;
  targetDigest: string;
  migration: {
    candidateSha: string;
    bundleDigest: string;
    plannedIds: string[];
    stagingReceiptReference: string;
    stagingReceiptDigest: string;
    testedAt: string;
  };
  backup: {
    candidateSha: string;
    receiptReference: string;
    receiptDigest: string;
    createdAt: string;
  };
  restoreTest: {
    candidateSha: string;
    backupReceiptDigest: string;
    receiptReference: string;
    receiptDigest: string;
    testedAt: string;
  };
  rollback: {
    candidateSha: string;
    rollbackSha: string;
    receiptReference: string;
    receiptDigest: string;
    rehearsedAt: string;
  };
  controlPlaneAudit: {
    status: 'ready';
    targetDigest: string;
    receiptReference: string;
    receiptDigest: string;
    auditedAt: string;
  };
  approvals: {
    release: {
      gate: 'G_RELEASE';
      reference: string;
      approvedAt: string;
      candidateSha: string;
      rollbackSha: string;
    };
    controlPlaneChange: {
      gate: 'G_PRODUCTION_CONTROL_PLANE_CHANGE';
      reference: string;
      approvedAt: string;
      targetDigest: string;
    };
  };
};

export type PromotionEvidenceContext = {
  candidateSha: string;
  rollbackSha: string;
  targetDigest: string;
  migrationBundleDigest: string;
  availableMigrationIds: string[];
};

type GitRunner = (args: string[]) => Promise<string>;

type PromotionEvidenceInput = {
  evidence: unknown;
  context: PromotionEvidenceContext;
  now?: Date;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

function isSha(value: unknown): value is string {
  return typeof value === 'string' && SHA_PATTERN.test(value);
}

function isDigest(value: unknown): value is string {
  return typeof value === 'string' && DIGEST_PATTERN.test(value);
}

function isSafeReference(value: unknown): value is string {
  return typeof value === 'string' && SAFE_REFERENCE_PATTERN.test(value);
}

function isUtcTimestamp(value: unknown): value is string {
  return typeof value === 'string'
    && ISO_UTC_PATTERN.test(value)
    && Number.isFinite(Date.parse(value));
}

function parsePromotionEvidence(value: unknown): PromotionEvidence | null {
  if (!isRecord(value) || !hasExactKeys(value, [
    'schemaVersion',
    'issuedAt',
    'validUntil',
    'candidateSha',
    'rollbackSha',
    'targetDigest',
    'migration',
    'backup',
    'restoreTest',
    'rollback',
    'controlPlaneAudit',
    'approvals',
  ])) return null;
  if (
    value.schemaVersion !== 1
    || !isUtcTimestamp(value.issuedAt)
    || !isUtcTimestamp(value.validUntil)
    || !isSha(value.candidateSha)
    || !isSha(value.rollbackSha)
    || !isDigest(value.targetDigest)
    || !isRecord(value.migration)
    || !isRecord(value.backup)
    || !isRecord(value.restoreTest)
    || !isRecord(value.rollback)
    || !isRecord(value.controlPlaneAudit)
    || !isRecord(value.approvals)
  ) return null;

  const migration = value.migration;
  const backup = value.backup;
  const restoreTest = value.restoreTest;
  const rollback = value.rollback;
  const controlPlaneAudit = value.controlPlaneAudit;
  const approvals = value.approvals;
  if (
    !hasExactKeys(migration, [
      'candidateSha',
      'bundleDigest',
      'plannedIds',
      'stagingReceiptReference',
      'stagingReceiptDigest',
      'testedAt',
    ])
    || !isSha(migration.candidateSha)
    || !isDigest(migration.bundleDigest)
    || !Array.isArray(migration.plannedIds)
    || migration.plannedIds.length === 0
    || !migration.plannedIds.every(
      (id): id is string => typeof id === 'string' && MIGRATION_ID_PATTERN.test(id),
    )
    || new Set(migration.plannedIds).size !== migration.plannedIds.length
    || !isSafeReference(migration.stagingReceiptReference)
    || !isDigest(migration.stagingReceiptDigest)
    || !isUtcTimestamp(migration.testedAt)
  ) return null;
  if (
    !hasExactKeys(backup, [
      'candidateSha',
      'receiptReference',
      'receiptDigest',
      'createdAt',
    ])
    || !isSha(backup.candidateSha)
    || !isSafeReference(backup.receiptReference)
    || !isDigest(backup.receiptDigest)
    || !isUtcTimestamp(backup.createdAt)
  ) return null;
  if (
    !hasExactKeys(restoreTest, [
      'candidateSha',
      'backupReceiptDigest',
      'receiptReference',
      'receiptDigest',
      'testedAt',
    ])
    || !isSha(restoreTest.candidateSha)
    || !isDigest(restoreTest.backupReceiptDigest)
    || !isSafeReference(restoreTest.receiptReference)
    || !isDigest(restoreTest.receiptDigest)
    || !isUtcTimestamp(restoreTest.testedAt)
  ) return null;
  if (
    !hasExactKeys(rollback, [
      'candidateSha',
      'rollbackSha',
      'receiptReference',
      'receiptDigest',
      'rehearsedAt',
    ])
    || !isSha(rollback.candidateSha)
    || !isSha(rollback.rollbackSha)
    || !isSafeReference(rollback.receiptReference)
    || !isDigest(rollback.receiptDigest)
    || !isUtcTimestamp(rollback.rehearsedAt)
  ) return null;
  if (
    !hasExactKeys(controlPlaneAudit, [
      'status',
      'targetDigest',
      'receiptReference',
      'receiptDigest',
      'auditedAt',
    ])
    || controlPlaneAudit.status !== 'ready'
    || !isDigest(controlPlaneAudit.targetDigest)
    || !isSafeReference(controlPlaneAudit.receiptReference)
    || !isDigest(controlPlaneAudit.receiptDigest)
    || !isUtcTimestamp(controlPlaneAudit.auditedAt)
  ) return null;
  if (
    !hasExactKeys(approvals, ['release', 'controlPlaneChange'])
    || !isRecord(approvals.release)
    || !isRecord(approvals.controlPlaneChange)
    || !hasExactKeys(approvals.release, [
      'gate',
      'reference',
      'approvedAt',
      'candidateSha',
      'rollbackSha',
    ])
    || approvals.release.gate !== 'G_RELEASE'
    || !isSafeReference(approvals.release.reference)
    || !isUtcTimestamp(approvals.release.approvedAt)
    || !isSha(approvals.release.candidateSha)
    || !isSha(approvals.release.rollbackSha)
    || !hasExactKeys(approvals.controlPlaneChange, [
      'gate',
      'reference',
      'approvedAt',
      'targetDigest',
    ])
    || approvals.controlPlaneChange.gate !== 'G_PRODUCTION_CONTROL_PLANE_CHANGE'
    || !isSafeReference(approvals.controlPlaneChange.reference)
    || !isUtcTimestamp(approvals.controlPlaneChange.approvedAt)
    || !isDigest(approvals.controlPlaneChange.targetDigest)
  ) return null;

  return value as PromotionEvidence;
}

function parseTime(value: string) {
  return new Date(value).getTime();
}

function isFresh(
  value: string,
  nowMs: number,
  maxAgeMs: number,
  upperBoundMs = nowMs,
) {
  const time = parseTime(value);
  return time <= upperBoundMs + CLOCK_SKEW_MS && nowMs - time <= maxAgeMs;
}

export function buildPromotionEvidencePreflight(input: PromotionEvidenceInput) {
  const evidence = parsePromotionEvidence(input.evidence);
  const blockerCodes: string[] = [];
  if (!evidence) {
    blockerCodes.push('EVIDENCE_CONTRACT_INVALID');
  } else {
    const nowMs = (input.now ?? new Date()).getTime();
    const issuedAt = parseTime(evidence.issuedAt);
    const validUntil = parseTime(evidence.validUntil);
    const availableMigrations = new Set(input.context.availableMigrationIds);
    if (
      evidence.candidateSha !== input.context.candidateSha
      || evidence.migration.candidateSha !== input.context.candidateSha
      || evidence.backup.candidateSha !== input.context.candidateSha
      || evidence.restoreTest.candidateSha !== input.context.candidateSha
      || evidence.rollback.candidateSha !== input.context.candidateSha
      || evidence.approvals.release.candidateSha !== input.context.candidateSha
    ) blockerCodes.push('CANDIDATE_SHA_MISMATCH');
    if (
      evidence.candidateSha === evidence.rollbackSha
      || evidence.rollbackSha !== input.context.rollbackSha
      || evidence.rollback.rollbackSha !== input.context.rollbackSha
      || evidence.approvals.release.rollbackSha !== input.context.rollbackSha
    ) blockerCodes.push('ROLLBACK_SHA_MISMATCH');
    if (
      evidence.targetDigest !== input.context.targetDigest
      || evidence.controlPlaneAudit.targetDigest !== input.context.targetDigest
      || evidence.approvals.controlPlaneChange.targetDigest !== input.context.targetDigest
    ) blockerCodes.push('PRODUCTION_TARGET_MISMATCH');
    if (
      evidence.migration.bundleDigest !== input.context.migrationBundleDigest
      || evidence.migration.plannedIds.some((id) => !availableMigrations.has(id))
    ) blockerCodes.push('MIGRATION_BUNDLE_MISMATCH');
    if (evidence.restoreTest.backupReceiptDigest !== evidence.backup.receiptDigest) {
      blockerCodes.push('BACKUP_RESTORE_LINK_MISMATCH');
    }
    if (
      issuedAt > nowMs + CLOCK_SKEW_MS
      || validUntil <= nowMs
      || validUntil <= issuedAt
      || validUntil - issuedAt > PROMOTION_WINDOW_MS
    ) blockerCodes.push('PROMOTION_EVIDENCE_EXPIRED');
    if (!isFresh(
      evidence.backup.createdAt,
      nowMs,
      FRESH_RECEIPT_MS,
      issuedAt,
    )) blockerCodes.push('BACKUP_RECEIPT_STALE');
    if (!isFresh(
      evidence.controlPlaneAudit.auditedAt,
      nowMs,
      FRESH_RECEIPT_MS,
      issuedAt,
    )) blockerCodes.push('CONTROL_PLANE_AUDIT_STALE');
    if (
      !isFresh(
        evidence.approvals.release.approvedAt,
        nowMs,
        FRESH_RECEIPT_MS,
        issuedAt,
      )
      || !isFresh(
        evidence.approvals.controlPlaneChange.approvedAt,
        nowMs,
        FRESH_RECEIPT_MS,
        issuedAt,
      )
    ) blockerCodes.push('APPROVAL_EVIDENCE_STALE');
    if (
      evidence.approvals.release.reference
      === evidence.approvals.controlPlaneChange.reference
    ) blockerCodes.push('APPROVAL_REFERENCE_REUSED');
    for (const timestamp of [
      evidence.migration.testedAt,
      evidence.restoreTest.testedAt,
      evidence.rollback.rehearsedAt,
    ]) {
      if (!isFresh(timestamp, nowMs, REHEARSAL_MAX_AGE_MS, issuedAt)) {
        blockerCodes.push('RECOVERY_REHEARSAL_STALE');
        break;
      }
    }
  }

  const uniqueBlockers = [...new Set(blockerCodes)];
  return {
    status: uniqueBlockers.length === 0 ? 'ready' as const : 'blocked' as const,
    candidateSha: input.context.candidateSha,
    rollbackSha: input.context.rollbackSha,
    blockerCodes: uniqueBlockers,
    checks: {
      evidenceContractValid: Boolean(evidence),
      candidateBound: Boolean(evidence)
        && !uniqueBlockers.includes('CANDIDATE_SHA_MISMATCH'),
      rollbackBound: Boolean(evidence)
        && !uniqueBlockers.includes('ROLLBACK_SHA_MISMATCH'),
      productionTargetBound: Boolean(evidence)
        && !uniqueBlockers.includes('PRODUCTION_TARGET_MISMATCH'),
      migrationBundleBound: Boolean(evidence)
        && !uniqueBlockers.includes('MIGRATION_BUNDLE_MISMATCH'),
      backupRestoreLinked: Boolean(evidence)
        && !uniqueBlockers.includes('BACKUP_RESTORE_LINK_MISMATCH'),
      evidenceFresh: Boolean(evidence)
        && !uniqueBlockers.some((code) => code.endsWith('_STALE') || code.endsWith('_EXPIRED')),
      approvalsIndependent: Boolean(evidence)
        && !uniqueBlockers.includes('APPROVAL_REFERENCE_REUSED'),
    },
    plannedMigrationIds: evidence?.migration.plannedIds ?? [],
    safety: {
      rawEvidenceIncluded: false as const,
      receiptReferencesIncluded: false as const,
      secretValuesIncluded: false as const,
      externalActions: 0 as const,
    },
  };
}

type MigrationJournal = {
  entries?: Array<{
    idx?: unknown;
    when?: unknown;
    tag?: unknown;
    breakpoints?: unknown;
  }>;
};

export async function readPromotionEvidenceContext(
  projectRoot: string,
  candidateSha: string,
  rollbackSha: string,
): Promise<PromotionEvidenceContext> {
  if (!isSha(candidateSha) || !isSha(rollbackSha) || candidateSha === rollbackSha) {
    throw new Error('Exact, distinct candidate and rollback SHA values are required.');
  }
  const targetPath = resolve(projectRoot, 'docs', 'operations', 'PRODUCTION_TARGET.json');
  const journalPath = resolve(projectRoot, 'drizzle', 'migrations', 'meta', '_journal.json');
  const [targetSource, journalSource] = await Promise.all([
    readFile(targetPath, 'utf8'),
    readFile(journalPath, 'utf8'),
  ]);
  const target = parseProductionTargetContract(JSON.parse(targetSource) as unknown);
  if (!target) throw new Error('Tracked Production target contract is invalid.');
  const journal = JSON.parse(journalSource) as MigrationJournal;
  if (!Array.isArray(journal.entries) || journal.entries.length === 0) {
    throw new Error('Migration journal is empty or invalid.');
  }
  const normalizedEntries = await Promise.all(journal.entries.map(async (entry) => {
    if (
      !Number.isSafeInteger(entry.idx)
      || !Number.isSafeInteger(entry.when)
      || typeof entry.tag !== 'string'
      || !MIGRATION_ID_PATTERN.test(entry.tag)
      || typeof entry.breakpoints !== 'boolean'
    ) throw new Error('Migration journal entry is invalid.');
    const sqlSource = await readFile(
      resolve(projectRoot, 'drizzle', 'migrations', `${entry.tag}.sql`),
      'utf8',
    );
    return {
      idx: entry.idx,
      when: entry.when,
      tag: entry.tag,
      breakpoints: entry.breakpoints,
      sqlDigest: createHash('sha256').update(sqlSource, 'utf8').digest('hex'),
    };
  }));
  const targetDigest = createHash('sha256')
    .update(JSON.stringify(target), 'utf8')
    .digest('hex');
  const migrationBundleDigest = createHash('sha256')
    .update(JSON.stringify(normalizedEntries), 'utf8')
    .digest('hex');
  return {
    candidateSha,
    rollbackSha,
    targetDigest,
    migrationBundleDigest,
    availableMigrationIds: normalizedEntries.map((entry) => entry.tag),
  };
}

async function defaultGitRunner(projectRoot: string, args: string[]) {
  const result = await execFileAsync('git', args, {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  return result.stdout;
}

export async function assertPromotionGitContext(
  projectRoot: string,
  candidateSha: string,
  rollbackSha: string,
  runGit: GitRunner = (args) => defaultGitRunner(projectRoot, args),
) {
  if (!isSha(candidateSha) || !isSha(rollbackSha) || candidateSha === rollbackSha) {
    throw new Error('Exact, distinct candidate and rollback SHA values are required.');
  }
  const head = (await runGit(['rev-parse', 'HEAD'])).trim();
  if (head !== candidateSha) throw new Error('Candidate SHA does not match HEAD.');
  const status = await runGit(['status', '--porcelain', '--untracked-files=all']);
  if (status.trim()) throw new Error('Promotion context requires a clean worktree.');
  await runGit(['merge-base', '--is-ancestor', rollbackSha, candidateSha]);
}

function readFlag(args: string[], name: string) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function runCli() {
  const args = process.argv.slice(2);
  const candidateSha = readFlag(args, '--candidate-sha');
  const rollbackSha = readFlag(args, '--rollback-sha');
  if (!candidateSha || !rollbackSha) {
    throw new Error('Both --candidate-sha and --rollback-sha are required.');
  }
  await assertPromotionGitContext(process.cwd(), candidateSha, rollbackSha);
  const context = await readPromotionEvidenceContext(
    process.cwd(),
    candidateSha,
    rollbackSha,
  );
  if (args.includes('--print-context')) {
    console.log(JSON.stringify(context, null, 2));
    return;
  }
  const evidencePath = args.find((arg) => !arg.startsWith('--')
    && arg !== candidateSha
    && arg !== rollbackSha);
  if (!evidencePath) throw new Error('Promotion evidence JSON path is required.');
  const evidence = JSON.parse(await readFile(resolve(evidencePath), 'utf8')) as unknown;
  const report = buildPromotionEvidencePreflight({ evidence, context });
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'ready') process.exitCode = 1;
}

const currentFile = resolve(fileURLToPath(import.meta.url));
const entryFile = process.argv[1] ? resolve(process.argv[1]) : '';
if (currentFile === entryFile) {
  runCli().catch(() => {
    console.error('Promotion evidence preflight failed closed.');
    process.exitCode = 1;
  });
}
