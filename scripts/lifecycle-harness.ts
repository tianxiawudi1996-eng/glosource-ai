import { createHash } from 'node:crypto';
import {
  existsSync,
  readFileSync,
} from 'node:fs';
import {
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { basename, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_MANIFEST_PATH = 'docs/harness/lifecycle/PHASES.json';
const DEFAULT_STATE_PATH = 'docs/harness/lifecycle/STATE.json';
const DEFAULT_REPORT_DIRECTORY = 'docs/harness/lifecycle/reports';
const REQUIRED_PROMPT_HEADINGS = [
  '## Role',
  '## Objective',
  '## Required Inputs',
  '## Workflow',
  '## Exit Gate',
  '## Report Obligation',
  '## Approval Boundary',
  '## Stop Conditions',
] as const;

export interface LifecyclePhase {
  id: string;
  slug: string;
  title: string;
  prompt: string;
  next: string | null;
  externalEffect: boolean;
  exitCriteria: Array<{ id: string; description: string }>;
  approvalGates: string[];
}

export interface LifecycleManifest {
  schemaVersion: '1.0.0';
  lifecycleId: string;
  phases: LifecyclePhase[];
}

interface CompletedPhase {
  id: string;
  completedAt: string;
  report: string;
  evidenceDigest: string;
}

export interface LifecycleState {
  schemaVersion: '1.0.0';
  lifecycleId: string;
  runId: string;
  mode: 'standard' | 'brownfield';
  baselinePhase: string;
  activePhase: string;
  status: 'ready' | 'in_progress' | 'blocked' | 'complete';
  phaseStartedAt: string;
  completedPhases: CompletedPhase[];
  reportIndex: string[];
  blockers: string[];
  approvalsPending: string[];
  lastValidatedAt: string | null;
}

interface CompletionEvidence {
  schemaVersion: 1;
  runId: string;
  phaseId: string;
  completedAt: string;
  criteria: Array<{ id: string; status: 'pass'; references: string[] }>;
  approvals: Array<{ id: string; status: 'approved'; reference: string }>;
  verification: Array<{ id: string; status: 'pass'; reference: string }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

function hasUniqueValues(values: readonly string[]) {
  return new Set(values).size === values.length;
}

function isSafeCode(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= 200
    && /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value)
    && !isAbsolute(value)
    && !value.split('/').includes('..');
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string'
    && !Number.isNaN(Date.parse(value));
}

function parseManifest(value: unknown): LifecycleManifest {
  if (!isRecord(value) || !hasExactKeys(
    value,
    ['schemaVersion', 'lifecycleId', 'phases'],
  )) {
    throw new Error('Lifecycle manifest has an invalid top-level contract.');
  }
  if (
    value.schemaVersion !== '1.0.0'
    || !isSafeCode(value.lifecycleId)
    || !Array.isArray(value.phases)
  ) {
    throw new Error('Lifecycle manifest identity or phase list is invalid.');
  }

  const phases = value.phases.map((candidate) => {
    if (!isRecord(candidate) || !hasExactKeys(candidate, [
      'id',
      'slug',
      'title',
      'prompt',
      'next',
      'externalEffect',
      'exitCriteria',
      'approvalGates',
    ])) {
      throw new Error('Lifecycle phase contract is invalid.');
    }
    if (
      !isSafeCode(candidate.id)
      || !isSafeCode(candidate.slug)
      || typeof candidate.title !== 'string'
      || candidate.title.length === 0
      || !isSafeCode(candidate.prompt)
      || (candidate.next !== null && !isSafeCode(candidate.next))
      || typeof candidate.externalEffect !== 'boolean'
      || !Array.isArray(candidate.exitCriteria)
      || !Array.isArray(candidate.approvalGates)
    ) {
      throw new Error(`Lifecycle phase ${String(candidate.id)} has invalid fields.`);
    }
    const exitCriteria = candidate.exitCriteria.map((criterion) => {
      if (!isRecord(criterion) || !hasExactKeys(criterion, ['id', 'description'])) {
        throw new Error(`Lifecycle phase ${candidate.id} has invalid exit criteria.`);
      }
      if (
        !isSafeCode(criterion.id)
        || typeof criterion.description !== 'string'
        || criterion.description.length === 0
      ) {
        throw new Error(`Lifecycle phase ${candidate.id} has invalid exit criteria.`);
      }
      return { id: criterion.id, description: criterion.description };
    });
    if (
      exitCriteria.length === 0
      || !hasUniqueValues(exitCriteria.map((criterion) => criterion.id))
      || !candidate.approvalGates.every(isSafeCode)
      || !hasUniqueValues(candidate.approvalGates)
    ) {
      throw new Error(`Lifecycle phase ${candidate.id} has duplicate or empty gates.`);
    }
    if (candidate.externalEffect && candidate.approvalGates.length === 0) {
      throw new Error(`External phase ${candidate.id} requires an approval gate.`);
    }
    return {
      id: candidate.id,
      slug: candidate.slug,
      title: candidate.title,
      prompt: candidate.prompt,
      next: candidate.next,
      externalEffect: candidate.externalEffect,
      exitCriteria,
      approvalGates: [...candidate.approvalGates],
    };
  });

  if (phases.length !== 17) {
    throw new Error('Lifecycle manifest must define P00 through P16.');
  }
  for (const [index, phase] of phases.entries()) {
    const expectedId = `P${String(index).padStart(2, '0')}`;
    const expectedNext = index === phases.length - 1
      ? null
      : `P${String(index + 1).padStart(2, '0')}`;
    if (phase.id !== expectedId || phase.next !== expectedNext) {
      throw new Error(`Lifecycle chain is broken at ${phase.id}.`);
    }
  }
  if (
    !hasUniqueValues(phases.map((phase) => phase.slug))
    || !hasUniqueValues(phases.map((phase) => phase.prompt))
  ) {
    throw new Error('Lifecycle phase slugs and prompt paths must be unique.');
  }

  return {
    schemaVersion: '1.0.0',
    lifecycleId: value.lifecycleId,
    phases,
  };
}

function parseState(value: unknown): LifecycleState {
  if (!isRecord(value) || !hasExactKeys(value, [
    'schemaVersion',
    'lifecycleId',
    'runId',
    'mode',
    'baselinePhase',
    'activePhase',
    'status',
    'phaseStartedAt',
    'completedPhases',
    'reportIndex',
    'blockers',
    'approvalsPending',
    'lastValidatedAt',
  ])) {
    throw new Error('Lifecycle state has an invalid top-level contract.');
  }
  if (
    value.schemaVersion !== '1.0.0'
    || !isSafeCode(value.lifecycleId)
    || !isSafeCode(value.runId)
    || (value.mode !== 'standard' && value.mode !== 'brownfield')
    || !isSafeCode(value.baselinePhase)
    || !isSafeCode(value.activePhase)
    || !['ready', 'in_progress', 'blocked', 'complete'].includes(String(value.status))
    || !isIsoDate(value.phaseStartedAt)
    || !Array.isArray(value.completedPhases)
    || !Array.isArray(value.reportIndex)
    || !Array.isArray(value.blockers)
    || !Array.isArray(value.approvalsPending)
    || (value.lastValidatedAt !== null && !isIsoDate(value.lastValidatedAt))
  ) {
    throw new Error('Lifecycle state fields are invalid.');
  }

  const completedPhases = value.completedPhases.map((candidate) => {
    if (!isRecord(candidate) || !hasExactKeys(
      candidate,
      ['id', 'completedAt', 'report', 'evidenceDigest'],
    )) {
      throw new Error('Completed phase record is invalid.');
    }
    if (
      !isSafeCode(candidate.id)
      || !isIsoDate(candidate.completedAt)
      || !isSafeCode(candidate.report)
      || typeof candidate.evidenceDigest !== 'string'
      || !/^[a-f0-9]{64}$/.test(candidate.evidenceDigest)
    ) {
      throw new Error('Completed phase record fields are invalid.');
    }
    return {
      id: candidate.id,
      completedAt: candidate.completedAt,
      report: candidate.report,
      evidenceDigest: candidate.evidenceDigest,
    };
  });
  if (
    !value.reportIndex.every(isSafeCode)
    || !value.blockers.every(isSafeCode)
    || !value.approvalsPending.every(isSafeCode)
  ) {
    throw new Error('Lifecycle state lists contain unsafe values.');
  }

  return {
    schemaVersion: '1.0.0',
    lifecycleId: value.lifecycleId,
    runId: value.runId,
    mode: value.mode,
    baselinePhase: value.baselinePhase,
    activePhase: value.activePhase,
    status: value.status as LifecycleState['status'],
    phaseStartedAt: value.phaseStartedAt,
    completedPhases,
    reportIndex: [...value.reportIndex],
    blockers: [...value.blockers],
    approvalsPending: [...value.approvalsPending],
    lastValidatedAt: value.lastValidatedAt,
  };
}

function parseCompletionEvidence(value: unknown): CompletionEvidence {
  if (!isRecord(value) || !hasExactKeys(value, [
    'schemaVersion',
    'runId',
    'phaseId',
    'completedAt',
    'criteria',
    'approvals',
    'verification',
  ])) {
    throw new Error('Completion evidence has an invalid top-level contract.');
  }
  if (
    value.schemaVersion !== 1
    || !isSafeCode(value.runId)
    || !isSafeCode(value.phaseId)
    || !isIsoDate(value.completedAt)
    || !Array.isArray(value.criteria)
    || !Array.isArray(value.approvals)
    || !Array.isArray(value.verification)
  ) {
    throw new Error('Completion evidence fields are invalid.');
  }

  const criteria = value.criteria.map((candidate) => {
    if (!isRecord(candidate) || !hasExactKeys(candidate, [
      'id', 'status', 'references',
    ])) {
      throw new Error('Completion evidence criteria are invalid.');
    }
    if (
      !isSafeCode(candidate.id)
      || candidate.status !== 'pass'
      || !Array.isArray(candidate.references)
      || candidate.references.length === 0
      || !candidate.references.every(isSafeCode)
    ) {
      throw new Error('Completion evidence criteria are invalid.');
    }
    return {
      id: candidate.id,
      status: 'pass' as const,
      references: [...candidate.references],
    };
  });
  const approvals = value.approvals.map((candidate) => {
    if (!isRecord(candidate) || !hasExactKeys(candidate, [
      'id', 'status', 'reference',
    ])) {
      throw new Error('Completion evidence approvals are invalid.');
    }
    if (
      !isSafeCode(candidate.id)
      || candidate.status !== 'approved'
      || !isSafeCode(candidate.reference)
    ) {
      throw new Error('Completion evidence approvals are invalid.');
    }
    return {
      id: candidate.id,
      status: 'approved' as const,
      reference: candidate.reference,
    };
  });
  const verification = value.verification.map((candidate) => {
    if (!isRecord(candidate) || !hasExactKeys(candidate, [
      'id', 'status', 'reference',
    ])) {
      throw new Error('Completion evidence verification is invalid.');
    }
    if (
      !isSafeCode(candidate.id)
      || candidate.status !== 'pass'
      || !isSafeCode(candidate.reference)
    ) {
      throw new Error('Completion evidence verification is invalid.');
    }
    return {
      id: candidate.id,
      status: 'pass' as const,
      reference: candidate.reference,
    };
  });
  if (
    verification.length === 0
    || !hasUniqueValues(criteria.map((criterion) => criterion.id))
    || !hasUniqueValues(approvals.map((approval) => approval.id))
    || !hasUniqueValues(verification.map((item) => item.id))
  ) {
    throw new Error('Completion evidence contains empty or duplicate checks.');
  }

  return {
    schemaVersion: 1,
    runId: value.runId,
    phaseId: value.phaseId,
    completedAt: value.completedAt,
    criteria,
    approvals,
    verification,
  };
}

export function loadLifecycleManifest(
  path = DEFAULT_MANIFEST_PATH,
): LifecycleManifest {
  return parseManifest(JSON.parse(readFileSync(path, 'utf8')) as unknown);
}

export function loadLifecycleState(path = DEFAULT_STATE_PATH): LifecycleState {
  return parseState(JSON.parse(readFileSync(path, 'utf8')) as unknown);
}

export function validateLifecycleState(
  manifest: LifecycleManifest,
  stateInput: unknown,
) {
  const errors: string[] = [];
  let state: LifecycleState;
  try {
    state = parseState(stateInput);
  } catch (error) {
    return [error instanceof Error ? error.message : 'Lifecycle state is invalid.'];
  }
  if (state.lifecycleId !== manifest.lifecycleId) {
    errors.push('Lifecycle state identity does not match the manifest.');
  }
  const baselineIndex = manifest.phases.findIndex(
    (phase) => phase.id === state.baselinePhase,
  );
  const activeIndex = manifest.phases.findIndex(
    (phase) => phase.id === state.activePhase,
  );
  if (baselineIndex < 0 || activeIndex < baselineIndex) {
    errors.push('Lifecycle baseline or active phase is outside the ordered chain.');
    return errors;
  }
  if (state.mode === 'standard' && state.baselinePhase !== 'P00') {
    errors.push('Standard lifecycle runs must begin at P00.');
  }

  const terminalComplete = state.status === 'complete';
  const completedEnd = terminalComplete ? activeIndex + 1 : activeIndex;
  const expectedCompleted = manifest.phases
    .slice(baselineIndex, completedEnd)
    .map((phase) => phase.id);
  if (
    JSON.stringify(state.completedPhases.map((phase) => phase.id))
    !== JSON.stringify(expectedCompleted)
  ) {
    errors.push('Completed phases are not a contiguous sequence before the active phase.');
  }
  const reports = state.completedPhases.map((phase) => phase.report);
  if (JSON.stringify(state.reportIndex) !== JSON.stringify(reports)) {
    errors.push('Lifecycle report index does not match completed phase records.');
  }
  if (terminalComplete && state.activePhase !== 'P16') {
    errors.push('Only P16 can mark a lifecycle run complete.');
  }
  if (!terminalComplete && state.completedPhases.some(
    (phase) => phase.id === state.activePhase,
  )) {
    errors.push('The active phase cannot already be completed.');
  }
  return errors;
}

export function validateLifecycleFiles(
  manifest: LifecycleManifest,
  repoRoot: string,
  stateInput?: unknown,
) {
  const errors: string[] = [];
  for (const phase of manifest.phases) {
    const promptPath = join(repoRoot, phase.prompt);
    if (!existsSync(promptPath)) {
      errors.push(`Missing lifecycle prompt: ${phase.prompt}`);
      continue;
    }
    const source = readFileSync(promptPath, 'utf8');
    for (const heading of REQUIRED_PROMPT_HEADINGS) {
      if (!source.split(/\r?\n/).includes(heading)) {
        errors.push(`${phase.prompt} is missing ${heading}.`);
      }
    }
  }
  if (stateInput !== undefined) {
    let state: LifecycleState;
    try {
      state = parseState(stateInput);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Lifecycle state is invalid.');
      return errors;
    }
    for (const report of state.reportIndex) {
      if (!existsSync(join(repoRoot, report))) {
        errors.push(`Missing lifecycle completion report: ${report}`);
      }
    }
  }
  return errors;
}

export function validateLifecyclePointer(
  manifest: LifecycleManifest,
  mainStateInput: unknown,
) {
  if (!isRecord(mainStateInput) || !isRecord(mainStateInput.lifecycle_harness)) {
    return ['Main harness state is missing lifecycle_harness.'];
  }
  const pointer = mainStateInput.lifecycle_harness;
  const expected: Record<string, unknown> = {
    lifecycle_id: manifest.lifecycleId,
    state_path: DEFAULT_STATE_PATH,
    manifest_path: DEFAULT_MANIFEST_PATH,
  };
  const errors: string[] = [];
  for (const [key, value] of Object.entries(expected)) {
    if (pointer[key] !== value) {
      errors.push(`Main harness lifecycle pointer ${key} is stale.`);
    }
  }
  return errors;
}

function requireExactIds(
  label: string,
  expected: readonly string[],
  actual: readonly string[],
) {
  if (
    !hasUniqueValues(actual)
    || JSON.stringify([...actual].sort()) !== JSON.stringify([...expected].sort())
  ) {
    throw new Error(`${label} must exactly match the active phase contract.`);
  }
}

function buildReport(
  phase: LifecyclePhase,
  evidence: CompletionEvidence,
  evidenceDigest: string,
) {
  const next = phase.next ?? 'terminal';
  const criteria = phase.exitCriteria.map((criterion) => {
    const result = evidence.criteria.find((item) => item.id === criterion.id);
    return `- ${criterion.id}: pass — ${result?.references.join(', ')}`;
  });
  const approvals = phase.approvalGates.length === 0
    ? ['- none required']
    : evidence.approvals.map(
      (approval) => `- ${approval.id}: approved — ${approval.reference}`,
    );
  const verification = evidence.verification.map(
    (item) => `- ${item.id}: pass — ${item.reference}`,
  );
  return [
    `# ${phase.id} ${phase.title} Completion Report`,
    '',
    `- Run: ${evidence.runId}`,
    `- Completed at: ${evidence.completedAt}`,
    `- Evidence digest: ${evidenceDigest}`,
    `- Next phase: ${next}`,
    '',
    '## Exit Criteria',
    '',
    ...criteria,
    '',
    '## Approval Gates',
    '',
    ...approvals,
    '',
    '## Verification',
    '',
    ...verification,
    '',
    '## Authority Boundary',
    '',
    '- This report records evidence and phase state only.',
    '- It does not authorize external actions, provider mutations, deployment, payment, publication, or deletion.',
    '',
  ].join('\n');
}

export function buildLifecycleTransition(
  manifestInput: LifecycleManifest,
  stateInput: unknown,
  evidenceInput: unknown,
) {
  const manifest = parseManifest(manifestInput);
  const state = parseState(stateInput);
  const evidence = parseCompletionEvidence(evidenceInput);
  const stateErrors = validateLifecycleState(manifest, state);
  if (stateErrors.length > 0) {
    throw new Error(`Lifecycle state is invalid: ${stateErrors.join(' ')}`);
  }
  if (state.status !== 'in_progress') {
    throw new Error('The active phase must be in_progress before completion.');
  }
  if (evidence.runId !== state.runId) {
    throw new Error('Completion evidence belongs to a different lifecycle run.');
  }
  if (evidence.phaseId !== state.activePhase) {
    throw new Error('Completion evidence does not match the active phase.');
  }
  if (Date.parse(evidence.completedAt) < Date.parse(state.phaseStartedAt)) {
    throw new Error('Completion evidence predates the active phase.');
  }

  const phase = manifest.phases.find((item) => item.id === state.activePhase);
  if (!phase) throw new Error('Active lifecycle phase is not in the manifest.');
  requireExactIds(
    'Completion criteria',
    phase.exitCriteria.map((criterion) => criterion.id),
    evidence.criteria.map((criterion) => criterion.id),
  );
  requireExactIds(
    'Completion approval gates',
    phase.approvalGates,
    evidence.approvals.map((approval) => approval.id),
  );

  const evidenceDigest = createHash('sha256')
    .update(JSON.stringify(evidence), 'utf8')
    .digest('hex');
  const reportPath = `${DEFAULT_REPORT_DIRECTORY}/${state.runId}-${phase.id}.md`;
  const completed: CompletedPhase = {
    id: phase.id,
    completedAt: evidence.completedAt,
    report: reportPath,
    evidenceDigest,
  };
  const nextState: LifecycleState = {
    ...state,
    activePhase: phase.next ?? phase.id,
    status: phase.next ? 'ready' : 'complete',
    phaseStartedAt: evidence.completedAt,
    completedPhases: [...state.completedPhases, completed],
    reportIndex: [...state.reportIndex, reportPath],
    blockers: [],
    approvalsPending: phase.next
      ? [...(manifest.phases.find((item) => item.id === phase.next)?.approvalGates ?? [])]
      : [],
    lastValidatedAt: evidence.completedAt,
  };
  const nextErrors = validateLifecycleState(manifest, nextState);
  if (nextErrors.length > 0) {
    throw new Error(`Next lifecycle state is invalid: ${nextErrors.join(' ')}`);
  }

  return {
    nextState,
    reportPath,
    reportContent: buildReport(phase, evidence, evidenceDigest),
  };
}

async function replaceFileAtomically(path: string, content: string) {
  const tempPath = `${path}.tmp-${process.pid}-${Date.now()}`;
  const backupPath = `${path}.backup-${process.pid}-${Date.now()}`;
  if (existsSync(tempPath) || existsSync(backupPath)) {
    throw new Error('Lifecycle state temporary path collision.');
  }
  await writeFile(tempPath, content, { encoding: 'utf8', flag: 'wx' });
  await rename(path, backupPath);
  try {
    await rename(tempPath, path);
    try {
      await unlink(backupPath);
    } catch {
      // The new state is already committed. A uniquely named backup is safer
      // than rolling back a successful replacement because cleanup failed.
    }
  } catch (error) {
    if (existsSync(backupPath) && !existsSync(path)) {
      await rename(backupPath, path);
    }
    if (existsSync(tempPath)) await unlink(tempPath);
    throw error;
  }
}

export async function completeLifecyclePhase(input: {
  manifest: LifecycleManifest;
  statePath: string;
  reportDirectory: string;
  evidence: unknown;
}) {
  const state = loadLifecycleState(input.statePath);
  const result = buildLifecycleTransition(input.manifest, state, input.evidence);
  await mkdir(input.reportDirectory, { recursive: true });
  const reportTarget = join(input.reportDirectory, basename(result.reportPath));
  await writeFile(reportTarget, result.reportContent, {
    encoding: 'utf8',
    flag: 'wx',
  });
  try {
    await replaceFileAtomically(
      input.statePath,
      `${JSON.stringify(result.nextState, null, 2)}\n`,
    );
  } catch (error) {
    await unlink(reportTarget);
    throw error;
  }
  return result;
}

async function startActivePhase(statePath: string, manifest: LifecycleManifest) {
  const state = loadLifecycleState(statePath);
  const errors = validateLifecycleState(manifest, state);
  if (errors.length > 0) throw new Error(errors.join(' '));
  if (state.status !== 'ready') {
    throw new Error('Only a ready lifecycle phase can be started.');
  }
  const nextState = {
    ...state,
    status: 'in_progress' as const,
    phaseStartedAt: new Date().toISOString(),
  };
  await replaceFileAtomically(
    statePath,
    `${JSON.stringify(nextState, null, 2)}\n`,
  );
  return nextState;
}

async function runCli() {
  const command = process.argv[2] ?? 'status';
  const manifestPath = resolve(DEFAULT_MANIFEST_PATH);
  const statePath = resolve(DEFAULT_STATE_PATH);
  const repoRoot = resolve('.');
  const manifest = loadLifecycleManifest(manifestPath);
  const state = loadLifecycleState(statePath);
  const mainState = JSON.parse(
    readFileSync(resolve('docs/harness/STATE.json'), 'utf8'),
  ) as unknown;
  const errors = [
    ...validateLifecycleState(manifest, state),
    ...validateLifecycleFiles(manifest, repoRoot, state),
    ...validateLifecyclePointer(manifest, mainState),
  ];

  if (command === 'validate') {
    if (errors.length > 0) throw new Error(errors.join(' '));
    console.log('[lifecycle-check] clean');
    return;
  }
  if (command === 'status') {
    if (errors.length > 0) throw new Error(errors.join(' '));
    const phase = manifest.phases.find((item) => item.id === state.activePhase);
    console.log(JSON.stringify({
      runId: state.runId,
      mode: state.mode,
      activePhase: state.activePhase,
      phaseTitle: phase?.title,
      status: state.status,
      prompt: phase?.prompt,
      blockers: state.blockers,
      approvalsPending: state.approvalsPending,
    }, null, 2));
    return;
  }
  if (command === 'start') {
    if (errors.length > 0) throw new Error(errors.join(' '));
    console.log(JSON.stringify(await startActivePhase(statePath, manifest), null, 2));
    return;
  }
  if (command === 'complete') {
    if (errors.length > 0) throw new Error(errors.join(' '));
    const evidencePath = process.argv[3];
    if (!evidencePath) throw new Error('A completion evidence JSON path is required.');
    const evidence = JSON.parse(await readFile(resolve(evidencePath), 'utf8')) as unknown;
    const result = await completeLifecyclePhase({
      manifest,
      statePath,
      reportDirectory: resolve(DEFAULT_REPORT_DIRECTORY),
      evidence,
    });
    console.log(JSON.stringify({
      completedPhase: state.activePhase,
      report: result.reportPath,
      nextPhase: result.nextState.activePhase,
      nextStatus: result.nextState.status,
    }, null, 2));
    return;
  }
  throw new Error('Lifecycle command must be status, validate, start, or complete.');
}

const currentFile = resolve(fileURLToPath(import.meta.url));
const entryFile = process.argv[1] ? resolve(process.argv[1]) : '';
if (currentFile === entryFile) {
  runCli().catch(() => {
    console.error('Lifecycle harness command failed.');
    process.exitCode = 1;
  });
}
