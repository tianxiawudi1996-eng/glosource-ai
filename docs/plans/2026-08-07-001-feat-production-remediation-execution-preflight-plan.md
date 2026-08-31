---
title: Production Remediation Execution Preflight - Plan
type: feat
date: 2026-08-07
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-plan-bootstrap
execution: code
---

# Production Remediation Execution Preflight - Plan

## Goal Capsule

- **Objective:** Convert the current remediation approval packet into a sanitized human-handoff readiness result without granting or exercising execution authority.
- **Authority:** Repository gates, current sanitized audit, required environment-name contract, and promotion workflow override preference input.
- **Execution profile:** Pure local evaluation plus a thin file-reading CLI.
- **Stop conditions:** Invalid, unverified, incomplete, incompatible, or stale context; any need for secrets, identities, exact patterns, commands, or provider payloads.
- **Tail ownership:** A human owns actual reviewer selection, secret entry, provider mutation, dispatch, promotion, deployment, and post-change audit.

---

## Product Contract

### Summary

Add a local preflight that says whether bounded Production remediation preferences are coherent enough to request a fresh human execution approval.
The preflight produces action categories, not commands or authority.

### Problem Frame

The preference packet correctly separates preferences from approval, but the next boundary is implicit.
Without an explicit preflight contract, a recorded preference packet could be mistaken for authorization or manually translated into unsafe provider instructions.

### Requirements

**Contract reuse**

- R1. The preflight rebuilds and consumes the canonical remediation approval packet instead of duplicating its validation rules.
- R2. Invalid, stale, awaiting-decision, and not-required packet states map deterministically to distinct preflight states.
- R3. `handoff_ready` is possible only when the packet is `preferences_recorded` against the current blocked audit.

**Output safety**

- R4. The output contains only generic blockers and a fixed allowlist of action-category codes.
- R5. Action codes appear only for `handoff_ready`; every other state returns an empty action list.
- R6. Output never includes a secret, reviewer identity, exact branch pattern, command, provider payload, or raw error.
- R7. Fixed invariants state that execution approval is absent and provider mutation is unauthorized and unattempted.

**Isolation**

- R8. The builder performs no network, subprocess, provider write, workflow dispatch, push, deployment, or persistence.
- R9. The CLI reads two local JSON files and the local promotion workflow, writes sanitized JSON to stdout, and exits nonzero unless remediation is not required.

### Acceptance Examples

- AE1. Deferred example preferences produce `awaiting_preferences`, no actions, and no authority.
- AE2. Complete current preferences produce `handoff_ready` with four bounded action codes while audited readiness remains blocked.
- AE3. A stale digest produces `stale` and no actions.
- AE4. Invalid or sensitive-shaped input produces `invalid` without reflecting rejected content.
- AE5. A ready audit produces `not_required`, no preferences, and no actions.

### Scope Boundaries

In scope: local state mapping, bounded action categories, CLI entry point, tests, and harness evidence.

Outside scope: collecting actual preference decisions, reviewer identity, secrets, exact branch patterns, provider instructions or mutations, commit, push, dispatch, deployment, payment testing, and publication.

---

## Planning Contract

- KTD1. **Wrap the canonical packet.** Reuse `buildProductionRemediationApprovalPacket` so schema, digest, audit consistency, and redaction have one authority. Governs R1-R3.
- KTD2. **Action categories are not commands.** Map recorded enum choices to a fixed code list; never emit payloads or provider syntax. Governs R4-R6.
- KTD3. **Approval remains absent by construction.** The schema has no approval field and the output always reports `executionApprovalPresent: false`. Governs R7-R9.

### Assumptions

- The user asked to proceed while the queue has no non-gated READY item, so this phase advances only the local approval boundary.
- Current Production blockers remain unchanged as confirmed by the read-only 2026-08-07 audit.

---

## Implementation Units

### U1. Metaprompt and preflight evaluator

- **Goal:** Define and implement the packet-to-handoff state machine.
- **Requirements:** R1-R8; AE1-AE5.
- **Files:** `docs/operations/GLOSOURCE_PRODUCTION_REMEDIATION_EXECUTION_PREFLIGHT_METAPROMPT.md`, `scripts/build-production-remediation-execution-preflight.ts`.
- **Patterns:** Reuse the pure-builder/thin-CLI boundary in `scripts/build-production-remediation-approval-packet.ts`.
- **Test scenarios:** Awaiting, complete, stale, invalid/redacted, and ready/not-required packet paths; static isolation scan.

### U2. Operator entry point and harness evidence

- **Goal:** Make the local preflight reproducible and record the unchanged approval boundary.
- **Requirements:** R7-R9.
- **Files:** `package.json`, `docs/harness/STATUS.md`, `docs/harness/TESTS.md`, `docs/harness/STATE.json`.
- **Test scenarios:** The tracked deferred example exits non-ready, returns no actions, and shows all false authority invariants.

---

## Verification Contract

| Gate | Applies to | Done signal |
|---|---|---|
| Focused preflight tests | U1-U2 | AE1-AE5 and isolation checks pass |
| `npm test` | U1-U2 | Full regression suite passes |
| `npx tsc --noEmit` | U1-U2 | Type checking exits cleanly |
| `npm run lint` | U1-U2 | No new errors or warnings |
| Harness and sensitive checks | U2 | State, placeholder, secret, and diff checks are clean |
| Example CLI | U2 | Returns `awaiting_preferences`, no actions, and no authority |

---

## Definition of Done

- The metaprompt, evaluator, tests, package command, and harness evidence exist.
- The evaluator reuses the canonical approval packet and does not reinterpret raw provider data.
- Only a current `preferences_recorded` packet yields `handoff_ready` and bounded action codes.
- All other states expose no actions and no rejected content.
- Execution approval and provider mutation remain false and unattempted.
- No external setting, secret, identity, branch pattern, command, commit, push, dispatch, deployment, payment, or publication action occurs.
