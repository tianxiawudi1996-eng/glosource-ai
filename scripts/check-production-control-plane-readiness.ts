import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import {
  RELEASE_IDENTITY,
  REQUIRED_PRODUCTION_ENV,
} from './package-release';

const execFileAsync = promisify(execFile);
const VERCEL_CLI_PACKAGE = 'vercel@58.5.1';

type QueryStatus = 'verified' | 'unverified';

interface VercelLink {
  projectId?: string;
  orgId?: string;
  projectName?: string;
}

export interface VercelProductionQuery {
  queryStatus: QueryStatus;
  configuredNames: string[];
}

export interface GithubEnvironmentQuery {
  queryStatus: QueryStatus;
  environmentExists: boolean;
  requiredReviewerRulePresent: boolean;
  requiredReviewerCount: number;
  preventSelfReview: boolean | null;
  deploymentBranchPolicyConfigured: boolean;
}

interface ControlPlaneReadinessInput {
  requiredEnvironment: readonly string[];
  expectedProjectName: string;
  vercelLink: VercelLink | null;
  vercelQuery: VercelProductionQuery;
  githubQuery: GithubEnvironmentQuery;
}

function stripAnsi(value: string): string {
  return value.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '');
}

export function parseVercelProductionNames(
  rawOutput: string,
  requiredEnvironment: readonly string[],
): VercelProductionQuery {
  const output = stripAnsi(rawOutput);
  const listingRecognized = /\bEnvironment Variables found\b/i.test(output);
  const emptyListingRecognized = /\bNo Environment Variables found\b/i.test(output);
  const tableHeaderRecognized = output.split(/\r?\n/).some(
    (line) => /^\s*name\s+.*\b(?:type|value)\b.*\benvironment/i.test(line),
  );

  if (!listingRecognized && !emptyListingRecognized && !tableHeaderRecognized) {
    return { queryStatus: 'unverified', configuredNames: [] };
  }

  const required = new Set(requiredEnvironment);
  const configured = new Set<string>();
  let recognizedRows = 0;
  for (const line of output.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s+/);
    if (!match) continue;
    if (!/\bProduction\b/i.test(line)) continue;
    if (!/\b(?:Encrypted|Sensitive|Plaintext|System)\b/i.test(line)) continue;
    recognizedRows += 1;
    if (required.has(match[1])) configured.add(match[1]);
  }

  if (
    !emptyListingRecognized
    && (!tableHeaderRecognized || recognizedRows === 0)
  ) {
    return { queryStatus: 'unverified', configuredNames: [] };
  }

  return {
    queryStatus: 'verified',
    configuredNames: [...configured].sort(),
  };
}

function unverifiedGithubQuery(): GithubEnvironmentQuery {
  return {
    queryStatus: 'unverified',
    environmentExists: false,
    requiredReviewerRulePresent: false,
    requiredReviewerCount: 0,
    preventSelfReview: null,
    deploymentBranchPolicyConfigured: false,
  };
}

