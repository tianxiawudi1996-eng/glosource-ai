import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const P10_RECEIPT_GATE_PROMPT =
  'docs/operations/GLOSOURCE_P10_RELEASE_RECEIPT_GATE_METAPROMPT.md';
export const P10_LIFECYCLE_STATE = 'docs/harness/lifecycle/STATE.json';
export const P10_TASK_QUEUE = 'docs/harness/TASK_QUEUE.md';

const REQUIRED_HEADINGS = [
  '## ROLE:',
  '## GOAL:',
  '## USERS / EXPECTED CHANGE:',
  '## CONTEXT:',
  '## SCOPE:',
  '## OUT OF SCOPE:',
  '## INPUTS / SOURCE OF TRUTH:',
  '## PROBLEM / BOTTLENECK / KPI CARD:',
  '## STATE MODEL / DECISION TABLE:',
  '## TOOLS:',
  '## WORKFLOW:',
  '## AUTHORITY / PERMISSIONS:',
  '## CONSTRAINTS:',
  '## SUCCESS CRITERIA:',
  '## FAILURE CRITERIA:',
  '## VERIFICATION / EVIDENCE:',
  '## OUTPUTS / FORMAT:',
  '## MEMORY UPDATE:',
  '## STOP CONDITION:',
] as const;

const REQUIRED_CONTRACT_GROUPS = [
  {
    id: 'DYNAMIC_CANDIDATE',
    tokens: [
      '`git rev-parse HEAD`의 정확한 40자리 SHA',
      'reports/harness/private/local-release-receipts/<40-char-head>.json',
      'dist` 내부 `.tgz',
    ],
  },
  {
    id: 'READY_NO_REBUILD',
    tokens: [
      '`status=ready`',
      '재빌드·재receipt 금지, 보고만 동기화',
      '`ready`이면 package/create를 반복하지 않는다',
    ],
  },
  {
    id: 'DIRTY_HARD_STOP',
    tokens: [
      '`SOURCE_DIRTY`',
      '즉시 STOP; package/create, stash/reset/cleanup/commit 금지',
      '사용자 변경을 보존하고 중단한다',
      'clean 후보를 만들 권한을 추정하지 않는다',
    ],
  },
  {
    id: 'CLEAN_RECOVERY_ONLY',
    tokens: [
      'clean + `LOCAL_RELEASE_RECEIPT_MISSING`',
      'clean + candidate/archive digest·size·manifest drift',
      '`npm run package:product` 후 exact archive receipt 1건',
      '`npm run receipt:release -- --archive <exact-dist-tgz>`',
    ],
  },
  {
    id: 'UNKNOWN_FAIL_CLOSED',
    tokens: [
      'invalid schema, unknown blocker, unsafe path, failed smoke',
      '자동 우회 금지',
      'unknown output',
    ],
  },
  {
    id: 'EVIDENCE_CEILING',
    tokens: [
      'local receipt, build, smoke는 staging·Production·고객 가치·결제 증거가 아니다',
      'P10의 independent reviewer, self-review prevention, fresh approvals를 로컬 artifact로 대체하지 않는다',
      '`local_recovery_ready`도 Production readiness가 아니다',
    ],
  },
  {
    id: 'EXTERNAL_AUTHORITY',
    tokens: [
      '별도 명시 승인 전 금지',
      'P10 completion evidence 생성',
      'approval reference를 실행 권한으로 사용',
    ],
  },
  {
    id: 'SANITIZED_OUTPUT',
    tokens: [
      'Secret 값, raw log, reviewer 신원, provider payload를 포함하지 않는다',
      'unknown blocker 0, external action 0, secret/raw-log 노출 0',
    ],
  },
] as const;

const RECOVERABLE_BLOCKERS = new Set([
  'LOCAL_RELEASE_RECEIPT_MISSING',
  'RECEIPT_CANDIDATE_MISMATCH',
  'RECEIPT_ARCHIVE_PATH_MISMATCH',
  'RECEIPT_ARCHIVE_DIGEST_MISMATCH',
  'RECEIPT_ARCHIVE_SIZE_MISMATCH',
  'RECEIPT_MANIFEST_MISMATCH',
  'ARCHIVE_MANIFEST_INVALID',
  'ARCHIVE_SOURCE_DIRTY',
  'ARCHIVE_CANDIDATE_MISMATCH',
]);

