# P10 Release Readiness Evidence Audit

## Report Identity

- Audited at: `2026-08-09T20:23:48+09:00`
- Lifecycle run: `GLO-BROWNFIELD-20260807`
- Phase: `P10 Release Readiness`
- Candidate branch: `codex/p10-provenance-reconstruction`
- Candidate HEAD: `70457e7f883ef55804ca91129bf913f60a508c7b`
- Result: `blocked`
- Phase completion report generated: no

## Goal and Scope

Re-audit the exact reconstructed candidate after the approved provenance commits. Confirm clean Git provenance, required Production configuration names, GitHub Production protection, artifact identity, and approval readiness without changing providers, secrets, branches, databases, or deployments.

The pre-receipt worktree was clean. The audit receipt, matching harness records,
and the Windows-checkout portability fix are subsequent local changes. They are
not committed and the generated diagnostic package therefore records
`source.dirty=true`.

## Candidate and Provenance

- `git status --porcelain=v1`: empty before this receipt
- Local `master...HEAD`: candidate is 25 commits ahead and 0 behind
- `origin/master...HEAD`: candidate is 15 commits ahead and 0 behind
- The five reconstructed increments culminate in `70457e7 feat(harness): govern the full product lifecycle`.
- A diagnostic standalone archive was built from the current dirty worktree. Its
  manifest points to `70457e7f883e` and records `dirty=true`; it is not a clean
  provenance artifact for Production promotion.

Conclusion: the prior mixed dirty provenance blocker was resolved for the
pre-receipt candidate. Build, archive integrity, and local smoke are green, but
`CLEAN_PROVENANCE_VERIFIED` is no longer met for the uncommitted fixed source.

## Configuration and Control-Plane Audit

### Local process

