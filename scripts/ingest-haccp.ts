/**
 * Ingest HACCP-certified food manufacturers (한국식품안전관리인증원) into kr_haccp_firms.
 * Source: data.go.kr B553748/CertCompanyListService2 (returnType=json). Match key = company name (no bizrno).
 * Run: node --env-file=.env.local --import tsx scripts/ingest-haccp.ts   (idempotent: TRUNCATE + reload)
 */
import { neon } from '@neondatabase/serverless';
import { db, krHaccpFirms } from '../app/lib/db';
import { normFirmName } from '../app/lib/mfds';

const KEY = process.env.DATAGO_SERVICE_KEY;
const BASE = 'https://apis.data.go.kr/B553748/CertCompanyListService2/getCertCompanyListService2';

interface HaccpItem {
  appointno?: string; company?: string; productGb?: string; businessitemNm?: string;
  companykindNm?: string; area1?: string; area2?: string; issuedate?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recordsOf(body: any): HaccpItem[] {
  const arr = body?.items;
  if (!arr) return [];
  if (Array.isArray(arr)) return arr.map((x) => x.item || x);
  if (arr.item) return Array.isArray(arr.item) ? arr.item : [arr.item];
  return [];
}

async function getPage(p: number, rows: number): Promise<{ total: number; recs: HaccpItem[] }> {
  const res = await fetch(`${BASE}?serviceKey=${KEY}&pageNo=${p}&numOfRows=${rows}&returnType=json`);
  const j = await res.json();
  return { total: j.body?.totalCount ?? 0, recs: recordsOf(j.body) };
}

async function main(): Promise<void> {
  if (!KEY) throw new Error('DATAGO_SERVICE_KEY not set');
  const sql = neon(process.env.DATABASE_URL as string);
  await sql`CREATE TABLE IF NOT EXISTS kr_haccp_firms (
    appointno text PRIMARY KEY, company text NOT NULL, company_norm text NOT NULL,
    product_gb text, business_item text, companykind_nm text, area1 text, area2 text, issue_date text
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_haccp_norm ON kr_haccp_firms (company_norm)`;

  let ROWS = 500;
  let first = await getPage(1, ROWS);
  if (!first.recs.length) { ROWS = 100; first = await getPage(1, ROWS); }
  const total = first.total;
  const pages = Math.ceil(total / ROWS);
  let recs = first.recs;
  for (let p = 2; p <= pages; p++) {
    const { recs: r } = await getPage(p, ROWS);
    recs = recs.concat(r);
    if (p % 20 === 0) console.log(`page ${p}/${pages}, acc ${recs.length}`);
    await new Promise((rr) => setTimeout(rr, 150));
  }
  console.log(`pulled ${recs.length}/${total} (numOfRows=${ROWS})`);

  const seen = new Set<string>();
  const rows = [];
  for (const it of recs) {
    const appointno = String(it.appointno || '').trim();
    const company = String(it.company || '').trim();
    if (!appointno || !company || seen.has(appointno)) continue;
    seen.add(appointno);
    rows.push({
      appointno,
      company,
      companyNorm: normFirmName(company),
      productGb: it.productGb || null,
      businessItem: it.businessitemNm || null,
      companykindNm: it.companykindNm || null,
      area1: it.area1 || null,
      area2: it.area2 || null,
      issueDate: it.issuedate || null,
    });
  }
  await sql`TRUNCATE kr_haccp_firms`;
  for (let i = 0; i < rows.length; i += 500) {
    await db.insert(krHaccpFirms).values(rows.slice(i, i + 500));
    if (i % 5000 === 0) console.log(`inserted ${i}...`);
  }
  console.log(`DONE: ${rows.length} HACCP firms ingested.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
