# GloSource AI Weekly Growth Report

Date: 2026-05-22

## Automation Health

- brand-consistency: pass (brand-consistency-2026-05-22.json)
  - Warning: No LinkedIn profile/company link found.
- buffer-launch: partial (buffer-launch-2026-05-21.json)
- case-study-candidates: pass (case-study-candidates-2026-05-22.json)
- daily-growth-run: partial_or_failed (daily-growth-run-2026-05-22.json)
- growth-env-preflight: pass (growth-env-preflight-2026-05-22.json)
  - Warning: Instagram launch will use the default public logo fallback because GITHUB_TOKEN/GITHUB_OWNER and INSTAGRAM_IMAGE_URL are not configured.
- locale-route-audit: pass (locale-route-audit-2026-05-22.json)
- outreach-leads: pass (outreach-leads-2026-05-20.json)
- payment-health: fail (payment-health-2026-05-22.json)
  - Critical: POLAR_STARTER_PRODUCT_ID cannot be read with POLAR_ACCESS_TOKEN. Status: 403. Polar error: insufficient_scope. The request requires higher privileges than provided by the access token. Check that POLAR_ACCESS_TOKEN is an Organization Access Token for the same Polar organization and includes products:read or products:write scope. If Polar returns insufficient_scope, create a new organization token with products:read and update .env.local.
  - Critical: POLAR_PRO_PRODUCT_ID cannot be read with POLAR_ACCESS_TOKEN. Status: 403. Polar error: insufficient_scope. The request requires higher privileges than provided by the access token. Check that POLAR_ACCESS_TOKEN is an Organization Access Token for the same Polar organization and includes products:read or products:write scope. If Polar returns insufficient_scope, create a new organization token with products:read and update .env.local.
  - Critical: POLAR_AGENCY_PRODUCT_ID cannot be read with POLAR_ACCESS_TOKEN. Status: 403. Polar error: insufficient_scope. The request requires higher privileges than provided by the access token. Check that POLAR_ACCESS_TOKEN is an Organization Access Token for the same Polar organization and includes products:read or products:write scope. If Polar returns insufficient_scope, create a new organization token with products:read and update .env.local.
- seo-briefs: pass (seo-briefs-2026-05-15.json)
- social-dry-run: pass (social-dry-run-2026-05-22.json)

## Required Manual Updates

- Add visits, free searches, signups, checkout clicks, paid conversions, and MRR from analytics.
- Add top acquisition source and top failed queries.
- Decide next experiment based on highest conversion bottleneck.