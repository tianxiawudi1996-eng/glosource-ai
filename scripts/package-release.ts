import { spawnSync } from 'node:child_process';
import {
  cp,
  mkdir,
  stat,
  writeFile,
} from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REQUIRED_PRODUCTION_ENV = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'GEMINI_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'RESEND_API_KEY',
  'RESEND_EMAIL_FROM',
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
  'AUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
  'BUFFER_API_KEY',
  'BUFFER_CHANNEL_THREADS',
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
    product: 'GloSource AI',
    packageName: 'glosource-ai',
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

function gitOutput(args: string[]): string {
  const result = spawnSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  return result.status === 0 ? result.stdout.trim() : 'unknown';
}

function shouldPackagePath(sourcePath: string): boolean {
  const name = basename(sourcePath).toLowerCase();
  if (name === '.env' || name.startsWith('.env.')) return false;
  if (name.endsWith('.pem')) return false;
  return name !== 'admin.txt' && name !== 'supabase.txt';
}

async function copyIfPresent(source: string, destination: string): Promise<void> {
  try {
    await stat(source);
  } catch {
    return;
  }
  await cp(source, destination, {
    recursive: true,
    filter: shouldPackagePath,
  });
}

export async function packageRelease(): Promise<{
  packageDirectory: string;
  archivePath: string;
}> {
  const projectRoot = process.cwd();
  const standaloneDirectory = join(projectRoot, '.next', 'standalone');
  try {
    await stat(join(standaloneDirectory, 'server.js'));
  } catch {
    throw new Error('Missing .next/standalone/server.js. Run npm run build first.');
  }

  const packageJson = JSON.parse(
    await import('node:fs/promises').then(({ readFile }) => readFile(
      join(projectRoot, 'package.json'),
      'utf8',
    )),
  ) as { version: string };
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const packageName = `glosource-ai-${packageJson.version}-${timestamp}`;
  const distRoot = join(projectRoot, 'dist');
  const packageDirectory = join(distRoot, packageName);
  const archivePath = join(distRoot, `${packageName}.tgz`);

  await mkdir(distRoot, { recursive: true });
  await mkdir(packageDirectory, { recursive: false });
  await cp(standaloneDirectory, packageDirectory, {
    recursive: true,
    filter: shouldPackagePath,
  });
  await copyIfPresent(join(projectRoot, 'public'), join(packageDirectory, 'public'));
  await copyIfPresent(
    join(projectRoot, '.next', 'static'),
    join(packageDirectory, '.next', 'static'),
  );

  const manifest = buildReleaseManifest({
    version: packageJson.version,
    commit: gitOutput(['rev-parse', '--short=12', 'HEAD']),
    dirty: gitOutput(['status', '--porcelain']) !== '',
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
    { cwd: projectRoot, stdio: 'inherit' },
  );
  if (archive.status !== 0) {
    throw new Error('Failed to create the release archive with tar.');
  }

  return { packageDirectory, archivePath };
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
