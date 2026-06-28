import { neon } from '@neondatabase/serverless';
import { lookupHealthFoodFirms, lookupQuasiDrugFirms } from '../app/lib/mfds';

async function main(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL as string);
  const [{ h }] = await sql`SELECT count(*)::int AS h FROM kr_health_food_firms`;
  const [{ q }] = await sql`SELECT count(*)::int AS q FROM kr_quasi_drug_firms`;
  console.log(`health_food=${h}  quasi_drug=${q}`);

  const hf = await lookupHealthFoodFirms(['한국인삼공사', '콜마비앤에이치', '노바렉스', '종근당건강', '주식회사 서흥', '코스맥스바이오', '일동바이오사이언스', '에스트라']);
  console.log(`\nhealth-food matched ${hf.size}:`);
  for (const [k, v] of hf) console.log(`  ${k} -> ${v.name} | ${v.productCount}품목 | ${v.sampleProduct ?? ''}`);

  const qd = await lookupQuasiDrugFirms(['동아제약', '유한양행', '애경산업', '엘지생활건강', '아모레퍼시픽', '동국제약', '고려은단', '부광약품']);
  console.log(`\nquasi-drug matched ${qd.size}:`);
  for (const [k, v] of qd) console.log(`  ${k} -> ${v.name} | ${v.induty} | mfr=${v.isManufacturer} | active=${v.hasActive} | ${v.sampleItem ?? ''}`);

  // sample the largest health-food firms to sanity-check ENTRPS
  const top = await sql`SELECT name, product_count FROM kr_health_food_firms ORDER BY product_count DESC NULLS LAST LIMIT 8`;
  console.log('\ntop health-food firms by product count:');
  for (const r of top) console.log(`  ${r.name} | ${r.product_count}`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
