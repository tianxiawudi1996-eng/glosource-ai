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
  dirty: boolean;
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
  const blockers: string[] = [];

  if (missing.length > 0) {
    blockers.push(`Missing ${missing.length} required environment variable(s).`);
  }
  if (!linkComplete) {
    blockers.push('Vercel project link is missing or incomplete.');
  }
  if (!input.archivePath) {
    blockers.push('No packaged release archive was found.');
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
    },
    source: {
      dirty: input.dirty,
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

async function checkProductReadiness(projectRoot = process.cwd()) {
  loadEnvConfig(projectRoot);
  const [vercelLink, archivePath, dirty] = await Promise.all([
    readVercelLink(projectRoot),
    findLatestArchive(projectRoot),
    sourceIsDirty(projectRoot),
  ]);
  return buildProductReadinessReport({
    requiredEnvironment: REQUIRED_PRODUCTION_ENV,
    environment: process.env,
    vercelLink,
    archivePath,
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