export type P10ReceiptGateDecision =
  | 'ready'
  | 'local_recovery_ready'
  | 'blocked';

export function decideP10ReceiptGate(input: {
  status: unknown;
  sourceClean: unknown;
  blockerCodes: unknown;
}): P10ReceiptGateDecision {
  if (!Array.isArray(input.blockerCodes)) return 'blocked';
  if (!input.blockerCodes.every((code) => typeof code === 'string')) return 'blocked';
  const blockerCodes = input.blockerCodes as string[];

  if (input.status === 'ready') {
    return input.sourceClean === true && blockerCodes.length === 0
      ? 'ready'
      : 'blocked';
  }
  if (input.status !== 'blocked' || input.sourceClean !== true) return 'blocked';
  if (blockerCodes.length === 0) return 'blocked';
  return blockerCodes.every((code) => RECOVERABLE_BLOCKERS.has(code))
    ? 'local_recovery_ready'
    : 'blocked';
}

export interface P10ReceiptGateHarnessContext {
  lifecycleState?: { activePhase?: unknown; status?: unknown };
  taskQueue?: string;
  packageScripts?: Record<string, unknown>;
}

export function validateP10ReceiptGateHarness(
  prompt: string,
  context: P10ReceiptGateHarnessContext = {},
) {
  const normalized = prompt.replace(/\r\n?/g, '\n');
  const errors: string[] = [];

  for (const heading of REQUIRED_HEADINGS) {
    const count = normalized.split('\n').filter((line) => line.trim() === heading).length;
    if (count !== 1) errors.push(`Required heading must appear exactly once: ${heading}`);
  }
  for (const group of REQUIRED_CONTRACT_GROUPS) {
    for (const token of group.tokens) {
      if (!normalized.includes(token)) {
        errors.push(`Required ${group.id} contract token is missing: ${token}`);
      }
    }
  }

  const activePhase = context.lifecycleState?.activePhase;
  const lifecycleStatus = context.lifecycleState?.status;
  if (
    typeof activePhase === 'string'
    && typeof lifecycleStatus === 'string'
    && !normalized.includes(`${activePhase} \`${lifecycleStatus}\``)
  ) {
    errors.push(
      `Current lifecycle phase/status pair is not reflected: ${activePhase}/${lifecycleStatus}`,
    );
  }

  if (context.taskQueue) {
    for (const token of [
      'npm run readiness:release-receipt',
      'SOURCE_DIRTY',
      'clean HEAD 전에는 package/receipt 복구를 실행하지 않는다',
      'P10-LOCAL-RECEIPT-RECOVERY',
    ]) {
      if (!context.taskQueue.includes(token)) {
        errors.push(`Task queue dynamic gate is missing: ${token}`);
      }
    }
  }

  const scripts = context.packageScripts;
  if (scripts) {
    if (scripts['readiness:release-receipt'] !== 'tsx scripts/local-release-receipt.ts check') {
      errors.push('Release receipt check script drifted.');
    }
    if (scripts['receipt:release'] !== 'tsx scripts/local-release-receipt.ts create') {
      errors.push('Release receipt create script drifted.');
    }
    if (scripts['package:product'] !== 'npm run build && tsx scripts/package-release.ts') {
      errors.push('Product package script drifted.');
    }
  }

  return errors;
}

function main() {
  const projectRoot = process.cwd();
  const prompt = readFileSync(resolve(projectRoot, P10_RECEIPT_GATE_PROMPT), 'utf8');
  const lifecycleState = JSON.parse(
    readFileSync(resolve(projectRoot, P10_LIFECYCLE_STATE), 'utf8'),
  ) as P10ReceiptGateHarnessContext['lifecycleState'];
  const taskQueue = readFileSync(resolve(projectRoot, P10_TASK_QUEUE), 'utf8');
  const packageJson = JSON.parse(
    readFileSync(resolve(projectRoot, 'package.json'), 'utf8'),
  ) as { scripts?: Record<string, unknown> };
  const errors = validateP10ReceiptGateHarness(prompt, {
    lifecycleState,
    taskQueue,
    packageScripts: packageJson.scripts,
  });
  if (errors.length) {
    errors.forEach((error) => console.error(`[p10-receipt-gate] ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log('[p10-receipt-gate] clean');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
