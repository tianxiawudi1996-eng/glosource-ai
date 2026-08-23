import { execFile } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { loadEnvConfig } from '@next/env';
import { RELEASE_IDENTITY, REQUIRED_PRODUCTION_ENV } from './package-release';

const execFileAsync = promisify(execFile);

interface VercelLink {
  projectId?: string;
  orgId?: string;
  projectName?: string;
}

interface ProductReadinessInput {
  requiredEnvironment: readonly string[];
  environment: Record<string, string | undefined>;
  vercelLink: VercelLink | null;
  archivePath: string | null;
  archiveManifest: unknown;
  currentHead: string | null;
  dirty: boolean;
}

interface ReleaseManifestAssessment {
  verified: boolean;
  candidateMatch: boolean;
  cleanSource: boolean;
  commit: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function assessReleaseManifest(
  manifest: unknown,
  currentHead: string | null,
  requiredEnvironment: readonly string[] = REQUIRED_PRODUCTION_ENV,
): ReleaseManifestAssessment {
  if (!isRecord(manifest) || !isRecord(manifest.source)) {
    return {
      verified: false,
      candidateMatch: false,
      cleanSource: false,
      commit: null,
    };
  }

  const commit = typeof manifest.source.commit === 'string'
    ? manifest.source.commit.trim().toLowerCase()
    : null;
  const manifestEnvironment = Array.isArray(manifest.requiredEnvironment)
    ? manifest.requiredEnvironment
    : null;
  const verified = Boolean(
    manifest.schemaVersion === 1
    && manifest.product === RELEASE_IDENTITY.product
    && manifest.packageName === RELEASE_IDENTITY.packageName
    && manifest.secretsIncluded === false
    && typeof manifest.version === 'string'
    && manifest.version.length > 0
    && commit
    && /^[a-f0-9]{12,40}$/.test(commit)
    && typeof manifest.source.dirty === 'boolean'
    && manifestEnvironment
    && manifestEnvironment.length === requiredEnvironment.length
    && manifestEnvironment.every(
      (name, index) => name === requiredEnvironment[index],
    )
  );
  const normalizedHead = currentHead?.trim().toLowerCase() ?? '';
  const candidateMatch = Boolean(
    verified
    && /^[a-f0-9]{40}$/.test(normalizedHead)
    && normalizedHead.startsWith(commit!),
  );

  return {
    verified,
    candidateMatch,
    cleanSource: verified && manifest.source.dirty === false,
    commit: verified ? commit : null,
  };
}

export function buildProductReadinessReport(input: ProductReadinessInput) {
  const missing = input.requiredEnvironment.filter(
    (name) => !input.environment[name]?.trim(),
  );
  const linkComplete = Boolean(
    input.vercelLink?.projectId
    && input.vercelLink.orgId
    && input.vercelLink.projectName,
  );
  const manifest = input.archivePath
    ? assessReleaseManifest(
        input.archiveManifest,
        input.currentHead,
        input.requiredEnvironment,
      )
    : null;
  const blockers: string[] = [];

  if (missing.length > 0) {
    blockers.push(`Missing ${missing.length} required environment variable(s).`);
  }
  if (!linkComplete) {
    blockers.push('Vercel project link is missing or incomplete.');
  }
  if (!input.archivePath) {
    blockers.push('No packaged release archive was found.');
  } else if (!manifest?.verified) {
    blockers.push('The packaged release archive manifest is missing or invalid.');
  } else {
    if (!manifest.cleanSource) {
      blockers.push('The packaged release archive was built from dirty source.');
    }
    if (!manifest.candidateMatch) {
      blockers.push('The packaged release archive is not bound to the current HEAD.');
    }
  }
  if (input.dirty) {
    blockers.push(
      'The source tree is dirty; create a clean provenance build before production deployment.',
    );
  }

  return {
    status: blockers.length === 0 ? 'ready' : 'blocked',
    environment: {
      scope: 'local-process',
      requiredCount: input.requiredEnvironment.length,
      configuredCount: input.requiredEnvironment.length - missing.length,
      missing,
      valuesIncluded: false,
    },
    vercelLink: {
      complete: linkComplete,
      projectId: input.vercelLink?.projectId ?? null,
      orgId: input.vercelLink?.orgId ?? null,
      projectName: input.vercelLink?.projectName ?? null,
    },
    releaseArchive: {
      present: Boolean(input.archivePath),
      path: input.archivePath,
      manifestVerified: manifest?.verified ?? false,
      candidateMatch: manifest?.candidateMatch ?? false,
      cleanSource: manifest?.cleanSource ?? false,
      commit: manifest?.commit ?? null,
    },
    source: {
      dirty: input.dirty,
      head: input.currentHead,
    },
    blockers,
  };
}

export async function readReleaseManifestFromArchive(
  archivePath: string,
  projectRoot: string,
): Promise<unknown> {
  try {
    const { stdout: listing } = await execFileAsync(
      'tar',
      ['-tzf', archivePath],
      {
        cwd: projectRoot,
        encoding: 'utf8',
        timeout: 120_000,
        maxBuffer: 2 * 1024 * 1024,
      },
    );
    const manifestEntries = listing
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .filter((entry) => /(?:^|\/)RELEASE-MANIFEST\.json$/.test(entry));
    if (manifestEntries.length !== 1) return null;

    const { stdout: source } = await execFileAsync(
      'tar',
      ['-xOf', archivePath, manifestEntries[0]],
      {
        cwd: projectRoot,
        encoding: 'utf8',
        timeout: 120_000,
        maxBuffer: 2 * 1024 * 1024,
      },
    );
    return JSON.parse(source) as unknown;
  } catch {
    return null;
  }
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

async function findLatestArchive(projectRoot: string): Promise<string | null> {
  const distRoot = join(projectRoot, 'dist');
  try {
    const prefix = `${RELEASE_IDENTITY.packageName}-`;
    let latest: { path: string; modifiedAt: number } | null = null;
    for (const name of await readdir(distRoot)) {
      if (!name.startsWith(prefix) || !name.endsWith('.tgz')) continue;
      const path = join(distRoot, name);
      const modifiedAt = (await stat(path)).mtimeMs;
      if (!latest || modifiedAt > latest.modifiedAt) latest = { path, modifiedAt };
    }
    return latest?.path ?? null;
  } catch {
    return null;
  }
}

async function sourceIsDirty(projectRoot: string): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync('git', ['status', '--porcelain'], {
      cwd: projectRoot,
      encoding: 'utf8',
    });
    return stdout.trim().length > 0;
  } catch {
    return true;
  }
}

