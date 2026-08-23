import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildControlPlaneReadinessReport,
  normalizeGithubEnvironment,
  parseGithubRepository,
  parseGithubSecretNames,
  parseProductionTargetContract,
  parseVercelProductionNames,
} from '../scripts/check-production-control-plane-readiness';

const requiredEnvironment = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'AUTH_TRUST_HOST',
  'DATAGO_SERVICE_KEY',
] as const;

const expectedTarget = {
  schemaVersion: 1 as const,
  vercel: {
    orgId: 'team_expected',
    projectId: 'prj_expected',
    projectName: 'glosource-ai',
  },
  github: {
    repository: 'tianxiawudi1996-eng/glosource-ai',
    environment: 'production',
    requiredSecretNames: ['DATABASE_URL'],
  },
};

const verifiedGithubSecrets = {
  queryStatus: 'verified' as const,
  configuredNames: ['DATABASE_URL'],
};

test('parses exact required names from a recognized Vercel Production table', () => {
  const parsed = parseVercelProductionNames(
    [
      '\u001b[2mVercel CLI 58.5.1\u001b[22m',
      'name                  type        environment    created',
      'DATABASE_URL          Encrypted   Production     2d ago',
      'AUTH_SECRET           Sensitive   Production     2d ago',
      'AUTH_SECRET_BACKUP    Encrypted   Production     2d ago',
    ].join('\n'),
    requiredEnvironment,
  );

  assert.equal(parsed.queryStatus, 'verified');
  assert.deepEqual(parsed.configuredNames, ['AUTH_SECRET', 'DATABASE_URL']);
});

test('rejects empty or unrecognized Vercel output instead of guessing', () => {
  assert.equal(
    parseVercelProductionNames('', requiredEnvironment).queryStatus,
    'unverified',
  );
  assert.equal(
    parseVercelProductionNames('AUTH_SECRET should-never-surface', requiredEnvironment)
      .queryStatus,
    'unverified',
  );
  assert.equal(
    parseVercelProductionNames(
      [
        '4 Environment Variables found in Production',
        'name                  value       environment    created',
        'AUTH_SECRET           NewFormat   Production     2d ago',
      ].join('\n'),
      requiredEnvironment,
    ).queryStatus,
    'unverified',
  );
});

test('normalizes GitHub protection rules without reviewer identities', () => {
  const normalized = normalizeGithubEnvironment({
    name: 'Production',
    protection_rules: [
      {
        type: 'required_reviewers',
        prevent_self_review: true,
        reviewers: [
          {
            type: 'User',
            reviewer: {
              login: 'should-never-surface',
              id: 123,
              url: 'https://api.github.test/users/should-never-surface',
            },
          },
        ],
      },
    ],
    deployment_branch_policy: {
      protected_branches: false,
      custom_branch_policies: true,
    },
  });

  assert.deepEqual(normalized, {
    queryStatus: 'verified',
    environmentExists: true,
    requiredReviewerRulePresent: true,
    requiredReviewerCount: 1,
    preventSelfReview: true,
    deploymentBranchPolicyConfigured: true,
  });
  assert.doesNotMatch(JSON.stringify(normalized), /should-never-surface|123/);
});

test('treats unknown GitHub response shapes as unverified', () => {
  const normalized = normalizeGithubEnvironment({
    name: 'Production',
    protection_rules: null,
  });

  assert.equal(normalized.queryStatus, 'unverified');
  assert.equal(normalized.environmentExists, false);

  for (const malformed of [
    {
      name: 'Production',
      protection_rules: [{
        type: 'required_reviewers',
        prevent_self_review: true,
        reviewers: [null],
      }],
      deployment_branch_policy: {
        protected_branches: true,
        custom_branch_policies: false,
      },
    },
    {
      name: 'Production',
      protection_rules: [{
        type: 'required_reviewers',
        prevent_self_review: true,
        reviewers: [{ type: 'Team', reviewer: { id: 7 } }],
      }],
      deployment_branch_policy: {},
    },
    {
      name: 'Production',
      protection_rules: [{
        type: 'required_reviewers',
        prevent_self_review: true,
        reviewers: [{ type: 'Team', reviewer: { id: 7 } }],
      }],
      deployment_branch_policy: {
        protected_branches: 'true',
        custom_branch_policies: false,
      },
    },
  ]) {
    assert.equal(normalizeGithubEnvironment(malformed).queryStatus, 'unverified');
  }
});

test('parses HTTPS and SSH GitHub origins', () => {
  assert.deepEqual(
    parseGithubRepository('https://github.com/tianxiawudi1996-eng/glosource-ai.git'),
    { owner: 'tianxiawudi1996-eng', repo: 'glosource-ai' },
  );
  assert.deepEqual(
    parseGithubRepository('git@github.com:tianxiawudi1996-eng/glosource-ai.git'),
    { owner: 'tianxiawudi1996-eng', repo: 'glosource-ai' },
  );
  assert.equal(parseGithubRepository('not-a-github-origin'), null);
});

test('tracked target contract requires exact Vercel identity and secret names', () => {
  assert.deepEqual(parseProductionTargetContract(expectedTarget), expectedTarget);
  assert.equal(
    parseProductionTargetContract({
      ...expectedTarget,
      vercel: { ...expectedTarget.vercel, projectId: 'wrong' },
    }),
    null,
  );
  assert.equal(
    parseProductionTargetContract({
      ...expectedTarget,
      github: { ...expectedTarget.github, requiredSecretNames: [] },
    }),
    null,
  );
});

