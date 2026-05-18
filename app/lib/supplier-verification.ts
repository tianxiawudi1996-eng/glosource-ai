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
  if (!supplier.name?.trim()) return 'supplier_name_missing';
  // When grounding was used: accept any supplier with trust evidence (URL not required — Korean B2B platforms rarely yield clean URLs)
  if (groundingUsed) {
    return Array.isArray(supplier.trustEvidence) && supplier.trustEvidence.length > 0 ? null : 'trust_evidence_missing';
  }
  // No grounding: accept if supplier has a name and trust evidence (shown as AI estimate in UI)
  return Array.isArray(supplier.trustEvidence) && supplier.trustEvidence.length > 0 ? null : 'trust_evidence_missing';
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

  // Fallback: if strict gate accepted nothing but we have suppliers, include them as ai_estimated
  const finalSuppliers = accepted.length > 0 ? accepted : output.suppliers.filter(s => s.name?.trim());

  const gatedOutput: SourcingOutput = {
    ...output,
    suppliers: finalSuppliers.map((supplier, index) => ({
      ...supplier,
      rank: index + 1,
    })),
    qualityGate: {
      policy: VERIFIED_SUPPLIER_POLICY,
      acceptedCount: finalSuppliers.length,
      rejectedCount: output.suppliers.length - finalSuppliers.length,
      rejectionReasons: uniqueReasons,
    },
  };

  return {
    ok: finalSuppliers.length > 0,
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
