import type { Supplier, SourcingOutput } from '../api/source/types';

const VERIFIED_SUPPLIER_POLICY = 'verified_suppliers_only' as const;

export interface SupplierQualityGateResult {
  ok: boolean;
  output: SourcingOutput;
  rejectedCount: number;
  rejectionReasons: string[];
}

function hasValidSupplierUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function rejectionReason(supplier: Supplier, groundingUsed: boolean): string | null {
  if (!groundingUsed) return 'live_search_grounding_missing';
  if (supplier.verificationStatus !== 'grounding_confirmed') return 'supplier_not_grounding_confirmed';
  if (!hasValidSupplierUrl(supplier.url)) return 'confirmed_supplier_url_missing_or_invalid';
  if (!Array.isArray(supplier.trustEvidence) || supplier.trustEvidence.length === 0) return 'trust_evidence_missing';
  return null;
}

export function enforceVerifiedSupplierQualityGate(output: SourcingOutput): SupplierQualityGateResult {
  const rejectionReasons: string[] = [];
  const accepted: Supplier[] = [];

  for (const supplier of output.suppliers) {
    const reason = rejectionReason(supplier, output.groundingUsed);
    if (reason) {
      rejectionReasons.push(reason);
      continue;
    }
    accepted.push(supplier);
  }

  const rejectedCount = output.suppliers.length - accepted.length;
  const uniqueReasons = [...new Set(rejectionReasons)];
  const gatedOutput: SourcingOutput = {
    ...output,
    suppliers: accepted.map((supplier, index) => ({
      ...supplier,
      rank: index + 1,
      verificationStatus: 'grounding_confirmed',
    })),
    qualityGate: {
      policy: VERIFIED_SUPPLIER_POLICY,
      acceptedCount: accepted.length,
      rejectedCount,
      rejectionReasons: uniqueReasons,
    },
  };

  return {
    ok: accepted.length > 0,
    output: gatedOutput,
    rejectedCount,
    rejectionReasons: uniqueReasons,
  };
}

export function verifiedSupplierUnavailableMessage(lang: 'ko' | 'en'): string {
  if (lang === 'en') {
    return 'No verified supplier candidates passed the quality gate. Try a more specific product name, or search again later when live grounding is available.';
  }
  return '검증 품질 기준을 통과한 공급자 후보가 없습니다. 더 구체적인 제품명으로 다시 검색하거나, 라이브 검색이 가능한 시점에 재시도해주세요.';
}
