/**
 * Executable version of the curation bar. Every curated supplier carries a 'GloSource Verified'
 * badge, so its claims are re-checked against the government registries before it can be written.
 * The seed refuses to write a row that fails — the standard is enforced, not just documented.
 *
 * What each category can actually be checked against:
 *   K-Beauty  MFDS cosmetics registry (화장품제조 licence) + MFDS CGMP list, matched on biz-reg no.
 *   K-Food    Korea food-safety HACCP registry, matched on company name (incl. plant suffixes).
 *   K-Fashion NOTHING. Korea publishes no registry of apparel manufacturers, so manufacturer-vs-
 *             trader cannot be confirmed. Those rows must say so in their notes; the check enforces
 *             the disclosure rather than pretending the supplier was verified.
 */
import { sql } from 'drizzle-orm';
import { db, krCosmeticsFirms, krHaccpFirms } from '../app/lib/db';
import { normFirmName } from '../app/lib/mfds';
import cgmp from '../app/data/cgmp-firms.json';
import type { CuratedSupplier } from './curated-suppliers';

const CGMP_SET = new Set((cgmp.bizrnos as string[]).map(b => b.replace(/\D/g, '')));
const PLANT_SUFFIX = /(공장|지점|캠퍼스|사업장|점)$/;

export interface Verdict {
  supplier: string;
  problems: string[];
  warnings: string[];
  evidence: string[];
}

/** A registry entry belongs to this company if the names match, or differ only by a plant suffix. */
function nameMatches(supplierNorm: string, registryNorm: string): boolean {
  if (registryNorm === supplierNorm) return true;
  if (!registryNorm.startsWith(supplierNorm)) return false;
  return PLANT_SUFFIX.test(registryNorm.slice(supplierNorm.length));
}

// Words that identify nobody, so they must not be what makes a domain look like the company's.
const GENERIC = new Set(['co', 'ltd', 'inc', 'corp', 'corporation', 'company', 'group', 'the', 'and', 'kr', 'com']);

function nameTokens(nameEn: string): string[] {
  return nameEn
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length >= 3 && !GENERIC.has(t));
}

async function checkUrl(url: string, koreanName: string, nameEn: string): Promise<{ problem?: string; warning?: string }> {
  let res: Response;
  try {
    res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
  } catch {
    return { problem: `URL unreachable: ${url}` };
  }
  if (res.status >= 400) return { problem: `URL ${res.status}: ${url}` };

  // Liveness is not ownership. A seeded row once pointed Samyang Foods at roundsquare.ai — an
  // unrelated company that answers 200 all day. Check the domain actually looks like the company's:
  // most Korean corporate sites are JS shells or EUC-KR, so the page text alone is too weak to rely on.
  const host = new URL(res.url || url).hostname.toLowerCase();
  const tokens = nameTokens(nameEn);
  if (tokens.some(t => host.includes(t))) return {};

  let body = '';
  try { body = (await res.text()).toLowerCase(); } catch { /* fall through to the warning */ }
  if (body.includes(koreanName.toLowerCase()) || tokens.some(t => body.includes(t))) return {};

  return { warning: `${host} neither carries the company's name nor names it on the page — confirm the link is really theirs` };
}

export async function verifyCurated(rows: CuratedSupplier[]): Promise<Verdict[]> {
  const cosmetics = await db
    .select({ name: krCosmeticsFirms.name, norm: krCosmeticsFirms.nameNorm, induty: krCosmeticsFirms.induty, bizrno: krCosmeticsFirms.bizrno })
    .from(krCosmeticsFirms)
    .where(sql`${krCosmeticsFirms.induty} = '화장품제조'`);
  const haccp = await db
    .select({ company: krHaccpFirms.company, norm: krHaccpFirms.companyNorm, area: krHaccpFirms.area1 })
    .from(krHaccpFirms);

  const out: Verdict[] = [];

  for (const s of rows) {
    const problems: string[] = [];
    const warnings: string[] = [];
    const evidence: string[] = [];
    const norm = normFirmName(s.name);
    const certs = s.certifications ?? '';

    if (s.trustScore != null) problems.push(`trustScore=${s.trustScore} is invented — no audit produced it`);
    if (/NTS-verified/i.test(certs)) problems.push('"NTS-verified" is not a certification — it only means the business registration is active');

    if (s.category === 'K-Beauty') {
      const hit = cosmetics.find(c => nameMatches(norm, c.norm));
      if (!hit) problems.push('no MFDS 화장품제조 licence — cannot be badged as a verified manufacturer');
      else {
        const biz = (hit.bizrno ?? '').replace(/\D/g, '');
        evidence.push(`MFDS 화장품제조: ${hit.name} (${biz})`);
        const claimsCgmp = certs.includes('CGMP');
        if (claimsCgmp !== CGMP_SET.has(biz)) {
          problems.push(`CGMP claim=${claimsCgmp} but the government CGMP list says ${CGMP_SET.has(biz)}`);
        }
      }
    } else if (s.category === 'K-Food') {
      const hits = haccp.filter(h => nameMatches(norm, h.norm));
      const claimsHaccp = certs.includes('HACCP');
      if (claimsHaccp && !hits.length) problems.push('HACCP claimed but no entry in the food-safety registry');
      if (!claimsHaccp && hits.length) warnings.push(`HACCP certified in the registry but not claimed (${hits[0].company})`);
      if (hits.length) evidence.push(`HACCP: ${hits[0].company}${hits[0].area ? ` (${hits[0].area})` : ''}, ${hits.length} entries`);
    } else if (s.category === 'K-Fashion') {
      // No registry exists. The only honest move is to say so where the buyer will read it.
      if (!/no government registry|cannot confirm manufacturer/i.test(s.notes ?? '')) {
        problems.push('apparel has no government manufacturer registry, so the notes MUST tell the buyer this supplier is unverified');
      }
      if (certs) problems.push(`certifications "${certs}" cannot be backed by any registry we ingest`);
      evidence.push('no registry available for apparel — disclosed as unverified');
    }

    if (s.moqMin != null && !/publicly states|publicly runs|advertises/.test(s.notes ?? '')) {
      problems.push('an MOQ number must be attributed to the company\'s own public claim');
    }

    if (s.url) {
      const u = await checkUrl(s.url, s.name, s.nameEn ?? s.name);
      if (u.problem) problems.push(u.problem);
      if (u.warning) warnings.push(u.warning);
    }

    out.push({ supplier: `${s.nameEn ?? s.name} [${s.category}]`, problems, warnings, evidence });
  }

  return out;
}
