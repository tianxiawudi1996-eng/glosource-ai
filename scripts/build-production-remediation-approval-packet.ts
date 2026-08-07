import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RELEASE_IDENTITY, REQUIRED_PRODUCTION_ENV } from './package-release';

const AUTH_TRUST_HOST_OPTIONS = ['set_true_preference', 'defer'] as const;
const DATAGO_SECRET_OPTIONS = [
  'secret_available_for_human_entry',
  'unavailable',
  'defer',
] as const;
const REQUIRED_REVIEWER_OPTIONS = [
  'require_independent_reviewer',
  'defer',
] as const;
const BRANCH_POLICY_OPTIONS = [
  'custom_feature_ref_policy',
  'dedicated_release_branch',
  'protected_master_only',
  'defer',
] as const;

type AuthTrustHostPreference = typeof AUTH_TRUST_HOST_OPTIONS[number];
type DatagoSecretPreference = typeof DATAGO_SECRET_OPTIONS[number];
type RequiredReviewerPreference = typeof REQUIRED_REVIEWER_OPTIONS[number];
type BranchPolicyPreference = typeof BRANCH_POLICY_OPTIONS[number];
type PacketStatus =
  | 'awaiting_decisions'
  | 'preferences_recorded'
  | 'stale'
  | 'invalid'
  | 'not_required';

export interface ProductionRemediationPreferences {
  schemaVersion: 1;
  contextDigest: string | null;
  preferences: {
    authTrustHost: AuthTrustHostPreference;
    datagoSecret: DatagoSecretPreference;
    requiredReviewer: RequiredReviewerPreference;
    branchPolicy: BranchPolicyPreference;
  };
}

interface SanitizedAudit {
  status: 'ready' | 'blocked';
  vercel: {
    queryStatus: 'verified' | 'unverified';
    scope: 'vercel-production';
    linkComplete: boolean;
    targetMatch: boolean;
    projectName: string | null;
    requiredCount: number;
    configuredCount: number;
    missing: string[];
    valuesIncluded: false;
  };
  blockers: string[];
  github: {
    queryStatus: 'verified' | 'unverified';
    environmentExists: boolean;
    requiredReviewerRulePresent: boolean;
    requiredReviewerCount: number;
    preventSelfReview: boolean | null;
    deploymentBranchPolicyConfigured: boolean;
    reviewerIdentitiesIncluded: false;
  };
}

interface PacketInput {
  audit: unknown;
  preferences: unknown;
  requiredEnvironment: readonly string[];
  workflowSource: string;
}

export async function readProductionRemediationPacketInput(
  preferencesPath: string,
  auditPath: string,
): Promise<PacketInput> {
  const [preferencesSource, auditSource, workflowSource] = await Promise.all([
    readFile(resolve(preferencesPath), 'utf8'),
    readFile(resolve(auditPath), 'utf8'),
    readFile(resolve('.github/workflows/promote.yml'), 'utf8'),
  ]);
  return {
    audit: JSON.parse(auditSource) as unknown,
    preferences: JSON.parse(preferencesSource) as unknown,
    requiredEnvironment: REQUIRED_PRODUCTION_ENV,
    workflowSource,
  };
}

