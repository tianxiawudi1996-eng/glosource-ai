# P10 Recommended Inputs and Isolated Rehearsal — 2026-08-29

## Result

The non-contract duplicate Vercel project no longer leaves PR #1 red. A
branch-only, non-sensitive build placeholder was added to Preview and the exact
failed Preview deployment was redeployed to `preview`; both Vercel checks and
GitHub verification are green.

An isolated PostgreSQL 16 rehearsal also proved that the six journal-ordered
SQL migration files can build the candidate schema from scratch, that a
custom-format backup can be restored, and that the rollback SHA's legacy
insert/read shape remains compatible with the forward schema. This was local,
ephemeral, and synthetic. It is not the required external staging migration,
candidate-bound backup receipt, or full rollback deployment receipt, so P10
remains blocked.

## Recommended inputs applied

- Duplicate Vercel target: `mubinkims-projects/glosource-ai-68c4`.
- Environment: Preview only.
- Git branch: `codex/p10-provenance-reconstruction` only.
- Variable: `DATABASE_URL`, non-sensitive loopback CI placeholder; no
  Production database access.
- Rehearsal environment: disposable local `postgres:16-alpine` container,
  loopback-only random port, generated temporary credentials, synthetic data.
- Candidate/rollback relation: current feature candidate with
  `origin/master` as its verified Git ancestor. Exact candidate identity is
  resolved dynamically after tracked report synchronization.

## Duplicate Preview evidence

- Environment listing showed exactly one branch-scoped Preview variable name:
  `DATABASE_URL`; no value was read or printed.
- Redeployed Preview:
  `https://glosource-ai-68c4-9bfd9nefz-mubinkims-projects.vercel.app`.
- Vercel inspection: target `preview`, status `Ready`.
- PR #1 checks: `verify`, `Vercel - glosource-ai`,
  `Vercel - glosource-ai-68c4`, and Vercel Preview Comments passed;
  Production `promote` skipped as designed.

## Isolated database rehearsal evidence

The first attempt intentionally used the repository command
`npm run db:migrate`. It failed before DDL because the installed
`@neondatabase/serverless` driver only connects to supported remote
WebSocket-backed databases and cannot connect to the loopback PostgreSQL
container. No remote or Production database was substituted.

The fallback applied the exact journal order with PostgreSQL `psql` inside the
isolated container:

- PostgreSQL image ID:
  `sha256:75f5a96988cdf694a215073c3e9c001b706b371e2f94df3967f2efdec2787f6b`.
- Journal-ordered SQL migrations applied: 6 (`0000` through `0005`).
- Data policy: synthetic only; Production/staging data accessed: false.
- Ephemeral custom-format backup: 37,206 bytes.
- Backup SHA-256:
  `4407cd9fa339045cea1eb3131d100706d4739e2c727b5d6cddac24984e93b9d5`.
- Restore verification `1:1:1`: synthetic user present, quota reservation
  present, and `search_history.surface` present.
- Rollback-SHA compatibility probe: legacy `usage_logs` and `search_history`
  insert/read shapes both passed against the restored forward schema.
- Transaction cleanup verification `0:0`: rehearsal writes were rolled back.
- Disposable containers were removed after each attempt.

## Claim ceiling and remaining gates

This evidence proves only a local SQL-bundle and recovery-procedure rehearsal.
It does not prove that `drizzle-kit migrate` succeeds against the actual
staging provider, that the staging schema matches Production, that a
candidate-bound operational backup can be restored, or that the previous
artifact can pass full application smoke against the migrated database.

P10 therefore retains these blockers:

1. `STAGING_MIGRATION_REHEARSAL_MISSING`
2. `BACKUP_RESTORE_RECEIPT_MISSING`
3. `ROLLBACK_REHEARSAL_RECEIPT_MISSING`
4. `G_RELEASE_APPROVAL_ABSENT`

The recommended next input is a separately named staging PostgreSQL target
with synthetic-only data and a provider-supported `DATABASE_URL`. Production
must not be reused. After the exact final candidate is fixed, the operator must
run `db:migrate`, backup→restore, and previous-artifact application smoke there,
then provide sanitized receipt references and digests. A fresh `G_RELEASE`
must bind that exact candidate and rollback SHA; it cannot be inferred from
this rehearsal or from prior control-plane approval.

## External-effect boundary

Performed: one branch-only duplicate-project Preview variable update and one
Preview redeployment. Not performed: workflow dispatch, staging or Production
database access, Production migration, backup or restore, merge, master push,
Production deployment, rollback execution, payment, or publication.
