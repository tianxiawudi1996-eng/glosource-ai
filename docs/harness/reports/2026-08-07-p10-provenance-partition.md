# P10 Dirty Worktree Provenance Partition

## Report Identity

- Audited at: 2026-08-07 Asia/Seoul
- Lifecycle: `GLO-BROWNFIELD-20260807 / P10 Release Readiness`
- Source snapshot: 27 modified tracked + 56 untracked = 83 files
- This report: generated after the snapshot and intentionally excluded from the 83-file count
- Git staging, commit, reset, checkout, push, or deployment performed: no

## Decision

Do not release or commit the 83-file worktree as one unit. Partition it into five ordered increments. Shared command registration and historical harness ledgers belong in the final integration increment so earlier domain increments remain reviewable by purpose.

## Dependency Order

```text
A. Release package integrity
        ↓
B. Production governance and readiness
        ↓
C. Public claims and active growth contract
        ↓
D. SNS sales whitepaper
        ↓
E. Lifecycle and root agent harness integration
```

`D` is technically independent of `A-C`, but placing it after active-copy corrections makes its commercial claims easier to compare against the current product contract. `E` is last because its state, test ledger, command aliases, and adoption reports refer to all earlier increments.

## Increment A — Release Package Integrity

### Outcome

Harden standalone packaging against sensitive files, interrupted all-zero build output, partial archive failures, and incomplete Production environment-name contracts.

### Files

- `docs/operations/PRODUCTIZATION.md`
- `eslint.config.mjs`
- `scripts/package-release.ts`
- `scripts/check-sensitive-strings.mjs`
- `tests/release-packaging.test.ts`
- `tests/sensitive-scanner.test.ts`

### Required verification

```powershell
npx tsx --test tests/release-packaging.test.ts tests/sensitive-scanner.test.ts
npx tsc --noEmit
npm run lint
```

### Risk boundary

Do not run `package:product` from the current mixed dirty tree. A release archive is meaningful only after the selected increment exists on a clean candidate.

## Increment B — Production Governance and Readiness

### Outcome

Replace automatic Production promotion with verified manual promotion; add sanitized product/control-plane readiness, bounded remediation preference evaluation, and a non-authorizing execution preflight.

### Files

- `.github/workflows/promote.yml`
- `docs/operations/GLOSOURCE_PRODUCTION_CONTROL_PLANE_METAPROMPT.md`
- `docs/operations/GLOSOURCE_PRODUCTION_REMEDIATION_APPROVAL_METAPROMPT.md`
- `docs/operations/GLOSOURCE_PRODUCTION_REMEDIATION_EXECUTION_PREFLIGHT_METAPROMPT.md`
- `docs/operations/NEXT_PRODUCTIZATION_METAPROMPT.md`
- `docs/operations/production-remediation-preferences.example.json`
- `docs/plans/2026-08-05-001-feat-production-control-plane-readiness-plan.md`
- `docs/plans/2026-08-05-002-feat-production-remediation-approval-plan.md`
- `docs/plans/2026-08-07-001-feat-production-remediation-execution-preflight-plan.md`
- `scripts/check-product-readiness.ts`
- `scripts/check-production-control-plane-readiness.ts`
- `scripts/build-production-remediation-approval-packet.ts`
- `scripts/build-production-remediation-execution-preflight.ts`
- `tests/product-readiness.test.ts`
- `tests/control-plane-readiness.test.ts`
- `tests/production-remediation-approval.test.ts`
- `tests/production-remediation-execution-preflight.test.ts`
- `tests/release-governance.test.ts`

### Dependency

Depends on Increment A exports `RELEASE_IDENTITY` and `REQUIRED_PRODUCTION_ENV` from `scripts/package-release.ts`.

### Required verification

```powershell
npx tsx --test tests/product-readiness.test.ts tests/control-plane-readiness.test.ts tests/production-remediation-approval.test.ts tests/production-remediation-execution-preflight.test.ts tests/release-governance.test.ts
npx tsc --noEmit
npm run lint
```

Provider queries remain read-only. Provider settings, reviewer identities, secret entry, workflow dispatch, promotion, and deployment remain separately gated.

