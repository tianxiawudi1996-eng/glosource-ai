/**
 * Ingest MFDS medical-device manufacturers/importers (식약처 의료기기 통합업체 정보) into
 * kr_medical_device_firms. Source: data.go.kr 1471000/MdeqItgrtEntpInfoService (type=json).
 * Keeps only 제조업 + 수입업 (suppliers); drops 의료기관/판매업/etc. Match key = company name + BRNO.
 * Run: node --env-file=.env.local --import tsx scripts/ingest-medical.ts   (idempotent: TRUNCATE + reload)
 */
import { neon } from '@neondatabase/serverless';
import { db, krMedicalDeviceFirms } from '../app/lib/db';
import { normFirmName } from '../app/lib/mfds';

const KEY = process.env.DATAGO_SERVICE_KEY;
const BASE = 'https://apis.data.go.kr/1471000/MdeqItgrtEntpInfoService/getMdeqItgrtEntpInfoService';
const KEEP = new Set(['제조업', '수입업']);

interface MdeqItem {
  BIZ_IPLA_NM?: string; INDT_DIVS_CD_NM?: string; BIZ_IPLA_BASC_ADDR?: string;
  PRMT_YMD?: string; BRNO?: string; CLSBIZ_YMD?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recordsOf(body: any): MdeqItem[] {
  const arr = body?.items;
  if (!arr) return [];
  if (Array.isArray(arr)) return arr.map((x) => x.item || x);
  if (arr.item) return Array.isArray(arr.item) ? arr.item : [arr.item];
  return [];
}

async function getPage(p: number, rows: number): Promise<{ total: number; code: string; recs: MdeqItem[] }> {
  const res = await fetch(`${BASE}?serviceKey=${KEY}&pageNo=${p}&numOfRows=${rows}&type=json`);
  const j = await res.json();
  return { total: j.body?.totalCount ?? 0, code: j.header?.resultCode ?? '?', recs: recordsOf(j.body) };
}

async function main(): Promise<void> {
  if (!KEY) throw new Error('DATAGO_SERVICE_KEY not set');
  const sql = neon(process.env.DATABASE_URL as string);
  await sql`CREATE TABLE IF NOT EXISTS kr_medical_device_firms (
    id text PRIMARY KEY, name text NOT NULL, name_norm text NOT NULL, induty text NOT NULL,
    is_manufacturer boolean NOT NULL, bizrno text, permit_date text, close_date text, addr text
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mdeq_norm ON kr_medical_device_firms (name_norm)`;

  let ROWS = 1000;
  let first = await getPage(1, ROWS);
  if (first.code !== '00' || !first.recs.length) { ROWS = 500; first = await getPage(1, ROWS); }
  const total = first.total;
  const pages = Math.ceil(total / ROWS);
  let recs = first.recs;
  for (let p = 2; p <= pages; p++) {
    const { recs: r, code } = await getPage(p, ROWS);
    if (code !== '00') { console.log(`page ${p} resultCode=${code} — stopping early`); break; }
    recs = recs.concat(r);
    if (p % 25 === 0) console.log(`page ${p}/${pages}, acc ${recs.length}`);
    await new Promise((rr) => setTimeout(rr, 130));
  }
  console.log(`pulled ${recs.length}/${total} (numOfRows=${ROWS})`);

  // Filter to suppliers (제조업/수입업), dedupe by bizrno||nameNorm, prefer manufacturer + open.
  const byKey = new Map<string, typeof krMedicalDeviceFirms.$inferInsert>();
  let kept = 0;
  for (const it of recs) {
    const induty = String(it.INDT_DIVS_CD_NM || '').trim();
    if (!KEEP.has(induty)) continue;
    const name = String(it.BIZ_IPLA_NM || '').trim();
    if (!name) continue;
    const nameNorm = normFirmName(name);
    if (nameNorm.length < 2) continue;
    const bizrno = String(it.BRNO || '').replace(/\D/g, '') || null;
    const isManufacturer = induty === '제조업';
    const closeDate = String(it.CLSBIZ_YMD || '').trim() || null;
    const key = bizrno || `n:${nameNorm}`;
    const row = {
      id: key, name, nameNorm, induty, isManufacturer, bizrno,
      permitDate: String(it.PRMT_YMD || '').trim() || null,
      closeDate,
      addr: String(it.BIZ_IPLA_BASC_ADDR || '').trim() || null,
    };
    const ex = byKey.get(key);
    if (!ex || (isManufacturer && !ex.isManufacturer) || (!closeDate && ex.closeDate)) byKey.set(key, row);
    kept++;
  }
  const rows = [...byKey.values()];
  console.log(`suppliers kept ${kept} → deduped ${rows.length} firms`);

  await sql`TRUNCATE kr_medical_device_firms`;
  for (let i = 0; i < rows.length; i += 500) {
    await db.insert(krMedicalDeviceFirms).values(rows.slice(i, i + 500));
    if (i % 5000 === 0) console.log(`inserted ${i}...`);
  }
  console.log(`DONE: ${rows.length} medical-device firms ingested.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
