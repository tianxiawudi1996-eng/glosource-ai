import { neon } from '@neondatabase/serverless';
import { lookupMedicalDeviceFirms } from '../app/lib/mfds';
import { checkBusinessStatus } from '../app/lib/nts';

async function main(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL as string);
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM kr_medical_device_firms`;
  const [{ mfr }] = await sql`SELECT count(*)::int AS mfr FROM kr_medical_device_firms WHERE is_manufacturer = true`;
  const [{ withbiz }] = await sql`SELECT count(*)::int AS withbiz FROM kr_medical_device_firms WHERE bizrno IS NOT NULL`;
  console.log(`rows=${count}  제조업=${mfr}  수입업=${count - mfr}  bizrno보유=${withbiz}`);

  // Major Korean medical-device exporters an LLM would surface.
  const names = ['삼성메디슨', '주식회사 삼성메디슨', '오스템임플란트', '(주)오스템임플란트', '메디트', '주식회사 메디트', '인바디', '(주)인바디', '클래시스', '루트로닉', '휴젤', '레이언스', '바텍', '(주)바텍'];
  const m = await lookupMedicalDeviceFirms(names);
  console.log(`\nlookup matched ${m.size} firms:`);
  const bizrnos: string[] = [];
  for (const [k, v] of m) {
    console.log(`  ${k} -> ${v.name} | ${v.induty} | ${v.sido} | biz=${v.bizrno ?? '-'} | closed=${v.closeDate ?? '-'}`);
    if (v.bizrno) bizrnos.push(v.bizrno);
  }
  const nts = await checkBusinessStatus(bizrnos);
  console.log(`\nNTS live status for matched (${nts.size}):`);
  for (const [, v] of nts) console.log(`  ${v.bizrno} -> ${v.statusText} | active=${v.active} | ${v.taxType ?? ''}`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
