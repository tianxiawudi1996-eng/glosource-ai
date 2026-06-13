import type { SourcingOutput } from '../api/source/types';

const SUPPLIER_CANDIDATE_POLICY = 'search_grounded_supplier_candidates' as const;

export interface SupplierQualityGateResult {
  ok: boolean;
  output: SourcingOutput;
  rejectedCount: number;
  rejectionReasons: string[];
}

export function enforceVerifiedSupplierQualityGate(output: SourcingOutput): SupplierQualityGateResult {
  const rejectionReasons: string[] = [];
  if (!output.groundingUsed) {
    rejectionReasons.push('AI response did not include search grounding metadata.');
  }

  const accepted = output.groundingUsed
    ? output.suppliers.filter(s =>
        s.name?.trim() &&
        s.verificationStatus === 'grounding_confirmed' &&
        /^https?:\/\//i.test(s.url || ''),
      )
    : [];

  const rejectedCount = output.suppliers.length - accepted.length;
  if (rejectedCount > 0) {
    rejectionReasons.push('Rejected candidates without a search-grounded URL.');
  }

  const gatedOutput: SourcingOutput = {
    ...output,
    suppliers: accepted.map((s, i) => ({ ...s, rank: i + 1 })),
    qualityGate: {
      policy: SUPPLIER_CANDIDATE_POLICY,
      acceptedCount: accepted.length,
      rejectedCount,
      rejectionReasons,
    },
  };

  return {
    ok: accepted.length > 0,
    output: gatedOutput,
    rejectedCount,
    rejectionReasons,
  };
}

export function verifiedSupplierUnavailableMessage(lang: 'ko' | 'en'): string {
  if (lang === 'en') {
    return 'No search-grounded supplier candidates were found. Try a more specific product name and search again.';
  }
  return '검색 근거가 있는 공급자 후보를 찾지 못했습니다. 더 구체적인 제품명으로 다시 검색해주세요.';
}
