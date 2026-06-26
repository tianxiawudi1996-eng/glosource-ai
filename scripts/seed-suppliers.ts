/**
 * Seed `verified_suppliers` with REAL, publicly-documented Korean OEM/ODM manufacturers.
 *
 * Honesty rules:
 *  - Only accurate public facts are stored (name, real URL, manufacturer status, publicly-known cert systems).
 *  - Unknown numbers (MOQ, trustScore, lead time) are left NULL — never invented.
 *  - These are established, high-MOQ ODMs (good for credibility/comparison). Low-MOQ, indie-friendly
 *    Korean factories still need manual curation — that is Phase 1b (real sourcing work, no fabrication).
 *
 * Run with the DATABASE_URL env var set:  npx tsx scripts/seed-suppliers.ts
 * Idempotent: skips rows whose `name` already exists.
 */
import { eq } from 'drizzle-orm';
import { db, verifiedSuppliers } from '../app/lib/db';

const SEED: Array<typeof verifiedSuppliers.$inferInsert> = [
  {
    name: '코스맥스',
    nameEn: 'COSMAX',
    platform: 'Direct',
    url: 'https://www.cosmax.com',
    category: 'K-Beauty',
    country: 'KR',
    certifications: 'ISO 22716,CGMP',
    trustScore: null,
    moqMin: null,
    leadTimeDays: null,
    notes: 'World-scale Korean cosmetics ODM (skincare / serum / ampoule). Established manufacturer; typically high MOQ — confirm indie/small-batch program and current certificates directly.',
    addedBy: 'seed-script',
  },
  {
    name: '한국콜마',
    nameEn: 'Kolmar Korea',
    platform: 'Direct',
    url: 'https://www.kolmar.co.kr',
    category: 'K-Beauty',
    country: 'KR',
    certifications: 'ISO 22716,CGMP',
    trustScore: null,
    moqMin: null,
    leadTimeDays: null,
    notes: 'Major science-led Korean cosmetics ODM with strong actives formulation. Confirm indie MOQ, lead time, and certificate scope directly.',
    addedBy: 'seed-script',
  },
  {
    name: '코스메카코리아',
    nameEn: 'Cosmecca Korea',
    platform: 'Direct',
    url: 'https://www.cosmecca.com',
    category: 'K-Beauty',
    country: 'KR',
    certifications: 'ISO 22716,CGMP',
    trustScore: null,
    moqMin: null,
    leadTimeDays: null,
    notes: 'Established Korean cosmetics ODM with broad formulation capability (works with global and indie brands). Confirm serum-line MOQ and certificates directly.',
    addedBy: 'seed-script',
  },
];

async function main(): Promise<void> {
  let inserted = 0;
  for (const s of SEED) {
    const existing = await db
      .select({ id: verifiedSuppliers.id })
      .from(verifiedSuppliers)
      .where(eq(verifiedSuppliers.name, s.name))
      .limit(1);
    if (existing.length > 0) {
      console.log('skip (exists):', s.nameEn);
      continue;
    }
    await db.insert(verifiedSuppliers).values(s);
    console.log('inserted:', s.nameEn);
    inserted += 1;
  }
  console.log(`done. ${inserted} inserted, ${SEED.length - inserted} skipped.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
