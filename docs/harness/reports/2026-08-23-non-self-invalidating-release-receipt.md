# 2026-08-23 Non-self-invalidating Local Release Receipt

## Problem

A tracked post-build receipt changes Git `HEAD` when committed. The archive then points to the previous commit, so documenting successful packaging immediately makes that package stale. The static READY entry also caused a completed local package to be selected again.

## Decision

Keep the generator, schema, checker, tests, and operating contract tracked. Keep each exact artifact receipt under the existing ignored private Harness root, keyed by the full candidate SHA. Current status is resolved by command output rather than a self-referential SHA in tracked JSON or Markdown.

## Enforced flow

1. Require exact clean `HEAD` and a `.tgz` under `dist/`.
2. Read the manifest from the archive and bind it to current `HEAD`.
3. Re-extract the actual archive into an OS temporary directory.
4. Reject sensitive filenames and non-empty all-zero files.
5. Start only the extracted `server.js` on `127.0.0.1` with generated smoke-only auth configuration and a non-routable local database fixture.
6. Require HTTP 200 for `/`, `/en`, `/api/auth/session`, product contract 7/7, and zero runtime fatal/unhandled/uncaught/error tokens.
7. Stop the child process, remove extraction output, and atomically write a sanitized ignored receipt.
8. Recheck the receipt against current clean `HEAD`, archive path, SHA-256, byte size, and manifest whenever work resumes.

Windows process cleanup treats either an exit code or a termination signal as a
completed child process; this prevents a successful `SIGTERM` cleanup from being
misreported as a smoke failure.

## Safety boundary

- The child process receives an OS execution allowlist and generated smoke-only variables, not the parent process environment or Production secrets.
- Receipt reports exclude generated values, raw logs, cookies, tokens, database URLs, provider payloads, and identities.
- The receipt proves only local artifact integrity and smoke for one candidate. It does not prove CI, staging, backup, restore, rollback, provider protections, approval, migration, deployment, or customer value.

## Verification contract

Before the follow-up commit: focused receipt/package/readiness tests, full suite, TypeScript, ESLint, build, Harness/state/placeholder/sensitive/diff checks. After the commit: rebuild/package that exact new HEAD, create the ignored receipt from the exact archive, require `readiness:release-receipt` ready, and recheck a clean worktree.
