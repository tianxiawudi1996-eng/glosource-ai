# GloSource AI Weekly Growth Report

Date: 2026-05-31

## Automation Health

- acquisition-readiness: pass (acquisition-readiness-2026-05-30.json; stale: 2026-05-30)
  - Warning: Case-study publication is blocked until approved evidence candidates exist.
- brand-consistency: pass (brand-consistency-2026-05-30.json; stale: 2026-05-30)
  - Warning: No LinkedIn profile/company link found.
- buffer-instagram-launch: pass (buffer-instagram-launch-2026-05-31.json; fresh)
- buffer-launch: pass (buffer-launch-2026-05-28.json; stale: 2026-05-28)
- buffer-launch-audit: pass (buffer-launch-audit-2026-05-31.json; fresh)
  - Warning: twitter post 6a1afd414f72c5a5a7f5c990 is queued, not yet live.
  - Warning: twitter post 6a1afd44586c8076cfe431bd is queued, not yet live.
  - Warning: twitter post 6a1afd4819f751d8938b442a is queued, not yet live.
- buffer-threads-launch: pass (buffer-threads-launch-2026-05-31.json; fresh)
- buffer-twitter-launch: pass (buffer-twitter-launch-2026-05-31.json; fresh)
- buyer-activity: pass (buyer-activity-2026-05-30.json; stale: 2026-05-30)
- case-study-candidates: pass (case-study-candidates-2026-05-30.json; stale: 2026-05-30)
- daily-growth-run: pass (daily-growth-run-2026-05-30.json; stale: 2026-05-30)
- growth-env-preflight: pass (growth-env-preflight-2026-05-30.json; stale: 2026-05-30)
  - Warning: Instagram launch will use the default public logo fallback because GITHUB_TOKEN/GITHUB_OWNER and INSTAGRAM_IMAGE_URL are not configured.
- locale-route-audit: pass (locale-route-audit-2026-05-30.json; stale: 2026-05-30)
- outreach-leads: pass (outreach-leads-2026-05-30.json; stale: 2026-05-30)
- payment-health: pass (payment-health-2026-05-30.json; stale: 2026-05-30)
- polar-webhook-dummy-test: pass (polar-webhook-dummy-test-2026-05-30.json; stale: 2026-05-30)
- reddit-launch: blocked (reddit-launch-2026-05-25.json; stale: 2026-05-25)
- scheduled-growth-run: pass (scheduled-growth-run-2026-05-30.json; stale: 2026-05-30)
- seo-briefs: pass (seo-briefs-2026-05-30.json; stale: 2026-05-30)
- social-dry-run: pass (social-dry-run-2026-05-30.json; stale: 2026-05-30)

## Automatic Evidence Summary

- Daily run: pass; failed jobs: none.
- Case-study candidates extracted: 0.
- Social dry-run: pass; failed channels: none.
- Last Buffer launch: Twitter/X {"scheduled":3}, Threads {"sent":3}, Instagram {"sent":3}.

## Blocked Actions

- case_study_publication
- testimonial_like_claims

## Operating Decision

- Social copy is previewable, but live posting should stay deliberate; rerun `npm run growth:social:dry-run` immediately before any Buffer launch.
- Do not publish testimonials, case studies, or proof claims from this run; no approved evidence candidates were found.
- Instagram can post with the public logo fallback, but branded/generated image hosting still needs `GITHUB_TOKEN`/`GITHUB_OWNER` or `INSTAGRAM_IMAGE_URL`.
- Last live Buffer launch is not from today; treat it as historical evidence, not proof that today has been published.

## Required Manual Updates

- Add visits, free searches, signups, checkout clicks, paid conversions, and MRR from analytics.
- Add top acquisition source and top failed queries.
- Decide next experiment based on highest conversion bottleneck.