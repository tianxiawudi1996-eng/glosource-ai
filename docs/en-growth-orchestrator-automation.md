# GloSource AI EN Growth Orchestrator Automation Plan

Date: 2026-05-16  
Active market: `/en` international buyers sourcing Korean suppliers  
Paused market: Korean users sourcing China/Korea from `/`

## Executive Summary

Claude Code's critique is directionally correct: `/en` growth depends less on more UI and more on trust, evidence, conversion QA, and repeatable distribution. The current codebase has already improved several originally flagged points:

- `/en/register` and `/en/login` exist and are English.
- `/en/blog` exists with initial SEO content.
- `/en/dashboard` and `/en/billing` exist.
- `/en` now uses `hello@glosource.ai` in visible primary contact areas.
- Agency pricing no longer repeats "Unlimited" twice on the landing page.
- `/en` includes a Twitter/X link.

However, the core business risk remains: the site needs an automated system that continuously proves the buyer journey works, turns real product usage into trustworthy public evidence, publishes content, and finds buyers without relying on manual heroics.

This document defines an orchestrator-driven organization of automation agents. The orchestrator assigns work, enforces acceptance gates, and prevents marketing from publishing unsupported claims.

## Current Finding Matrix

| Finding | Current status | Risk | Automation response |
|---|---:|---|---|
| English page sends users to Korean signup | Mostly fixed: `/en/register` is English | Regression risk | Route-locale QA agent checks every `/en` CTA weekly and before deploy |
| No real output / only simulation | Partially unresolved: blog exists, but real case-study evidence pipeline is not formalized | Trust and shareability failure | Evidence agent converts real verified searches into anonymized case studies |
| Gmail contact hurts B2B trust | Partially fixed on `/en`, still present in older pages/components | Trust leak | Brand consistency scanner blocks Gmail in EN surfaces |
| Agency plan repeats Unlimited | Fixed on `/en`, still check `/en/billing` | Copy quality | Pricing copy scanner |
| No social links | Partially fixed: X link only | Distribution weakness | Social profile + link inventory agent |
| No blog/SEO | Partially fixed: `/en/blog` exists | Needs scale and freshness | SEO content factory with review gate |
| No team/company story | Unresolved | B2B credibility gap | Trust page generator and founder story workflow |
| Payment must never break | Checkout links reachable, Polar API token recently returned 403 in local check | Revenue-critical | Payment QA agent runs live-safe checkout and webhook checks |

## Non-Negotiable Principles

1. **No fake testimonials.** Public proof must come from real user quotes, real verified case studies, or clearly labeled demos.
2. **No unverified supplier claims.** Case studies can show "candidate discovered" only when the source URL passed the verified supplier quality gate.
3. **No paid traffic before payment QA passes.** If checkout, webhook, plan activation, or cancellation cannot be verified, the orchestrator blocks paid campaigns.
4. **English funnel is the only active product.** Korean version is paused until explicitly reactivated.
5. **Every growth action must leave a measurable artifact.** Example: lead list, post URL, campaign URL, CTR, trial searches, signups, paid conversions.

## Target Operating Model

The orchestrator runs the growth system like a small company:

```text
Growth Orchestrator
├─ Funnel QA Squad
│  ├─ Locale Route QA Agent
│  ├─ Payment QA Agent
│  └─ Conversion Copy QA Agent
├─ Trust & Evidence Squad
│  ├─ Supplier Evidence Agent
│  ├─ Case Study Agent
│  └─ Brand Trust Agent
├─ Acquisition Squad
│  ├─ SEO Content Agent
│  ├─ Social Repurposing Agent
│  ├─ Community Outreach Agent
│  └─ Cold Lead Agent
└─ Analytics Squad
   ├─ Event Tracking Agent
   ├─ Weekly Metrics Agent
   └─ Experiment Scoring Agent
```

Each agent has a narrow responsibility, clear inputs, output files, and acceptance gates.

## Automation Architecture

### Data Sources

