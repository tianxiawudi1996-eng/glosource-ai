import { neon } from '@neondatabase/serverless';
import { lookupHaccpFirms } from '../app/lib/mfds';

async function main(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL as string);
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM kr_haccp_firms`;
  const [{ food }] = await sql`SELECT count(*)::int AS food FROM kr_haccp_firms WHERE product_gb = '식품'`;
  const [{ live }] = await sql`SELECT count(*)::int AS live FROM kr_haccp_firms WHERE product_gb = '축산물'`;
  console.log(`rows=${count}  식품=${food}  축산물=${live}`);

  // Major K-food manufacturers an LLM would surface for export queries.
  const names = ['농심', '주식회사 농심', '삼양식품', '삼양식품 주식회사', 'CJ제일제당', '씨제이제일제당', '오뚜기', '주식회사 오뚜기', '대상', '풀무원', '동서식품'];
  const m = await lookupHaccpFirms(names);
  console.log(`\nlookup matched ${m.size} firms:`);
  for (const [k, v] of m) console.log(`  ${k} -> ${v.company} | ${v.productGb} | ${v.area1} | ${v.businessItem ?? ''}`);

  // Sample a few real rows so we can see what names look like.
  const sample = await sql`SELECT company, product_gb, companykind_nm, area1 FROM kr_haccp_firms WHERE company LIKE '%농심%' OR company LIKE '%삼양%' OR company LIKE '%오뚜기%' OR company LIKE '%제일제당%' LIMIT 15`;
  console.log('\nsample rows for big brands:');
  for (const r of sample) console.log(`  ${r.company} | ${r.product_gb} | ${r.companykind_nm} | ${r.area1}`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
