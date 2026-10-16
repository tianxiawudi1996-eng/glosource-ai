# 2026 K-Beauty Expo Korea — exhibitor acquisition and MFDS evidence delta
Date: 2026-10-17 KST. Scope: KINTEX Exhibition Center 1, Halls 3–5, Oct 15–17 2026 ONLY.

## Numerical status (DO NOT conflate denominators)
- Organizer announcement: **679 exhibitors** = domestic 597 + overseas 82, 1,088 booths. This is an announced aggregate, NOT an obtained 679-row official directory.
- Previously indexed: 70 display-name candidates (no legal-entity/booth dedup).
- Previous chat batch4 secondary-mirror leads: 13 names, provisionally indexed as rows 071–083.
- New evidence from the indexed KINTEX event page: **BS Global Holdings** as a participant display name, row 084 (no booth verified).
- **84 display-name candidates / 679 announced exhibitors = 12.37% candidate-to-announced-total ratio ONLY.** Do not call this official company coverage or unique legal-entity completion.
- **Official MFDS live verified manufacturers: 0. Official MFDS live verified responsible sellers: 0.** Not-checked is not not-registered.
- **Secondary MFDS-derived registration leads: 2** (Caregen, Raphas). These are explicitly NOT official live confirmations.

## New organizer-side corroboration
KINTEX's event detail indexed result names 아네시 (ANNECY), 아이에스씨 (ISC), 비에스글로벌홀딩스 (BS Global Holdings), and 유니블리스 (unibliss) as event examples.
- Source: https://www.kintex.com/web/ko/event/view.do?seq=26030306 (page retrieval returned 502; the official-domain indexed excerpt is retained as snippet-level evidence).
- ANNECY (index 007), ISC (011), unibliss (023) are EXISTING rows, do not add as new.
- BS Global Holdings is a NEW display name (084), but legal/company and shared-booth de-duplication is pending.
- BS Global Holdings self publishes the legal name, company website, business ID **662-81-01086** and HQ contact address (https://www.bsgholdings.co.kr/64). A business ID is NOT MFDS cosmetics registration proof.

## Regulatory evidence from MFDS-derived SECONDARY historical snapshot
A non-government website reports a 2026-10-04 pull of MFDS open API and publishes a 240-entry sample from the 32,750-registration snapshot. Source: https://safecosmetic.org/statistics/cosmetics-company-list
- Row 052 CAREGEN: legal-name match candidate '(주)케어젠'; **cosmetics manufacturing** registration date 2012-04-03; location 경기 군포시. MFDS live direct query NOT performed; business ID NOT matched; responsible seller NOT established.
- Row 020 RAPHAS: legal-name match candidate '(주)라파스'; **cosmetics manufacturing** registration date 2010-11-09; location 충남 천안시 서북구. MFDS live direct query NOT performed; business ID NOT matched; responsible seller NOT established.
- Do NOT label the above as verified CURRENT registrations; they are third-party reproductions of an official-source snapshot and require direct authority confirmation.
- Official authority API: https://www.data.go.kr/data/15020628/openapi.do ; key required. Official direct lookup interface: https://nedrug.mfds.go.kr/pbp/CCBBA01 ; website search uses a form.
- Snapshot source is a private/non-government publisher. The paper company's industry, self-declared manufacturing status, business license, KGMP or ISO certificate do not establish MFDS current registered business role.
- Status options: NOT_CHECKED, SECONDARY_REGISTRY_LEAD, MFDS_OFFICIAL_IDENTITY_CONFIRMED, AMBIGUOUS_REGISTRY, OUT_OF_SCOPE, NOT_FOUND_IN_DATED_SNAPSHOT. Never replace NOT_CHECKED with NOT_REGISTERED absent authoritative negative search with scope/time captured.

## Known blockers
- Organizer directory (2026 exhibitors): https://www.kbeautyexpo.com/fairOnline.do?selAction=single_page&SYSTEM_IDX=222&hl=ENG&FAIRMENU_IDX=14925#/ ; web retrieval returns 403.
- Organizer 3D hall/floor plan: https://kbeautyexpo.com/fairContents.do?FAIRMENU_IDX=18624&hl=ENG ; web retrieval returned 403.
- Jufair page advertised 677 listings but catalog storefront offers **2025** directory; its 677 counter has not been demonstrated to be 2026 names. Do NOT import as 2026 roster.
- The 13 mirror leads from previous run were not newly confirmed against organizer in this audit; source tier remains SECONDARY_MIRROR_2026.
- Multiple display names may represent one legal entity (including shared stand 4B21); do NOT use 84 as confirmed unique companies.

## Next actions, safely in feature branch only
1. Obtain official **2026** entire 679 company+booth directory or actual 2026 exhibition handbook/QR map export. If inaccessible, record blocker, not invented rows; do not email anyone without authorization.
2. Preserve organizer name, booth, category and source URL/page/date; distinguish booth-level vs legal entity, brand, pavilion and joint stand.
3. Categorize Korean candidates by manufacturer / responsible seller / brand / distribution / packaging / devices / logistics; overseas are not automatically Korean MFDS registrants.
4. Get authorized current MFDS registry export/API key locally; don't share credentials. Only read access; never execute scripts/ingest-mfds.ts (TRUNCATE).
5. Link by normalized LEGAL NAME + business ID (where available) + address and registration role; require review of conflicts, closure dates and entity aliases.
6. Produce regulator-confirmed rates with eligible domestic-company denominator, not 679 unfiltered exhibition names; do not publish prematurely.
7. Continue SEO/GEO factual audit of 14 live-source posts and 3 unpublished drafts in audit docs only; do not publish any content.
8. Use create_tree -> create_commit -> update_ref with expected_sha for this feature ref only, then compare master SHA before/after; no contents create_file/update_file.