| Source | Purpose |
|---|---|
| App routes and codebase | CTA, locale, pricing, contact, social link regression checks |
| `usage_logs` | Search count, successful result count, product demand clusters |
| `payments` and `subscriptions` | MRR, paid conversion, active subscriber health |
| KV history | Raw sourcing outputs for anonymized case study candidates |
| Polar checkout links | Checkout availability and redirect checks |
| Polar API | Product, subscription, cancellation health checks |
| Search Console | SEO impressions, clicks, query ranking |
| Manual CRM CSV | Outreach leads, replies, demos, conversions |

### Required New Files

```text
docs/
  en-growth-orchestrator-automation.md
  growth/
    weekly-scorecard-template.md
    case-study-template.md
    outreach-playbooks.md

scripts/
  growth/
    audit-en-funnel.ts
    audit-brand-consistency.ts
    audit-polar-health.ts
    extract-case-study-candidates.ts
    generate-weekly-growth-report.ts
    generate-seo-briefs.ts
    score-outreach-leads.ts

data/
  growth/
    lead-sources.json
    seo-keywords.json
    case-study-candidates.json
    approved-case-studies.json
    outreach-log.csv
```

### Suggested NPM Scripts

```json
{
  "growth:audit": "tsx scripts/growth/audit-en-funnel.ts && tsx scripts/growth/audit-brand-consistency.ts",
  "growth:payments": "tsx scripts/growth/audit-polar-health.ts",
  "growth:cases": "tsx scripts/growth/extract-case-study-candidates.ts",
  "growth:seo": "tsx scripts/growth/generate-seo-briefs.ts",
  "growth:weekly": "tsx scripts/growth/generate-weekly-growth-report.ts"
}
```

If avoiding new dependencies, implement scripts as plain Node ESM or TypeScript compiled via existing `tsc`. If adding `tsx`, make it an explicit dependency decision.

## Agent Specifications

### 1. Locale Route QA Agent

Objective: prevent EN users from falling into Korean pages.

Checks:

- Crawl `/en`, `/en/login`, `/en/register`, `/en/billing`, `/en/dashboard`, `/en/blog`.
- Collect every internal link and form redirect.
- Fail if an EN auth/pricing/account CTA points to `/auth/*`, `/billing`, `/dashboard`, or Korean-only copy.
- Allow `/` only for explicit language switch labeled `KO` or `Korean version`.

Output:

```text
reports/growth/locale-route-audit-YYYY-MM-DD.json
```

Acceptance:

- 0 critical EN to KO auth leaks.
- 0 missing EN account routes.
- All `/en` forms show English error copy.

### 2. Payment QA Agent

Objective: ensure real buyers can pay and retain access.

Checks:

- `NEXT_PUBLIC_POLAR_STARTER_LINK`, `NEXT_PUBLIC_POLAR_PRO_LINK`, `NEXT_PUBLIC_POLAR_AGENCY_LINK` respond with valid redirect.
- `POLAR_*_PRODUCT_ID` exists for all plans.
- `POLAR_ACCESS_TOKEN` can query product API. A 403 blocks paid campaigns.
- Webhook endpoint exists at `/api/polar/webhook`.
- Test webhook fixture can create or update subscription in a local/staging DB.
- Cancellation endpoint can call Polar API or clearly falls back with an admin alert.

Output:

```text
reports/growth/payment-health-YYYY-MM-DD.json
```

Blockers:

- Checkout link unreachable.
- Polar product API returns 401/403.
- Webhook signature validation impossible due missing secret.
- Paid subscription does not activate plan.
- Cancellation silently fails.

### 3. Brand Consistency Agent

Objective: eliminate B2B trust leaks.

Checks:

- Scan `app/`, `docs/`, and email templates for `hello@glosource.ai`.
- For `/en` surfaces, require `hello@glosource.ai`.
- Check footer, Terms, Privacy, JSON-LD, billing alerts, cancellation alerts.
- Verify social profile links are present and not dead.

Output:

```text
reports/growth/brand-consistency-YYYY-MM-DD.json
```

