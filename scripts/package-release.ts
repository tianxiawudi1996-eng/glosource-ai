import { spawnSync } from 'node:child_process';
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REQUIRED_PRODUCTION_ENV = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'AUTH_URL',
  'AUTH_TRUST_HOST',
  'GEMINI_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'RESEND_API_KEY',
  'RESEND_EMAIL_FROM',
  'RESEND_WEBHOOK_SECRET',
  'POLAR_WEBHOOK_SECRET',
  'POLAR_ACCESS_TOKEN',
  'POLAR_STARTER_PRODUCT_ID',
  'POLAR_PRO_PRODUCT_ID',
  'POLAR_AGENCY_PRODUCT_ID',
  'NEXT_PUBLIC_POLAR_STARTER_LINK',
  'NEXT_PUBLIC_POLAR_PRO_LINK',
  'NEXT_PUBLIC_POLAR_AGENCY_LINK',
  'DATAGO_SERVICE_KEY',
  'CRON_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PUBLISH_SECRET',
] as const;

export const OPTIONAL_PRODUCTION_ENV = [
  'RESEND_FULL_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
  'BUFFER_API_KEY',
  'BUFFER_CHANNEL_THREADS',
] as const;

export const RELEASE_IDENTITY = {
  product: 'GloSource AI',
  packageName: 'glosource-ai',
} as const;

const SENSITIVE_FILE_NAMES = new Set([
  '.dockerconfigjson',
  '.netrc',
  '.npmrc',
  '.yarnrc',
  'admin.txt',
  'credentials',
  'credentials.json',
  'id_ed25519',
  'id_rsa',
  'supabase.txt',
]);

const SENSITIVE_FILE_EXTENSIONS = [
  '.jks',
  '.key',
  '.keystore',
  '.p12',
  '.pem',
  '.pfx',
] as const;

interface ReleaseManifestInput {
  version: string;
  commit: string;
  dirty: boolean;
  builtAt: string;
  nodeVersion: string;
}

export function buildReleaseManifest(input: ReleaseManifestInput) {
  return {
    schemaVersion: 1,
    ...RELEASE_IDENTITY,
    version: input.version,
    builtAt: input.builtAt,
    source: {
      commit: input.commit,
      dirty: input.dirty,
    },
    runtime: {
      node: input.nodeVersion,
      startCommand: 'node server.js',
      portEnv: 'PORT',
      hostnameEnv: 'HOSTNAME',
    },
    requiredEnvironment: REQUIRED_PRODUCTION_ENV,
    optionalEnvironment: OPTIONAL_PRODUCTION_ENV,
    contents: [
      'Next.js standalone server',
      'Traced production dependencies',
      'Public assets',
      'Next.js static assets',
    ],
    secretsIncluded: false,
  };
}

function gitOutput(args: string[], cwd: string): string {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
  });
  return result.status === 0 ? result.stdout.trim() : 'unknown';
}

export function assertPackagePathSafe(sourcePath: string): true {
  const name = basename(sourcePath).toLowerCase();
  const sensitive = (
    name === '.env'
    || name === '.envrc'
    || name.startsWith('.env.')
    || SENSITIVE_FILE_NAMES.has(name)
    || SENSITIVE_FILE_EXTENSIONS.some((extension) => name.endsWith(extension))
    || (
      name.endsWith('.json')
      && (
        name.includes('client_secret')
        || name.includes('client-secret')
        || name.includes('service_account')
        || name.includes('service-account')
        || name === 'application_default_credentials.json'
      )
    )
  );
  if (sensitive) {
    throw new Error(`Refusing to package sensitive file: ${name}`);
  }
  return true;
}

export async function assertStandaloneIntegrity(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await assertStandaloneIntegrity(path);
      continue;
    }
    if (!entry.isFile()) continue;

    const contents = await readFile(path);
    if (contents.length > 0 && contents.every((byte) => byte === 0)) {
      throw new Error(`Corrupt standalone build artifact (all zero bytes): ${path}`);
    }
  }
}

export async function packageRelease(projectRoot = process.cwd()): Promise<{
  packageDirectory: string;
  archivePath: string;
}> {
  const standaloneDirectory = join(projectRoot, '.next', 'standalone');
  try {
    await stat(join(standaloneDirectory, 'server.js'));
  } catch {
    throw new Error('Missing .next/standalone/server.js. Run npm run build first.');
  }
  await assertStandaloneIntegrity(standaloneDirectory);

  const packageJson = JSON.parse(
    await readFile(join(projectRoot, 'package.json'), 'utf8'),
  ) as { version: string };
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const packageName = `${RELEASE_IDENTITY.packageName}-${packageJson.version}-${timestamp}`;
  const distRoot = join(projectRoot, 'dist');
  const packageDirectory = join(distRoot, packageName);
  const archivePath = join(distRoot, `${packageName}.tgz`);

  await mkdir(distRoot, { recursive: true });
  await mkdir(packageDirectory, { recursive: false });
  try {
    await cp(standaloneDirectory, packageDirectory, {
      recursive: true,
      filter: assertPackagePathSafe,
    });
    const copyResults = await Promise.allSettled([
      cp(join(projectRoot, 'public'), join(packageDirectory, 'public'), {
        recursive: true,
        filter: assertPackagePathSafe,
      }),
      cp(
        join(projectRoot, '.next', 'static'),
        join(packageDirectory, '.next', 'static'),
        {
          recursive: true,
          filter: assertPackagePathSafe,
        },
      ),
    ]);
    const copyFailures = copyResults
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) => result.reason);
    if (copyFailures.length === 1) throw copyFailures[0];
    if (copyFailures.length > 1) {
      throw new AggregateError(copyFailures, 'Failed to copy release assets.');
    }

    const manifest = buildReleaseManifest({
      version: packageJson.version,
      commit: gitOutput(['rev-parse', '--short=12', 'HEAD'], projectRoot),
      dirty: gitOutput(['status', '--porcelain'], projectRoot) !== '',
      builtAt: new Date().toISOString(),
      nodeVersion: process.version,
    });
    await writeFile(
      join(packageDirectory, 'RELEASE-MANIFEST.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
      'utf8',
    );

    const archive = spawnSync(
      'tar',
      ['-czf', archivePath, '-C', distRoot, packageName],
      { cwd: projectRoot, stdio: 'inherit', timeout: 120_000 },
    );
    if (archive.error) throw archive.error;
    if (archive.status !== 0) {
      throw new Error(
        `Failed to create the release archive with tar (status ${archive.status}, signal ${archive.signal ?? 'none'}).`,
      );
    }

    return { packageDirectory, archivePath };
  } catch (error: unknown) {
    const cleanupResults = await Promise.allSettled([
      rm(packageDirectory, { recursive: true, force: true }),
      rm(archivePath, { force: true }),
    ]);
    const cleanupFailures = cleanupResults
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) => result.reason);
    if (cleanupFailures.length > 0) {
      throw new AggregateError(
        [error, ...cleanupFailures],
        'Release packaging failed and cleanup was incomplete.',
      );
    }
    throw error;
  }
}

const currentFile = resolve(fileURLToPath(import.meta.url));
const entryFile = process.argv[1] ? resolve(process.argv[1]) : '';
if (currentFile === entryFile) {
  packageRelease()
    .then(({ packageDirectory, archivePath }) => {
      console.log(`Product package: ${packageDirectory}`);
      console.log(`Archive: ${archivePath}`);
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
