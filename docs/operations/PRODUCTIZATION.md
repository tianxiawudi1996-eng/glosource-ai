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
