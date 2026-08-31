# HARNESS_MANIFEST

## Installed Files

- [x] `docs/harness/PROJECT_OS.md`
- [x] `docs/harness/GOAL.md`
- [x] `docs/harness/STATUS.md`
- [x] `docs/harness/RULES.md`
- [x] `docs/harness/PLAN.md`
- [x] `docs/harness/TESTS.md`
- [x] `docs/harness/TASK_QUEUE.md`
- [x] `docs/harness/DECISIONS.md`
- [x] `docs/harness/WORKFLOW.md`
- [x] `docs/harness/STATE.json`
- [x] `docs/harness/REPORT_TEMPLATE.md`
- [x] `docs/harness/HARNESS_MANIFEST.md`
- [x] `scripts/check-sensitive-strings.mjs`
- [x] `scripts/check-harness-placeholders.mjs`
- [x] `scripts/check-state-json.mjs`
- [x] `scripts/check-agent-instructions.ts`
- [x] `scripts/harness-precommit.sh`
- [x] Hook activation plan documented
- [x] `.gitignore` entries for local blocklist and private/generated harness evidence
- [x] `docs/harness/lifecycle/PHASES.json` P00-P16 lifecycle manifest
- [x] `docs/harness/lifecycle/STATE.json` single-run phase state
- [x] `docs/harness/lifecycle/prompts/` phase-specific metaprompts
- [x] `docs/harness/lifecycle/reports/README.md` immutable completion-report contract
- [x] `docs/harness/lifecycle/completion-evidence.example.json` strict evidence example
- [x] `docs/harness/lifecycle/ADOPTION_REPORT.md` adoption and verification report
- [x] `scripts/lifecycle-harness.ts` validation, start, completion, and report engine
- [x] `tests/lifecycle-harness.test.ts` lifecycle drift and transition regression tests
- [x] `npm run lifecycle:validate` included in `scripts/harness-precommit.sh`
- [x] `npm run harness:instructions` validates root instruction drift and runs in the pre-commit mirror
- [x] `tests/agent-instructions.test.ts` covers required guidance, duplication, transcript artifacts, and package-command drift
- [x] `docs/harness/AGENTS_INSTRUCTION_ADOPTION_REPORT.md` records normalization decisions, verification, and external boundaries

## Local-only Files

- [x] `.harness-blocklist.local` exists locally
- [x] `.harness-blocklist.local` is ignored by git
- [x] private evidence paths are ignored

## Ignition Status

| Layer | Installed | Active | Notes |
|---|---:|---:|---|
| Agent hook | No | No | `.claude/` is ignored; activate only after local hook schema verification |
| Sensitive check | Yes | Yes | Local blocklist required and gitignored |
| Placeholder check | Yes | Yes | Scans `docs/harness` |
| State JSON check | Yes | Yes | Validates required fields and arrays |
| Pre-commit mirror | Yes | No | Script installed; git hook activation requires user approval |
| Lifecycle validator | Yes | Yes | Manifest, prompt, state, and report-link checks run locally and in the pre-commit mirror |
| Agent-instruction validator | Yes | Yes | Root product contract, lifecycle links, managed Next block, and executable command references fail closed on drift |

## Generic Purity Check

- [x] No copied example project names
- [x] No unrelated client/company names
- [x] No unrelated domain scripts
- [x] No proprietary source filenames
- [x] No unresolved template placeholders
- [x] Human-input gates are explicit in TASK_QUEUE and STATE

## Hook Activation Plan

1. Confirm the active coding-agent hook schema.
2. Configure post-edit sensitive-string check.
3. Configure stop-time diff and state checks.
4. Mirror checks through `scripts/harness-precommit.sh`.
5. Do not activate hooks while the current dirty worktree ownership is unresolved.