Acceptance:

- EN pages expose only domain email.
- KO pages may use Korean operator email only if intentionally documented.
- Footer has contact, Terms, Privacy, X/LinkedIn or explicitly marks social as "coming soon" outside production.

### 4. Conversion Copy QA Agent

Objective: prevent sloppy pricing and unsupported claims.

Checks:

- Pricing cards have unique value propositions.
- No duplicate feature such as `Unlimited searches` repeated in the same plan.
- Every claim with a number has either a source, a local metric, or is clearly labeled as estimate.
- Search count and plan limits match `PLAN_LIMITS`.
- CTA labels are clear: "Start free search", "Get Starter", "Get Pro".

Acceptance:

- 0 duplicate plan bullets.
- 0 unsupported testimonials.
- 0 contradictory quota claims.

### 5. Supplier Evidence Agent

Objective: create real proof from actual product usage without exposing private data.

Inputs:

- Verified supplier outputs from `kvSaveHistory`.
- `qualityGate.acceptedCount > 0`.
- Product query and supplier count.

Process:

1. Pull successful verified searches.
2. Remove buyer-identifying data.
3. Group by vertical: K-beauty, K-food, fashion, electronics, industrial.
4. Flag high-quality examples:
   - 3+ verified suppliers.
   - Recognizable platform source: BuyKorea, EC21, tradeKorea, Direct.
   - RFQ generated.
   - No severe red flags.
5. Write candidates to `data/growth/case-study-candidates.json`.

Acceptance:

- No supplier is called "verified manufacturer" unless URL and quality gate passed.
- Case study status must be one of `draft`, `approved`, `published`, `rejected`.

### 6. Case Study Agent

Objective: replace fake/simulated proof with shareable real evidence.

Case study format:

```text
Title: Found 4 Korean collagen serum OEM supplier candidates in 92 seconds
Buyer type: Private-label skincare founder
Market: US
Product: Collagen serum OEM
Inputs: quantity, destination, certification needs
Results:
- 4 verified source URLs
- 2 MFDS/ISO signal candidates
- RFQ generated in English
Limitations:
- GloSource did not audit the suppliers
- Buyer must confirm certificates and samples
CTA: Run your own Korean supplier search
```

Outputs:

- `app/en/case-studies/page.tsx`
- `app/en/case-studies/[slug]/page.tsx`
- optional screenshots in `public/images/case-studies/`

Rules:

- User quotes require written permission.
- No invented names, countries, or star ratings.
- Demos are labeled `Demo search`, not `User result`.

### 7. SEO Content Agent

Objective: produce search-intent content that feeds trials.

Initial keyword clusters:

| Cluster | Example pages |
|---|---|
| K-beauty OEM | Korean cosmetics manufacturers, private label skincare Korea, Korean sheet mask OEM |
| K-food import | Korean snack suppliers, Korean ramen wholesale, HACCP Korean food manufacturer |
| Certifications | MFDS supplier verification, HACCP Korea, KC certification supplier |
| Platform comparison | BuyKorea vs Alibaba, EC21 vs tradeKorea, how to use KOTRA BuyKorea |
| RFQ templates | RFQ email to Korean manufacturer, cosmetics OEM RFQ template |

Automation flow:

1. Pull top product queries from usage logs.
2. Match to keyword clusters.
3. Generate SEO brief, not final article.
4. Human reviews brief.
5. Agent drafts post.
6. Human approves factual claims.
7. Publish through `app/lib/blog-posts.ts` or a structured post data system.

Acceptance:

- Each post has metadata, canonical URL, FAQ schema where relevant.
- Each post includes one CTA to `/en#sourcing-tool`.
- Each factual market number has a source URL in the post or an internal citation note.

### 8. Social Repurposing Agent

Objective: turn one approved case study into many distribution assets.

Outputs per case study:

- 1 LinkedIn post.
- 1 X thread.
- 1 Reddit-safe educational post, no hard sell.
- 3 short video scripts.
- 1 image carousel outline.
- 1 cold email snippet.