test('normalizes only required GitHub Production secret names', () => {
  const normalized = parseGithubSecretNames({
    total_count: 2,
    secrets: [
      { name: 'DATABASE_URL', updated_at: 'not-retained' },
      { name: 'UNRELATED_SECRET', updated_at: 'not-retained' },
    ],
  }, ['DATABASE_URL']);

  assert.deepEqual(normalized, verifiedGithubSecrets);
  assert.doesNotMatch(JSON.stringify(normalized), /UNRELATED_SECRET|not-retained/);
  assert.equal(
    parseGithubSecretNames({ total_count: 101, secrets: [] }, ['DATABASE_URL'])
      .queryStatus,
    'unverified',
  );
});

test('current provider facts produce the expected sanitized blockers', () => {
  const report = buildControlPlaneReadinessReport({
    requiredEnvironment,
    expectedTarget,
    vercelLink: {
      projectId: expectedTarget.vercel.projectId,
      orgId: expectedTarget.vercel.orgId,
      projectName: 'glosource-ai',
    },
    vercelQuery: {
      queryStatus: 'verified',
      configuredNames: ['AUTH_SECRET', 'DATABASE_URL'],
    },
    githubQuery: normalizeGithubEnvironment({
      name: 'Production',
      protection_rules: [],
      deployment_branch_policy: null,
    }),
    githubSecretsQuery: verifiedGithubSecrets,
  });

  assert.equal(report.status, 'blocked');
  assert.deepEqual(report.vercel.missing, [
    'AUTH_TRUST_HOST',
    'DATAGO_SERVICE_KEY',
  ]);
  assert.equal(report.vercel.valuesIncluded, false);
  assert.equal(report.github.requiredReviewerCount, 0);
  assert.equal(report.github.preventSelfReview, null);
  assert.equal(report.github.deploymentBranchPolicyConfigured, false);
  assert.deepEqual(report.blockers, [
    'Vercel Production is missing 2 required environment variable name(s).',
    'GitHub Production has no required-reviewer approval rule.',
    'GitHub Production self-review prevention is not confirmed enabled.',
    'GitHub Production deployment branch policy is not configured.',
  ]);
});

test('provider uncertainty blocks without exposing raw errors', () => {
  const report = buildControlPlaneReadinessReport({
    requiredEnvironment,
    expectedTarget,
    vercelLink: {
      projectId: expectedTarget.vercel.projectId,
      orgId: expectedTarget.vercel.orgId,
      projectName: 'glosource-ai',
    },
    vercelQuery: {
      queryStatus: 'unverified',
      configuredNames: [],
    },
    githubQuery: {
      queryStatus: 'unverified',
      environmentExists: false,
      requiredReviewerRulePresent: false,
      requiredReviewerCount: 0,
      preventSelfReview: null,
      deploymentBranchPolicyConfigured: false,
    },
    githubSecretsQuery: {
      queryStatus: 'unverified',
      configuredNames: [],
    },
  });

  assert.equal(report.status, 'blocked');
  assert.deepEqual(report.blockers, [
    'Vercel Production environment names could not be verified.',
    'GitHub Production environment protections could not be verified.',
    'GitHub Production secret names could not be verified.',
  ]);
  assert.doesNotMatch(JSON.stringify(report), /should-never-surface|stderr|rawOutput/);
});

test('complete provider facts are ready', () => {
  const report = buildControlPlaneReadinessReport({
    requiredEnvironment,
    expectedTarget,
    vercelLink: {
      projectId: expectedTarget.vercel.projectId,
      orgId: expectedTarget.vercel.orgId,
      projectName: 'glosource-ai',
    },
    vercelQuery: {
      queryStatus: 'verified',
      configuredNames: [...requiredEnvironment],
    },
    githubQuery: normalizeGithubEnvironment({
      name: 'Production',
      protection_rules: [
        {
          type: 'required_reviewers',
          prevent_self_review: true,
          reviewers: [{ type: 'Team', reviewer: { id: 7 } }],
        },
      ],
      deployment_branch_policy: {
        protected_branches: false,
        custom_branch_policies: true,
      },
    }),
    githubSecretsQuery: verifiedGithubSecrets,
  });

  assert.equal(report.status, 'ready');
  assert.deepEqual(report.blockers, []);
});

test('exact Vercel IDs and required GitHub secret names are release blockers', () => {
  const githubQuery = normalizeGithubEnvironment({
    name: 'Production',
    protection_rules: [{
      type: 'required_reviewers',
      prevent_self_review: true,
      reviewers: [{ type: 'Team', reviewer: { id: 7 } }],
    }],
    deployment_branch_policy: {
      protected_branches: false,
      custom_branch_policies: true,
    },
  });
  const report = buildControlPlaneReadinessReport({
    requiredEnvironment,
    expectedTarget,
    vercelLink: {
      projectId: 'prj_same_name_wrong_id',
      orgId: expectedTarget.vercel.orgId,
      projectName: expectedTarget.vercel.projectName,
    },
    vercelQuery: {
      queryStatus: 'verified',
      configuredNames: [...requiredEnvironment],
    },
    githubQuery,
    githubSecretsQuery: {
      queryStatus: 'verified',
      configuredNames: [],
    },
  });

  assert.equal(report.status, 'blocked');
  assert.equal(report.vercel.targetMatch, false);
  assert.deepEqual(report.blockers, [
    'Vercel linked project does not match the expected GloSource AI project.',
    'GitHub Production is missing required secret name(s): DATABASE_URL.',
  ]);
  assert.doesNotMatch(JSON.stringify(report), /secret-value/);
});
