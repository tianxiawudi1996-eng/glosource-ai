---
title: GloSource Full Lifecycle Goal Harness - Plan
type: feat
date: 2026-08-07
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-plan-bootstrap
execution: code
---

# GloSource Full Lifecycle Goal Harness - Plan

## Goal Capsule

- **Objective:** Make every GloSource lifecycle phase from initial intent through retirement explicit, restartable, evidence-gated, and report-producing.
- **Authority:** Repository truth and direct verification override lifecycle records; phase completion never grants an external action.
- **Execution profile:** Machine-readable phase manifest, phase-specific metaprompts, local state transitions, deterministic completion reports, and drift tests.
- **Stop conditions:** Missing evidence, stale or contradictory state, phase skipping, missing human approval, sensitive input, or external action without authority.
- **Tail ownership:** Humans retain deployment, data migration, payment, publication, provider mutation, and retirement authority.

---

## Product Contract

### Summary

Add one lifecycle layer beneath the existing Goal Harness so every phase has a prompt, entry and exit gates, required evidence, approval boundary, and completion report.

### Problem Frame

The current harness controls one READY increment well, but lifecycle order and phase completion are expressed across prose files rather than one enforceable state machine.
Agents can therefore restart at the wrong layer, call preparation “deployment,” omit a completion report, or lose the next-phase handoff between sessions.

### Requirements

- R1. Define the complete ordered lifecycle from P00 intake through P16 retirement.
- R2. Give every phase its own metaprompt with objective, inputs, workflow, exit gate, report obligation, approval boundary, and stop conditions.
- R3. Keep one machine-readable manifest as the phase and gate source of truth.
- R4. Track one run and one active phase without phase skipping or retroactive completion claims.
- R5. Complete a phase only when every declared exit criterion and approval gate has a bounded evidence reference.
- R6. Generate a deterministic phase completion report in the same local transition operation.
- R7. Store only codes, safe references, and evidence digests; never secret values, identities, raw logs, or provider payloads.
- R8. External-effect phases remain records of human authorization and evidence, never authority to perform the action.
- R9. Validate manifest order, prompt coverage, state consistency, report linkage, and drift locally and in the existing harness precommit flow.
- R10. Initialize the current product honestly as a brownfield P10 blocked baseline without claiming P00-P09 passed under the new framework.

### Acceptance Examples

- AE1. A valid in-progress phase with all criteria advances exactly one phase and emits one linked report.
- AE2. Missing criteria, missing approval, wrong run, wrong phase, or unknown fields fail without changing state.
- AE3. A Production deployment phase cannot complete without its declared human approval reference and deployment evidence codes.
- AE4. Prompt deletion, broken next-phase links, duplicate phase IDs, or report-index drift fail validation.
- AE5. The current brownfield state validates at P10 blocked with no retroactive completion entries.

### Scope Boundaries

In scope: lifecycle governance, local state transitions, report generation, tests, and harness integration.

Outside scope: performing deployments, migrations, payments, external publication, provider writes, secret handling, commit, push, or reconstructing historical phase reports.

---

## Planning Contract

- KTD1. **One ordered manifest.** Phase IDs, prompts, criteria, approval gates, and next links live in `PHASES.json`; prose references it rather than restating a competing machine contract. Governs R1-R3, R9.
- KTD2. **One-phase transition.** Only the active in-progress phase may complete; the next phase is derived from the manifest. Governs R4-R6.
- KTD3. **Report and state are one operation.** The completion command creates a non-overwriting report and atomically replaces state; failure cleans up the new report. Governs R5-R7.
- KTD4. **Approval reference is evidence, not authority.** The harness records approved gate codes but contains no external adapters. Governs R7-R8.
- KTD5. **Brownfield honesty.** Adoption begins at observed P10 blocked and leaves prior completion history empty. Governs R10.

---

## Implementation Units

### U1. Lifecycle contract and phase metaprompts

- **Goal:** Define P00-P16 and the operating/recovery rules.
- **Files:** `docs/harness/lifecycle/LIFECYCLE.md`, `docs/harness/lifecycle/GOAL.md`, `docs/harness/lifecycle/PHASES.json`, `docs/harness/lifecycle/prompts/*.md`.
- **Covers:** R1-R3, R8, R10; AE4-AE5.

### U2. State transition and completion-report engine

- **Goal:** Validate, start, and complete exactly one phase with deterministic reports.
- **Files:** `scripts/lifecycle-harness.ts`, `tests/lifecycle-harness.test.ts`, `package.json`, `docs/harness/lifecycle/STATE.json`.
- **Covers:** R4-R9; AE1-AE5.
- **Execution note:** Prove invalid and missing-evidence paths before relying on the writer integration.

### U3. Existing harness integration and adoption record

- **Goal:** Connect lifecycle validation to the current Goal Harness without erasing prior state.
- **Files:** `docs/harness/GOAL.md`, `docs/harness/WORKFLOW.md`, `docs/harness/RULES.md`, `docs/harness/HARNESS_MANIFEST.md`, `docs/harness/STATUS.md`, `docs/harness/STATE.json`, `docs/harness/TESTS.md`, `scripts/harness-precommit.sh`, `docs/harness/lifecycle/ADOPTION_REPORT.md`.
- **Covers:** R6-R10; AE4-AE5.

---

## Verification Contract

| Gate | Done signal |
|---|---|
| Lifecycle focused tests | Manifest, state, failure paths, report content, and file integration pass |
| `npm run lifecycle:validate` | Current brownfield state and all prompt/report links are consistent |
| `npm test` | Full repository regression passes |
| `npx tsc --noEmit` | Type checking passes |
| `npm run lint` | No new errors or warnings |
| Harness checks | State, placeholder, sensitive-string, and diff checks pass |

---

## Definition of Done

- P00-P16 are ordered, machine-readable, and individually prompted.
- Completion cannot skip phases, omit criteria, omit approvals, or overwrite reports.
- Successful completion creates a report and next-phase state in one bounded local operation.
- Current product state is P10 blocked with explicit Production blockers and no invented history.
- Existing Goal Harness and precommit validation invoke the lifecycle validator.
- No external action, secret, identity, commit, push, or deployment occurs.
