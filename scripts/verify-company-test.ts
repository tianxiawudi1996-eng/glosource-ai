import { verifyKoreanCompany } from '../app/lib/verify-company';

async function main(): Promise<void> {
  for (const name of ['COSMAX', '한국콜마', '오스템임플란트', '농심', '정관장', '고려은단', 'NotARealCompanyXYZ']) {
    const v = await verifyKoreanCompany(name, 'en');
    console.log(`\n=== ${name} === found=${v.found} active=${v.activeBusiness} [${v.registries.join(', ')}]`);
    v.evidence.forEach((e) => console.log(`  + ${e}`));
    v.redFlags.forEach((f) => console.log(`  ! ${f}`));
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
