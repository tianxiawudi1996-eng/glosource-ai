import { createHash, randomBytes } from 'node:crypto';
import { execFile, spawn, type ChildProcess } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { assertPackagePathSafe } from './package-release';
import { assessReleaseManifest, readReleaseManifestFromArchive } from './check-product-readiness';

const execFileAsync = promisify(execFile);
const SHA_PATTERN = /^[a-f0-9]{40}$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const RECEIPT_ROOT = join('reports', 'harness', 'private', 'local-release-receipts');
const REQUIRED_SMOKE_ROUTES = ['/', '/en', '/api/auth/session'] as const;
const PRODUCT_CONTRACT_ROUTE_COUNT = 7;
const MAX_CAPTURE_BYTES = 64 * 1024;

type SmokeRoute = {
  path: typeof REQUIRED_SMOKE_ROUTES[number];
  status: 200;
};

export type LocalReleaseReceipt = {
  schemaVersion: 1;
  kind: 'glosource-local-release-receipt';
  candidateSha: string;
  createdAt: string;
  archive: {
    path: string;
    sha256: string;
    bytes: number;
    entryCount: number;
    unpackedFileCount: number;
    blockedFileCount: 0;
    allZeroFileCount: 0;
    manifest: {
      commit: string;
      dirty: false;
      requiredEnvironmentCount: number;
      secretsIncluded: false;
    };
  };
  smoke: {
    routes: SmokeRoute[];
    productContract: {
      passed: 7;
      total: 7;
    };
    runtimeErrorTokenCount: 0;
  };
  safety: {
    loopbackOnly: true;
    secretValuesIncluded: false;
    externalActions: 0;
  };
};

export type LocalReleaseReceiptContext = {
  currentHead: string;
  dirty: boolean;
  archivePath: string;
  archiveSha256: string;
  archiveBytes: number;
  archiveManifest: unknown;
};

type ArchiveInspection = {
  absolutePath: string;
  relativePath: string;
  sha256: string;
  bytes: number;
  entryCount: number;
  manifestEntry: string;
  manifest: unknown;
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

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    && Number.isFinite(Date.parse(value));
}

function parseLocalReleaseReceipt(value: unknown): LocalReleaseReceipt | null {
  if (!isRecord(value) || !hasExactKeys(value, [
    'schemaVersion',
    'kind',
    'candidateSha',
    'createdAt',
    'archive',
    'smoke',
    'safety',
  ])) return null;
  if (
    value.schemaVersion !== 1
    || value.kind !== 'glosource-local-release-receipt'
    || typeof value.candidateSha !== 'string'
    || !SHA_PATTERN.test(value.candidateSha)
    || !isIsoTimestamp(value.createdAt)
    || !isRecord(value.archive)
    || !isRecord(value.smoke)
    || !isRecord(value.safety)
  ) return null;

  const archive = value.archive;
  const smoke = value.smoke;
  const safety = value.safety;
  if (
    !hasExactKeys(archive, [
      'path',
      'sha256',
      'bytes',
      'entryCount',
      'unpackedFileCount',
      'blockedFileCount',
      'allZeroFileCount',
      'manifest',
    ])
    || typeof archive.path !== 'string'
    || !archive.path.startsWith('dist/')
    || archive.path.includes('..')
    || !archive.path.endsWith('.tgz')
    || typeof archive.sha256 !== 'string'
    || !DIGEST_PATTERN.test(archive.sha256)
    || typeof archive.bytes !== 'number'
    || !Number.isSafeInteger(archive.bytes)
    || archive.bytes <= 0
    || typeof archive.entryCount !== 'number'
    || !Number.isSafeInteger(archive.entryCount)
    || archive.entryCount <= 0
    || typeof archive.unpackedFileCount !== 'number'
    || !Number.isSafeInteger(archive.unpackedFileCount)
    || archive.unpackedFileCount <= 0
    || archive.blockedFileCount !== 0
    || archive.allZeroFileCount !== 0
    || !isRecord(archive.manifest)
    || !hasExactKeys(archive.manifest, [
      'commit',
      'dirty',
      'requiredEnvironmentCount',
      'secretsIncluded',
    ])
    || typeof archive.manifest.commit !== 'string'
    || !/^[a-f0-9]{12,40}$/.test(archive.manifest.commit)
    || archive.manifest.dirty !== false
    || typeof archive.manifest.requiredEnvironmentCount !== 'number'
    || !Number.isSafeInteger(archive.manifest.requiredEnvironmentCount)
    || archive.manifest.requiredEnvironmentCount <= 0
    || archive.manifest.secretsIncluded !== false
  ) return null;

  if (
    !hasExactKeys(smoke, ['routes', 'productContract', 'runtimeErrorTokenCount'])
    || !Array.isArray(smoke.routes)
    || smoke.routes.length !== REQUIRED_SMOKE_ROUTES.length
    || !smoke.routes.every((route, index) => (
      isRecord(route)
      && hasExactKeys(route, ['path', 'status'])
      && route.path === REQUIRED_SMOKE_ROUTES[index]
      && route.status === 200
    ))
    || !isRecord(smoke.productContract)
    || !hasExactKeys(smoke.productContract, ['passed', 'total'])
    || smoke.productContract.passed !== PRODUCT_CONTRACT_ROUTE_COUNT
    || smoke.productContract.total !== PRODUCT_CONTRACT_ROUTE_COUNT
    || smoke.runtimeErrorTokenCount !== 0
  ) return null;

  if (
    !hasExactKeys(safety, ['loopbackOnly', 'secretValuesIncluded', 'externalActions'])
    || safety.loopbackOnly !== true
    || safety.secretValuesIncluded !== false
    || safety.externalActions !== 0
  ) return null;

  return value as LocalReleaseReceipt;
}