Rules:

- Reddit posts must lead with education, not "try my app".
- Include disclosure if founder posts about own product.
- Never post automatically to communities. Prepare drafts for human approval.

### 9. Community Outreach Agent

Objective: generate qualified conversations without spam.

Target communities:

- Reddit: beauty entrepreneurship, Shopify, Amazon FBA, import/export, small business.
- LinkedIn: cosmetics buyers, import managers, private label founders.
- Facebook groups: Amazon sellers, beauty entrepreneurs, Korean products importers.
- Indie communities: Product Hunt, Indie Hackers, Hacker News Show HN.

Workflow:

1. Agent finds 30 relevant discussions per week.
2. Scores each thread by buyer intent.
3. Drafts helpful reply with no link unless context permits.
4. Human approves and posts.
5. Log outcome in `data/growth/outreach-log.csv`.

Metrics:

- Replies posted.
- Profile visits.
- Site clicks.
- Free searches.
- Signups.
- Paid conversions.

### 10. Cold Lead Agent

Objective: create a repeatable outbound engine for the first 10 paying customers.

Lead sources:

- LinkedIn search for `K-beauty importer`, `cosmetics buyer`, `private label skincare`, `procurement manager`.
- Shopify stores selling Korean skincare.
- Amazon sellers with K-beauty listings.
- Beauty distributors in US, UK, Australia, Singapore, UAE.

Lead scoring:

| Signal | Points |
|---|---:|
| Sells Korean beauty/food already | +30 |
| Has wholesale/import language | +20 |
| Founder or buyer contact visible | +20 |
| Recent product launch | +15 |
| Uses generic supplier marketplace | +10 |
| No contact path | -30 |

Output:

```text
data/growth/outreach-leads-YYYY-MM-DD.csv
```

Email structure:

```text
Subject: Quick Korean supplier shortlist for [product]

Hi [Name],

I saw [company] sells [specific product/category].
I built GloSource AI to help buyers find Korean supplier candidates from EC21, BuyKorea/KOTRA, tradeKorea, and direct Korean factory sources.

If you send one product you are trying to source, I can run a free supplier shortlist and send the RFQ draft.

No agency fee. It is a research tool, not a sourcing middleman.

Best,
[Name]
```

Acceptance:

- No bulk spam without personalization.
- Max 50 cold messages/day until reply rate is known.
- Track reply, demo, search, signup, paid conversion.

### 11. Event Tracking Agent

Objective: make every marketing channel measurable.

Minimum events:

| Event | Trigger |
|---|---|
| `en_landing_view` | `/en` loaded |
| `en_free_search_started` | search submitted |
| `en_free_search_success` | suppliers returned |
| `en_quality_gate_failed` | no verified suppliers |
| `en_rfq_copied` | RFQ copied |
| `en_signup_started` | register page opened |
| `en_signup_completed` | registration success |
| `en_checkout_clicked` | Polar link clicked |
| `en_payment_webhook_received` | Polar webhook received |
| `en_subscription_active` | plan active |

UTM requirements:

```text
utm_source = linkedin | reddit | x | youtube | blog | cold_email | producthunt
utm_medium = organic | community | outbound | paid | referral
utm_campaign = YYYY-MM-growth-theme
utm_content = post-or-message-id
```

Weekly scorecard:

```text
Visits
Free searches
Verified result rate
RFQ copy rate
Signup rate
Checkout click rate
Paid conversion rate
MRR
Top product categories
Top failed queries
Top acquisition source
```

## Orchestrator Workflow

### Daily Run

```text
09:00  Run funnel QA
09:10  Run brand consistency scan
09:20  Run payment health check
09:30  Extract verified case-study candidates
10:00  Generate outreach leads
10:30  Draft 10 personalized messages
11:00  Draft 1 social post from latest approved case study
18:00  Record replies, searches, signups, conversions
```

### Weekly Run

