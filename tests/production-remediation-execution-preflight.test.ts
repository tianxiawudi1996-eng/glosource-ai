import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { calculateRemediationContextDigest } from '../scripts/build-production-remediation-approval-packet';
import { buildProductionRemediationExecutionPreflight } from '../scripts/build-production-remediation-execution-preflight';

const requiredEnvironment = [
  'AUTH_SECRET',
  'AUTH_TRUST_HOST',
  'DATAGO_SERVICE_KEY',
] as const;

const blockedAudit = {
  status: 'blocked',
  vercel: {
    queryStatus: 'verified',
    scope: 'vercel-production',
    linkComplete: true,
    targetMatch: true,
    projectName: 'glosource-ai',
    requiredCount: 3,
    configuredCount: 1,
    missing: ['AUTH_TRUST_HOST', 'DATAGO_SERVICE_KEY'],
    valuesIncluded: false,
  },
  github: {
    queryStatus: 'verified',
    environmentExists: true,
    requiredReviewerRulePresent: false,
    requiredReviewerCount: 0,
    preventSelfReview: null,
    deploymentBranchPolicyConfigured: false,
    reviewerIdentitiesIncluded: false,
  },
  blockers: [
    'Vercel Production is missing 2 required environment variable name(s).',
    'GitHub Production has no required-reviewer approval rule.',
    'GitHub Production self-review prevention is not confirmed enabled.',
    'GitHub Production deployment branch policy is not configured.',
  ],
} as const;

const workflowSource = 'environment: production\ngit push origin HEAD:master\n';

function build(preferences: unknown, audit: unknown = blockedAudit) {
  return buildProductionRemediationExecutionPreflight({
    audit,
    preferences,
    requiredEnvironment,
    workflowSource,
  });
}

test('deferred preferences await input with no actions or authority', () => {
  const preferences = JSON.parse(
    readFileSync('docs/operations/production-remediation-preferences.example.json', 'utf8'),
  );
  const preflight = build(preferences);

  assert.equal(preflight.preflightStatus, 'awaiting_preferences');
  assert.equal(preflight.readinessStatus, 'blocked');
  assert.deepEqual(preflight.proposedActionCodes, []);
  assert.equal(preflight.safety.executionApprovalPresent, false);
  assert.equal(preflight.safety.providerMutationAuthorized, false);
  assert.equal(preflight.safety.mutationStatus, 'not_attempted_by_design');
});

test('current complete preferences yield only bounded handoff action codes', () => {
  const contextDigest = calculateRemediationContextDigest({
    audit: blockedAudit,
    requiredEnvironment,
    workflowSource,
  });
  const preflight = build({
    schemaVersion: 1,
    contextDigest,
    preferences: {
      authTrustHost: 'set_true_preference',
      datagoSecret: 'secret_available_for_human_entry',
      requiredReviewer: 'require_independent_reviewer',
      branchPolicy: 'custom_feature_ref_policy',
    },
  });

  assert.equal(preflight.preflightStatus, 'handoff_ready');
  assert.equal(preflight.readinessStatus, 'blocked');
  assert.deepEqual(preflight.proposedActionCodes, [
    'SET_AUTH_TRUST_HOST_TRUE',
    'HUMAN_ENTER_DATAGO_SECRET',
    'CONFIGURE_INDEPENDENT_REVIEWER_PROTECTION',
    'CONFIGURE_CUSTOM_FEATURE_REF_POLICY',
  ]);
  assert.deepEqual(preflight.decisionBlockers, []);
  assert.equal(preflight.safety.executionApprovalPresent, false);
});

test('dedicated release branch maps to its bounded policy code', () => {
  const contextDigest = calculateRemediationContextDigest({
    audit: blockedAudit,
    requiredEnvironment,
    workflowSource,
  });
  const preflight = build({
    schemaVersion: 1,
    contextDigest,
    preferences: {
      authTrustHost: 'set_true_preference',
      datagoSecret: 'secret_available_for_human_entry',
      requiredReviewer: 'require_independent_reviewer',
      branchPolicy: 'dedicated_release_branch',
    },
  });

  assert.equal(preflight.preflightStatus, 'handoff_ready');
  assert.equal(
    preflight.proposedActionCodes.at(-1),
    'CONFIGURE_DEDICATED_RELEASE_BRANCH_POLICY',
  );
});

test('stale and invalid inputs expose no actions or rejected content', () => {
  const stale = build({
    schemaVersion: 1,
    contextDigest: '0'.repeat(64),
    preferences: {
      authTrustHost: 'set_true_preference',
      datagoSecret: 'secret_available_for_human_entry',
      requiredReviewer: 'require_independent_reviewer',
      branchPolicy: 'custom_feature_ref_policy',
    },
  });
  assert.equal(stale.preflightStatus, 'stale');
  assert.deepEqual(stale.proposedActionCodes, []);

  const invalid = build({
    schemaVersion: 1,
    contextDigest: null,
    preferences: {
      authTrustHost: 'defer',
      datagoSecret: 'defer',
      requiredReviewer: 'defer',
      branchPolicy: 'defer',
      secret: 'must-not-surface',
    },
  });
  assert.equal(invalid.preflightStatus, 'invalid');
  assert.deepEqual(invalid.proposedActionCodes, []);
  assert.doesNotMatch(JSON.stringify(invalid), /must-not-surface/);
});

test('ready audit maps to not_required with no actions', () => {
  const readyAudit = {
    status: 'ready',
    vercel: {
      ...blockedAudit.vercel,
      configuredCount: 3,
      missing: [],
    },
    github: {
      ...blockedAudit.github,
      requiredReviewerRulePresent: true,
      requiredReviewerCount: 1,
      preventSelfReview: true,
      deploymentBranchPolicyConfigured: true,
    },
    blockers: [],
  } as const;
  const preflight = build({
    schemaVersion: 1,
    contextDigest: null,
    preferences: {
      authTrustHost: 'defer',
      datagoSecret: 'defer',
      requiredReviewer: 'defer',
      branchPolicy: 'defer',
    },
  }, readyAudit);

  assert.equal(preflight.preflightStatus, 'not_required');
  assert.equal(preflight.readinessStatus, 'ready');
  assert.deepEqual(preflight.proposedActionCodes, []);
});

test('preflight source has no provider, network, subprocess, or mutation adapter', () => {
  const source = readFileSync(
    'scripts/build-production-remediation-execution-preflight.ts',
    'utf8',
  );
  assert.doesNotMatch(
    source,
    /from ['"](?:node:)?(?:child_process|http|https|net|tls)['"]|\b(?:fetch|spawn|exec|execa)\s*\(/,
  );
  assert.doesNotMatch(
    source,
    /vercel\s+env\s+(?:add|rm|pull)|gh\s+api\s+.*(?:--method|-X)\s+(?:PUT|POST|PATCH|DELETE)|workflow_dispatch|git\s+push/i,
  );
});
