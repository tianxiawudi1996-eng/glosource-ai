/**
 * Ingest MFDS health-functional-food makers (식약처 건강기능식품정보) into kr_health_food_firms.
 * Source: data.go.kr 1471000/HtfsInfoService03/getHtfsList01 (type=json). Product-level → dedupe to
 * companies by 업소명(ENTRPS). No biz-reg number in source. Match key = company name.
 * Run: node --env-file=.env.local --import tsx scripts/ingest-health.ts   (idempotent: TRUNCATE + reload)
 */
import { neon } from '@neondatabase/serverless';
import { db, krHealthFoodFirms } from '../app/lib/db';
import { normFirmName } from '../app/lib/mfds';

const KEY = process.env.DATAGO_SERVICE_KEY;
const BASE = 'https://apis.data.go.kr/1471000/HtfsInfoService03/getHtfsList01';

interface HtfsItem { ENTRPS?: string; PRDUCT?: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recordsOf(body: any): HtfsItem[] {
  const arr = body?.items;
  if (!arr) return [];
  if (Array.isArray(arr)) return arr.map((x) => x.item || x);
  if (arr.item) return Array.isArray(arr.item) ? arr.item : [arr.item];
  return [];
}

async function getPage(p: number, rows: number): Promise<{ total: number; code: string; recs: HtfsItem[] }> {
  const res = await fetch(`${BASE}?serviceKey=${KEY}&pageNo=${p}&numOfRows=${rows}&type=json`);
  const j = await res.json();
  return { total: j.body?.totalCount ?? 0, code: j.header?.resultCode ?? '?', recs: recordsOf(j.body) };
}

async function main(): Promise<void> {
  if (!KEY) throw new Error('DATAGO_SERVICE_KEY not set');
  const sql = neon(process.env.DATABASE_URL as string);
  await sql`CREATE TABLE IF NOT EXISTS kr_health_food_firms (
    name_norm text PRIMARY KEY, name text NOT NULL, sample_product text, product_count integer
  )`;

  let ROWS = 500;
  let first = await getPage(1, ROWS);
  if (first.code !== '00' || !first.recs.length) { ROWS = 100; first = await getPage(1, ROWS); }
  const total = first.total;
  const pages = Math.ceil(total / ROWS);
  let recs = first.recs;
  for (let p = 2; p <= pages; p++) {
    const { recs: r, code } = await getPage(p, ROWS);
    if (code !== '00') { console.log(`page ${p} resultCode=${code} — stopping`); break; }
    recs = recs.concat(r);
    if (p % 20 === 0) console.log(`page ${p}/${pages}, acc ${recs.length}`);
    await new Promise((rr) => setTimeout(rr, 130));
  }
  console.log(`pulled ${recs.length}/${total} (numOfRows=${ROWS})`);

  const byNorm = new Map<string, typeof krHealthFoodFirms.$inferInsert>();
  for (const it of recs) {
    const name = String(it.ENTRPS || '').trim();
    if (!name) continue;
    const nameNorm = normFirmName(name);
    if (nameNorm.length < 2) continue;
    const product = String(it.PRDUCT || '').trim();
    const ex = byNorm.get(nameNorm);
    if (ex) { ex.productCount = (ex.productCount ?? 0) + 1; if (!ex.sampleProduct && product) ex.sampleProduct = product; }
    else byNorm.set(nameNorm, { nameNorm, name, sampleProduct: product || null, productCount: 1 });
  }
  const rows = [...byNorm.values()];
  console.log(`deduped → ${rows.length} health-food firms`);

  await sql`TRUNCATE kr_health_food_firms`;
  for (let i = 0; i < rows.length; i += 500) {
    await db.insert(krHealthFoodFirms).values(rows.slice(i, i + 500));
  }
  console.log(`DONE: ${rows.length} health-food firms ingested.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
