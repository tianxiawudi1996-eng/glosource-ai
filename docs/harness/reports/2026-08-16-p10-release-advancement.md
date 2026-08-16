# P10 Release Advancement — 2026-08-16

## Status

`blocked` — local verification, clean-provenance packaging, and the Vercel
Production environment-name contract are green. Production promotion is not
safe yet because the only configured GitHub environment reviewer is the current
operator account while `prevent_self_review=false`.

## Fixed target

- Repository: `tianxiawudi1996-eng/glosource-ai`
- Branch: `codex/p10-provenance-reconstruction`
- Exact release candidate: `3c5ca96bbba6aab56562a44819f8874e9ab0bb0b`
- Vercel project: `team_1O8DJuyjKpmyIUqPSadnA3Cv` / `prj_YWNLp4TP9OQKt6jvSPVMfYg0QdfA` (`glosource-ai`)
- GitHub environment: `Production`

## Live control-plane evidence

- `npm run readiness:control-plane`: Vercel Production 22/22 required names,
  target match true, values not included.
- GitHub Production: one required reviewer, deployment branch policy present,
  `preventSelfReview=false`.
- Sanitized follow-up confirmed that the only required reviewer is the current
  authenticated operator. Enabling self-review prevention without first adding
  an independent reviewer would deadlock promotion, so no provider mutation was
  performed.

## Local verification

- `npm run verify:product`: 202/202 tests, TypeScript errors 0, ESLint errors 0,
  warnings 16.
- `npm run build`: Next.js 16.3.0, 88 routes, exit 0. The existing Edge Runtime
  deprecation warning remains.
- Local provenance commits: `6ee214d` (release/governance) and `3c5ca96`
  (UI/visual experience). Neither commit was pushed.
- `npm run package:product` from clean candidate `3c5ca96`: exit 0.
- Archive:
  `dist/glosource-ai-0.1.0-20260816T135231882Z.tgz`
- Size: 73,289,062 bytes
- SHA-256:
  `359FD0DAF3DAA0EFB3ACBF0EB2F591916706DD57C37F4E6AF949E63293F35C2F`
- Package inspection: 2,452 files, blocked files 0, all-zero files 0,
  `secretsIncluded=false`, `dirty=false`, manifest commit `3c5ca96bbba6`.
- Package smoke with local-process-only `AUTH_URL` and
  `AUTH_TRUST_HOST=true`: `/`, `/en`, `/api/auth/session` HTTP 200;
  `npm run growth:live-contract` 7/7.

## Remaining gates

1. Add or nominate an independent GitHub Production reviewer, then enable
   self-review prevention and repeat the sanitized control-plane audit.
2. Record `G_RELEASE` and `G_PRODUCTION_CONTROL_PLANE_CHANGE` against the exact
   clean SHA and approved rollback target before dispatch or deployment.

No secret value, push, workflow dispatch, deployment, database change, payment
action, or external send occurred in this loop. Two local commits were created
to establish clean provenance.
