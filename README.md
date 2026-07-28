# GloSource AI

GloSource AI operates two sourcing products in one Next.js application:

- `/`: Korean companies sourcing from overseas markets. This surface is a free beta and does not accept payment yet.
- `/en`: International buyers sourcing Korean manufacturers and K-products. This surface is commercially live and billed in USD through Polar MoR.

The binding product rules are documented in [GLOSOURCE_PORTFOLIO.md](docs/requirements/GLOSOURCE_PORTFOLIO.md). Route-specific contracts live in the same directory.

## Local Development

```bash
npm ci
npm run db:migrate
npm run dev
```

Open `http://localhost:3000` for the Korean service and `http://localhost:3000/en` for the global service.

## Quality Gates

```bash
npm test
npx tsc --noEmit
npm run build
GLOSOURCE_BASE_URL=http://localhost:3000 npm run growth:live-contract
```

`growth:live-contract` defaults to `https://glosourceai.com` when `GLOSOURCE_BASE_URL` is not set.

## Standalone Release

Run the complete verification, production build, and packaging flow with one command:

```bash
npm run release:product
```

The command writes a versioned `.tgz` archive and an unpacked standalone server to `dist/`. After extracting the archive, provide the environment variables listed in `RELEASE-MANIFEST.json` and start it with:

```bash
node server.js
```

## Product Boundaries

- Korean Toss checkout is fail-closed until business registration and the explicit `KR_COMMERCIALIZATION_ENABLED=true` release flag.
- Polar subscriptions unlock only the global service.
- Usage logs and quotas are segmented by `kr` and `en`.
- “Registry Match” is evidence, not GloSource supplier certification or endorsement.
