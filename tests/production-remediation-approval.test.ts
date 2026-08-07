import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildProductionRemediationApprovalPacket,
  calculateRemediationContextDigest,
  parseProductionRemediationPreferences,
} from '../scripts/build-production-remediation-approval-packet';

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

function build(decisions: unknown, audit: unknown = blockedAudit, workflow = workflowSource) {
  return buildProductionRemediationApprovalPacket({
    audit,
    preferences: decisions,
    requiredEnvironment,
    workflowSource: workflow,
  });
}

test('deferred example awaits four independent decisions without authority', () => {
  const preferences = JSON.parse(
    readFileSync('docs/operations/production-remediation-preferences.example.json', 'utf8'),
  );
  const packet = build(preferences);

  assert.equal(packet.packetStatus, 'awaiting_decisions');
  assert.equal(packet.readinessStatus, 'blocked');
  assert.deepEqual(packet.decisionBlockers, [
    'CONTEXT_ACKNOWLEDGEMENT_REQUIRED',
    'AUTH_TRUST_HOST_PREFERENCE_REQUIRED',
    'DATAGO_SECRET_CUSTODY_REQUIRED',
    'INDEPENDENT_REVIEWER_POLICY_REQUIRED',
    'BRANCH_POLICY_STRATEGY_REQUIRED',
  ]);
  assert.deepEqual(packet.safety, {
    mutationStatus: 'not_attempted_by_design',
    providerMutationAuthorized: false,
    executionCommandsIncluded: false,
    secretValuesIncluded: false,
    reviewerIdentitiesIncluded: false,
    freshApprovalRequiredAtExecution: true,
    postChangeAuditRequired: true,
  });
});

test('matching context records preferences but keeps readiness blocked', () => {
  const contextDigest = calculateRemediationContextDigest({
    audit: blockedAudit,
    requiredEnvironment,
    workflowSource,
  });
  const packet = build({
    schemaVersion: 1,
    contextDigest,
    preferences: {
      authTrustHost: 'set_true_preference',
      datagoSecret: 'secret_available_for_human_entry',
      requiredReviewer: 'require_independent_reviewer',
      branchPolicy: 'custom_feature_ref_policy',
    },
  });

  assert.equal(packet.packetStatus, 'preferences_recorded');
  assert.equal(packet.readinessStatus, 'blocked');
  assert.deepEqual(packet.decisionBlockers, []);
  assert.equal(packet.safety.providerMutationAuthorized, false);
  assert.equal(packet.safety.mutationStatus, 'not_attempted_by_design');
});

test('unknown or sensitive-shaped fields fail closed without reflection', () => {
  const maliciousInputs = [
    {
      schemaVersion: 1,
      contextDigest: null,
      preferences: {
        authTrustHost: 'defer',
        datagoSecret: 'defer',
        requiredReviewer: 'defer',
        branchPolicy: 'defer',
        secret: 'fake-secret-should-never-surface',
      },
    },
    {
      schemaVersion: 1,
      contextDigest: null,
      preferences: {
        authTrustHost: 'defer',
        datagoSecret: 'defer',
        requiredReviewer: {
          login: 'reviewer-should-never-surface',
          id: 42,
        },
        branchPolicy: 'defer',
      },
    },
  ];

  for (const input of maliciousInputs) {
    assert.equal(parseProductionRemediationPreferences(input), null);
    const serialized = JSON.stringify(build(input));
    assert.doesNotMatch(
      serialized,
      /fake-secret-should-never-surface|reviewer-should-never-surface|42/,
    );
    assert.match(serialized, /PREFERENCE_INPUT_INVALID/);
  }
});

test('context changes make an acknowledged packet stale', () => {
  const contextDigest = calculateRemediationContextDigest({
    audit: blockedAudit,
    requiredEnvironment,
    workflowSource,
  });
  const preferences = {
    schemaVersion: 1,
    contextDigest,
    preferences: {
      authTrustHost: 'set_true_preference',
      datagoSecret: 'secret_available_for_human_entry',
      requiredReviewer: 'require_independent_reviewer',
      branchPolicy: 'dedicated_release_branch',
    },
  };

  assert.equal(build(preferences, blockedAudit, `${workflowSource}# changed`).packetStatus, 'stale');
  assert.equal(
    build(preferences, {
      ...blockedAudit,
      vercel: {
        ...blockedAudit.vercel,
        configuredCount: 2,
        missing: ['DATAGO_SERVICE_KEY'],
      },
      blockers: [
        'Vercel Production is missing 1 required environment variable name(s).',
        ...blockedAudit.blockers.slice(1),
      ],
    }).packetStatus,
    'stale',
  );
});

