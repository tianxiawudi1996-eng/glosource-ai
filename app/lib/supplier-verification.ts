import { SUPPLIER_CANDIDATE_POLICY, type SourcingOutput, type Supplier } from '../api/source/types';

export type SupplierVerificationKind = 'government' | 'curated' | 'url' | 'unconfirmed';

export function supplierVerificationKind(
  supplier: Pick<Supplier, 'govVerified' | 'dbVerified' | 'urlCompanyMatch'>,
): SupplierVerificationKind {
  if (supplier.govVerified) return 'government';
  if (supplier.dbVerified) return 'curated';
  if (supplier.urlCompanyMatch) return 'url';
  return 'unconfirmed';
}

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

  const accepted = output.suppliers.filter(s =>
    s.name?.trim() &&
    /^https?:\/\//i.test(s.url || '') &&
    (s.dbVerified === true || (
      output.groundingUsed &&
      s.verificationStatus === 'grounding_confirmed' &&
      s.urlCompanyMatch === true
    )),
  );

  const rejectedCount = output.suppliers.length - accepted.length;
  if (rejectedCount > 0) {
    rejectionReasons.push('Rejected candidates without a server-confirmed URL/company match or curated database match.');
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
    return 'No server-confirmed supplier candidates were found. Try a more specific product name and search again.';
  }
  return '서버에서 확인된 공급자 후보를 찾지 못했습니다. 더 구체적인 제품명으로 다시 검색해주세요.';
}