## Increment C — Public Claims and Active Growth Contract

### Outcome

Remove unsupported precise KR outcome claims and align active EN social launchers with the account-based free quota, current paid entry price, and evidence-safe language.

### Files

- `app/HomePageClient.tsx`
- `docs/operations/GLOSOURCE_GLOBAL_INSTRUCTION_EXECUTION_METAPROMPT.md`
- `docs/plans/2026-08-04-001-fix-glosource-operational-governance-plan.md`
- `scripts/growth/discord-launch.js`
- `scripts/growth/instagram-launch.js`
- `scripts/growth/linkedin-launch-handler.js`
- `scripts/growth/reddit-launch.js`
- `scripts/growth/threads-launch-handler.js`
- `scripts/growth/twitter-launch.js`
- `tests/growth-copy-contract.test.ts`
- `tests/marketing-claims.test.ts`

### Required verification

```powershell
npx tsx --test tests/growth-copy-contract.test.ts tests/marketing-claims.test.ts
npx tsc --noEmit
npm run lint
npm run build
npm run growth:social:dry-run
```

### Manual verification

- KR examples render as illustrative checks, not observed customer results.
- Active EN launchers retain current quota and price language.
- 360px and 1440px browser review is required before release.
- SNS publishing remains prohibited without approval.

## Increment D — SNS Sales Whitepaper

### Outcome

Produce and audit the KR/EN sales whitepaper without coupling the binary document to application runtime or deployment governance.

### Files

- `docs/whitepapers/GloSource_AI_SNS_영업_백서_KR_EN.docx`
- `scripts/build-glosource-sales-whitepaper.py`
- `scripts/audit-glosource-sales-whitepaper.py`

### Required verification

```powershell
python scripts/audit-glosource-sales-whitepaper.py
```

The DOCX should be regenerated only through the builder and re-audited. Public distribution, Drive upload, email, or SNS posting remains a separate approval.

## Increment E — Lifecycle and Root Agent Harness Integration

### Outcome

Adopt the P00-P16 lifecycle, root GloSource agent contract, instruction/lifecycle drift guards, completion reporting, and the consolidated current-state ledger.

### Files

- `.gitignore`
- `AGENTS.md`
- `package.json`
- `scripts/check-agent-instructions.ts`
- `scripts/lifecycle-harness.ts`
- `scripts/harness-precommit.sh`
- `tests/agent-instructions.test.ts`
- `tests/lifecycle-harness.test.ts`
- `docs/plans/2026-08-07-002-feat-lifecycle-goal-harness-plan.md`
- `docs/harness/AGENTS_INSTRUCTION_ADOPTION_REPORT.md`
- `docs/harness/GOAL.md`
- `docs/harness/HARNESS_MANIFEST.md`
- `docs/harness/PLAN.md`
- `docs/harness/REPORT_TEMPLATE.md`
- `docs/harness/RULES.md`
- `docs/harness/STATE.json`
- `docs/harness/STATUS.md`
- `docs/harness/TASK_QUEUE.md`
- `docs/harness/TESTS.md`
- `docs/harness/WORKFLOW.md`
- `docs/harness/reports/2026-08-07-p10-release-readiness-refresh.md`
- `docs/harness/lifecycle/ADOPTION_REPORT.md`
- `docs/harness/lifecycle/GOAL.md`
- `docs/harness/lifecycle/LIFECYCLE.md`
- `docs/harness/lifecycle/PHASES.json`
- `docs/harness/lifecycle/STATE.json`
- `docs/harness/lifecycle/completion-evidence.example.json`
- `docs/harness/lifecycle/reports/README.md`
- `docs/harness/lifecycle/prompts/P00_INTAKE_STRATEGY.md`
- `docs/harness/lifecycle/prompts/P01_DISCOVERY_EVIDENCE.md`
- `docs/harness/lifecycle/prompts/P02_REQUIREMENTS.md`
- `docs/harness/lifecycle/prompts/P03_FUNCTIONAL_DESIGN.md`
- `docs/harness/lifecycle/prompts/P04_ARCHITECTURE_INFRASTRUCTURE.md`
- `docs/harness/lifecycle/prompts/P05_DATA_SECURITY_PRIVACY.md`
- `docs/harness/lifecycle/prompts/P06_UI_UX_CONTENT.md`
- `docs/harness/lifecycle/prompts/P07_IMPLEMENTATION_PLANNING.md`
- `docs/harness/lifecycle/prompts/P08_IMPLEMENTATION.md`
- `docs/harness/lifecycle/prompts/P09_VERIFICATION_QA.md`
- `docs/harness/lifecycle/prompts/P10_RELEASE_READINESS.md`
- `docs/harness/lifecycle/prompts/P11_STAGING_UAT.md`
- `docs/harness/lifecycle/prompts/P12_PRODUCTION_DEPLOYMENT.md`
- `docs/harness/lifecycle/prompts/P13_POST_DEPLOY_VALIDATION.md`
- `docs/harness/lifecycle/prompts/P14_OPERATIONS.md`
- `docs/harness/lifecycle/prompts/P15_MAINTENANCE_ITERATION.md`
- `docs/harness/lifecycle/prompts/P16_RETIREMENT.md`

