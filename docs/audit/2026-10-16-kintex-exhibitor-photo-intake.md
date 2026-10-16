# K-Beauty Expo Korea 2026 — on-site photo intake (2026-10-16)

**State: REVIEW / PRELIMINARY — no database verification performed.** Based on five user-provided photographs of actual KINTEX exhibitor boards, booth map, and event guide. These photographs were visible in the conversation but are not stored in this GitHub repository. All transcribed company strings below require cross-check against the exhibition's official searchable directory or original full-resolution photos before use as a production matching dataset.

## Verified from the event-guide image

- Event name: **2026 K-뷰티엑스포 코리아 / K-Beauty Expo Korea 2026**.
- Dates: **2026-10-15 through 2026-10-17**.
- Venue: **KINTEX Exhibition Center 1, Halls 3–5**.
- Host: **KINTEX**; organizers printed as **KINTEX and KOTRA**.
- Event home page printed: **https://www.kbeautyexpo.com**.
- Exhibition areas include cosmetics, hair/nails, aesthetics, ingredients and packaging, body, inner beauty, medical service, smart beauty, platforms and marketing.
- Printed booth map includes **online directory** and **mobile visitor guide** QR options; a full official roster export is preferable to manual reading of distant photographed wall panels.
- **NOT the Osong beauty exposition.**

## Photograph inventory

1. Photo 1: Hall 3–5 consolidated booth layout, exhibitor-zone legend, official directory QR, entrance and international pavilions.
2. Photos 2–4: Three overlapping captures of the participant company index. The company names and booth IDs are useful but some small text is not reliably readable at this supplied scale.
3. Photo 5: Event overview and October 15–17 program schedule.

## Sample rows visible from the exhibitor index (NOT the final roster)

| Booth | Printed/recognizable exhibitor string | Evidentiary confidence | MFDS matching treatment |
|---|---|---|---|
| 3A03 | GUANGZHOU WANSONG PRINTING CO., LIMITED | High for photo transcription | Overseas printing/packaging vendor; **not MFDS cosmetics-manufacturer denominator** |
| 3A05 | CHIME Packaging Co., Ltd. | High for photo transcription | Packaging vendor; **not automatically MFDS manufacturer** |
| 3A08 | Top-Link International Exhibition | High for photo transcription | Event/exhibition service; exclude unless registered cosmetics legal entity separately established |
| 4D37 | Kreassive (display/sponsor name; legal entity to confirm) | Medium; booth and display name visible | Entity type unknown; **candidate**, requires business-name resolution |
| 5C01 | PIE Co., Ltd. (photo index; independent booth announcement previously checked) | Medium photo transcription, stronger with corporate corroboration | Entity type unknown; **candidate** pending legal name and product business classification |

These are only example rows, not a representative sample; **no match percentage can be calculated**. Some booth occupants are overseas companies, packaging manufacturers, organizers, brand owners, or service providers. These must not count as failed Korean cosmetics-firm matches.

## Matching scheme / review sheet

Columns:
`event_year`, `expo`, `booth_id`, `exhibitor_name_photograph`, `official_directory_name`, `website`, `exhibitor_country`, `declared_product_type`, `eligibility_scope`, `legal_company_name_kr`, `business_registration_number_if_public`, `mfds_entp_seq`, `mfds_entity_name`, `mfds_induty`, `is_manufacturer`, `registered_responsible_seller`, `mfds_fetched_at`, `match_method`, `match_status`, `confidence`, `review_notes`, `source_url_or_photo_index`.

1. Assemble full official **KINTEX 2026** exhibitor roster before calculating denominators.
2. Assign eligibility scope: Korean MFDS-manufacturer, Korean responsible cosmetics seller, non-MFDS sector, overseas company, unknown.
3. Exact confirmed identifier match first; name normalization with address/industry disambiguation second; documented trade names third. No automatic fuzzy acceptance.
4. Test live DB `kr_cosmetics_firms` against current MFDS source as of known `fetched_at` date; distinguish absent data, stale ingestion, entity mismatch, and genuine non-registration.
5. Separately calculate Korean eligible coverage, manufacturer coverage, responsible-seller coverage, and unknown/unresolved counts. An exhibitor appearance is **NOT** evidence that it is a certified or verified manufacturer.

## Blog work integration (unpublished)

- Support a new English buyers' article about **How to Verify K-Beauty Expo Korea Exhibitors Against MFDS Records**, explaining manufacturer versus responsible cosmetics seller versus brand versus packaging provider.
- Use event guide for factual event/date/location claims, but **do not invent exhibitor match statistics**.
- Full existing 14-post SEO/GEO accuracy review and three article drafts proceed in the same review-only feature branch.
- Never publish article, contact exhibitors, merge to master, or modify the production database without user's later explicit approval.
