import { inArray } from 'drizzle-orm';
import { db, krCosmeticsFirms, krHaccpFirms, krMedicalDeviceFirms, krHealthFoodFirms, krQuasiDrugFirms } from '@/app/lib/db';
import cgmpData from '@/app/data/cgmp-firms.json';

// CGMP-certified cosmetics manufacturers (MFDS 화장품 GMP 적합업체), keyed by business-reg number.
const CGMP_BIZRNOS = new Set((cgmpData.bizrnos as string[]).map((b) => b.replace(/\D/g, '')));

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
  cgmp: boolean;
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
      cgmp: CGMP_BIZRNOS.has(String(r.bizrno || '').replace(/\D/g, '')),
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

export interface HaccpMatch {
  company: string;
  productGb: string | null;
  businessItem: string | null;
  area1: string | null;
}

// Look up company names against the HACCP-certified food manufacturer registry.
export async function lookupHaccpFirms(names: string[]): Promise<Map<string, HaccpMatch>> {
  const norms = [...new Set(names.map(normFirmName).filter((n) => n.length >= 2))];
  const out = new Map<string, HaccpMatch>();
  if (!norms.length) return out;
  let rows: { company: string; companyNorm: string; productGb: string | null; businessItem: string | null; area1: string | null }[];
  try {
    rows = await db
      .select({ company: krHaccpFirms.company, companyNorm: krHaccpFirms.companyNorm, productGb: krHaccpFirms.productGb, businessItem: krHaccpFirms.businessItem, area1: krHaccpFirms.area1 })
      .from(krHaccpFirms)
      .where(inArray(krHaccpFirms.companyNorm, norms))
      .limit(300);
  } catch {
    return out;
  }
  for (const r of rows) {
    if (!out.has(r.companyNorm)) {
      out.set(r.companyNorm, { company: r.company, productGb: r.productGb, businessItem: r.businessItem, area1: r.area1 });
    }
  }
  return out;
}

export interface MedicalMatch {
  name: string;
  induty: string;
  isManufacturer: boolean;
  bizrno: string | null;
  closeDate: string | null;
  sido: string | null;
}

// Look up company names against the MFDS medical-device manufacturer/importer registry.
export async function lookupMedicalDeviceFirms(names: string[]): Promise<Map<string, MedicalMatch>> {
  const norms = [...new Set(names.map(normFirmName).filter((n) => n.length >= 2))];
  const out = new Map<string, MedicalMatch>();
  if (!norms.length) return out;
  let rows: (typeof krMedicalDeviceFirms.$inferSelect)[];
  try {
    rows = await db.select().from(krMedicalDeviceFirms).where(inArray(krMedicalDeviceFirms.nameNorm, norms)).limit(300);
  } catch {
    return out;
  }
  for (const r of rows) {
    const m: MedicalMatch = {
      name: r.name,
      induty: r.induty,
      isManufacturer: r.isManufacturer,
      bizrno: r.bizrno,
      closeDate: r.closeDate,
      sido: r.addr ? r.addr.split(/\s+/)[0] : null,
    };
    const ex = out.get(r.nameNorm);
    // Prefer a manufacturer record, and an open (not closed) record, on collision.
    if (!ex || (m.isManufacturer && !ex.isManufacturer) || (!m.closeDate && ex.closeDate)) out.set(r.nameNorm, m);
  }
  return out;
}

export interface HealthFoodMatch {
  name: string;
  sampleProduct: string | null;
  productCount: number | null;
}

// Look up company names against the MFDS health-functional-food (건강기능식품) registry.
export async function lookupHealthFoodFirms(names: string[]): Promise<Map<string, HealthFoodMatch>> {
  const norms = [...new Set(names.map(normFirmName).filter((n) => n.length >= 2))];
  const out = new Map<string, HealthFoodMatch>();
  if (!norms.length) return out;
  let rows: (typeof krHealthFoodFirms.$inferSelect)[];
  try {
    rows = await db.select().from(krHealthFoodFirms).where(inArray(krHealthFoodFirms.nameNorm, norms)).limit(300);
  } catch {
    return out;
  }
  for (const r of rows) {
    if (!out.has(r.nameNorm)) out.set(r.nameNorm, { name: r.name, sampleProduct: r.sampleProduct, productCount: r.productCount });
  }
  return out;
}

export interface QuasiDrugMatch {
  name: string;
  induty: string | null;
  isManufacturer: boolean;
  sampleItem: string | null;
  hasActive: boolean;
}

// Look up company names against the MFDS quasi-drug (의약외품) registry.
export async function lookupQuasiDrugFirms(names: string[]): Promise<Map<string, QuasiDrugMatch>> {
  const norms = [...new Set(names.map(normFirmName).filter((n) => n.length >= 2))];
  const out = new Map<string, QuasiDrugMatch>();
  if (!norms.length) return out;
  let rows: (typeof krQuasiDrugFirms.$inferSelect)[];
  try {
    rows = await db.select().from(krQuasiDrugFirms).where(inArray(krQuasiDrugFirms.nameNorm, norms)).limit(300);
  } catch {
    return out;
  }
  for (const r of rows) {
    const m: QuasiDrugMatch = { name: r.name, induty: r.induty, isManufacturer: r.isManufacturer, sampleItem: r.sampleItem, hasActive: r.hasActive };
    const ex = out.get(r.nameNorm);
    if (!ex || (m.isManufacturer && !ex.isManufacturer) || (m.hasActive && !ex.hasActive)) out.set(r.nameNorm, m);
  }
  return out;
}