export function buildLocalReleaseReceiptReport(input: {
  receipt: unknown;
  context: LocalReleaseReceiptContext;
  receiptPath: string;
}) {
  const receipt = parseLocalReleaseReceipt(input.receipt);
  const blockerCodes: string[] = [];
  const manifestAssessment = assessReleaseManifest(
    input.context.archiveManifest,
    input.context.currentHead,
  );
  if (!receipt) blockerCodes.push('LOCAL_RELEASE_RECEIPT_INVALID');
  if (input.context.dirty) blockerCodes.push('SOURCE_DIRTY');
  if (!manifestAssessment.verified) blockerCodes.push('ARCHIVE_MANIFEST_INVALID');
  if (!manifestAssessment.cleanSource) blockerCodes.push('ARCHIVE_SOURCE_DIRTY');
  if (!manifestAssessment.candidateMatch) blockerCodes.push('ARCHIVE_CANDIDATE_MISMATCH');

  if (receipt) {
    if (receipt.candidateSha !== input.context.currentHead) {
      blockerCodes.push('RECEIPT_CANDIDATE_MISMATCH');
    }
    if (receipt.archive.path !== input.context.archivePath) {
      blockerCodes.push('RECEIPT_ARCHIVE_PATH_MISMATCH');
    }
    if (receipt.archive.sha256 !== input.context.archiveSha256) {
      blockerCodes.push('RECEIPT_ARCHIVE_DIGEST_MISMATCH');
    }
    if (receipt.archive.bytes !== input.context.archiveBytes) {
      blockerCodes.push('RECEIPT_ARCHIVE_SIZE_MISMATCH');
    }
    if (
      !input.context.currentHead.startsWith(receipt.archive.manifest.commit)
      || receipt.archive.manifest.commit !== manifestAssessment.commit
    ) blockerCodes.push('RECEIPT_MANIFEST_MISMATCH');
  }

  const uniqueBlockers = [...new Set(blockerCodes)];
  return {
    status: uniqueBlockers.length === 0 ? 'ready' as const : 'blocked' as const,
    candidateSha: input.context.currentHead,
    receipt: {
      path: input.receiptPath,
      found: Boolean(receipt),
    },
    archive: {
      path: input.context.archivePath,
      sha256: input.context.archiveSha256,
      bytes: input.context.archiveBytes,
      manifestVerified: manifestAssessment.verified,
      candidateMatch: manifestAssessment.candidateMatch,
      cleanSource: manifestAssessment.cleanSource,
    },
    checks: {
      sourceClean: !input.context.dirty,
      receiptValid: Boolean(receipt),
      archiveBound: Boolean(receipt)
        && !uniqueBlockers.some((code) => (
          code.startsWith('RECEIPT_ARCHIVE')
          || code === 'RECEIPT_CANDIDATE_MISMATCH'
          || code === 'RECEIPT_MANIFEST_MISMATCH'
        )),
      smokeGreen: Boolean(receipt),
    },
    blockerCodes: uniqueBlockers,
    safety: {
      secretValuesIncluded: false as const,
      rawLogsIncluded: false as const,
      externalActions: 0 as const,
    },
  };
}

async function gitOutput(projectRoot: string, args: string[]) {
  const { stdout } = await execFileAsync('git', args, {
    cwd: projectRoot,
    encoding: 'utf8',
    timeout: 30_000,
  });
  return stdout.trim();
}