export function normalizeGithubEnvironment(
  response: unknown,
): GithubEnvironmentQuery {
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    return unverifiedGithubQuery();
  }

  const environment = response as Record<string, unknown>;
  if (
    typeof environment.name !== 'string'
    || environment.name.toLowerCase() !== 'production'
    || !Array.isArray(environment.protection_rules)
    || !Object.prototype.hasOwnProperty.call(environment, 'deployment_branch_policy')
  ) {
    return unverifiedGithubQuery();
  }

  const protectionRules = environment.protection_rules;
  if (!protectionRules.every(
    (rule) => Boolean(
      rule
      && typeof rule === 'object'
      && !Array.isArray(rule)
      && typeof (rule as Record<string, unknown>).type === 'string',
    ),
  )) {
    return unverifiedGithubQuery();
  }

  const reviewerRules = protectionRules.filter(
    (rule): rule is Record<string, unknown> => Boolean(
      rule
      && typeof rule === 'object'
      && !Array.isArray(rule)
      && (rule as Record<string, unknown>).type === 'required_reviewers',
    ),
  );
  if (reviewerRules.length > 1) return unverifiedGithubQuery();

  const reviewerRule = reviewerRules[0];
  if (reviewerRule && !Array.isArray(reviewerRule.reviewers)) {
    return unverifiedGithubQuery();
  }
  if (
    reviewerRule
    && typeof reviewerRule.prevent_self_review !== 'boolean'
  ) {
    return unverifiedGithubQuery();
  }
  const reviewers = reviewerRule?.reviewers as unknown[] | undefined;
  if (reviewers && !reviewers.every((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const candidate = entry as Record<string, unknown>;
    if (candidate.type !== 'User' && candidate.type !== 'Team') return false;
    if (
      !candidate.reviewer
      || typeof candidate.reviewer !== 'object'
      || Array.isArray(candidate.reviewer)
    ) {
      return false;
    }
    const identity = candidate.reviewer as Record<string, unknown>;
    return typeof identity.id === 'number' && Number.isSafeInteger(identity.id);
  })) {
    return unverifiedGithubQuery();
  }

  const branchPolicy = environment.deployment_branch_policy;
  if (
    branchPolicy !== null
    && (typeof branchPolicy !== 'object' || Array.isArray(branchPolicy))
  ) {
    return unverifiedGithubQuery();
  }
  if (branchPolicy !== null) {
    const policy = branchPolicy as Record<string, unknown>;
    if (
      typeof policy.protected_branches !== 'boolean'
      || typeof policy.custom_branch_policies !== 'boolean'
    ) {
      return unverifiedGithubQuery();
    }
  }

  return {
    queryStatus: 'verified',
    environmentExists: true,
    requiredReviewerRulePresent: Boolean(reviewerRule),
    requiredReviewerCount: reviewers?.length ?? 0,
    preventSelfReview: reviewerRule
      ? reviewerRule.prevent_self_review as boolean
      : null,
    deploymentBranchPolicyConfigured: branchPolicy !== null,
  };
}

export function parseGithubRepository(
  remoteUrl: string,
): { owner: string; repo: string } | null {
  const match = remoteUrl.trim().match(
    /^(?:https:\/\/github\.com\/|git@github\.com:)([^/\s:]+)\/([^/\s]+?)(?:\.git)?$/i,
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

export function buildControlPlaneReadinessReport(
  input: ControlPlaneReadinessInput,
) {
  const linkComplete = Boolean(
    input.vercelLink?.projectId
    && input.vercelLink.orgId
    && input.vercelLink.projectName,
  );
  const targetMatch = Boolean(
    linkComplete
    && input.vercelLink?.projectName === input.expectedProjectName,
  );
  const configured = new Set(input.vercelQuery.configuredNames);
  const missing = input.requiredEnvironment.filter((name) => !configured.has(name));
  const blockers: string[] = [];

  if (!linkComplete) {
    blockers.push('Vercel project link is missing or incomplete.');
  } else if (!targetMatch) {
    blockers.push('Vercel linked project does not match the expected GloSource AI project.');
  }

  if (input.vercelQuery.queryStatus !== 'verified') {
    blockers.push('Vercel Production environment names could not be verified.');
  } else if (missing.length > 0) {
    blockers.push(
      `Vercel Production is missing ${missing.length} required environment variable name(s).`,
    );
  }

  if (input.githubQuery.queryStatus !== 'verified') {
    blockers.push('GitHub Production environment protections could not be verified.');
  } else {
    if (
      !input.githubQuery.requiredReviewerRulePresent
      || input.githubQuery.requiredReviewerCount === 0
    ) {
      blockers.push('GitHub Production has no required-reviewer approval rule.');
    }
    if (input.githubQuery.preventSelfReview !== true) {
      blockers.push(
        'GitHub Production self-review prevention is not confirmed enabled.',
      );
    }
    if (!input.githubQuery.deploymentBranchPolicyConfigured) {
      blockers.push('GitHub Production deployment branch policy is not configured.');
    }
  }

  return {
    status: blockers.length === 0 ? 'ready' : 'blocked',
    vercel: {
      queryStatus: input.vercelQuery.queryStatus,
      scope: 'vercel-production',
      linkComplete,
      targetMatch,
      projectName: input.vercelLink?.projectName ?? null,
      requiredCount: input.requiredEnvironment.length,
      configuredCount: input.requiredEnvironment.length - missing.length,
      missing,
      valuesIncluded: false,
    },
    github: {
      queryStatus: input.githubQuery.queryStatus,
      environmentExists: input.githubQuery.environmentExists,
      requiredReviewerRulePresent:
        input.githubQuery.requiredReviewerRulePresent,
      requiredReviewerCount: input.githubQuery.requiredReviewerCount,
      preventSelfReview: input.githubQuery.preventSelfReview,
      deploymentBranchPolicyConfigured:
        input.githubQuery.deploymentBranchPolicyConfigured,
      reviewerIdentitiesIncluded: false,
    },
    blockers,
  };
}

async function readVercelLink(projectRoot: string): Promise<VercelLink | null> {
  try {
    return JSON.parse(
      await readFile(join(projectRoot, '.vercel', 'project.json'), 'utf8'),
    ) as VercelLink;
  } catch {
    return null;
  }
}

async function runReadOnlyCommand(
  command: string,
  args: string[],
  cwd: string,
): Promise<string | null> {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd,
      encoding: 'utf8',
      timeout: 120_000,
      maxBuffer: 2 * 1024 * 1024,
      windowsHide: true,
    });
    return `${stdout}\n${stderr}`;
  } catch {
    return null;
  }
}

