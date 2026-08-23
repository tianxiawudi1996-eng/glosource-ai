# GloSource AI Productization

GloSource AI ships as a Next.js SaaS. Vercel remains the primary production
target, while the repository can also produce a portable standalone Node.js
release for backup hosting, delivery, and archival.

## Release gates

```bash
npm ci
npm run verify:product
npm run package:product
```

`readiness:product` does not accept an archive based on filename or modification
time alone. The selected `.tgz` must contain one valid
`RELEASE-MANIFEST.json`, record `dirty=false`, use the current required
environment-name contract, and identify the current clean Git `HEAD`.

`readiness:control-plane` treats
`docs/operations/PRODUCTION_TARGET.json` as the tracked deployment-target
contract. The local Vercel link must match its exact organization ID, project
ID, and project name. The check also reads only the names of GitHub Production
environment secrets and confirms every name required by the tracked contract;
it never reads or prints secret values.

`verify:product` runs the complete automated test suite, TypeScript validation,
and ESLint. `package:product` creates a fresh production build and writes:

- `dist/glosource-ai-<version>-<timestamp>/`
- `dist/glosource-ai-<version>-<timestamp>.tgz`

The archive contains the traced Next.js server, runtime dependencies, public
assets, static assets, and `RELEASE-MANIFEST.json`. It deliberately excludes
common environment, private-key, credential-store, and local credential files.
Packaging also rejects all-zero files left by an interrupted standalone build.
Next.js standalone output can contain junctions or symlinks; the release copier
dereferences them so Windows packaging does not require symlink-creation
privileges.

## Non-self-invalidating local receipt

Tracked Harness files cannot safely store the exact post-build artifact receipt:
editing and committing that receipt changes `HEAD`, which immediately makes the
archive stale. GloSource therefore stores local package/smoke receipts under the
already ignored `reports/harness/private/local-release-receipts/` directory.

After creating an archive from a clean candidate, run:

```bash
npm run receipt:release -- --archive dist/<exact-archive>.tgz
npm run readiness:release-receipt
```

`receipt:release` fails unless the worktree is clean and the archive manifest is
bound to the exact current `HEAD`. It extracts the actual `.tgz` into an OS temp
directory, rejects blocked or all-zero files, starts only that extracted server
on `127.0.0.1` with generated smoke-only configuration, checks `/`, `/en`,
`/api/auth/session`, and runs the 7-route product contract. Raw logs and generated
values are discarded; only a sanitized candidate/archive/smoke receipt is written
atomically.

`readiness:release-receipt` derives the receipt filename from the current
40-character `HEAD`, then rechecks clean source, archive path, SHA-256, size, and
manifest binding. A code, archive, or receipt change therefore fails closed
without requiring a tracked documentation edit. This local receipt is not a
Production approval, provider audit, backup, restore, rollback, migration, or
deployment receipt.

## Runtime

Extract the archive, enter the packaged directory, configure the environment,
and start the server:

```bash
HOSTNAME=0.0.0.0 PORT=3000 node server.js
```

Use a reverse proxy or managed platform in front of a self-hosted instance.
TLS termination, request-size limits, rate limiting, and rolling deployment
coordination belong at that layer.

## Required production configuration

The package records the authoritative variable-name list in
`RELEASE-MANIFEST.json`. Core groups are:

- Database and authentication: `DATABASE_URL`, `AUTH_SECRET`, the public
  `AUTH_URL`, and `AUTH_TRUST_HOST=true` when running behind a trusted proxy
- AI sourcing: `GEMINI_API_KEY`
- Distributed quotas and rate limits: `UPSTASH_REDIS_REST_URL`,
  `UPSTASH_REDIS_REST_TOKEN`
- Transactional and inbound support email: `RESEND_API_KEY`,
  `RESEND_EMAIL_FROM`, `RESEND_WEBHOOK_SECRET`. `RESEND_FULL_API_KEY` is
  optional when `RESEND_API_KEY` already has read access; otherwise configure it
  as the read-capable inbound key.
