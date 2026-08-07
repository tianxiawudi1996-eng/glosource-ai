import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_HEADINGS = [
  '# GloSource AI Repository Instructions',
  '## 1. Authority and Purpose',
  '## 2. Product Truth and Boundaries',
  '## 3. Mandatory Session Start',
  '## 4. Goal, Specification, and Lifecycle',
  '## 5. Technology and Architecture',
  '## 6. Security, Authentication, and Privacy',
  '## 7. Database and Migration Rules',
  '## 8. UI, UX, Content, and Accessibility',
  '## 9. Implementation and Editing Rules',
  '## 10. Verification Matrix',
  '## 11. Git, Release, and External-Effect Boundaries',
  '## 12. Documentation, Memory, and Reports',
  '## 13. Agent and Model Orchestration',
  '## 14. Failure, Stop, and Recovery Rules',
  '## 15. Definition of Done and Final Report',
] as const;

const REQUIRED_REFERENCES = [
  'docs/requirements/GLOSOURCE_PORTFOLIO.md',
  'docs/harness/lifecycle/PHASES.json',
  'docs/harness/lifecycle/LIFECYCLE.md',
  'docs/harness/STATE.json',
  'docs/harness/TASK_QUEUE.md',
] as const;

const REQUIRED_SCRIPTS = [
  { name: 'harness:instructions', command: 'npm run harness:instructions' },
  { name: 'lifecycle:validate', command: 'npm run lifecycle:validate' },
  { name: 'lifecycle:status', command: 'npm run lifecycle:status' },
  { name: 'test', command: 'npm test' },
  { name: 'lint', command: 'npm run lint' },
  { name: 'build', command: 'npm run build' },
  { name: 'growth:live-contract', command: 'npm run growth:live-contract' },
] as const;

const NEXT_RULE_BLOCK = `<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in \`node_modules/next/dist/docs/\` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->`;

export function validateAgentInstructions(
  instructions: string,
  packageJson: { scripts?: Record<string, string> },
) {
  const errors: string[] = [];

  for (const heading of REQUIRED_HEADINGS) {
    const matches = instructions.split('\n').filter((line) => line.trim() === heading);
    if (matches.length !== 1) {
      errors.push(`Required heading must appear exactly once: ${heading}`);
    }
  }

  for (const reference of REQUIRED_REFERENCES) {
    if (!instructions.includes(reference)) {
      errors.push(`Required repository reference is missing: ${reference}`);
    }
  }

  for (const script of REQUIRED_SCRIPTS) {
    if (!packageJson.scripts?.[script.name]) {
      errors.push(`Required package script is missing: ${script.name}`);
    }
    if (!instructions.includes(script.command)) {
      errors.push(`AGENTS.md does not document required command: ${script.command}`);
    }
  }

  if (!instructions.includes(NEXT_RULE_BLOCK)) {
    errors.push('The managed Next.js agent rule block changed or is missing.');
  }
  if (/\[20\d{2}-\d{2}-\d{2}[^\]]*\]\s*[A-Z0-9_]+:/.test(instructions)) {
    errors.push('Chat transcript timestamp artifacts are not allowed in AGENTS.md.');
  }
  if ((instructions.match(/^# GloSource AI Repository Instructions$/gm) ?? []).length !== 1) {
    errors.push('AGENTS.md appears duplicated or has the wrong top-level title.');
  }
  if (instructions.length > 30_000) {
    errors.push('AGENTS.md exceeds the 30,000-character maintainability limit.');
  }

  return errors;
}

function main() {
  const root = process.cwd();
  const instructions = readFileSync(resolve(root, 'AGENTS.md'), 'utf8');
  const packageJson = JSON.parse(
    readFileSync(resolve(root, 'package.json'), 'utf8'),
  ) as { scripts?: Record<string, string> };
  const errors = validateAgentInstructions(instructions, packageJson);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[agent-instructions] ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('[agent-instructions] clean');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