async function readGitContext(projectRoot: string) {
  const [head, status] = await Promise.all([
    gitOutput(projectRoot, ['rev-parse', 'HEAD']),
    gitOutput(projectRoot, ['status', '--porcelain', '--untracked-files=all']),
  ]);
  if (!SHA_PATTERN.test(head)) throw new Error('Exact Git HEAD is unavailable.');
  return { head, dirty: status.length > 0 };
}

export function resolveArchiveWithinDist(projectRoot: string, requestedPath: string) {
  const absolute = resolve(projectRoot, requestedPath);
  const distRoot = resolve(projectRoot, 'dist');
  const relativeToDist = relative(distRoot, absolute);
  if (
    relativeToDist.startsWith('..')
    || relativeToDist === ''
    || relativeToDist.includes(`..${sep}`)
    || !absolute.toLowerCase().endsWith('.tgz')
  ) throw new Error('Release archive must be a .tgz file inside dist/.');
  return absolute;
}

function toRepoPath(projectRoot: string, path: string) {
  return relative(projectRoot, path).split(sep).join('/');
}

async function inspectArchive(projectRoot: string, requestedPath: string): Promise<ArchiveInspection> {
  const absolutePath = resolveArchiveWithinDist(projectRoot, requestedPath);
  const [contents, archiveStat, manifest] = await Promise.all([
    readFile(absolutePath),
    stat(absolutePath),
    readReleaseManifestFromArchive(absolutePath, projectRoot),
  ]);
  const { stdout: listing } = await execFileAsync('tar', ['-tzf', absolutePath], {
    cwd: projectRoot,
    encoding: 'utf8',
    timeout: 120_000,
    maxBuffer: 4 * 1024 * 1024,
  });
  const entries = listing.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
  const manifestEntries = entries.filter(
    (entry) => /(?:^|\/)RELEASE-MANIFEST\.json$/.test(entry),
  );
  if (manifestEntries.length !== 1 || !manifest) {
    throw new Error('Archive must contain exactly one valid release manifest.');
  }
  return {
    absolutePath,
    relativePath: toRepoPath(projectRoot, absolutePath),
    sha256: createHash('sha256').update(contents).digest('hex'),
    bytes: archiveStat.size,
    entryCount: entries.length,
    manifestEntry: manifestEntries[0],
    manifest,
  };
}

async function scanExtractedPackage(packageRoot: string) {
  let fileCount = 0;
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(path);
        continue;
      }
      if (!entry.isFile()) continue;
      assertPackagePathSafe(path);
      fileCount += 1;
      const contents = await readFile(path);
      if (contents.length > 0 && contents.every((byte) => byte === 0)) {
        throw new Error('Extracted archive contains an all-zero file.');
      }
    }
  }
  await visit(packageRoot);
  return fileCount;
}

async function reserveLoopbackPort() {
  return new Promise<number>((resolvePort, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close((error) => {
        if (error) reject(error);
        else if (!port) reject(new Error('Could not reserve a loopback port.'));
        else resolvePort(port);
      });
    });
  });
}

export function hasChildExited(
  child: Pick<ChildProcess, 'exitCode' | 'signalCode'>,
) {
  return child.exitCode !== null || child.signalCode !== null;
}

function safeChildEnvironment(port: number) {
  const environment: NodeJS.ProcessEnv = { NODE_ENV: 'production' };
  for (const name of [
    'PATH',
    'Path',
    'SystemRoot',
    'SYSTEMROOT',
    'TEMP',
    'TMP',
    'ComSpec',
    'COMSPEC',
    'PATHEXT',
    'WINDIR',
  ]) {
    if (process.env[name]) environment[name] = process.env[name];
  }
  environment.HOSTNAME = '127.0.0.1';
  environment.PORT = String(port);
  environment.AUTH_URL = `http://127.0.0.1:${port}`;
  environment.AUTH_TRUST_HOST = 'true';
  environment.AUTH_SECRET = randomBytes(32).toString('base64url');
  environment.DATABASE_URL = [
    'postgresql',
    '://smoke:smoke@127.0.0.1:65432/glosource_smoke',
  ].join('');
  return environment;
}

async function waitForServer(baseUrl: string, child: ChildProcess) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (hasChildExited(child)) throw new Error('Standalone server exited before smoke.');
    try {
      const response = await fetch(`${baseUrl}/`, { redirect: 'manual' });
      if (response.status === 200) return;
    } catch {
      // Startup is still in progress.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }
  throw new Error('Standalone server did not become ready within 30 seconds.');
}

