# GloSource AI Red-Team Readiness - 2026-06-03

## Verdict

Partially operational, but not ready for paid acquisition at scale.

## Verified Passes

- `npm run growth:env`: pass
- `npm run growth:audit`: pass
- `npm run growth:payments`: pass
- `npm run growth:payments:dummy`: pass
- `npm run lint`: pass
- `npx tsc --noEmit`: pass
- `npm run build`: pass after adding root `app/not-found.tsx`
- Public `/en` is reachable and indexed/crawlable

## Fixed During This Review

- Added root `app/not-found.tsx` to resolve the production build failure.
- Changed supplier quality policy from `verified_suppliers_only` to `search_grounded_supplier_candidates`.
- Strengthened supplier gate to reject non-grounded model output and candidates without a search-grounded URL.
- Replaced buyer-facing `Google-verified` / `Web-verified` wording with `search-grounded`.
- Aligned Starter, Pro, and Agency quota copy with DB limits: 30 / 60 / 999 searches.
- Removed unsupported self-serve team-seat and unlimited-search claims.
- Softened checkout FAQ to acknowledge manual activation if automatic account activation does not appear.

## Red-Team Findings Still Open

### High

- Polar checkout uses static external checkout links. If a buyer pays with a different email from the logged-in account, the current account may not upgrade.
- `/en/billing` and `/en/dashboard` fetch one subscription by `userId` without ordering/filtering for the current active subscription, so stale rows can be shown.
- Toss webhook records payments but does not create/activate subscriptions; Toss activation still depends on the user reaching the success page.
- Manual `verified_suppliers` DB exists but is not yet used to enrich or validate `/api/source` output.

### Medium

- `/en/billing?polar=success` shows a success banner based only on query params, not DB-confirmed subscription activation.
- Auth session treats active Polar subscriptions without `currentPeriodEnd` as free, which may mis-handle edge-case webhook payloads.
- Polar-created users do not record the same consent timestamps as normal registration.
- Email verification redirects to `/auth/verify-email`, not `/en/...`, causing an English funnel locale leak.
- WeChat sourcing has weaker quality gates than `/api/source`.
- Risk guardrails focus mostly on cosmetics; medical devices, counterfeit/brand infringement, controlled goods, dual-use, and hazardous products need pre-search policy checks.

## Paid Acquisition Decision

Do not run paid ads or high-volume outbound yet.

Proceed with low-volume manual outreach and organic social only, while fixing:

1. Polar checkout account binding.
2. Active subscription query ordering/filtering.
3. DB-verified supplier matching or clear display separation between AI candidates and manually verified suppliers.
4. Query-param-only billing success messaging.
