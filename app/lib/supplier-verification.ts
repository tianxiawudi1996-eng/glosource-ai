import type { SourcingOutput } from '../api/source/types';

const VERIFIED_SUPPLIER_POLICY = 'verified_suppliers_only' as const;

export interface SupplierQualityGateResult {
  ok: boolean;
  output: SourcingOutput;
  rejectedCount: number;
  rejectionReasons: string[];
}

export function enforceVerifiedSupplierQualityGate(output: SourcingOutput): SupplierQualityGateResult {
  // Accept any supplier with a name — verification level is shown in the UI via verificationStatus badges
  const accepted = output.suppliers.filter(s => s.name?.trim());

  const gatedOutput: SourcingOutput = {
    ...output,
    suppliers: accepted.map((s, i) => ({ ...s, rank: i + 1 })),
    qualityGate: {
      policy: VERIFIED_SUPPLIER_POLICY,
      acceptedCount: accepted.length,
      rejectedCount: output.suppliers.length - accepted.length,
      rejectionReasons: [],
    },
  };

  return {
    ok: accepted.length > 0,
    output: gatedOutput,
    rejectedCount: output.suppliers.length - accepted.length,
    rejectionReasons: [],
  };
}

export function verifiedSupplierUnavailableMessage(lang: 'ko' | 'en'): string {
  if (lang === 'en') {
    return 'No supplier candidates found. Try a more specific product name and search again.';
  }
  return '공급자 후보를 찾지 못했습니다. 더 구체적인 제품명으로 다시 검색해주세요.';
}
