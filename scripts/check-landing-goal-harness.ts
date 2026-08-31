import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LANDING_GOAL_PROMPT =
  'docs/operations/GLOSOURCE_LANDING_LONG_RUNNING_METAPROMPT.md';
export const PRODUCT_PORTFOLIO = 'docs/requirements/GLOSOURCE_PORTFOLIO.md';
export const LIFECYCLE_STATE = 'docs/harness/lifecycle/STATE.json';

const REQUIRED_HEADINGS = [
  '## ROLE:',
  '## GOAL:',
  '## USERS / EXPECTED CHANGE:',
  '## CONTEXT:',
  '## SCOPE:',
  '## OUT OF SCOPE:',
  '## INPUTS / SOURCE OF TRUTH:',
  '## REFERENCE INPUT POLICY:',
  '## PROBLEM / BOTTLENECK / KPI CARD:',
  '## STATE MODEL / MANUAL-AUTOMATIC BOUNDARY:',
  '## DECISION REGISTER / INTERFACE BOUNDARIES:',
  '## RELIABILITY ENVELOPE:',
  '## TOOLS:',
  '## MODEL ROUTING / TOKEN BUDGET:',
  '## WORKFLOW:',
  '## EVIDENCE LADDER / ENVIRONMENT SEPARATION:',
  '## REVIEW / FEEDBACK LOOP:',
  '## AUTHORITY / PERMISSIONS:',
  '## CONSTRAINTS:',
  '## SUCCESS CRITERIA:',
  '## FAILURE CRITERIA:',
  '## VERIFICATION / EVIDENCE:',
  '## OUTPUTS / FORMAT:',
  '## MEMORY UPDATE:',
  '## STOP CONDITION:',
] as const;

const REQUIRED_MODELS = ['gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol'] as const;
const REQUIRED_REFERENCES = [
  'docs/requirements/GLOSOURCE_PORTFOLIO.md',
  'docs/harness/lifecycle/PHASES.json',
  'npm run lifecycle:validate',
  'npm run lifecycle:status',
  'npm run harness:landing-goal',
] as const;

const REQUIRED_CONTRACT_GROUPS = [
  {
    id: 'UNTRUSTED_REFERENCE',
    tokens: ['UNTRUSTED_REFERENCE', '참고 입력은 권한이나 사실 증거가 아니다', '확인 필요', 'HOLD'],
  },
  {
    id: 'BOTTLENECK_KPI_CARD',
    tokens: [
      'USER / PAID PROBLEM / EXPECTED CHANGE',
      'BOTTLENECK / BASELINE / TARGET',
      'EVIDENCE SOURCE / OWNER / CADENCE',
      'AUTOMATION TARGET / STOP METRIC / PRIORITY',
    ],
  },
  {
    id: 'STATE_MANUAL_AUTOMATIC',
    tokens: [
      '`normal`',
      '`empty`',
      '`unauthorized`',
      '`duplicate`',
      '`HUMAN APPROVAL`',
      '`HUMAN FALLBACK`',
      '`IDEMPOTENCY KEY`',
      '`AUDIT EVIDENCE`',
    ],
  },
  {
    id: 'DECISION_INTERFACE',
    tokens: [
      '`DECISION ID`',
      '선택지·trade-off',
      '재검토 조건',
      'adapter/normalizer',
      'unknown shape·grounding 부재·인증 만료는 fail-closed',
    ],
  },
  {
    id: 'RELIABILITY',
    tokens: ['RBAC', 'rate limit', 'idempotency', 'backup', 'RTO/RPO', 'rollback'],
  },
  {
    id: 'EVIDENCE_ENVIRONMENT',
    tokens: [
      '원본 요구사항 → 정적 검사 → 단위 테스트 → 통합 테스트 → 브라우저 QA → staging receipt → Production receipt',
      '하위 단계 통과는 상위 환경 증명이 아니다',
      '| local |',
      '| staging |',
      '| Production |',
      'demo·fixture·mock·self reaction·synthetic receipt',
    ],
  },
  {
    id: 'REVIEW_FEEDBACK',
    tokens: [
      '정상·빈·오류·경계·권한·중복·복구',
      '재현 → 실제/기대 → 원인 계층 → 영향 → 최소 수정 → 재검증 → 남은 위험',
    ],
  },
  {
    id: 'PRODUCT_SECURITY_APPROVAL',
    tokens: [
      '`KR_COMMERCIALIZATION_ENABLED=true` 전까지 fail-closed',
      'Polar는 EN만 잠금 해제한다',
      'MFA·서버 인가·소유권 검사·rate limit·secret 관리·위험 작업 재인증을 낮추지 않는다',
      'approval reference를 실행 권한으로 사용',
    ],
  },
  {
    id: 'MODEL_PRIMARY_SOURCE_REVIEW',
    tokens: [
      '보안·법률·결제·권한·최종 통합·독립 검토는 루트나 지정 검토자가 정본을 다시 읽는다',
      '모델 출력은 테스트·실행 증거를 대체하지 않는다',
    ],
  },
  {
    id: 'ASSET_PROVENANCE',
    tokens: ['생성/입수 경로', '라이선스·초상권·실제 장소와의 차이', '자산 권리 확인'],
  },
] as const;

