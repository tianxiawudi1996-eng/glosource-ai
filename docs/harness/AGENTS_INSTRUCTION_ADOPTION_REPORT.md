# GloSource AI Root Agent Instruction Adoption Report

## Report Identity

- Adopted at: 2026-08-07T20:20:00+09:00
- Scope: repository instructions and local governance checks
- Canonical instruction: `AGENTS.md`
- Drift command: `npm run harness:instructions`
- Product lifecycle at adoption: brownfield `P10 Release Readiness / blocked`
- External actions: 0

## Input Audit

The supplied global-instruction attachment contained a useful generic web-development contract, but it was not safe to copy verbatim:

- the full body appeared twice;
- chat timestamp and speaker-prefix artifacts were embedded in headings and tables;
- the 12-step generic lifecycle duplicated the repository's machine-readable P00-P16 lifecycle;
- Controller/Service/Repository and mandatory PostgreSQL assumptions were generic rather than mapped to this Next.js App Router application;
- it did not encode the separate KR and EN product, quota, payment, and evidence contracts;
- it did not reflect the current manual promotion, provider-configuration, dirty-provenance, and external-approval gates;
- the existing managed Next.js instruction block had to be retained exactly.

## Adopted Contract

The root `AGENTS.md` now provides one repository-specific entrypoint for:

- instruction precedence and fact/assumption/unknown separation;
- KR `/` free-beta and EN `/en` commercial product boundaries;
- mandatory repository and lifecycle calibration;
- testable Goal/Specification framing and phase completion rules;
- the installed npm, Next.js 15, React 19, TypeScript, Drizzle, Neon/PostgreSQL, NextAuth, Polar, Toss, and Vercel boundaries;
- App Router-oriented request, domain, data, and provider responsibilities;
- authentication, authorization, privacy, secret, rate-limit, and fail-closed rules;
- migration provenance, atomicity, backup, rollback, and production-write approval;
- responsive, accessible, evidence-honest KR/EN UI and content;
- risk-proportional tests and honest build/deployment completion;
- git, provider, outbound, payment, SNS, and external-effect approval boundaries;
- documentation, failure memory, orchestration, stop conditions, and final reporting.

The generic 12-step process was not installed as a second lifecycle. Its useful requirements were mapped into the existing P00-P16 prompts and the root operating rules, preserving one state machine.

## Enforceable Drift Guard

`scripts/check-agent-instructions.ts` fails when:

- a required GloSource instruction section is missing or duplicated;
- the product contract, lifecycle manifest/state, or task queue reference disappears;
- a documented required npm command no longer exists in `package.json`;
- the managed Next.js rule block changes unexpectedly;
- a pasted chat timestamp/speaker artifact contaminates the file;
- the top-level contract is duplicated;
- the file exceeds a 30,000-character maintainability boundary.

The check is exposed as `npm run harness:instructions`, covered by `tests/agent-instructions.test.ts`, and included in `scripts/harness-precommit.sh`.

## Verification Receipt

| Check | Result |
|---|---|
| Instruction drift command | clean |
| Focused instruction tests | 3/3 pass |
| Full repository tests | 200/200 pass |
| TypeScript | pass |
| ESLint | 0 errors; 1 pre-existing unrelated warning |
| Lifecycle validator | clean |
| Main state JSON | clean |
| Harness placeholder scan | clean |
| Sensitive-string scan | clean |
| Diff whitespace check | pass; line-ending warnings only |

The production build was not rerun because this increment does not change application runtime code. The last recorded 2026-08-04 build remains green with 89 routes.

## Boundaries and Follow-up

- The lifecycle remains blocked at P10; instruction adoption does not make the product release-ready.
- Historical P00-P09 phases were not backfilled.
- No Vercel/GitHub setting, secret, provider payload, database, payment, email, SNS, commit, push, workflow, or deployment action ran.
- No new failure-memory document was created: this was a proactive instruction adoption, not a newly observed runtime incident. The drift tests are the durable prevention artifact.
- The existing dirty worktree remains unresolved and must be provenance-reviewed before release.

## Adoption Decision

The supplied global principles are adopted in a deduplicated, project-specific, machine-checked form. `AGENTS.md` is now the root agent entrypoint, while product truth remains in `docs/requirements` and lifecycle truth remains in `docs/harness/lifecycle`.