```text
Monday     Publish 1 SEO article or update existing article
Tuesday    Publish 1 approved case study
Wednesday  Run 50 targeted LinkedIn/email outreaches
Thursday   Community replies and founder-led posts
Friday     Growth scorecard + next experiment decision
```

### Deployment Gate

Before any production deploy, the orchestrator must pass:

```text
npm run lint
npx tsc --noEmit
npm run build
npm run growth:audit
npm run growth:payments
```

If `growth:payments` fails, deploy can proceed only if the changed files do not affect checkout, billing, auth, subscriptions, pricing, or webhooks.

## Priority Backlog

### P0: Revenue Safety

1. Fix Polar API 403.
   - Confirm token belongs to correct Polar organization.
   - Confirm token has product/subscription read and subscription write/cancel permissions.
   - Add `audit-polar-health.ts`.
2. Run $9.90 real payment test.
   - Checkout complete.
   - Webhook received.
   - User created or matched.
   - Subscription active.
   - Dashboard shows plan.
   - Cancellation works.
3. Add payment health report to deployment gate.

### P1: EN Funnel Trust

1. Brand consistency scanner for Gmail remnants.
2. Replace or relabel any testimonial-like content that is not from a real user.
3. Add `/en/case-studies` using only approved real or clearly labeled demo searches.
4. Add `/en/about` with founder story, company status, service limitations, and contact.
5. Add LinkedIn company profile and footer link.

### P2: Acquisition Engine

1. Publish 5 SEO pages:
   - How to find Korean cosmetics manufacturers.
   - BuyKorea vs EC21 vs tradeKorea.
   - MFDS/HACCP/KC verification guide.
   - Korean skincare OEM MOQ guide.
   - RFQ email template for Korean suppliers.
2. Create 50-lead weekly outbound list.
3. Produce 10 short-form video scripts from case studies.
4. Prepare Product Hunt launch assets only after 3 real case studies and 1 real paying customer.

### P3: Analytics and Experimentation

1. Add UTM capture.
2. Add event tracking.
3. Weekly growth report.
4. Experiment scoring:
   - Impact
   - Confidence
   - Effort
   - Time to learn

## Automation Acceptance Criteria

The orchestrator is considered operational when:

- It can detect EN to KO route leaks automatically.
- It can block paid acquisition when payment health fails.
- It can scan for Gmail and unsupported claims.
- It can produce a weekly list of verified case-study candidates.
- It can generate SEO briefs from real user demand.
- It can generate a weekly growth scorecard.
- It can produce outreach drafts and log outcomes.

## First 7 Days Execution Plan

Day 1:

- Implement `audit-en-funnel.ts`.
- Implement `audit-brand-consistency.ts`.
- Fix all remaining EN Gmail occurrences or create intentional exceptions.

Day 2:

- Implement `audit-polar-health.ts`.
- Fix Polar 403.
- Run real Starter payment test.

Day 3:

- Remove or relabel unsupported testimonials.
- Create case study template and data file.
- Extract first 3 demo or verified search cases.

Day 4:

- Create `/en/about`.
- Create `/en/case-studies`.
- Add LinkedIn profile link placeholder only after profile exists.

Day 5:

- Publish or improve first SEO article.
- Add CTA from blog to `/en#sourcing-tool`.
- Submit sitemap to Google Search Console.

Day 6:

- Build 100 lead list.
- Send 30 personalized messages.
- Log outcomes.

Day 7:

- Generate weekly scorecard.
- Decide next experiment:
  - More SEO if search traffic converts.
  - More outbound if reply rate is above 5%.
  - Product Hunt only if payment and case studies are ready.

## Final Judgment

The English product can be marketed, but only under strict gates:

- Organic/community marketing can begin after the EN funnel audit passes.
- Direct outbound can begin after at least one verified search case study exists.
- Paid advertising should wait until payment health passes and one real payment has activated a subscription.
- Public social proof must be real or clearly labeled as demo.

This turns the critique into an automated operating system: not a one-time fix, but a weekly machine that keeps the `/en` funnel trustworthy while creating distribution assets from real usage.
