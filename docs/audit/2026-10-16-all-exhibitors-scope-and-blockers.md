# K-Beauty Expo Korea 2026 — Whole-roster verification tracker

Date: 2026-10-16 (KST). Full intended scope: **679 exhibitors**, including **597 domestic and 82 overseas**, across **1,088 booths**, reported from KINTEX's October 12 organizer release; the count is a reported event total, not a recovered company directory. Sources: https://www.news1.kr/industry/distribution/6321321 , https://www1.edaily.co.kr/News/Read?mediaCodeNo=257&newsId=02433766645612592 .

## Acquisition progress, not MFDS matches
- Base review index: 55 display-name candidates.
- VVBETTER company announcement: 1 candidate, see existing company lead.
- Mirror-derived batch 3: 14 company display names with booth number and direct indexed mirror references, file `docs/audit/2026-10-16-kintex-mirror-batch3.csv`.
- Consolidated **70 candidate display rows**: `docs/audit/2026-10-16-kintex-70-candidate-index.csv`; may include corporate aliases/shared stands not yet reconciled. This is NOT 70 confirmed unique legal entities.
- Exhibitor source coverage by display rows (70 / 679) is just a work-in-progress ratio, not regulatory-match coverage or participation certification.
- **MFDS registered manufacturers confirmed: 0**; **MFDS registered responsible sellers confirmed: 0**. The 0 here means none checked to official matching standard, NOT no companies registered.

## Critical restrictions
- Organizer's actual 2026 full online exhibitor directory `https://www.kbeautyexpo.com/fairOnline.do?selAction=single_page&SYSTEM_IDX=222&hl=ENG&FAIRMENU_IDX=14925#/?TYPE=cfair` returned HTTP 403 in the current data retrieval environment.
- Mirror pages are independent copies claiming to cite the official list checked October 8. Treat those 14 rows as secondary evidence; don't mark organizer directly verified.
- KINTEX 2026 event attendee wall-board photos are available only through the conversation, not as a structured complete CSV or accessible raw original in this runtime; do not pretend to have OCR'd the 679 companies.
- Sources listing 2025 company names are not substitute for the 2026 679-company roster.
- A cosmetics brand/wholesaler may be a **responsible sales business** and not a registered **manufacturer**. Packaging, overseas and logistics entrants may not be eligible to appear in those MFDS registers.
- The MFDS API at https://www.data.go.kr/data/15020628/openapi.do needs access key. No authenticated source export has been joined; no match percentage can be published.

## Precise completion gate
1. Obtain current official 2026 KINTEX organizer full participant name+booth export (request through organizer email kbeautyexpo@kintex.com if not downloadable). User can upload a PDF or Excel roster or provide high resolution photographs.
2. Reconcile all 679 company/booth combinations, resolving multiple company names per shared booth and brand aliases.
3. Obtain fresh authorized MFDS manufacturing and responsible-seller registries with legal names and registration fields.
4. Read-only join by identifiers/legal entity, check address/registered business role, and store confirmed/ambiguous/no-match/out-of-scope statuses with source and date.
5. Report eligible count, confirmed count, mismatches, unresolved and non-Korean exclusions separately.

**This deliverable is explicitly partial. No production writes, publication, master merge, or claims of full completion.**
