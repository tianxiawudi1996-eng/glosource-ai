import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { validateAgentInstructions } from '../scripts/check-agent-instructions';

const instructions = readFileSync('AGENTS.md', 'utf8');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts?: Record<string, string>;
};

test('root AGENTS.md preserves the GloSource instruction contract', () => {
  assert.deepEqual(validateAgentInstructions(instructions, packageJson), []);
});

test('instruction drift rejects missing product truth and transcript duplication', () => {
  const drifted = instructions
    .replace('docs/requirements/GLOSOURCE_PORTFOLIO.md', 'missing-product-contract.md')
    .concat('\n[2026-08-07 오전 11:03] SOMEONE: pasted transcript\n');
  const errors = validateAgentInstructions(drifted, packageJson);

  assert.ok(errors.some((error) => error.includes('GLOSOURCE_PORTFOLIO.md')));
  assert.ok(errors.some((error) => error.includes('timestamp artifacts')));
});

test('instruction drift rejects missing package commands', () => {
  const scripts = { ...packageJson.scripts };
  delete scripts['lifecycle:validate'];

  const errors = validateAgentInstructions(instructions, { scripts });
  assert.ok(errors.some((error) => error.includes('lifecycle:validate')));
});
