# Production Promotion Evidence Contract

This contract is consumed by `scripts/check-promotion-evidence.ts` before the
protected workflow can run `db:migrate`. It is a completeness and binding
check, not a backup, restore, approval, migration, or deployment executor.

## Context first

Generate the exact non-secret context for the clean candidate and current
rollback commit:

```bash
npm run readiness:promotion-context -- \
  --candidate-sha <40-character-candidate-sha> \
  --rollback-sha <40-character-origin-master-sha>
```

The output contains the tracked Production target digest, the migration bundle
digest, and the available migration IDs. Any candidate, target, journal, or SQL
change produces a different context and invalidates older evidence. Context
generation itself requires the candidate to equal `HEAD`, a clean worktree, and
the rollback SHA to be an ancestor of the candidate.

## Exact JSON shape

The dispatch input must be one JSON object with exactly this structure. Text in
angle brackets describes an operator-supplied value and is not valid evidence.

```json
{
  "schemaVersion": 1,
  "issuedAt": "<UTC timestamp>",
  "validUntil": "<UTC timestamp no more than 24 hours after issuedAt>",
  "candidateSha": "<context candidateSha>",
  "rollbackSha": "<context rollbackSha>",
  "targetDigest": "<context targetDigest>",
  "migration": {
    "candidateSha": "<context candidateSha>",
    "bundleDigest": "<context migrationBundleDigest>",
    "plannedIds": ["<journalled migration ID rehearsed on staging>"],
    "stagingReceiptReference": "<safe external receipt reference>",
    "stagingReceiptDigest": "<SHA-256 of sanitized staging receipt>",
    "testedAt": "<UTC timestamp>"
  },
  "backup": {
    "candidateSha": "<context candidateSha>",
    "receiptReference": "<safe external receipt reference>",
    "receiptDigest": "<SHA-256 of sanitized backup receipt>",
    "createdAt": "<UTC timestamp>"
  },
  "restoreTest": {
    "candidateSha": "<context candidateSha>",
    "backupReceiptDigest": "<same digest as backup.receiptDigest>",
    "receiptReference": "<safe external receipt reference>",
    "receiptDigest": "<SHA-256 of sanitized restore-test receipt>",
    "testedAt": "<UTC timestamp>"
  },
  "rollback": {
    "candidateSha": "<context candidateSha>",
    "rollbackSha": "<context rollbackSha>",
    "receiptReference": "<safe external receipt reference>",
    "receiptDigest": "<SHA-256 of sanitized rollback-rehearsal receipt>",
    "rehearsedAt": "<UTC timestamp>"
  },
  "controlPlaneAudit": {
    "status": "ready",
    "targetDigest": "<context targetDigest>",
    "receiptReference": "<safe external receipt reference>",
    "receiptDigest": "<SHA-256 of sanitized current audit receipt>",
    "auditedAt": "<UTC timestamp>"
  },
  "approvals": {
    "release": {
      "gate": "G_RELEASE",
      "reference": "<fresh safe approval reference>",
      "approvedAt": "<UTC timestamp>",
      "candidateSha": "<context candidateSha>",
      "rollbackSha": "<context rollbackSha>"
    },
    "controlPlaneChange": {
      "gate": "G_PRODUCTION_CONTROL_PLANE_CHANGE",
      "reference": "<different fresh safe approval reference>",
      "approvedAt": "<UTC timestamp>",
      "targetDigest": "<context targetDigest>"
    }
  }
}
```

## Retention and safety

- Keep the completed JSON in an ignored/private operations location. Do not
  commit it.
- GitHub can retain manual-dispatch input in workflow event metadata. Therefore
  the JSON must contain only sanitized references and digests, never secrets or
  raw operational evidence.
- Receipt references may use letters, numbers, dots, underscores, colons,
  slashes, and hyphens. Receipt digests are lowercase SHA-256 values.
- Backup, control-plane audit, and approvals expire after 24 hours.
- Staging, restore, and rollback rehearsal receipts expire after 30 days.
- Unknown fields, malformed timestamps, reused approval references, stale
  evidence, and any SHA/digest mismatch fail closed.
- Do not include database URLs, tokens, cookies, provider payloads, reviewer
  identities, raw logs, customer data, or secret values.

## Local validation

```bash
npm run readiness:promotion-evidence -- <ignored-private-evidence.json> \
  --candidate-sha <40-character-candidate-sha> \
  --rollback-sha <40-character-origin-master-sha>
```

Only a sanitized report is printed. The raw JSON, receipt references, and
receipt digests are never returned in the report.