async function stopChild(child: ChildProcess) {
  if (hasChildExited(child)) return;
  child.kill();
  await Promise.race([
    new Promise<void>((resolveExit) => child.once('exit', () => resolveExit())),
    new Promise<void>((resolveTimeout) => setTimeout(resolveTimeout, 10_000)),
  ]);
  if (!hasChildExited(child)) throw new Error('Standalone server did not stop cleanly.');
}

async function runLocalSmoke(projectRoot: string, packageRoot: string) {
  const port = await reserveLoopbackPort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const environment = safeChildEnvironment(port);
  const child: ChildProcess = spawn(process.execPath, ['server.js'], {
    cwd: packageRoot,
    env: environment,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout?.on('data', (chunk: Buffer) => {
    stdout = (stdout + String(chunk)).slice(-MAX_CAPTURE_BYTES);
  });
  child.stderr?.on('data', (chunk: Buffer) => {
    stderr = (stderr + String(chunk)).slice(-MAX_CAPTURE_BYTES);
  });

  const routes: SmokeRoute[] = [];
  try {
    await waitForServer(baseUrl, child);
    for (const path of REQUIRED_SMOKE_ROUTES) {
      const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });
      if (response.status !== 200) throw new Error(`Smoke route failed: ${path}`);
      routes.push({ path, status: 200 });
    }
    const contract = await execFileAsync(
      process.execPath,
      [join(projectRoot, 'scripts', 'growth', 'audit-live-product-contract.js')],
      {
        cwd: projectRoot,
        env: { ...environment, GLOSOURCE_BASE_URL: baseUrl },
        encoding: 'utf8',
        timeout: 60_000,
        maxBuffer: 512 * 1024,
      },
    );
    const passed = contract.stdout.split(/\r?\n/)
      .filter((line) => line.startsWith('PASS ')).length;
    if (passed !== PRODUCT_CONTRACT_ROUTE_COUNT) {
      throw new Error('Product contract smoke did not pass every required route.');
    }
  } finally {
    await stopChild(child);
  }

  const runtimeErrorTokenCount = (
    `${stdout}\n${stderr}`.match(/\b(?:fatal|unhandled|uncaught|error)\b/gi) ?? []
  ).length;
  if (runtimeErrorTokenCount > 0) {
    throw new Error('Standalone runtime log contains an error token.');
  }
  return {
    routes,
    productContract: {
      passed: PRODUCT_CONTRACT_ROUTE_COUNT as 7,
      total: PRODUCT_CONTRACT_ROUTE_COUNT as 7,
    },
    runtimeErrorTokenCount: 0 as const,
  };
}

function receiptPathForCandidate(projectRoot: string, candidateSha: string) {
  if (!SHA_PATTERN.test(candidateSha)) throw new Error('Invalid candidate SHA.');
  return join(projectRoot, RECEIPT_ROOT, `${candidateSha}.json`);
}

