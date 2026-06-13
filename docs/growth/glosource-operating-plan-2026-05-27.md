# GloSource AI Operating Plan

Date: 2026-05-27
Active market: international buyers on `/en`

## Operating Decision

GloSource AI should be operated as a narrow B2B sourcing product, not a broad AI directory.

The first wedge is:

- Buyer: Amazon FBA sellers, K-beauty founders, beauty distributors, and importers already interested in Korean products.
- Job: find Korean supplier candidates faster across EC21, BuyKorea/KOTRA, tradeKorea, and direct Korean factory sources.
- Output: ranked supplier candidates, AI-detected trust/certification signals, and an English RFQ draft.
- Boundary: GloSource AI is a research tool, not a sourcing agent, supplier auditor, logistics provider, or transaction middleman.

## Current Hard Gates

Paid acquisition is blocked until payment health passes.

Current blocker:

- `POLAR_ACCESS_TOKEN` cannot read `POLAR_STARTER_PRODUCT_ID`, `POLAR_PRO_PRODUCT_ID`, or `POLAR_AGENCY_PRODUCT_ID`.
- Polar returns `403 insufficient_scope`.
- Required fix: create a Polar Organization Access Token for the same organization with `products:read` or `products:write`, then update `.env.local`.

Public social proof is blocked until there are approved real or clearly labeled demo case studies.

Current blocker:

- `case-study-candidates-2026-05-27.json` has zero approved candidates.
- No testimonials, user quotes, or "verified supplier" claims may be published without evidence.

## What We Can Do Now

Allowed immediately:

- SEO content that teaches sourcing, certification checks, RFQ writing, and platform comparison.
- Founder-led educational posts with clear disclaimers.
- Direct one-to-one conversations where the offer is a free supplier shortlist for a specific product.
- Community replies that answer the question first and only mention GloSource AI when directly relevant.
- Social dry-runs and draft preparation.
- Product and funnel QA.

Not allowed yet:

- Paid ads.
- Product Hunt launch.
- High-volume cold outbound.
- Unsupported testimonials.
- Claims that suppliers are verified unless source URL and quality gate evidence exist.

## 14-Day Execution Plan

### Days 1-2: Revenue Safety

- Fix Polar token scope.
- Run `npm run growth:payments`.
- Complete a real low-cost Starter checkout test.
- Confirm webhook receives payment event.
- Confirm subscription activates plan and dashboard quota.
- Confirm cancellation works or escalates cleanly to support.

Acceptance:

- `npm run growth:payments` passes.
- `npm run growth:acquisition:gate` no longer blocks paid acquisition for payment reasons.

### Days 3-4: Trust Base

- Keep all EN support/contact surfaces on `hello@glosource.ai`.
- Add LinkedIn company profile only after the real profile exists.
- Build or approve one demo case study from a controlled search, clearly labeled as a demo.
- Add real limitations wherever results are shown: AI-estimated signals, not audits.

Acceptance:

- `npm run growth:audit` passes.
- Brand consistency report has no Gmail warning on EN surfaces.
- One approved demo case study exists, or public case studies remain blocked.

### Days 5-8: Buyer Content

Publish or refresh pages around high-intent searches:

- Korean cosmetics manufacturers for private label.
- Korean supplier verification: MFDS, HACCP, KC.
- EC21 vs BuyKorea vs tradeKorea.
- Korean beauty OEM MOQ and lead times.
- RFQ email template for Korean manufacturers.

Acceptance:

- Each post has a CTA to `/en#sourcing-tool`.
- Each post avoids fake proof and includes due-diligence caveats.
- Sitemap/build includes the posts.

### Days 9-12: Direct Demand

- Build a 50-lead list from K-beauty stores, distributors, Amazon sellers, and importers.
- Send only personalized messages.
- Offer to run one free supplier shortlist for a specific product.
- Log reply, search, signup, checkout click, and paid conversion.

Acceptance:

- At least 30 personalized messages sent.
- Reply rate and site visits recorded.
- No bulk-spam sequence until reply quality is known.

### Days 13-14: Scorecard

- Run daily and weekly growth reports.
- Add manual metrics: visits, searches, signups, checkout clicks, paid conversions, MRR.
- Decide the next experiment from bottleneck data:
  - If visits are low, ship more SEO/community.
  - If searches are low, improve landing CTA and examples.
  - If signups are low, improve registration trust and free quota copy.
  - If checkout clicks are low, improve pricing proof.
  - If payments fail, keep all paid acquisition blocked.

## Daily Command Sequence

Run:

```bash
npm run growth:daily
npm run growth:social:dry-run
npm run growth:seo
npm run growth:leads
npm run growth:acquisition:gate
```

For code/funnel changes, also run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Weekly Scorecard Fields

Track these manually until analytics automation is complete:

- Visits
- Free searches
- Successful supplier result rate
- RFQ copy rate
- Signups
- Checkout clicks
- Paid conversions
- MRR
- Top product categories
- Top failed queries
- Top acquisition source

## Positioning

Use this short positioning consistently:

> GloSource AI helps international buyers find Korean supplier candidates from EC21, BuyKorea/KOTRA, tradeKorea, and direct Korean factory sources, with AI trust signals and an English RFQ draft in about 90 seconds.

Use this disclaimer consistently:

> GloSource AI is a supplier research tool. Trust scores and certification mentions are AI-detected signals, not third-party audits. Buyers must verify suppliers directly before ordering.
