# Korean Service Contract

## Job To Be Done

Help Korean companies discover and evaluate overseas supplier candidates without starting from fragmented foreign-language marketplaces.

## Commercial Contract

- Entry route: `/`
- Commercial status: free beta / waitlist
- Language: Korean
- Checkout: disabled; no Korean payment is accepted
- Anonymous trial: 5 searches per day
- Verified free member: 5 searches per month
- Free result: one supplier preview; full details and exports remain locked
- Planned paid plans are internal launch preparation only and are not offers for sale.

## Commercialization Release Gate

All conditions are required before Korean paid checkout can open:

1. Business registration and required Korean seller disclosures are complete.
2. Production Toss checkout, webhook, subscription activation, cancellation, refund, and receipt flows pass QA.
3. Pricing and terms receive launch approval.
4. `KR_COMMERCIALIZATION_ENABLED=true` is set deliberately in the production environment.

## Access Rules

- Anonymous access is permitted only on Korean billable sourcing routes.
- Korean usage is logged with `surface = 'kr'`.
- Polar subscriptions must never increase Korean quotas.
- The dashboard, account, and billing pages present free beta status and a launch waitlist, not paid checkout.

## Primary Metrics

- Search completion rate
- Trial-to-registration conversion
- Trial-to-waitlist conversion
- Waitlist-to-beta activation
- Cost per completed supplier shortlist
- 30-day beta retention