test('master-only policy cannot be recorded for the current promotion flow', () => {
  const contextDigest = calculateRemediationContextDigest({
    audit: blockedAudit,
    requiredEnvironment,
    workflowSource,
  });
  const packet = build({
    schemaVersion: 1,
    contextDigest,
    preferences: {
      authTrustHost: 'set_true_preference',
      datagoSecret: 'secret_available_for_human_entry',
      requiredReviewer: 'require_independent_reviewer',
      branchPolicy: 'protected_master_only',
    },
  });

  assert.equal(packet.packetStatus, 'awaiting_decisions');
  assert.deepEqual(packet.decisionBlockers, [
    'BRANCH_POLICY_INCOMPATIBLE_WITH_CURRENT_WORKFLOW',
  ]);
});

test('malformed audit data is invalid and never reflected', () => {
  const packet = build(
    {
      schemaVersion: 1,
      contextDigest: null,
      preferences: {
        authTrustHost: 'defer',
        datagoSecret: 'defer',
        requiredReviewer: 'defer',
        branchPolicy: 'defer',
      },
    },
    { status: 'blocked', rawError: 'raw-error-should-never-surface' },
  );

  assert.equal(packet.packetStatus, 'invalid');
  assert.deepEqual(packet.decisionBlockers, ['CONTROL_PLANE_AUDIT_INVALID']);
  assert.doesNotMatch(JSON.stringify(packet), /raw-error-should-never-surface/);
});

test('contradictory or unmapped audit facts fail closed', () => {
  const preferences = {
    schemaVersion: 1,
    contextDigest: null,
    preferences: {
      authTrustHost: 'defer',
      datagoSecret: 'defer',
      requiredReviewer: 'defer',
      branchPolicy: 'defer',
    },
  };
  const contradictoryReady = {
    ...blockedAudit,
    status: 'ready',
  };
  const unexpectedMissing = {
    ...blockedAudit,
    vercel: {
      ...blockedAudit.vercel,
      configuredCount: 1,
      missing: ['AUTH_TRUST_HOST', 'UNEXPECTED_PROVIDER_FIELD'],
    },
  };

  for (const audit of [contradictoryReady, unexpectedMissing]) {
    const packet = build(preferences, audit);
    assert.equal(packet.packetStatus, 'invalid');
    assert.deepEqual(packet.decisionBlockers, ['UNMAPPED_CONTROL_PLANE_BLOCKER']);
  }
});

test('contradictory reviewer state and retained producer fields are invalid', () => {
  const preferences = JSON.parse(
    readFileSync('docs/operations/production-remediation-preferences.example.json', 'utf8'),
  );
  const contradictoryReviewer = {
    ...blockedAudit,
    github: {
      ...blockedAudit.github,
      requiredReviewerCount: 5,
    },
  };
  const wrongProject = {
    ...blockedAudit,
    vercel: {
      ...blockedAudit.vercel,
      projectName: 'another-project',
    },
  };
  const hiddenProducerField = {
    ...blockedAudit,
    rawError: 'must-not-be-accepted',
  };

  for (const audit of [contradictoryReviewer, wrongProject]) {
    const packet = build(preferences, audit);
    assert.equal(packet.packetStatus, 'invalid');
    assert.deepEqual(packet.decisionBlockers, ['UNMAPPED_CONTROL_PLANE_BLOCKER']);
  }

  const hiddenFieldPacket = build(preferences, hiddenProducerField);
  assert.equal(hiddenFieldPacket.packetStatus, 'invalid');
  assert.deepEqual(hiddenFieldPacket.decisionBlockers, ['CONTROL_PLANE_AUDIT_INVALID']);
  assert.doesNotMatch(JSON.stringify(hiddenFieldPacket), /must-not-be-accepted/);
});

test('ready audit rejects a stale digest before returning not_required', () => {
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
  const packet = build({
    schemaVersion: 1,
    contextDigest: '0'.repeat(64),
    preferences: {
      authTrustHost: 'set_true_preference',
      datagoSecret: 'secret_available_for_human_entry',
      requiredReviewer: 'require_independent_reviewer',
      branchPolicy: 'custom_feature_ref_policy',
    },
  }, readyAudit);

  assert.equal(packet.packetStatus, 'stale');
  assert.deepEqual(packet.decisionBlockers, ['CONTEXT_DIGEST_STALE']);
});

test('ready audit needs no remediation preferences and does not echo them', () => {
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
  const packet = build({
    schemaVersion: 1,
    contextDigest: null,
    preferences: {
      authTrustHost: 'set_true_preference',
      datagoSecret: 'secret_available_for_human_entry',
      requiredReviewer: 'require_independent_reviewer',
      branchPolicy: 'custom_feature_ref_policy',
    },
  }, readyAudit);

  assert.equal(packet.packetStatus, 'not_required');
  assert.equal(packet.readinessStatus, 'ready');
  assert.equal(packet.preferences, null);
  assert.deepEqual(packet.decisionBlockers, []);
});

test('packet builder has no provider, network, or subprocess adapter', () => {
  const source = readFileSync(
    'scripts/build-production-remediation-approval-packet.ts',
    'utf8',
  );
  assert.doesNotMatch(
    source,
    /node:child_process|\bfetch\s*\(|\bexecFile\b|\bspawn\b|gh\s+api|vercel\s+env|workflow_dispatch/,
  );
});
