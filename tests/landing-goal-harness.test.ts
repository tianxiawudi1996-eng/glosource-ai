import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  LANDING_GOAL_PROMPT,
  LIFECYCLE_STATE,
  PRODUCT_PORTFOLIO,
  validateLandingGoalHarness,
} from '../scripts/check-landing-goal-harness';

const prompt = readFileSync(LANDING_GOAL_PROMPT, 'utf8');
const context = {
  lifecycleState: JSON.parse(readFileSync(LIFECYCLE_STATE, 'utf8')),
  productPortfolio: readFileSync(PRODUCT_PORTFOLIO, 'utf8'),
};

test('landing long-running goal harness preserves its execution contract', () => {
  assert.deepEqual(validateLandingGoalHarness(prompt, context), []);
});

test('landing goal harness rejects removal of every strengthened section', () => {
  const strengthenedHeadings = [
    '## REFERENCE INPUT POLICY:',
    '## PROBLEM / BOTTLENECK / KPI CARD:',
    '## STATE MODEL / MANUAL-AUTOMATIC BOUNDARY:',
    '## DECISION REGISTER / INTERFACE BOUNDARIES:',
    '## RELIABILITY ENVELOPE:',
    '## TOOLS:',
    '## EVIDENCE LADDER / ENVIRONMENT SEPARATION:',
    '## REVIEW / FEEDBACK LOOP:',
  ];

  for (const heading of strengthenedHeadings) {
    const drifted = prompt.replace(heading, '## REMOVED CONTRACT:');
    assert.ok(
      validateLandingGoalHarness(drifted, context).some((error) =>
        error.includes(heading),
      ),
      `expected missing heading to fail: ${heading}`,
    );
  }
});

test('landing goal harness rejects a missing bottleneck and KPI contract', () => {
  const drifted = prompt.replace('BOTTLENECK / BASELINE / TARGET', 'GENERAL GOAL');
  assert.ok(
    validateLandingGoalHarness(drifted, context).some((error) =>
      error.includes('BOTTLENECK_KPI_CARD'),
    ),
  );
});

test('landing goal harness rejects a weakened manual approval boundary', () => {
  const drifted = prompt.replace('`HUMAN APPROVAL`', '`AUTOMATIC APPROVAL`');
  assert.ok(
    validateLandingGoalHarness(drifted, context).some((error) =>
      error.includes('STATE_MANUAL_AUTOMATIC'),
    ),
  );
});

test('landing goal harness rejects evidence-level promotion', () => {
  const drifted = prompt.replace(
    '하위 단계 통과는 상위 환경 증명이 아니다',
    'staging 통과는 Production 증명이다',
  );
  assert.ok(
    validateLandingGoalHarness(drifted, context).some((error) =>
      error.includes('EVIDENCE_ENVIRONMENT'),
    ),
  );
});

test('landing goal harness rejects loss of independent primary-source review', () => {
  const drifted = prompt.replace(
    '보안·법률·결제·권한·최종 통합·독립 검토는 루트나 지정 검토자가 정본을 다시 읽는다',
    '어떤 경우에도 정본을 다시 읽지 않는다',
  );
  assert.ok(
    validateLandingGoalHarness(drifted, context).some((error) =>
      error.includes('MODEL_PRIMARY_SOURCE_REVIEW'),
    ),
  );
});

test('landing goal harness rejects product payment-boundary drift', () => {
  const drifted = prompt.replace('Polar는 EN만 잠금 해제한다', 'Polar는 KR도 잠금 해제한다');
  assert.ok(
    validateLandingGoalHarness(drifted, context).some((error) =>
      error.includes('PRODUCT_SECURITY_APPROVAL'),
    ),
  );
});

test('landing goal harness rejects contradictory shortcut language', () => {
  const drifted = `${prompt}\n필요하면 실행`;
  assert.ok(
    validateLandingGoalHarness(drifted, context).some((error) =>
      error.includes('Forbidden contract weakening'),
    ),
  );
});

test('landing goal harness rejects lifecycle context drift', () => {
  const drifted = prompt.replaceAll('P10', 'P09');
  assert.ok(
    validateLandingGoalHarness(drifted, context).some((error) =>
      error.includes('Current lifecycle phase'),
    ),
  );
});

test('landing goal harness rejects a missing model route', () => {
  const drifted = prompt.replaceAll('`gpt-5.6-luna`', '`small-model`');
  assert.ok(
    validateLandingGoalHarness(drifted).some((error) =>
      error.includes('gpt-5.6-luna'),
    ),
  );
});

test('landing goal harness rejects a weakened external approval boundary', () => {
  const drifted = prompt.replace('별도 명시 승인 전 금지', '필요하면 실행');
  assert.ok(
    validateLandingGoalHarness(drifted).some((error) =>
      error.includes('approval boundary'),
    ),
  );
});
