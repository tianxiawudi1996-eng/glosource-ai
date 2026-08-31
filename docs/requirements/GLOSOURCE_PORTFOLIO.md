# GloSource AI Product Portfolio Contract

This document is the source of truth for the two products served by one application.

| Contract | Korean service | Global service |
| --- | --- | --- |
| Route | `/` | `/en` |
| Buyer | Korean companies | International buyers |
| Sourcing direction | Korea to overseas markets | Overseas buyers to Korean suppliers |
| Commercial status | Free beta / waitlist | Live commercial service |
| Currency / checkout | No checkout until legal launch | USD / Polar MoR |
| Free anonymous use | 5 searches per day | Disabled |
| Free member use | 5 searches per month | 3 searches per month |
| Free result | One supplier preview | One supplier preview |
| Paid quotas | Planned only; not for sale | Starter 40, Pro 100, Business 300 |

## Non-Negotiable Invariants

1. The Korean service remains free beta and its Toss checkout stays closed until business registration and an explicit release flag.
2. A Polar subscription unlocks only the global service.
3. Usage quotas are counted independently by `surface` (`kr` or `en`).
4. Korean and global free-credit buckets never share keys.
5. A government-registry match is evidence about a candidate, not GloSource endorsement or supplier verification.
6. Acquisition, activation, paid conversion, retention, and revenue reporting must be segmented by service.

## Release Gate

Run these checks before release:

```bash
npm test
npx tsc --noEmit
npm run build
GLOSOURCE_BASE_URL=http://localhost:3000 npm run growth:live-contract
```

Run `npm run db:migrate` before deploying application code that writes `usage_logs.surface`.
Keep `KR_COMMERCIALIZATION_ENABLED` absent or `false` until business registration, required legal disclosures, Toss production QA, and launch approval are complete.