- Required names: 22
- Configured names: 17
- Missing names: `AUTH_URL`, `AUTH_TRUST_HOST`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_WEBHOOK_SECRET`
- Release archive present: yes, diagnostic only (`dirty=true`)
- Values included: no

### Vercel Production

- Query status: verified read-only
- Linked project and target match: yes
- Required names: 22
- Configured names: 20
- Missing names: `AUTH_TRUST_HOST`, `DATAGO_SERVICE_KEY`
- Values included: no

### GitHub Production

- Environment exists: yes
- Required-reviewer rule: absent
- Required reviewer count: 0
- Self-review prevention: not confirmed enabled
- Deployment branch policy: not configured
- Reviewer identities included: no

## P10 Exit Gate

| Exit condition | Status | Evidence |
|---|---|---|
| `CLEAN_PROVENANCE_VERIFIED` | blocked for current package | pre-receipt `70457e7` was clean; package manifest records `dirty=true` after the portability fix and audit records |
| `REQUIRED_CONFIG_NAMES_VERIFIED` | blocked | Vercel Production 20/22 |
| `RELEASE_ARTIFACT_SMOKE_GREEN` | met locally, not promotable | build/package succeeded; blocked files 0; all-zero files 0; required routes 200; product contract 7/7 |
| `CHANGE_ROLLBACK_APPROVED` | blocked | remediation preferences and fresh approvals absent |
| `G_RELEASE` | absent | no fresh approval reference |
| `G_PRODUCTION_CONTROL_PLANE_CHANGE` | absent | no fresh approval reference |

P10 remains blocked. P11 staging/UAT was not started.

## Reproduction and Expected Result

- `npm run lifecycle:validate` -> clean
- `npm run lifecycle:status` -> P10 blocked with four blockers and two pending approvals
- `npm run harness:instructions` -> clean
- `npm run readiness:product` -> expected blocked; local process 17/22 and no archive
- `npm run readiness:control-plane` -> expected blocked; Vercel 20/22 and GitHub protections absent
- `npm run verify:product` -> 201/201 tests, TypeScript 0 errors, ESLint 0 errors and 1 pre-existing warning
- `npm run package:product` -> build and diagnostic standalone archive succeeded
- archive integrity -> 3,080 entries, blocked files 0, all-zero files 0
- package smoke with local environment injection -> `/`, `/en`, `/api/auth/session` HTTP 200; product contract 7/7

Expected P10-ready state: all 22 required Vercel Production names present, required reviewer and self-review/branch protections configured, a package built from exact clean candidate and smoke-tested, and both approval references recorded.

## External-Effect Receipt

- Provider setting writes: 0
- Secret values read or printed: 0
- Git stage, commit, push, PR, workflow dispatch, promotion: 0
- Local build and diagnostic package: 1
- Staging or Production deployment: 0
- Database migration or ingest: 0
- Email, SNS, payment, or paid action: 0

## Decision and Recovery

Keep lifecycle state at `P10 / blocked`. The next safe transition requires a
committed clean candidate, human remediation preferences, separate authorization
for Vercel/GitHub control-plane changes, fresh `G_RELEASE` and
`G_PRODUCTION_CONTROL_PLANE_CHANGE` references, and a new clean-candidate package
and smoke run after those blockers are cleared.

## Diagnostic Artifact

- Archive: `dist/glosource-ai-0.1.0-20260809T145408205Z.tgz`
- Size: `43,773,591` bytes (`41.75 MiB`)
- SHA-256: `16733E1A4A06957EA3BD5895AC55A1755D7E7720045FA30742319FABB05A79A9`
- Manifest: product `GloSource AI`, version `0.1.0`, commit `70457e7f883e`, `dirty=true`, `secretsIncluded=false`
- Promotion status: not eligible because clean provenance and Production control-plane gates are not met

## Production Dependency Security Audit

- Command: `npm audit --omit=dev --json` (read-only; no automatic fix)
- Production dependency count: 98
- Result: critical 2, high 6, moderate 5, total 13
- Direct critical path: `next-auth@5.0.0-beta.31` through `@auth/core<=0.41.2`
- Direct high paths include `next@15.5.20` and `@auth/drizzle-adapter@1.11.2`
- Official npm candidates observed on 2026-08-09: `next-auth@5.0.0-beta.32`,
  `@auth/core@0.41.3`, `@auth/drizzle-adapter@1.11.3`, and
  `next@15.5.23`
- `npm audit fix` was not run because its proposed dependency graph includes
  migration-tool downgrade risk and cannot replace targeted compatibility tests.
- Next authorized increment: execute
  `docs/operations/P10_AUTH_SECURITY_REMEDIATION_METAPROMPT.md`; Auth.js critical
  remediation first, Next.js/high advisories in a separate increment.

### Auth.js Remediation Result

- Completed locally at `2026-08-09T23:55:56+09:00`.
- `next-auth`: `5.0.0-beta.31` -> `5.0.0-beta.32`
- `@auth/drizzle-adapter`: `1.11.2` -> `1.11.3`
- Transitive `@auth/core`: `0.41.2` -> `0.41.3`
- Transitive `jose`: `6.2.3` -> `6.2.8`
- Production audit after remediation: critical 0, high 5, moderate 5, total 10.
- Focused admin/internal/session security tests: 6/6.
- Full product verification: 201/201, TypeScript 0 errors, ESLint 0 errors
  with one pre-existing warning.
- Rebuilt standalone package: 3,080 entries, blocked files 0, all-zero files 0,
  required routes HTTP 200, product contract 7/7.
- No provider mutation, secret entry, commit, push, or deployment was performed.
- Remaining security increment: targeted `next@15.5.23` and
  `@next/env@15.5.23` remediation for the direct Next.js high advisory, with
  its own build and runtime regression cycle.

### Next.js Backport Result (2026-08-10)

- Applied the official npm `backport` versions `next@15.5.23` and
  `@next/env@15.5.23` as exact dependencies; React and React DOM remain 19.2.4.
- No codemod was run because this is a 15.5.x patch, not a major migration.
- The official upgrade pages could not be fetched by the browser tool because
  of their Markdown content type, and the installed package did not contain
  `node_modules/next/dist/docs`; these sources are not claimed as read.
- npm currently marks `next` versions through `16.3.0-preview.10` vulnerable
  and offers only `next@16.3.0` as a semver-major fix. The direct high advisory
  therefore remains after the 15.5.23 backport.
- Regression evidence is green: 201/201 tests, TypeScript/ESLint errors 0,
  Next.js 15.5.23 production build with 89 pages, required routes HTTP 200,
  product contract 7/7.
- A new archive was intentionally not created because the security success
  criterion was not met. The prior `20260809T145408205Z` archive contains
  Next.js 15.5.20 and is stale relative to the current worktree.
- Next.js 16.3.0 migration is out of this patch scope and requires its own
  migration plan, official guide review, codemod/API compatibility assessment,
  and full regression cycle.

### Next.js 16 Migration and Packaging Follow-up (2026-08-10)

- Official Next.js 16 upgrade and codemod guidance was reviewed before changing
  the major version. The migration was kept local and did not alter providers,
  secrets, databases, branches, or deployment.
- Exact runtime/tooling versions now resolve to `next@16.3.0`,
  `@next/env@16.3.0`, and `eslint-config-next@16.3.0`; React and React DOM remain
  `19.2.4`.
- `middleware.ts` was migrated to `proxy.ts` with the same Auth.js wrapper and
  matcher. The Next 16 middleware-convention deprecation warning is gone; the
  existing Edge Runtime deprecation warning remains and is separately queued.
- Next 16 flat ESLint configs replaced the incompatible `FlatCompat` wrapper.
  Verification has 0 errors and 16 warnings from stricter React Hooks rules;
  those rules are warnings for this bounded migration and are not a claim that
  the UI cleanup is complete.
- `npm run verify:product`: 201/201 tests, TypeScript 0 errors, ESLint 0 errors.
- `npm run build`: Next.js 16.3.0/Turbopack, 88 routes, exit 0.
- Production-only audit after targeted patch updates (`undici@7.29.0`,
  `dompurify@3.4.13`): critical 0, high 0, moderate 4, total 4. The remaining
  moderate findings are dev/tooling paths (`esbuild` through `drizzle-kit` and
  `tsx`); the full unfiltered audit still reports two high dev-only findings.
- `npm run package:product`: success after adding Windows-safe symlink
  dereferencing to `scripts/package-release.ts`. Latest diagnostic artifact:
  `dist/glosource-ai-0.1.0-20260809T223844953Z.tgz`, 36,244,023 bytes,
  2,845 entries, SHA-256
  `6CB653377D92082886EB4472B0A164F4C342A8010E466046F350705FE5B247E8`.
  Manifest reports `dirty=true`, `secretsIncluded=false`, required environment
  names 22, blocked files 0, and all-zero files 0.
- Local standalone smoke passed with `/`, `/en`, and `/api/auth/session` all
  HTTP 200; `growth:live-contract` passed 7/7.
- `readiness:product` remains intentionally blocked: local process 17/22 with
  missing names `AUTH_URL`, `AUTH_TRUST_HOST`, `UPSTASH_REDIS_REST_URL`,
  `UPSTASH_REDIS_REST_TOKEN`, `RESEND_WEBHOOK_SECRET`, and the source tree is
  dirty. Vercel/GitHub control-plane blockers and approval gates remain
  unchanged from this report's earlier audit.
