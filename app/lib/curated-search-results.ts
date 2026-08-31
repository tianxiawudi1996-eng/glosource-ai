import type { Supplier } from '@/app/api/source/types';

interface MergeCuratedOptions {
  repeatQuery: boolean;
  limit?: number;
}

interface CuratedMergeResult {
  suppliers: Supplier[];
  liveSupplierCount: number;
  curatedSupplierCount: number;
}

function supplierIdentity(supplier: Supplier): string {
  try {
    const host = new URL(supplier.url).hostname.replace(/^www\./, '').toLowerCase();
    if (host) return `host:${host}`;
  } catch {
    // Suppliers without a usable URL fall back to their normalized company name.
  }

  const name = supplier.name
    .toLowerCase()
    .replace(/\b(?:co|company|corp|corporation|inc|ltd|limited)\b/gi, '')
    .replace(/[^a-z0-9가-힣]/g, '');
  return name ? `name:${name}` : '';
}

export function getQueryCluster(product: string): string {
  const normalized = product.trim().replace(/\s+/g, ' ').toLowerCase();
  const kbeautyTerms = [
    'k-beauty', 'korean beauty', 'skincare', 'cosmetic', 'toner', 'lotion',
    'serum', 'ampoule', 'cream', 'sunscreen', 'spf', 'sheet mask', 'toner pad',
    'olive young', 'pdrn', 'collagen', 'centella', 'cica',
  ];
  if (kbeautyTerms.some(term => normalized.includes(term))) return 'kbeauty';
  return normalized
    .replace(/[^a-z0-9가-힣\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join('-') || 'general';
}

export function queryClusterHistoryCounts(
  rows: { product: string | null; userId: string | null }[],
  product: string,
  userId: string | null,
): { abuseSimilarCount: number; requesterSimilarCount: number } {
  const cluster = getQueryCluster(product);
  const similarRows = rows.filter(row => row.product && getQueryCluster(row.product) === cluster);
  return {
    abuseSimilarCount: similarRows.length,
    requesterSimilarCount: userId
      ? similarRows.filter(row => row.userId === userId).length
      : similarRows.length,
  };
}

export function mergeCuratedSearchResults(
  liveSuppliers: Supplier[],
  curatedSuppliers: Supplier[],
  options: MergeCuratedOptions,
): CuratedMergeResult {
  const seen = new Set(liveSuppliers.map(supplierIdentity).filter(Boolean));
  const curated = curatedSuppliers
    .filter(supplier => {
      const identity = supplierIdentity(supplier);
      if (!identity || seen.has(identity)) return false;
      seen.add(identity);
      return true;
    })
    .slice(0, options.limit ?? 2)
    .map(supplier => ({
      ...supplier,
      repeatQuery: options.repeatQuery || undefined,
    }));

  return {
    suppliers: [...curated, ...liveSuppliers].map((supplier, index) => ({
      ...supplier,
      rank: index + 1,
    })),
    liveSupplierCount: liveSuppliers.length,
    curatedSupplierCount: curated.length,
  };
}
