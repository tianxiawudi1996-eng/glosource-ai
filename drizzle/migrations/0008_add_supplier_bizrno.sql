-- Business-registration number for curated suppliers.
--
-- Registry cross-checks matched on the company NAME, which silently missed Sempio's real HACCP
-- certificate: the registry lists plants ("샘표식품(주)영동공장"), not head offices. A number matches
-- exactly, and it is what the live 국세청 (NTS) closed/suspended-business check needs — today that
-- check only reaches cosmetics suppliers, because MFDS is the only registry we ingest that carries
-- the number.
--
-- bizrno_source records provenance: a government registry outranks a number a company publishes on
-- its own website ('mfds-registry' | 'company-site').
--
-- Hand-written, not generated. `drizzle-kit generate` diffed against a stale snapshot and emitted
-- CREATE TABLE for tables that already exist in production, and prod records only 3 of the 9
-- journalled migrations as applied — so `drizzle-kit migrate` cannot be run against it as things
-- stand (tracked separately). These two statements are additive and idempotent, so they were applied
-- directly instead.

ALTER TABLE "verified_suppliers" ADD COLUMN IF NOT EXISTS "bizrno" text;--> statement-breakpoint
ALTER TABLE "verified_suppliers" ADD COLUMN IF NOT EXISTS "bizrno_source" text;
