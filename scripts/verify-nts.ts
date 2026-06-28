import { neon } from '@neondatabase/serverless';
import { checkBusinessStatus } from '../app/lib/nts';

async function main(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL as string);
  // Pull real biz-reg numbers from the MFDS cosmetics registry (manufacturers).
  const rows = (await sql`SELECT name, bizrno FROM kr_cosmetics_firms WHERE bizrno IS NOT NULL AND is_manufacturer = true LIMIT 8`) as { name: string; bizrno: string }[];
  const bizrnos = rows.map((r) => r.bizrno);
  console.log('testing bizrnos from MFDS DB:', bizrnos);
  const m = await checkBusinessStatus(bizrnos);
  console.log(`\nNTS live status (${m.size} resolved):`);
  for (const r of rows) {
    const st = m.get(String(r.bizrno).replace(/\D/g, ''));
    console.log(`  ${r.name} [${r.bizrno}] -> ${st ? `${st.statusText} | active=${st.active} | ${st.taxType ?? ''}` : 'no data'}`);
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
