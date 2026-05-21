# GloSource AI Automation Schedule Runbook

Date: 2026-05-20  
Timezone: Asia/Seoul  
Source of truth: `data/growth/automation-schedule.json`

## Operating Mode

The Korean version is paused. Run acquisition, QA, trust proof, SEO, outreach, and payment checks for the English product only. Root traffic should resolve to `/en`, and public search/distribution assets should point to English routes.

## How to Use

Run the schedule printer at the start of a work session:

```bash
npm run growth:schedule
```

Then run the commands listed for the due tasks. The schedule is deliberately conservative: revenue and funnel safety checks run before acquisition work, and all public-facing marketing still requires human review.

## Daily Gate

At 09:00 KST, run:

```bash
npm run growth:audit
npm run growth:payments
```

If `growth:payments` fails, block paid ads, Product Hunt launch, and high-volume outbound until checkout, webhook, subscription activation, and cancellation are verified.

For Polar `403 insufficient_scope`, create a new production Organization Access Token in the same Polar organization as the products. Required scopes for the current health gate are `products:read`; include `subscriptions:read`, `subscriptions:write`, and `orders:read` before testing cancellation and subscription activation flows. Update `POLAR_ACCESS_TOKEN` in `.env.local`, then rerun `npm run growth:payments`.

At 09:30 KST, run:

```bash
npm run growth:cases
```

Only approved real or clearly labeled demo evidence can become a public case study, testimonial-like proof, social post, or video script.

## Weekly Cadence

Monday 10:00 KST:

```bash
npm run growth:seo
```

Wednesday 10:00 KST:

```bash
npm run growth:leads
```

Friday 16:00 KST:

```bash
npm run growth:weekly
```

The Friday report needs manual analytics updates: visits, free searches, verified result rate, RFQ copies, signups, checkout clicks, paid conversions, MRR, top acquisition source, and top failed queries.

## Pre-Deploy Gate

Before production deployment, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run growth:audit
npm run growth:payments
```

If payment health fails, deploy only when the changed files do not affect checkout, billing, auth, subscriptions, pricing, or webhooks.

## Claude Collaboration Notes

Claude can keep implementing individual agents or route changes. This schedule layer should remain the coordination contract:

- Add new automation jobs to `data/growth/automation-schedule.json`.
- Keep npm commands stable so CI, Claude, and Codex can run the same gates.
- Do not auto-post to Reddit, LinkedIn, X, email, or Product Hunt without human approval.
- Treat generated outreach and case studies as drafts until approved.
