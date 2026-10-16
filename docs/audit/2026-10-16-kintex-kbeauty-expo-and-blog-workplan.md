# GloSource AI — 2026-10-16 KINTEX K-Beauty Expo / Blog Review Working Note

> STATUS: Development-branch review material only. No production publishing, database changes, mailing, or external contact authorized.

## 1. Exhibition identity — CORRECTED

- **Correct event:** 2026 K-뷰티엑스포 코리아 (K-Beauty Expo Korea 2026).
- **When:** 2026-10-15 (Thu) – 2026-10-17 (Sat).
- **Where:** KINTEX Exhibition Center 1, **Halls 3–5**, Goyang, Gyeonggi-do.
- **Related event attended by user:** 2026 한국건설·안전박람회, 2026-10-14 – 2026-10-16, also KINTEX Exhibition Center 1.
- **Not** the 2026 Osong beauty expo. Do not import an Osong exhibitor roster.
- Exhibition organizer / listing: https://akei.or.kr/bbs/board.php?bo_table=schedule&page=5
- Venue and halls: https://kioca.org/k-beauty-expo-korea-2026/
- Construction-safety dates: https://gttc.gtp.or.kr/web/bbs/noticeView.jsp?cPage=1&gubun=news&no=29754
- Verified example for exhibitor-roster seed only: PIE booth **Hall 5, 5C01**, as announced by the company 2026-09-30: https://www.pie.co.kr/eng/customer/news.php/3902541864?idx=6509&ptype=view. Presence in a roster is NOT proof of government registration, manufacturer status, export eligibility, or a completed match.

## 2. Data cross-check design (do not publish unverified results)

Repo ingestion found at `scripts/ingest-mfds.ts`:
- Government source `CsmtcsMfcrtrInfoService01` from data.go.kr / MFDS.
- DB table `kr_cosmetics_firms` has `entp_seq, name, name_norm, induty, is_manufacturer, boss_name, permit_date, factory_addr, bizrno, fetched_at`.
- `app/lib/mfds.ts` already supports exact normalized-name matching and manufacturer preference. This is a **first-pass candidate match**, not identity verification, especially on duplicate company names.

Collect verified 2026 **KINTEX** exhibitor list and later user-supplied photographed guide/brochures; preserve source URL, booth, exhibitor display name, product category, capture date. Match in stages:
1. Exact business registration number where legitimately available, then independently check registered legal entity.
2. Korean legal company name after normalization; use address and manufacturer/brand context to disambiguate; retain original name and show confidence.
3. English/trading name with documented alias evidence; don't auto-merge based on similarity alone.
4. Record outcome: `confirmed`, `candidate-review`, `not-found`, `not-applicable` (e.g. brands, wholesalers, overseas suppliers), and `stale/needs-refresh`.
5. Calculate match rate **among eligible Korean MFDS-registerable manufacturers/responsible sellers**, never indiscriminately across all exhibitors. A nonmatch alone does NOT prove bad data.

No verified 2026 full roster has yet been ingested; no live MFDS database comparison or measured match rate is claimed.

## 3. English blog repository baseline (source: app/lib/blog-posts.ts)

Static `BLOG_POSTS`: **14**. Current categories: **9**, not 7:
- Sourcing Guide 5; FBA Sourcing 2.
- K-Beauty Sourcing 1; Platform Guide 1; Templates 1; Compliance 1; Private Label 1; Supplier Vetting 1; Certifications 1.

Only **2** of the 14 static articles have external clickable links (3 each); the remaining **12** have zero external HTML href URLs in article bodies. This measures link presence, not factual accuracy or true source provenance.
- The new 2026-06-04 K-Beauty OEM article has 3 external links and a sourcing-tool internal link.
- The certifications article has 3 external links.
- Other articles warrant citation review.
- Immediate legal/regulatory review candidates: `ship-from-korea-to-amazon-fba` (FDA Prior Notice is food-specific; don't imply every Amazon shipment requires it); `korean-food-export-certification-guide` (avoid blanket 'HACCP effectively mandatory under FSMA'); articles claiming KORUS blanket 0% duty.
- Review factual claims of BuyKorea / EC21 verification, claims that registration = full supplier verification, and out-of-date commercial/promotional quotas.
- Existing page code provides per-post meta title/description, canonical, OpenGraph, Twitter, BlogPosting JSON-LD, and sitemap inclusion; this is technical groundwork **not** proof of indexation or AI citation. Google Search Console data is required for reliable per-URL indexing conclusions.

## 4. Three differentiated SEO + GEO draft topics (NOT published)

1. **K-Beauty Expo Korea 2026: How Overseas Buyers Can Verify Korean Beauty Exhibitors** — event-specific field guide, no invented exhibitor statistics; include real examples only when documented.
2. **Korean Cosmetics Manufacturer vs Brand Owner vs Responsible Seller: How to Check MFDS Records** — explain MFDS role and cautious interpretation of match/no-match.
3. **Korean Skincare OEM RFQ Checklist for Small Importers: MOQ, Samples, Compliance, and Evidence** — practical buyer checklist, avoid guarantees and unverified quantities.

For each draft: clear intent-matching title, answer-first summary, accurate source links, date/updates, FAQ only where helpful, relevant internal CTA, editorial fact-check. GEO is writing for verifiable, retrievable answers; no indexing or AI-citation guarantees.

## 5. Release gate

Until further confirmation: development branch only; do not merge into master, deploy, publish posts, contact exhibitors, or run paid APIs. Once photos arrive: extract and human-check names, deduplicate with official roster, then create a review-only candidate match report, with evidence and uncertainty columns.
