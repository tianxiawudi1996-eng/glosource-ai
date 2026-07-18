/**
 * Ingest Financial Supervisory Service OpenDART company profiles for curated K-Food suppliers.
 *
 * Why OpenDART: the official food-licence APIs expose licence number, industry, company, owner,
 * phone, licence date and address, but not the business-registration number. OpenDART company
 * profiles explicitly expose bizr_no, so this is the authority that can upgrade weak company-site
 * provenance without inventing a join.
 *
 * Required env: DART_API_KEY, DATABASE_URL
 * Run: npm run db:ingest:opendart
 * Idempotent: upserts by OpenDART corporation code.
 */
import { normFirmName } from '../app/lib/firm-name';
import {
  matchDartCorporation,
  parseDartCompanyProfile,
  parseDartCorpCodes,
  type DartCompanyProfile,
} from '../app/lib/opendart';
import { CURATED } from './curated-suppliers';

const KEY = process.env.DART_API_KEY;
const CORP_CODES = 'https://engopendart.fss.or.kr/engapi/corpCode.json';
const COMPANY = 'https://opendart.fss.or.kr/api/company.json';

async function getJson(base: string, params: Record<string, string>): Promise<unknown> {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`OpenDART HTTP ${response.status} for ${url.pathname}`);
  return response.json();
}

async function main(): Promise<void> {
  if (!KEY) throw new Error('DART_API_KEY not set');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
  const { db, krDartFirms } = await import('../app/lib/db');

  const codeRows = parseDartCorpCodes(await getJson(CORP_CODES, { crtfc_key: KEY }));
  const suppliers = CURATED.filter((supplier) => supplier.category === 'K-Food' && !supplier.bizrno);
  const unmatched: string[] = [];
  const profiles: DartCompanyProfile[] = [];

  for (const supplier of suppliers) {
    const corporation = matchDartCorporation(codeRows, supplier.name);
    if (!corporation) {
      unmatched.push(supplier.name);
      continue;
    }
    const profile = parseDartCompanyProfile(await getJson(COMPANY, {
      crtfc_key: KEY,
      corp_code: corporation.corpCode,
    }));
    profiles.push(profile);
  }

  const unique = [...new Map(profiles.map((profile) => [profile.corpCode, profile])).values()];
  for (const profile of unique) {
    await db.insert(krDartFirms).values({
      corpCode: profile.corpCode,
      name: profile.name,
      nameNorm: normFirmName(profile.name),
      nameEn: profile.nameEn,
      stockCode: profile.stockCode,
      jurirNo: profile.jurirNo,
      bizrno: profile.bizrno,
      address: profile.address,
      homepage: profile.homepage,
      fetchedAt: new Date(),
    }).onConflictDoUpdate({
      target: krDartFirms.corpCode,
      set: {
        name: profile.name,
        nameNorm: normFirmName(profile.name),
        nameEn: profile.nameEn,
        stockCode: profile.stockCode,
        jurirNo: profile.jurirNo,
        bizrno: profile.bizrno,
        address: profile.address,
        homepage: profile.homepage,
        fetchedAt: new Date(),
      },
    });
  }

  console.log(`OpenDART: matched ${unique.length}/${suppliers.length} curated K-Food suppliers`);
  if (unmatched.length) {
    console.warn(`OpenDART unmatched (not silently assigned): ${unmatched.join(', ')}`);
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