### Required verification

```powershell
npm run harness:instructions
npm run lifecycle:validate
npx tsx --test tests/agent-instructions.test.ts tests/lifecycle-harness.test.ts
npm test
npx tsc --noEmit
npm run lint
git diff --check
node scripts/check-sensitive-strings.mjs .harness-blocklist.local
node scripts/check-harness-placeholders.mjs docs/harness
node scripts/check-state-json.mjs docs/harness/STATE.json
```

## Shared-File Rule

`package.json` registers commands for Increments B and E. Do not use broad staging. During an approved commit workflow, either:

1. keep `package.json` in Increment E and invoke focused B checks directly with `npx tsx`, or
2. use reviewed partial-hunk staging and prove each intermediate commit is green.

The first option is safer because it avoids an accidental mixed hunk.

`docs/harness/STATE.json`, `STATUS.md`, `TASK_QUEUE.md`, and `TESTS.md` are consolidated evidence ledgers. Keep them in Increment E rather than duplicating or partially staging historical entries across A-D.

## Candidate Reconstruction Procedure

This is a proposed future procedure, not an executed action:

1. Create a recoverable snapshot of the current worktree.
2. Use an isolated branch/worktree for each approved increment.
3. Apply only the exact files listed for A, verify, and record its receipt.
4. Build B on A; verify with no provider mutation.
5. Build C on B; include browser verification before release.
6. Add D as a non-runtime commercial artifact.
7. Add E last and run the full 200-test-or-newer suite plus every harness guard.
8. Only after the resulting candidate is clean, run product readiness and create a fresh release artifact.
9. Provider remediation, promotion, staging, and Production remain separate approvals.

## Coverage Check

- Increment A: 6 files
- Increment B: 18 files
- Increment C: 11 files
- Increment D: 3 files
- Increment E: 45 files
- Total source snapshot coverage: 83/83 files

This new partition report is the only additional artifact created by this audit and is not counted in the source snapshot.

## Final Assessment

The dirty provenance blocker is now decomposed and reviewable, but not resolved. No clean candidate exists until the user authorizes a concrete branch/commit reconstruction strategy and the five increments are independently verified.

## Execution Update — 2026-08-07T21:07:27+09:00

The user subsequently approved local branch and commit reconstruction. The plan was executed on `codex/p10-provenance-reconstruction` without push or deployment:

- A `252d6cb` — `fix(release): harden standalone package integrity`
- B `9edbd83` — `fix(release): require explicit production promotion`
- C `54b1f37` — `fix(marketing): align public claims with product contract`
- D `d0d3ba8` — `docs(sales): add audited KR EN social playbook`
- E — the final lifecycle/root harness integration commit containing this update

Increment D was regenerated after the initial audit found builder/document drift. The regenerated DOCX passed every structural audit, including required sections, content coverage, page/table geometry, current EN contract, 15 hyperlinks, numbering, bullets, and metadata. PNG render QA could not run because LibreOffice/`soffice` is not installed; this limitation is not treated as a visual pass.
