# KINTEX K-Beauty Expo Korea 2026 — NewSelect / 뉴셀렉트 (1차 증거 검증)

Review date: 2026-10-16 (KST). Branch: feature/kintex-mfds-batch-20261016.
**NO live MFDS registry or production database has been queried. This is NOT a confirmed MFDS registration match.**

## NewSelect facts established
- Trade show candidate: **NewSelect / 뉴셀렉트**, booth **3E32** per previously collected company exhibition announcement (see master candidate CSV). Booth needs organizer directory cross-check.
- Public corporate website **https://newselect.co.kr/** identifies the legal seller as **뉴셀렉트(주)** (NewSelect Co., Ltd.).
- The same company website publishes business registration number **482-87-02822** and its current contact address as **서울특별시 성동구 성수이로 127 DL 성수** (not a factory address).
- Its web pages describe beauty, wellness and lifestyle brands and overseas commerce. **Do not label it a manufacturer solely from retail/brand activities.**
- Company website https://newselect.co.kr/ ; company brand division https://newselect.co.kr/wellness_beyond ; seller evidence https://stores.auction.co.kr/newselect ; trade show declaration URL recorded in candidate CSV.
- Historic marketplace business address differs from current corporate site address; **do not infer fraud or a business entity mismatch without a date-specific confirmation**.
- Its legal name and business ID are corroborated across the company website and a large marketplace seller profile.
- No current Korean cosmetics manufacturing registration, responsible-sales registration, factory association, ISO 22716, certification, or license number was verified by the present check.

## Next MFDS check (read-only)
Look up registration against a **dated official MFDS data export**, using business number first. Confirm whether the company itself is registered as (a) 화장품제조업, (b) 화장품책임판매업, both, or neither, and whether dataset scope covers that role. Confirm legal company name and registered address. Record raw row identifier, date, API provenance, type and any ambiguity. An apparent no-match is **NOT fraud**.

## Data-quality issue observed in existing importer
Existing `scripts/ingest-mfds.ts` contains `TRUNCATE kr_cosmetics_firms`. Do NOT run to investigate this exhibition: it would replace the production registry table. Also validate API status, completeness and pagination before any future refresh; do not use a destructive import as a read-only verification.

## Status fields
expo_identity_candidate=YES
booth_claim_from_company=3E32 (organizer verification pending)
official_business_name=뉴셀렉트(주)
company_business_id_from_public_corporate_site=482-87-02822
manufacturer_registration=NOT_CHECKED
responsible_seller_registration=NOT_CHECKED
registry_match=NOT_CHECKED
status=LEGAL_IDENTITY_CORROBORATED; MFDS_PENDING

## Reference caveat
The 2026 show official site currently returned HTTP 403 to the web retrieval tool. The third-party ConferenceDB subset lists only 22 exhibitors, not the full show. **2025** exhibitor count was **509** in AKEI historical directory; 2026 500/510 figures published in secondary listings are forecasts, not a complete directory. Do not use unrelated 2026 beauty shows' lists or a 2025 KINTEX list as 2026 confirmed exhibitor records.
