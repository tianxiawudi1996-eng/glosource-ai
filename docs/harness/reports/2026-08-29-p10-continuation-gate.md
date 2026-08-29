# P10 Completion Continuation Gate — 2026-08-29

## Result

The four action-time-approved external changes were executed against their exact branch, project, repository, environment, and account targets. The Production control-plane audit is now `ready`. The first remote verification exposed two independent portability/platform defects; both received minimal local fixes and full regression verification. P10 remains blocked on staging migration and recovery evidence plus a separate fresh Production release approval.

## Approved scope and exact targets

- Repository and PR: `tianxiawudi1996-eng/glosource-ai`, PR #1.
- Branch: `codex/p10-provenance-reconstruction`.
- Vercel target: `mubinkims-projects/glosource-ai`.
- GitHub environment: `Production`.
- Approved reviewer: `like2buyglobal-sudo`.
- Explicitly excluded: workflow dispatch, migration, merge, master promotion, Production deployment, and Production DB use from Preview.

## External changes performed

1. Added a non-sensitive build-only `DATABASE_URL` to Vercel Preview, scoped only to the approved branch. It points to a loopback CI placeholder and cannot reach Production data.
2. Pushed the approved candidate to the feature branch and updated PR #1; remote branch and PR head equality were verified.
3. Replaced the Production approval reviewer with `like2buyglobal-sudo`, removed the current operator from the reviewer list, enabled `preventSelfReview`, and preserved the existing custom branch policy.
4. Transferred Vercel Production `DATABASE_URL` directly from process memory to `gh secret set` stdin. The value was never written to a tracked or temporary value file, command argument, stdout, report, or Memory. Only the GitHub Production Secret name was queried afterward.

## First remote verification and corrections

- GitHub verify ran all 278 tests but failed two EN pixel-receipt tests with `SOURCE_DIGEST_MISMATCH`. The digest hashed CRLF bytes on Windows and LF bytes on Linux even though rendering was identical.
- The source digest now hashes canonical LF text. A regression test proves CRLF, CR, and LF equivalence. Existing measured 360×800 and 1440×900 rectangles were not altered; only their provenance digest was rebound to the canonical source.
- The target Vercel Preview passed compilation, TypeScript, and static generation 89/89, then Next 16.3.0 failed during Vercel adapter `onBuildComplete` because standalone packaging requested a root NFT trace the adapter build did not emit.
- `next.config.ts` now disables standalone output only when Vercel sets `VERCEL`; Vercel does not use the standalone directory. Local release builds still generate `.next/standalone/server.js` for the immutable archive workflow.

## Verification

- Focused EN receipt and release packaging tests: 14/14 pass.
- Full `npm test`: 279/279 pass.
- `npx tsc --noEmit`: pass.
- `npm run lint`: 0 errors, 16 existing warnings.
- Vercel-mode local build: Next.js 16.3.0, 89/89 pages, pass, standalone absent by design.
- Local release-mode build: Next.js 16.3.0, 89/89 pages, pass, standalone present.
- Structural EN balance: product-supporting 90%, culture-only 10%.
- Existing source-bound browser receipts remain clean: 360×800 at 93.9074%/6.0926% and 1440×900 at 93.8228%/6.1772%.
- `npm run readiness:control-plane`: `ready`; Vercel Production 22/22 and GitHub reviewer/self-review/branch-policy checks pass with no values or reviewer identities in the output.
- Instruction, landing-goal, lifecycle, STATE, placeholder, sensitive-string and diff checks are rerun on the final tracked candidate. Exact SHA, local release receipt, remote equality, GitHub CI, and Vercel Preview are verified dynamically after this report commit so this tracked report does not invalidate its own SHA.

## Current boundary

- The approved control-plane change authorization was used and is no longer pending.
- P10 is still `blocked`: staging migration rehearsal, candidate-bound backup→restore, rollback rehearsal, and fresh `G_RELEASE` evidence are absent.
- P11 was not started. No workflow dispatch, migration, backup/restore, merge, master promotion, Production deployment, payment, or external publication ran.
