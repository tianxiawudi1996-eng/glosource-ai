# GloSource AI Weekly Growth Report

Date: 2026-05-27

## Automation Health

- acquisition-readiness: fail (acquisition-readiness-2026-05-27.json; fresh)
  - Critical: paid_ads is blocked by current growth evidence.
  - Critical: product_hunt_launch is blocked by current growth evidence.
  - Critical: high_volume_outbound is blocked by current growth evidence.
  - Warning: Case-study publication is blocked until approved evidence candidates exist.
- brand-consistency: pass (brand-consistency-2026-05-27.json; fresh)
  - Warning: No LinkedIn profile/company link found.
- buffer-instagram-launch: pass (buffer-instagram-launch-2026-05-25.json; stale: 2026-05-25)
- buffer-launch: pass (buffer-launch-2026-05-25.json; stale: 2026-05-25)
- buffer-threads-launch: pass (buffer-threads-launch-2026-05-25.json; stale: 2026-05-25)
- buffer-twitter-launch: pass (buffer-twitter-launch-2026-05-25.json; stale: 2026-05-25)
- case-study-candidates: pass (case-study-candidates-2026-05-27.json; fresh)
- daily-growth-run: partial_or_failed (daily-growth-run-2026-05-27.json; fresh)
- growth-env-preflight: pass (growth-env-preflight-2026-05-27.json; fresh)
  - Warning: Instagram launch will use the default public logo fallback because GITHUB_TOKEN/GITHUB_OWNER and INSTAGRAM_IMAGE_URL are not configured.
- locale-route-audit: pass (locale-route-audit-2026-05-27.json; fresh)
- outreach-leads: pass (outreach-leads-2026-05-27.json; fresh)
- payment-health: fail (payment-health-2026-05-27.json; fresh)
  - Critical: POLAR_STARTER_PRODUCT_ID cannot be read with POLAR_ACCESS_TOKEN. Status: 403. Polar error: insufficient_scope. The request requires higher privileges than provided by the access token. Check that POLAR_ACCESS_TOKEN is an Organization Access Token for the same Polar organization and includes products:read or products:write scope. If Polar returns insufficient_scope, create a new organization token with products:read and update .env.local.
  - Critical: POLAR_PRO_PRODUCT_ID cannot be read with POLAR_ACCESS_TOKEN. Status: 403. Polar error: insufficient_scope. The request requires higher privileges than provided by the access token. Check that POLAR_ACCESS_TOKEN is an Organization Access Token for the same Polar organization and includes products:read or products:write scope. If Polar returns insufficient_scope, create a new organization token with products:read and update .env.local.
  - Critical: POLAR_AGENCY_PRODUCT_ID cannot be read with POLAR_ACCESS_TOKEN. Status: 403. Polar error: insufficient_scope. The request requires higher privileges than provided by the access token. Check that POLAR_ACCESS_TOKEN is an Organization Access Token for the same Polar organization and includes products:read or products:write scope. If Polar returns insufficient_scope, create a new organization token with products:read and update .env.local.
- reddit-launch: blocked (reddit-launch-2026-05-25.json; stale: 2026-05-25)
- seo-briefs: pass (seo-briefs-2026-05-27.json; fresh)
- social-dry-run: pass (social-dry-run-2026-05-27.json; fresh)

## Automatic Evidence Summary

- Daily run: partial_or_failed; failed jobs: growth:payments.
- Case-study candidates extracted: 0.
- Social dry-run: pass; failed channels: none.
- Last Buffer launch: Twitter/X {"scheduled":3}, Threads {"sent":3}, Instagram {"sent":2,"sending":1}.

## Blocked Actions

- case_study_publication
- high_volume_outbound
- paid_ads
- product_hunt_launch
- testimonial_like_claims

## Operating Decision

- Do not run paid ads, Product Hunt launch, or high-volume outbound until payment health passes.
- Social copy is previewable, but live posting should stay deliberate; rerun `npm run growth:social:dry-run` immediately before any Buffer launch.
- Do not publish testimonials, case studies, or proof claims from this run; no approved evidence candidates were found.
- Instagram can post with the public logo fallback, but branded/generated image hosting still needs `GITHUB_TOKEN`/`GITHUB_OWNER` or `INSTAGRAM_IMAGE_URL`.
- Last live Buffer launch is not from today; treat it as historical evidence, not proof that today has been published.

## Required Manual Updates

- Add visits, free searches, signups, checkout clicks, paid conversions, and MRR from analytics.
- Add top acquisition source and top failed queries.
- Decide next experiment based on highest conversion bottleneck.