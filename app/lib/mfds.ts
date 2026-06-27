import { inArray } from 'drizzle-orm';
import { db, krCosmeticsFirms } from '@/app/lib/db';

// Normalize a company name for cross-listing matching (strip corp suffixes, spaces, punctuation).
// Cross-language (EN<->KO) matching is out of scope here; this catches exact/near Korean-name matches.
export function normFirmName(name: string | null | undefined): string {
  return String(name || '')
    .toLowerCase()
    .replace(/주식회사|㈜|\(주\)|co\.?\s*,?\s*ltd\.?|company\s*limited|limited|inc\.?|corp(oration)?\.?|ltd\.?/g, '')
    .replace(/[\s().,\-_'"·`/]/g, '')
    .trim();
}

export interface MfdsMatch {
  name: string;
  induty: string;
  isManufacturer: boolean;
  bizrno: string | null;
  permitDate: string | null;
  ageYears: number | null;
  sido: string | null;
}

function ageFrom(permitDate: string | null): number | null {
  if (!permitDate || permitDate.length < 4) return null;
  const y = parseInt(permitDate.slice(0, 4), 10);
  if (!y || y < 1900) return null;
  return Math.max(0, new Date().getFullYear() - y);
}

// Look up a batch of company names against the MFDS registry.
// Returns map keyed by normalized name -> match (prefers the manufacturer record on collision).
export async function lookupMfdsFirms(names: string[]): Promise<Map<string, MfdsMatch>> {
  const norms = [...new Set(names.map(normFirmName).filter((n) => n.length >= 2))];
  const out = new Map<string, MfdsMatch>();
  if (!norms.length) return out;
  let rows: (typeof krCosmeticsFirms.$inferSelect)[];
  try {
    rows = await db.select().from(krCosmeticsFirms).where(inArray(krCosmeticsFirms.nameNorm, norms)).limit(300);
  } catch {
    return out;
  }
  for (const r of rows) {
    const m: MfdsMatch = {
      name: r.name,
      induty: r.induty,
      isManufacturer: r.isManufacturer,
      bizrno: r.bizrno,
      permitDate: r.permitDate,
      ageYears: ageFrom(r.permitDate),
      sido: r.factoryAddr ? r.factoryAddr.split(/\s+/)[0] : null,
    };
    const ex = out.get(r.nameNorm);
    if (!ex || (m.isManufacturer && !ex.isManufacturer)) out.set(r.nameNorm, m);
  }
  return out;
}