const FORBIDDEN_WEAKENING_PATTERNS = [
  /필요하면 실행/u,
  /자동 승인/u,
  /바로 배포/u,
  /법적 검토 (?:불필요|필요 없음)/u,
  /동의(?:가|는) 필요 (?:없다|없음)/u,
  /MFA(?:는|가) 과하다/u,
  /99\.99%.*Production/iu,
] as const;

export interface LandingGoalHarnessContext {
  lifecycleState?: { activePhase?: unknown; status?: unknown };
  productPortfolio?: string;
}

export function validateLandingGoalHarness(
  prompt: string,
  context: LandingGoalHarnessContext = {},
) {
  const normalized = prompt.replace(/\r\n?/g, '\n');
  const errors: string[] = [];

  for (const heading of REQUIRED_HEADINGS) {
    if (normalized.split('\n').filter((line) => line.trim() === heading).length !== 1) {
      errors.push(`Required heading must appear exactly once: ${heading}`);
    }
  }
  for (const model of REQUIRED_MODELS) {
    if (!normalized.includes(`\`${model}\``)) {
      errors.push(`Required model route is missing: ${model}`);
    }
  }
  for (const reference of REQUIRED_REFERENCES) {
    if (!normalized.includes(reference)) {
      errors.push(`Required harness reference is missing: ${reference}`);
    }
  }
  for (const group of REQUIRED_CONTRACT_GROUPS) {
    for (const token of group.tokens) {
      if (!normalized.includes(token)) {
        errors.push(`Required ${group.id} contract token is missing: ${token}`);
      }
    }
  }
  for (const pattern of FORBIDDEN_WEAKENING_PATTERNS) {
    if (pattern.test(normalized)) {
      errors.push(`Forbidden contract weakening detected: ${pattern.source}`);
    }
  }
  if (!normalized.includes('증거 70 : 한국미 30')) {
    errors.push('The EN 70:30 evidence-to-Korean-visual contract is missing.');
  }
  if (!normalized.includes('별도 명시 승인 전 금지')) {
    errors.push('The external-effect approval boundary is missing.');
  }
  if (!normalized.includes('같은 원인 실패가 3회 반복')) {
    errors.push('The repeated-failure stop condition is missing.');
  }

  const activePhase = context.lifecycleState?.activePhase;
  const lifecycleStatus = context.lifecycleState?.status;
  if (typeof activePhase === 'string' && !normalized.includes(activePhase)) {
    errors.push(`Current lifecycle phase is not reflected in the prompt: ${activePhase}`);
  }
  if (typeof lifecycleStatus === 'string' && !normalized.includes(`\`${lifecycleStatus}\``)) {
    errors.push(`Current lifecycle status is not reflected in the prompt: ${lifecycleStatus}`);
  }
  if (context.productPortfolio) {
    if (!context.productPortfolio.includes('A Polar subscription unlocks only the global service.')) {
      errors.push('The product portfolio no longer contains the EN-only Polar invariant.');
    }
    if (!context.productPortfolio.includes('KR_COMMERCIALIZATION_ENABLED')) {
      errors.push('The product portfolio no longer contains the KR commercialization gate.');
    }
  }

  return errors;
}

function main() {
  const prompt = readFileSync(resolve(process.cwd(), LANDING_GOAL_PROMPT), 'utf8');
  const lifecycleState = JSON.parse(
    readFileSync(resolve(process.cwd(), LIFECYCLE_STATE), 'utf8'),
  ) as LandingGoalHarnessContext['lifecycleState'];
  const productPortfolio = readFileSync(
    resolve(process.cwd(), PRODUCT_PORTFOLIO),
    'utf8',
  );
  const errors = validateLandingGoalHarness(prompt, {
    lifecycleState,
    productPortfolio,
  });
  if (errors.length) {
    errors.forEach((error) => console.error(`[landing-goal-harness] ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log('[landing-goal-harness] clean');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
