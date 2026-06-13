# GloSource AI Weekly Growth Report

Date: 2026-05-30

## Automation Health

- acquisition-readiness: pass (acquisition-readiness-2026-05-30.json; fresh)
  - Warning: Case-study publication is blocked until approved evidence candidates exist.
- brand-consistency: pass (brand-consistency-2026-05-30.json; fresh)
  - Warning: No LinkedIn profile/company link found.
- buffer-instagram-launch: pass (buffer-instagram-launch-2026-05-28.json; stale: 2026-05-28)
- buffer-launch: pass (buffer-launch-2026-05-28.json; stale: 2026-05-28)
- buffer-threads-launch: pass (buffer-threads-launch-2026-05-28.json; stale: 2026-05-28)
- buffer-twitter-launch: pass (buffer-twitter-launch-2026-05-28.json; stale: 2026-05-28)
- buyer-activity: pass (buyer-activity-2026-05-30.json; fresh)
- case-study-candidates: pass (case-study-candidates-2026-05-30.json; fresh)
- daily-growth-run: pass (daily-growth-run-2026-05-30.json; fresh)
- growth-env-preflight: pass (growth-env-preflight-2026-05-30.json; fresh)
  - Warning: Instagram launch will use the default public logo fallback because GITHUB_TOKEN/GITHUB_OWNER and INSTAGRAM_IMAGE_URL are not configured.
- locale-route-audit: pass (locale-route-audit-2026-05-30.json; fresh)
- outreach-leads: pass (outreach-leads-2026-05-30.json; fresh)
- payment-health: pass (payment-health-2026-05-30.json; fresh)
- polar-webhook-dummy-test: pass (polar-webhook-dummy-test-2026-05-29.json; stale: 2026-05-29)
- reddit-launch: blocked (reddit-launch-2026-05-25.json; stale: 2026-05-25)
- scheduled-growth-run: pass (scheduled-growth-run-2026-05-30.json; fresh)
- seo-briefs: pass (seo-briefs-2026-05-30.json; fresh)
- social-dry-run: pass (social-dry-run-2026-05-30.json; fresh)

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