/**
 * Seed / correct `verified_suppliers` with REAL, government-verifiable Korean cosmetics manufacturers.
 *
 * Our ICP is a low-MOQ indie brand, so a 'GloSource Verified' badge on a factory that will not take
 * their order is a trust claim we cannot cash. Every row in scripts/curated-suppliers.ts is therefore
 * checked the same way the product itself checks suppliers — web discovery, then cross-checked
 * against the government registries we already ingest:
 *
 *   1. MFDS cosmetics registry (kr_cosmetics_firms, induty=화장품제조) — proves the company holds a
 *      manufacturing licence, with a business-registration number and a plant address. A broker or a
 *      brand owner is registered 화장품책임판매 (or not at all) and is rejected.
 *   2. MFDS CGMP list (app/data/cgmp-firms.json, matched on business-reg number) — proves GMP scope.
 *
 * MOQ is in NO registry. It is a commercial term, so `moqMin` is filled only when the company states
 * a figure on its own public site, and the note says so. Otherwise it stays null. Never invented.
 *
 * Rejected during curation (recorded so we do not re-add them):
 *   - Laonhase (laonhase.com) — advertises the lowest MOQ found (300 units) but has NO MFDS
 *     manufacturing record under that name. Unverifiable, so it gets no badge. This is precisely the
 *     trap our buyers fall into.
 *   - Factosquare — 화장품책임판매 only, no manufacturing licence: a platform, not a factory.
 *   - Selfcos, Smallcosmetic — no registry record at all (matching platforms).
 *   - OEMKorea, CosKorea, Crescent Seoul, Mayk, Sourcing Lab, KPrivateLabel — sourcing agencies that
 *     rank for "Korean factory" but resell someone else's plant. Badging them would make us the
 *     middleman problem we sell against.
 *
 * Note the trade-off the data actually shows: the CGMP-certified plants here do NOT publish an MOQ,
 * and the two that publish a 1,000-unit MOQ are NOT CGMP-listed. The notes say so plainly rather
 * than implying every badged supplier is both easy to start with and top-certified.
 *
 * Run with DATABASE_URL set:  npx tsx --env-file=.env.local scripts/seed-suppliers.ts
 * Pass --dry to print the plan without touching the database (these rows are what buyers see).
 */
import { eq } from 'drizzle-orm';
import { db, verifiedSuppliers } from '../app/lib/db';
import { CURATED, RETIRED, type CuratedSupplier } from './curated-suppliers';
import { verifyCurated } from './verify-curated';

// Fields this script owns. Everything else on an existing row (id, verifiedAt, active) is left alone.
function curatedFields(s: CuratedSupplier) {
  return {
    nameEn: s.nameEn,
    platform: s.platform,
    url: s.url,
    category: s.category,
    country: s.country,
    certifications: s.certifications,
    trustScore: s.trustScore,
    moqMin: s.moqMin,
    leadTimeDays: s.leadTimeDays,
    notes: s.notes,
    updatedAt: new Date(),
  };
}

async function main(): Promise<void> {
  const dry = process.argv.includes('--dry');
  let inserted = 0;
  let updated = 0;

  if (dry) console.log('DRY RUN — no writes\n');

  // Re-check every claim against the registries before anything is written. A row that fails is a
  // row that would tell a buyer something we cannot back, so nothing is seeded until it is fixed.
  console.log('verifying claims against the government registries…');
  const verdicts = await verifyCurated(CURATED);
  for (const v of verdicts) {
    for (const w of v.warnings) console.warn(`  ! ${v.supplier}: ${w}`);
  }
  const failed = verdicts.filter(v => v.problems.length);
  if (failed.length) {
    console.error('\nREFUSING TO SEED — these rows make claims the registries do not back:\n');
    for (const v of failed) {
      console.error(`  ${v.supplier}`);
      for (const p of v.problems) console.error(`     - ${p}`);
    }
    process.exit(1);
  }
  console.log(`  all ${verdicts.length} rows check out\n`);

  for (const r of RETIRED) {
    const [row] = await db
      .select({ id: verifiedSuppliers.id, active: verifiedSuppliers.active })
      .from(verifiedSuppliers)
      .where(eq(verifiedSuppliers.name, r.name))
      .limit(1);
    if (!row || !row.active) continue;
    if (!dry) await db.update(verifiedSuppliers).set({ active: false, updatedAt: new Date() }).where(eq(verifiedSuppliers.id, row.id));
    console.log(`${dry ? 'would retire' : 'retired'}: ${r.name} — ${r.reason}`);
  }

  for (const s of CURATED) {
    const existing = await db
      .select({ id: verifiedSuppliers.id, notes: verifiedSuppliers.notes, moqMin: verifiedSuppliers.moqMin })
      .from(verifiedSuppliers)
      .where(eq(verifiedSuppliers.name, s.name))
      .limit(1);

    if (existing.length === 0) {
      if (!dry) await db.insert(verifiedSuppliers).values(s);
      console.log(`${dry ? 'would insert' : 'inserted'}:`, s.nameEn, `(moq ${s.moqMin ?? 'null'}, certs ${s.certifications ?? 'none'})`);
      inserted += 1;
      continue;
    }

    // Upsert rather than skip. The first seed shipped COSMAX with a "typically high MOQ" note, which
    // stopped being true when it opened a 1,000-unit indie programme; skipping existing rows would
    // have left that misleading note in front of buyers forever.
    const row = existing[0];
    if (row.notes === s.notes && row.moqMin === (s.moqMin ?? null)) {
      console.log('unchanged:', s.nameEn);
      continue;
    }
    if (!dry) await db.update(verifiedSuppliers).set(curatedFields(s)).where(eq(verifiedSuppliers.id, row.id));
    console.log(`${dry ? 'would update' : 'updated'}:`, s.nameEn, `(moq ${row.moqMin ?? 'null'} -> ${s.moqMin ?? 'null'})`);
    updated += 1;
  }

  console.log(`\n${dry ? 'plan' : 'done'}. ${inserted} inserted, ${updated} updated, ${CURATED.length - inserted - updated} unchanged.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