async function currentHead(projectRoot: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
      cwd: projectRoot,
      encoding: 'utf8',
    });
    const head = stdout.trim().toLowerCase();
    return /^[a-f0-9]{40}$/.test(head) ? head : null;
  } catch {
    return null;
  }
}

async function checkProductReadiness(projectRoot = process.cwd()) {
  loadEnvConfig(projectRoot);
  const [vercelLink, archivePath, dirty, head] = await Promise.all([
    readVercelLink(projectRoot),
    findLatestArchive(projectRoot),
    sourceIsDirty(projectRoot),
    currentHead(projectRoot),
  ]);
  const archiveManifest = archivePath
    ? await readReleaseManifestFromArchive(archivePath, projectRoot)
    : null;
  return buildProductReadinessReport({
    requiredEnvironment: REQUIRED_PRODUCTION_ENV,
    environment: process.env,
    vercelLink,
    archivePath,
    archiveManifest,
    currentHead: head,
    dirty,
  });
}

const currentFile = resolve(fileURLToPath(import.meta.url));
const entryFile = process.argv[1] ? resolve(process.argv[1]) : '';
if (currentFile === entryFile) {
  checkProductReadiness()
    .then((report) => {
      console.log(JSON.stringify(report, null, 2));
      if (report.status !== 'ready') process.exitCode = 1;
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
