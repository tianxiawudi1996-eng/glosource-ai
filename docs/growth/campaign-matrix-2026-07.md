# GloSource AI campaign matrix — July 2026

Campaign: `2026-07-korean-supplier-intelligence`

Goal: bring international buyers with active Korea-sourcing intent to `/en`, then measure free searches, signups, checkout starts, and paid conversions.

| Channel | Medium | Content IDs | Primary action | Status |
|---|---|---|---|---|
| X | organic | `x-01` to `x-03` | Start a free supplier search | Copy and UTM ready; Buffer token invalid |
| Threads | organic | `threads-01` to `threads-03` | Start a free supplier search | Copy and UTM ready; Buffer token invalid |
| LinkedIn | organic | `linkedin-01` to `linkedin-03` | Start a free supplier search | Copy and UTM ready; Buffer token invalid and channel ID unverified |
| Instagram | organic | `instagram-01` to `instagram-03` | Visit profile link and start search | Copy ready; branded image hosting not configured |
| Reddit | community | thread-specific | Educational answer first | Three opportunities and response drafts ready; manual rule review required |
| Paid acquisition | paid | not assigned | Paid conversion | Blocked until GA4 and channel-specific conversion tracking are verified |

## Funnel events

1. `search` / shortlist request
2. `sign_up`
3. `begin_checkout`
4. `purchase`

The app already emits funnel events and GA4 automatically reads `utm_*` query parameters, but production attribution remains unverified until `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured and a live test appears in GA4 DebugView/Realtime.

## Launch gates

- `npm run growth:payments` passes.
- `npm run growth:acquisition:gate` passes.
- Buffer channel listing succeeds with a valid token.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured in local and production environments.
- One UTM-tagged test visit produces the expected GA4 source, medium, campaign, and funnel event.
- Paid spend remains zero until those checks pass.