- Global billing: Polar webhook, access token, product IDs, and public links
- Registry checks: `DATAGO_SERVICE_KEY`
- Operations: `CRON_SECRET`, `ADMIN_EMAIL`, `ADMIN_PUBLISH_SECRET`

Never put secret values inside the archive. Configure them in the deployment
platform or process environment.

Creating the `.tgz` archive requires a `tar` executable on the release machine.
Windows 10/11, macOS, and standard Linux build images normally provide one.

For self-hosting, set `AUTH_URL` to the public HTTPS origin. Only enable
`AUTH_TRUST_HOST=true` when the reverse proxy controls the forwarded host
headers; never expose the standalone Node.js process directly to the internet.

## Product boundaries

- Korean anonymous access remains five searches with one supplier preview.
- Korean paid checkout remains disabled until the legal commercialization flag
  is intentionally enabled.
- Global paid access uses Polar.
- “Registry Match” means matched evidence, not supplier endorsement.

### Legacy quota transition

Quota accounting never rewrites or guesses the surface of a legacy
`usage_logs.surface IS NULL` row. Exact `kr` and `en` rows count only in their
own bucket. Legacy `factory_direct`, `wechat`, and `image_analyze` actions are
unambiguously KR-only in the tracked route contract, so they count only toward
KR during their active quota window. A legacy `source` action is ambiguous and
temporarily counts in neither bucket; this can allow a small amount of quota
until those rows age out of the active window, but avoids charging the same
unknown event to both products. Legacy rows remain unmodified and hidden from
surface-specific history and dashboards.

## Promotion boundary

Production promotion runs share the repository-wide
`glosource-production-promotion` concurrency lock, so migrations cannot overlap
across refs.

Before `db:migrate`, the protected promotion job now requires one sanitized
`promotion_evidence_json` input and runs `readiness:promotion-evidence`. The
input is never committed, printed, or retained by the repository. The validator
fails closed unless the evidence binds all of the following to the checked-out
candidate and the current `origin/master` rollback SHA:

- the tracked Production target digest;
- the exact migration journal and SQL bundle plus planned migration IDs;
- a staging migration rehearsal receipt;
- a fresh candidate-bound database backup receipt and a restore-test receipt
  linked to that backup digest;
- a rollback rehearsal receipt for the exact candidate and rollback SHA;
- a fresh `ready` control-plane audit receipt;
- exact `G_RELEASE` and `G_PRODUCTION_CONTROL_PLANE_CHANGE` approval references.

Promotion evidence is valid for at most 24 hours. Backup, control-plane, and
both distinct approval references must be no older than 24 hours; staging,
restore, and rollback rehearsals must be no older than 30 days. Receipt
references and SHA-256 digests are accepted, but raw logs, provider payloads,
reviewer identities, database URLs, tokens, and secret values are outside the
contract.

GitHub may retain manual-dispatch inputs in workflow event metadata. For that
reason the input is intentionally a sanitized index of external receipts, not
the receipts themselves and never a place for secrets or raw logs.

Generate the non-secret context to which an external evidence packet must bind:

```bash
npm run readiness:promotion-context -- \
  --candidate-sha <exact-40-character-candidate-sha> \
  --rollback-sha <exact-40-character-origin-master-sha>
```

Context generation fails unless the candidate is the exact clean `HEAD` and the
rollback SHA is its Git ancestor. A digest generated from a dirty working tree
cannot be used as promotion evidence.

Then validate an ignored/private evidence file locally:

```bash
npm run readiness:promotion-evidence -- <private-evidence.json> \
  --candidate-sha <exact-40-character-candidate-sha> \
  --rollback-sha <exact-40-character-origin-master-sha>
```

The validator only proves that the supplied receipts are complete, fresh, and
bound to the current code and target. It does not create a backup, perform a
restore, query a provider, grant approval, run a migration, or authorize a
deployment. Independent reviewer protection, current provider evidence, actual
backup/restore execution, and fresh approvals remain external P10 gates.
