/**
 * Ingest MFDS (식약처) registered cosmetics firms into kr_cosmetics_firms.
 * Real government data: 화장품제조(manufacturer) / 화장품책임판매(brand-seller) + 사업자번호 + 등록일 + 공장주소.
 * Source: data.go.kr CsmtcsMfcrtrInfoService01 (free, dev tier 1,000 req/day; numOfRows max 500).
 *
 * Run: node --env-file=.env.local --import tsx scripts/ingest-mfds.ts
 * Idempotent: TRUNCATE + reload (refreshable).
 */
import { neon } from '@neondatabase/serverless';
import { db, krCosmeticsFirms } from '../app/lib/db';
import { normFirmName } from '../app/lib/mfds';

const KEY = process.env.DATAGO_SERVICE_KEY;
const BASE = 'https://apis.data.go.kr/1471000/CsmtcsMfcrtrInfoService01/getCsmtcsMfcrtrInfoList01';
const ROWS = 500;

interface MfdsItem {
  ENTP_SEQ?: string; ENTP_NAME?: string; INDUTY?: string; BOSS_NAME?: string;
  ENTP_PERMIT_DATE?: string; FACTORY_ADDR?: string; BIZRNO?: string;
}

async function getPage(p: number): Promise<{ totalCount: number; items: MfdsItem[] }> {
  const res = await fetch(`${BASE}?serviceKey=${KEY}&pageNo=${p}&numOfRows=${ROWS}&type=json`);
  const j = await res.json();
  return { totalCount: j.body?.totalCount ?? 0, items: j.body?.items ?? [] };
}

async function main(): Promise<void> {
  if (!KEY) throw new Error('DATAGO_SERVICE_KEY not set');
  const sql = neon(process.env.DATABASE_URL as string);

  await sql`CREATE TABLE IF NOT EXISTS kr_cosmetics_firms (
    entp_seq text PRIMARY KEY, name text NOT NULL, name_norm text NOT NULL,
    induty text NOT NULL, is_manufacturer boolean NOT NULL, boss_name text,
    permit_date text, factory_addr text, bizrno text, fetched_at timestamp DEFAULT now()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_kcf_name_norm ON kr_cosmetics_firms (name_norm)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_kcf_bizrno ON kr_cosmetics_firms (bizrno)`;

  const first = await getPage(1);
  const pages = Math.ceil(first.totalCount / ROWS);
  let items = first.items;
  for (let p = 2; p <= pages; p++) {
    const { items: it } = await getPage(p);
    items = items.concat(it);
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`pulled ${items.length}/${first.totalCount}`);

  const seen = new Set<string>();
  const rows = [];
  for (const it of items) {
    const seq = String(it.ENTP_SEQ || '').trim();
    if (!seq || seen.has(seq)) continue;
    seen.add(seq);
    const induty = String(it.INDUTY || '');
    rows.push({
      entpSeq: seq,
      name: String(it.ENTP_NAME || '').trim(),
      nameNorm: normFirmName(it.ENTP_NAME),
      induty,
      isManufacturer: induty.includes('제조'),
      bossName: it.BOSS_NAME ? String(it.BOSS_NAME) : null,
      permitDate: it.ENTP_PERMIT_DATE ? String(it.ENTP_PERMIT_DATE) : null,
      factoryAddr: it.FACTORY_ADDR ? String(it.FACTORY_ADDR) : null,
      bizrno: it.BIZRNO ? String(it.BIZRNO) : null,
    });
  }

  await sql`TRUNCATE kr_cosmetics_firms`;
  for (let i = 0; i < rows.length; i += 500) {
    await db.insert(krCosmeticsFirms).values(rows.slice(i, i + 500));
    if (i % 5000 === 0) console.log(`inserted ${i}...`);
  }
  const mfr = rows.filter((r) => r.isManufacturer).length;
  console.log(`DONE: ${rows.length} firms ingested (manufacturers ${mfr}, sellers ${rows.length - mfr}).`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
