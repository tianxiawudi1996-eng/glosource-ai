/**
 * Ingest MFDS quasi-drug makers (식약처 의약외품 제품 허가정보) into kr_quasi_drug_firms.
 * Source: data.go.kr 1471000/QdrgPrdtPrmsnInfoService03/getQdrgPrdtPrmsnInfoInq03 (type=json).
 * Product-level → dedupe to companies by ENTP_SEQ. Tracks 제조/수입 + whether any permit is still active.
 * Run: node --env-file=.env.local --import tsx scripts/ingest-quasidrug.ts   (idempotent: TRUNCATE + reload)
 */
import { neon } from '@neondatabase/serverless';
import { db, krQuasiDrugFirms } from '../app/lib/db';
import { normFirmName } from '../app/lib/mfds';

const KEY = process.env.DATAGO_SERVICE_KEY;
const BASE = 'https://apis.data.go.kr/1471000/QdrgPrdtPrmsnInfoService03/getQdrgPrdtPrmsnInfoInq03';

interface QdrgItem {
  ENTP_SEQ?: string; ENTP_NAME?: string; ITEM_NAME?: string; INDUTY_CODE?: string;
  CANCEL_CODE_NAME?: string; ITEM_PERMIT_DATE?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recordsOf(body: any): QdrgItem[] {
  const arr = body?.items;
  if (!arr) return [];
  if (Array.isArray(arr)) return arr.map((x) => x.item || x);
  if (arr.item) return Array.isArray(arr.item) ? arr.item : [arr.item];
  return [];
}

async function getPage(p: number, rows: number): Promise<{ total: number; code: string; recs: QdrgItem[] }> {
  const res = await fetch(`${BASE}?serviceKey=${KEY}&pageNo=${p}&numOfRows=${rows}&type=json`);
  const j = await res.json();
  return { total: j.body?.totalCount ?? 0, code: j.header?.resultCode ?? '?', recs: recordsOf(j.body) };
}

async function main(): Promise<void> {
  if (!KEY) throw new Error('DATAGO_SERVICE_KEY not set');
  const sql = neon(process.env.DATABASE_URL as string);
  await sql`CREATE TABLE IF NOT EXISTS kr_quasi_drug_firms (
    entp_seq text PRIMARY KEY, name text NOT NULL, name_norm text NOT NULL, induty text,
    is_manufacturer boolean NOT NULL, sample_item text, has_active boolean NOT NULL, permit_date text
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_qdrg_norm ON kr_quasi_drug_firms (name_norm)`;

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

  const bySeq = new Map<string, typeof krQuasiDrugFirms.$inferInsert>();
  for (const it of recs) {
    const entpSeq = String(it.ENTP_SEQ || '').trim();
    const name = String(it.ENTP_NAME || '').trim();
    if (!entpSeq || !name) continue;
    const nameNorm = normFirmName(name);
    if (nameNorm.length < 2) continue;
    const induty = String(it.INDUTY_CODE || '').trim() || null;
    const isManufacturer = (induty || '').includes('제조');
    const cancel = String(it.CANCEL_CODE_NAME || '').trim();
    const itemActive = !cancel || cancel === '정상'; // 정상=active; 폐업/취하/행정(취소)=inactive
    const item = String(it.ITEM_NAME || '').trim();
    const permit = String(it.ITEM_PERMIT_DATE || '').trim() || null;
    const ex = bySeq.get(entpSeq);
    if (ex) {
      if (itemActive) ex.hasActive = true;
      if (isManufacturer) ex.isManufacturer = true;
      if (!ex.sampleItem && item) ex.sampleItem = item;
      if (permit && (!ex.permitDate || permit > ex.permitDate)) ex.permitDate = permit;
    } else {
      bySeq.set(entpSeq, { entpSeq, name, nameNorm, induty, isManufacturer, sampleItem: item || null, hasActive: itemActive, permitDate: permit });
    }
  }
  const rows = [...bySeq.values()];
  const mfr = rows.filter((r) => r.isManufacturer).length;
  console.log(`deduped → ${rows.length} quasi-drug firms (제조 ${mfr} / 수입 ${rows.length - mfr})`);

  await sql`TRUNCATE kr_quasi_drug_firms`;
  for (let i = 0; i < rows.length; i += 500) {
    await db.insert(krQuasiDrugFirms).values(rows.slice(i, i + 500));
  }
  console.log(`DONE: ${rows.length} quasi-drug firms ingested.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
