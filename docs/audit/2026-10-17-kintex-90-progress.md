# K-Beauty Expo Korea 2026 — 90 display-name candidates (NOT 679 completed)

As-of date: **2026-10-17**. Confirmed exhibition count: 679 firms (597 Korean, 82 overseas), 1,088 booths. Official total source: https://www.cmn.co.kr/sub/news/news_view.asp?cls_cd=&news_idx=51284

- Previously captured 84 candidate display names, from a combination of photos, third-party sites, company notices, and organizer search snippets.
- Additional **six** candidates, each with source URL, booth where available, and provisional business category: `docs/audit/2026-10-17-kintex-batch5-public-2026.csv`.
- Consolidated **90** candidate display-name rows: `docs/audit/2026-10-17-kintex-90-candidate-index.csv`. This is not 90 legally verified distinct exhibitors. Resolve duplicate trade names/brands and shared booths.
- **Organizer-direct verified complete roster: NOT OBTAINED**; official exhibitor portal https://www.kbeautyexpo.com/fairDash.do currently returns 403 to research tool. Some third-party directory ads show 2025 lists, *not* valid for 2026.
- **MFDS live cosmetics manufacturer match: ZERO VERIFIED; seller match: ZERO VERIFIED** because key/data export is not available in this environment, not because businesses are unregistered.
- Total remaining exhibitor legal names not obtained: **at least 589** if all 90 candidates are unique current exhibitors, a provisional lower bound only; actual remaining number may be greater if a candidate is a brand name/shared booth/false positive.
- 2026 679 count is organizer-reported and media-reconfirmed; an exact per-entity coverage rate is not calculable from unverified aliases.
- **Do not perform production DB refresh** via `scripts/ingest-mfds.ts` (TRUNCATE risk); no public posts or deployment are authorized.
- Korean manufacturer and Korean responsible seller need separate eligibility denominators; overseas packaging & services not automatically counted as invalid Korean manufacturer registrations.

## Required upstream source
Obtain the **official 2026 show participant directory, Excel/CSV, official brochure or full 3–5 hall booth directory**, preferably requested from KINTEX organizer at kbeautyexpo@kintex.com, +82-31-995-8844 (contact per Korea Association of Exhibition Industry listing). This has **not been requested/sent** by this research assistant; request is a suggested source acquisition step: https://www.akei.or.kr/bbs/board.php?bo_table=schedule&wr_id=104760 . Without it, claiming that all 679 individual names have been identified would be fabricated.

## Source-grade caveat
The six new rows are a 2026-specific mirrored exhibitor directory (secondary publisher) or trade-press company release. Do not treat these as independently organizer-verified, and do not equate an expo booth with a manufacturing license.
