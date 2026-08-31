# 2026-08-18 Code and Product Review Remediation

## Status

- Local implementation: evidence-backed complete.
- Lifecycle: P10 remains `blocked`; no phase advancement was recorded.
- External effects: none. No commit, push, workflow dispatch, deployment, provider mutation, secret entry, or production database change ran.

## User outcome

- KR anonymous free access is enforced server-side as five searches with one supplier preview per search; gated supplier details are removed from both responses and persisted history.
- EN free usage is displayed as a monthly counter, and the assistant cannot route EN buyers into a China-sourcing action.
- Concurrent quota admission now counts committed usage and active reservations atomically before allocating a unique slot.
- KR and EN quota/history buckets remain separate. Legacy rows with an attributable KR-only action count only in KR; ambiguous legacy `source` rows count in neither bucket and are not rewritten.
- Release checks now bind a clean standalone archive to the current HEAD and exact Vercel/GitHub target contract without printing secret values.

## Changed areas

- Entitlement and history redaction: source, Factory Direct, WeChat, free-access helpers, and focused tests.
- Quota integrity: reservation schema and migration `0005_handy_iron_fist`, request reservation/finalize/release paths, exact-surface history filtering, and concurrency tests.
- EN product contract: monthly counter, Korea-only assistant/tool behavior, and client contract tests.
- Release governance: promotion concurrency, tracked production target, archive manifest validation, sanitized control-plane secret-name checks, and release tests/documentation.

## Verification evidence

- `npm run verify:product`: 229/229 tests passed; TypeScript passed; ESLint reported 0 errors and 16 pre-existing warnings.
- `npm run build`: Next.js 16.3.0 production build passed with 89 routes; the existing Edge Runtime deprecation warning remains.
- Focused quota suite: 9/9 passed, including A/B reservation, B-first finalization, and C rejection.
- Local runtime on port 3106: `/` 200, `/en` 200, `/billing` 307, `/en/billing` 302.
- `growth:live-contract`: 7/7 passed against the local runtime.
- `/api/auth/session`: 500 under the local process because Auth.js rejected the untrusted localhost host. This smoke is not recorded as passed.
- Harness instructions, lifecycle validation, placeholder/state/sensitive-string checks, and `git diff --check`: passed after the remediation.

## Remaining gates and risks

- Migration `0005_handy_iron_fist` has not been applied to staging or production, and real multi-connection PostgreSQL concurrency has not been exercised. Deployment requires approved migration, backup, restore, and rollback evidence.
- `.github/workflows/promote.yml` still allows `db:migrate` after checking only for `DATABASE_URL`; it does not mechanically consume a candidate-bound backup/restore/rollback receipt or the control-plane readiness result. Production dispatch remains prohibited until an approved evidence contract and protected-job preflight exist.
- GitHub Production still requires an independent reviewer, self-review prevention, and fresh `G_RELEASE` plus `G_PRODUCTION_CONTROL_PLANE_CHANGE` approvals.
- The working tree is intentionally dirty with this uncommitted remediation, so no release archive was generated and no promotion was attempted.
- Expired reservations do not block admission, but a long-term cleanup/retention job has not been defined.

## Recovery and next action

- Code rollback is the removal of this uncommitted working-tree increment.
- Database rollback must be designed and approved before applying migration `0005`; no database rollback command was inferred or run.
- Next READY local increment: define and test the candidate-bound promotion evidence contract and protected-job preflight. Provider settings, migration execution, commit, push, dispatch, and deployment remain separate approval gates.