const SAFETY_INVARIANTS = {
  mutationStatus: 'not_attempted_by_design' as const,
  providerMutationAuthorized: false as const,
  executionCommandsIncluded: false as const,
  secretValuesIncluded: false as const,
  reviewerIdentitiesIncluded: false as const,
  freshApprovalRequiredAtExecution: true as const,
  postChangeAuditRequired: true as const,
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

function isOneOf<T extends string>(
  value: unknown,
  options: readonly T[],
): value is T {
  return typeof value === 'string' && options.includes(value as T);
}

export function parseProductionRemediationPreferences(
  value: unknown,
): ProductionRemediationPreferences | null {
  if (!isRecord(value) || !hasExactKeys(
    value,
    ['schemaVersion', 'contextDigest', 'preferences'],
  )) {
    return null;
  }
  if (value.schemaVersion !== 1) return null;
  if (
    value.contextDigest !== null
    && (
      typeof value.contextDigest !== 'string'
      || !/^[a-f0-9]{64}$/.test(value.contextDigest)
    )
  ) {
    return null;
  }
  if (!isRecord(value.preferences) || !hasExactKeys(
    value.preferences,
    ['authTrustHost', 'datagoSecret', 'requiredReviewer', 'branchPolicy'],
  )) {
    return null;
  }

  const preferences = value.preferences;
  if (!isOneOf(preferences.authTrustHost, AUTH_TRUST_HOST_OPTIONS)) return null;
  if (!isOneOf(preferences.datagoSecret, DATAGO_SECRET_OPTIONS)) return null;
  if (!isOneOf(preferences.requiredReviewer, REQUIRED_REVIEWER_OPTIONS)) return null;
  if (!isOneOf(preferences.branchPolicy, BRANCH_POLICY_OPTIONS)) return null;

  return {
    schemaVersion: 1,
    contextDigest: value.contextDigest,
    preferences: {
      authTrustHost: preferences.authTrustHost,
      datagoSecret: preferences.datagoSecret,
      requiredReviewer: preferences.requiredReviewer,
      branchPolicy: preferences.branchPolicy,
    },
  };
}

function normalizeAudit(value: unknown): SanitizedAudit | null {
  if (
    !isRecord(value)
    || !hasExactKeys(value, ['status', 'vercel', 'github', 'blockers'])
    || (value.status !== 'ready' && value.status !== 'blocked')
  ) {
    return null;
  }
  if (!isRecord(value.vercel) || !isRecord(value.github)) return null;
  const vercel = value.vercel;
  const github = value.github;
  if (!hasExactKeys(vercel, [
    'queryStatus',
    'scope',
    'linkComplete',
    'targetMatch',
    'projectName',
    'requiredCount',
    'configuredCount',
    'missing',
    'valuesIncluded',
  ]) || !hasExactKeys(github, [
    'queryStatus',
    'environmentExists',
    'requiredReviewerRulePresent',
    'requiredReviewerCount',
    'preventSelfReview',
    'deploymentBranchPolicyConfigured',
    'reviewerIdentitiesIncluded',
  ])) {
    return null;
  }
  if (
    (vercel.queryStatus !== 'verified' && vercel.queryStatus !== 'unverified')
    || vercel.scope !== 'vercel-production'
    || typeof vercel.linkComplete !== 'boolean'
    || typeof vercel.targetMatch !== 'boolean'
    || (vercel.projectName !== null && typeof vercel.projectName !== 'string')
    || typeof vercel.requiredCount !== 'number'
    || !Number.isSafeInteger(vercel.requiredCount)
    || vercel.requiredCount < 0
    || typeof vercel.configuredCount !== 'number'
    || !Number.isSafeInteger(vercel.configuredCount)
    || vercel.configuredCount < 0
    || !Array.isArray(vercel.missing)
    || !vercel.missing.every((name) => typeof name === 'string')
    || vercel.valuesIncluded !== false
  ) {
    return null;
  }
  if (
    !Array.isArray(value.blockers)
    || !value.blockers.every((blocker) => typeof blocker === 'string')
  ) {
    return null;
  }
  if (
    (github.queryStatus !== 'verified' && github.queryStatus !== 'unverified')
    || typeof github.environmentExists !== 'boolean'
    || typeof github.requiredReviewerRulePresent !== 'boolean'
    || typeof github.requiredReviewerCount !== 'number'
    || !Number.isSafeInteger(github.requiredReviewerCount)
    || github.requiredReviewerCount < 0
    || (
      github.preventSelfReview !== null
      && typeof github.preventSelfReview !== 'boolean'
    )
    || typeof github.deploymentBranchPolicyConfigured !== 'boolean'
    || github.reviewerIdentitiesIncluded !== false
  ) {
    return null;
  }

  return {
    status: value.status,
    vercel: {
      queryStatus: vercel.queryStatus,
      scope: 'vercel-production',
      linkComplete: vercel.linkComplete,
      targetMatch: vercel.targetMatch,
      projectName: vercel.projectName,
      requiredCount: vercel.requiredCount,
      configuredCount: vercel.configuredCount,
      missing: [...new Set(vercel.missing)].sort(),
      valuesIncluded: false,
    },
    github: {
      queryStatus: github.queryStatus,
      environmentExists: github.environmentExists,
      requiredReviewerRulePresent: github.requiredReviewerRulePresent,
      requiredReviewerCount: github.requiredReviewerCount,
      preventSelfReview: github.preventSelfReview,
      deploymentBranchPolicyConfigured:
        github.deploymentBranchPolicyConfigured,
      reviewerIdentitiesIncluded: false,
    },
    blockers: [...value.blockers],
  };
}

function deriveAuditBlockers(audit: SanitizedAudit) {
  const blockers: string[] = [];
  if (!audit.vercel.linkComplete) {
    blockers.push('Vercel project link is missing or incomplete.');
  } else if (!audit.vercel.targetMatch) {
    blockers.push('Vercel linked project does not match the expected GloSource AI project.');
  }
  if (audit.vercel.queryStatus !== 'verified') {
    blockers.push('Vercel Production environment names could not be verified.');
  } else if (audit.vercel.missing.length > 0) {
    blockers.push(
      `Vercel Production is missing ${audit.vercel.missing.length} required environment variable name(s).`,
    );
  }
  if (audit.github.queryStatus !== 'verified') {
    blockers.push('GitHub Production environment protections could not be verified.');
  } else {
    if (
      !audit.github.requiredReviewerRulePresent
      || audit.github.requiredReviewerCount === 0
    ) {
      blockers.push('GitHub Production has no required-reviewer approval rule.');
    }
    if (audit.github.preventSelfReview !== true) {
      blockers.push('GitHub Production self-review prevention is not confirmed enabled.');
    }
    if (!audit.github.deploymentBranchPolicyConfigured) {
      blockers.push('GitHub Production deployment branch policy is not configured.');
    }
  }
  return blockers;
}

export function calculateRemediationContextDigest(input: {
  audit: unknown;
  requiredEnvironment: readonly string[];
  workflowSource: string;
}) {
  const audit = normalizeAudit(input.audit);
  if (!audit) throw new Error('Sanitized control-plane audit is invalid.');
  const context = {
    audit,
    requiredEnvironment: [...new Set(input.requiredEnvironment)].sort(),
    workflowDigest: createHash('sha256')
      .update(input.workflowSource, 'utf8')
      .digest('hex'),
  };
  return createHash('sha256')
    .update(JSON.stringify(context), 'utf8')
    .digest('hex');
}

function invalidPacket(
  readinessStatus: 'ready' | 'blocked' | 'unverified',
  blocker: 'PREFERENCE_INPUT_INVALID' | 'CONTROL_PLANE_AUDIT_INVALID',
) {
  return {
    packetStatus: 'invalid' as PacketStatus,
    readinessStatus,
    contextDigest: null,
    preferences: null,
    decisionBlockers: [blocker],
    safety: SAFETY_INVARIANTS,
  };
}

export function buildProductionRemediationApprovalPacket(input: PacketInput) {
  const audit = normalizeAudit(input.audit);
  const preferences = parseProductionRemediationPreferences(input.preferences);
  if (!audit) {
    return invalidPacket('unverified', 'CONTROL_PLANE_AUDIT_INVALID');
  }
  if (!preferences) {
    return invalidPacket(audit.status, 'PREFERENCE_INPUT_INVALID');
  }
  if (
    audit.vercel.queryStatus !== 'verified'
    || audit.github.queryStatus !== 'verified'
  ) {
    return {
      ...invalidPacket(audit.status, 'CONTROL_PLANE_AUDIT_INVALID'),
      decisionBlockers: ['CONTROL_PLANE_AUDIT_UNVERIFIED'],
    };
  }
  if (
    !audit.vercel.linkComplete
    || !audit.vercel.targetMatch
    || !audit.github.environmentExists
  ) {
    return {
      ...invalidPacket(audit.status, 'CONTROL_PLANE_AUDIT_INVALID'),
      decisionBlockers: ['CONTROL_PLANE_TARGET_UNVERIFIED'],
    };
  }

  const required = new Set(input.requiredEnvironment);
  const hasUnexpectedMissingName = audit.vercel.missing.some(
    (name) => !required.has(name),
  );
  const githubReady = audit.github.requiredReviewerRulePresent
    && audit.github.requiredReviewerCount > 0
    && audit.github.preventSelfReview === true
    && audit.github.deploymentBranchPolicyConfigured;
  const factsReady = audit.vercel.missing.length === 0 && githubReady;
  const reviewerStateConsistent = audit.github.requiredReviewerRulePresent
    ? audit.github.requiredReviewerCount > 0
      && typeof audit.github.preventSelfReview === 'boolean'
    : audit.github.requiredReviewerCount === 0
      && audit.github.preventSelfReview === null;
  const expectedBlockers = deriveAuditBlockers(audit);
  if (
    hasUnexpectedMissingName
    || audit.vercel.projectName !== RELEASE_IDENTITY.packageName
    || audit.vercel.requiredCount !== input.requiredEnvironment.length
    || audit.vercel.configuredCount
      !== audit.vercel.requiredCount - audit.vercel.missing.length
    || !reviewerStateConsistent
    || JSON.stringify(audit.blockers) !== JSON.stringify(expectedBlockers)
    || (audit.status === 'ready' && !factsReady)
    || (audit.status === 'blocked' && factsReady)
    || (audit.status === 'ready' && audit.blockers.length > 0)
    || (audit.status === 'blocked' && audit.blockers.length === 0)
  ) {
    return {
      ...invalidPacket(audit.status, 'CONTROL_PLANE_AUDIT_INVALID'),
      decisionBlockers: ['UNMAPPED_CONTROL_PLANE_BLOCKER'],
    };
  }

  const contextDigest = calculateRemediationContextDigest({
    audit,
    requiredEnvironment: input.requiredEnvironment,
    workflowSource: input.workflowSource,
  });
  if (
    preferences.contextDigest !== null
    && preferences.contextDigest !== contextDigest
  ) {
    return {
      packetStatus: 'stale' as PacketStatus,
      readinessStatus: audit.status,
      contextDigest,
      preferences: preferences.preferences,
      decisionBlockers: ['CONTEXT_DIGEST_STALE'],
      safety: SAFETY_INVARIANTS,
    };
  }
  if (audit.status === 'ready') {
    return {
      packetStatus: 'not_required' as PacketStatus,
      readinessStatus: audit.status,
      contextDigest,
      preferences: null,
      decisionBlockers: [],
      safety: SAFETY_INVARIANTS,
    };
  }

  const blockers: string[] = [];
  if (preferences.contextDigest === null) {
    blockers.push('CONTEXT_ACKNOWLEDGEMENT_REQUIRED');
  }
  if (preferences.preferences.authTrustHost === 'defer') {
    blockers.push('AUTH_TRUST_HOST_PREFERENCE_REQUIRED');
  }
  if (preferences.preferences.datagoSecret === 'defer') {
    blockers.push('DATAGO_SECRET_CUSTODY_REQUIRED');
  } else if (preferences.preferences.datagoSecret === 'unavailable') {
    blockers.push('DATAGO_SECRET_UNAVAILABLE');
  }
  if (preferences.preferences.requiredReviewer === 'defer') {
    blockers.push('INDEPENDENT_REVIEWER_POLICY_REQUIRED');
  }
  if (preferences.preferences.branchPolicy === 'defer') {
    blockers.push('BRANCH_POLICY_STRATEGY_REQUIRED');
  } else if (preferences.preferences.branchPolicy === 'protected_master_only') {
    blockers.push('BRANCH_POLICY_INCOMPATIBLE_WITH_CURRENT_WORKFLOW');
  }

  return {
    packetStatus: blockers.length === 0
      ? 'preferences_recorded' as PacketStatus
      : 'awaiting_decisions' as PacketStatus,
    readinessStatus: audit.status,
    contextDigest,
    preferences: preferences.preferences,
    decisionBlockers: blockers,
    safety: SAFETY_INVARIANTS,
  };
}

async function runCli() {
  const preferencesPath = process.argv[2];
  const auditPath = process.argv[3];
  if (!preferencesPath || !auditPath) {
    throw new Error('Preference and sanitized audit file paths are required.');
  }
  const packet = buildProductionRemediationApprovalPacket(
    await readProductionRemediationPacketInput(preferencesPath, auditPath),
  );
  console.log(JSON.stringify(packet, null, 2));
  if (
    packet.packetStatus !== 'preferences_recorded'
    && packet.packetStatus !== 'not_required'
  ) {
    process.exitCode = 1;
  }
}

const currentFile = resolve(fileURLToPath(import.meta.url));
const entryFile = process.argv[1] ? resolve(process.argv[1]) : '';
if (currentFile === entryFile) {
  runCli().catch(() => {
    console.error('Production remediation approval packet could not be built.');
    process.exitCode = 1;
  });
}