async function queryVercelProduction(
  projectRoot: string,
): Promise<VercelProductionQuery> {
  const command = process.platform === 'win32'
    ? (process.env.ComSpec || 'cmd.exe')
    : 'npx';
  const args = process.platform === 'win32'
    ? [
        '/d',
        '/s',
        '/c',
        `npx -y ${VERCEL_CLI_PACKAGE} env ls production --no-color`,
      ]
    : ['-y', VERCEL_CLI_PACKAGE, 'env', 'ls', 'production', '--no-color'];
  const output = await runReadOnlyCommand(
    command,
    args,
    projectRoot,
  );
  if (output === null) {
    return { queryStatus: 'unverified', configuredNames: [] };
  }
  return parseVercelProductionNames(output, REQUIRED_PRODUCTION_ENV);
}

async function queryGithubProduction(
  projectRoot: string,
): Promise<GithubEnvironmentQuery> {
  const origin = await runReadOnlyCommand(
    'git',
    ['remote', 'get-url', 'origin'],
    projectRoot,
  );
  if (origin === null) return unverifiedGithubQuery();
  const repository = parseGithubRepository(origin);
  if (!repository) return unverifiedGithubQuery();

  const response = await runReadOnlyCommand(
    'gh',
    [
      'api',
      `repos/${repository.owner}/${repository.repo}/environments/production`,
    ],
    projectRoot,
  );
  if (response === null) return unverifiedGithubQuery();
  try {
    return normalizeGithubEnvironment(JSON.parse(response));
  } catch {
    return unverifiedGithubQuery();
  }
}

export async function checkProductionControlPlaneReadiness(
  projectRoot = process.cwd(),
) {
  const vercelLink = await readVercelLink(projectRoot);
  const linkUsable = Boolean(
    vercelLink?.projectId
    && vercelLink.orgId
    && vercelLink.projectName === RELEASE_IDENTITY.packageName,
  );
  const [vercelQuery, githubQuery] = await Promise.all([
    linkUsable
      ? queryVercelProduction(projectRoot)
      : Promise.resolve({
          queryStatus: 'unverified' as const,
          configuredNames: [],
        }),
    queryGithubProduction(projectRoot),
  ]);

  return buildControlPlaneReadinessReport({
    requiredEnvironment: REQUIRED_PRODUCTION_ENV,
    expectedProjectName: RELEASE_IDENTITY.packageName,
    vercelLink,
    vercelQuery,
    githubQuery,
  });
}

const currentFile = resolve(fileURLToPath(import.meta.url));
const entryFile = process.argv[1] ? resolve(process.argv[1]) : '';
if (currentFile === entryFile) {
  checkProductionControlPlaneReadiness()
    .then((report) => {
      console.log(JSON.stringify(report, null, 2));
      if (report.status !== 'ready') process.exitCode = 1;
    })
    .catch(() => {
      console.error('Production control-plane readiness check failed.');
      process.exitCode = 1;
    });
}
