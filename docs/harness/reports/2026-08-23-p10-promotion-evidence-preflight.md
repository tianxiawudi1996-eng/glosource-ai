# P10 Candidate-bound Promotion Evidence Preflight — 2026-08-23

## Result

The approved local READY increment is evidence-backed complete. The protected
promotion workflow now validates a sanitized candidate-bound evidence packet
before `db:migrate`. P10 remains blocked because no real backup, restore,
staging, rollback, current control-plane, independent-reviewer, or fresh
approval receipt was created or supplied.

## Implemented contract

- Exact candidate and rollback SHA binding.
- Tracked Production target digest binding.
- Migration journal and SQL bundle digest plus journalled planned migration IDs.
- Candidate-bound staging migration rehearsal receipt.
- Fresh backup receipt and restore-test receipt linked by backup digest.
- Exact-candidate rollback rehearsal receipt.
- Fresh `ready` control-plane audit receipt.
- Distinct, fresh `G_RELEASE` and `G_PRODUCTION_CONTROL_PLANE_CHANGE` references.
- Maximum 24-hour packet window; 24-hour backup/audit/approval freshness;
  30-day staging/restore/rollback rehearsal freshness.
- Exact-key parsing and sanitized output that does not echo raw evidence,
  receipt references, receipt digests, provider payloads, or secret values.

## Workflow order

`verify → protected Production approval → fast-forward check → npm ci →
promotion evidence preflight → db:migrate → master push`.

The evidence JSON is accepted only as a required manual dispatch input, written
with restrictive permissions to the runner temporary directory, and deleted by
an EXIT trap. A failed or missing packet stops before migration.

## Verification

- Final focused release/preflight suite: 17/17 passed.
- Full `npm test`: 242/242 passed. TypeScript passed; ESLint
  reported 0 errors and 16 existing warnings in the preceding full verification.
- Context calculation was exercised against the tracked target and migrations
  `0000` through `0005`. The operational CLI additionally requires exact HEAD,
  clean worktree, and rollback ancestry; it therefore remains expected blocked
  in the current dirty worktree.
- `git diff --check`: passed before Harness documentation update.
- No build or browser QA was run because this increment changes only local
  release scripts, tests, workflow governance, and operations documentation;
  it does not change the Next.js runtime or UI.

## External effects and remaining gates

- Commit, push, PR, workflow dispatch, provider change, secret entry,
  migration, backup, restore, rollback, and deployment: 0.
- Current working tree remains dirty, so the diagnostic context generated from
  unchanged HEAD is not a releasable candidate context.
- Independent reviewer protection and self-review prevention remain absent.
- Real receipts and both exact approvals remain absent.
- Lifecycle stays at P10 `blocked`; no transition to P11 was attempted.

## Next action

Review and stabilize the existing dirty worktree. A separate commit approval is
required before creating a clean immutable candidate. Only that clean SHA can
be used to generate operational promotion evidence.