async function createReceipt(projectRoot: string, requestedArchive: string) {
  const git = await readGitContext(projectRoot);
  if (git.dirty) throw new Error('Local release receipt requires a clean worktree.');
  const archive = await inspectArchive(projectRoot, requestedArchive);
  const manifestAssessment = assessReleaseManifest(archive.manifest, git.head);
  if (
    !manifestAssessment.verified
    || !manifestAssessment.cleanSource
    || !manifestAssessment.candidateMatch
    || !manifestAssessment.commit
  ) throw new Error('Archive manifest is not bound to the clean current HEAD.');

  const extractionRoot = await mkdtemp(join(tmpdir(), 'glosource-local-release-'));
  try {
    await execFileAsync('tar', ['-xzf', archive.absolutePath, '-C', extractionRoot], {
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 120_000,
      maxBuffer: 2 * 1024 * 1024,
    });
    const manifestSuffix = '/RELEASE-MANIFEST.json';
    if (!archive.manifestEntry.endsWith(manifestSuffix)) {
      throw new Error('Archive root directory is invalid.');
    }
    const archiveRootName = archive.manifestEntry.slice(0, -manifestSuffix.length);
    if (!/^[A-Za-z0-9._-]+$/.test(archiveRootName)) {
      throw new Error('Archive root directory is unsafe.');
    }
    const packageRoot = join(extractionRoot, archiveRootName);
    const unpackedFileCount = await scanExtractedPackage(packageRoot);
    const smoke = await runLocalSmoke(projectRoot, packageRoot);
    const manifest = archive.manifest as {
      source: { commit: string; dirty: false };
      requiredEnvironment: string[];
      secretsIncluded: false;
    };
    const receipt: LocalReleaseReceipt = {
      schemaVersion: 1,
      kind: 'glosource-local-release-receipt',
      candidateSha: git.head,
      createdAt: new Date().toISOString(),
      archive: {
        path: archive.relativePath,
        sha256: archive.sha256,
        bytes: archive.bytes,
        entryCount: archive.entryCount,
        unpackedFileCount,
        blockedFileCount: 0,
        allZeroFileCount: 0,
        manifest: {
          commit: manifest.source.commit,
          dirty: false,
          requiredEnvironmentCount: manifest.requiredEnvironment.length,
          secretsIncluded: false,
        },
      },
      smoke,
      safety: {
        loopbackOnly: true,
        secretValuesIncluded: false,
        externalActions: 0,
      },
    };
    const receiptPath = receiptPathForCandidate(projectRoot, git.head);
    await mkdir(dirname(receiptPath), { recursive: true });
    const temporaryPath = `${receiptPath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, {
      encoding: 'utf8',
      mode: 0o600,
    });
    await rename(temporaryPath, receiptPath);
    return buildLocalReleaseReceiptReport({
      receipt,
      context: {
        currentHead: git.head,
        dirty: false,
        archivePath: archive.relativePath,
        archiveSha256: archive.sha256,
        archiveBytes: archive.bytes,
        archiveManifest: archive.manifest,
      },
      receiptPath: toRepoPath(projectRoot, receiptPath),
    });
  } finally {
    await rm(extractionRoot, { recursive: true, force: true });
  }
}

async function checkReceipt(projectRoot: string) {
  const git = await readGitContext(projectRoot);
  const receiptPath = receiptPathForCandidate(projectRoot, git.head);
  const relativeReceiptPath = toRepoPath(projectRoot, receiptPath);
  let receipt: unknown = null;
  try {
    receipt = JSON.parse(await readFile(receiptPath, 'utf8')) as unknown;
  } catch {
    return {
      status: 'blocked' as const,
      candidateSha: git.head,
      receipt: { path: relativeReceiptPath, found: false },
      blockerCodes: [git.dirty ? 'SOURCE_DIRTY' : 'LOCAL_RELEASE_RECEIPT_MISSING'],
      safety: {
        secretValuesIncluded: false as const,
        rawLogsIncluded: false as const,
        externalActions: 0 as const,
      },
    };
  }
  const parsed = parseLocalReleaseReceipt(receipt);
  if (!parsed) {
    return buildLocalReleaseReceiptReport({
      receipt,
      context: {
        currentHead: git.head,
        dirty: git.dirty,
        archivePath: '',
        archiveSha256: '',
        archiveBytes: 0,
        archiveManifest: null,
      },
      receiptPath: relativeReceiptPath,
    });
  }
  let archive: ArchiveInspection;
  try {
    archive = await inspectArchive(projectRoot, parsed.archive.path);
  } catch {
    return buildLocalReleaseReceiptReport({
      receipt,
      context: {
        currentHead: git.head,
        dirty: git.dirty,
        archivePath: parsed.archive.path,
        archiveSha256: '',
        archiveBytes: 0,
        archiveManifest: null,
      },
      receiptPath: relativeReceiptPath,
    });
  }
  return buildLocalReleaseReceiptReport({
    receipt,
    context: {
      currentHead: git.head,
      dirty: git.dirty,
      archivePath: archive.relativePath,
      archiveSha256: archive.sha256,
      archiveBytes: archive.bytes,
      archiveManifest: archive.manifest,
    },
    receiptPath: relativeReceiptPath,
  });
}

function readFlag(args: string[], name: string) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function runCli() {
  const args = process.argv.slice(2);
  const command = args[0];
  let report;
  if (command === 'create') {
    const archive = readFlag(args, '--archive');
    if (!archive) throw new Error('create requires --archive <dist archive>.');
    report = await createReceipt(process.cwd(), archive);
  } else if (command === 'check') {
    report = await checkReceipt(process.cwd());
  } else {
    throw new Error('Use create or check.');
  }
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'ready') process.exitCode = 1;
}

const currentFile = resolve(fileURLToPath(import.meta.url));
const entryFile = process.argv[1] ? resolve(process.argv[1]) : '';
if (currentFile === entryFile) {
  runCli().catch(() => {
    console.error('Local release receipt failed closed.');
    process.exitCode = 1;
  });
}
