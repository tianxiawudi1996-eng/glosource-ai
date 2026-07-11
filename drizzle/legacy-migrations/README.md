# Legacy migrations (not run — kept for history)

These are the migrations from before the 2026-07-12 baseline reset. drizzle does not read this
folder (`out` points at `drizzle/migrations`), and nothing here should be run again.

They were retired because the set had stopped describing the database:

- **The ledger had fallen behind.** Production recorded 3 of the 9 journalled migrations as applied.
  drizzle decides what to run by comparing each migration's `when` against the *latest* recorded
  `created_at`, so the next `db:migrate` would have re-run 0003–0008 and tried to `CREATE TABLE` on
  tables that already existed. It never failed only because nobody had run it.
- **Some tables were never in a migration at all.** `kr_cosmetics_firms`, `kr_haccp_firms`,
  `kr_health_food_firms`, `kr_medical_device_firms`, `kr_quasi_drug_firms`, `blog_posts`,
  `social_posts` and `search_history` were pushed straight to production, so this set could not
  rebuild the database from scratch — a fresh environment would have come up missing them.
- **Two files were never journalled.** `0001_add_waitlist.sql` and `0006_age_marketing_consent.sql`
  sit here without journal entries, so drizzle never ran them and nothing said so.

The replacement is a single `0000_baseline` generated from `schema.ts`, verified to reproduce the
production schema exactly (19 tables, every column). Existing databases were told it is already
applied with `npm run db:adopt`, which refuses unless the live schema actually matches — recording a
lie there would skip real work forever.

`tests/migrations.test.ts` now compares schema.ts, the journal and the snapshot on every test run,
so a table can no longer reach production without a migration.
