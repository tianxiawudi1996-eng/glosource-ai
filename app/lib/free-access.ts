import type { SourcingOutput } from '@/app/api/source/types';
import { PRODUCT_CONTRACTS, type ProductSurface } from './product-contracts';

const LOCKED_OUTPUT_MESSAGE =
  'Free plan shows a search preview only. Upgrade to view full supplier details, source URLs, RFQ drafts, and exports.';

export function redactSourcingOutputForFree(
  output: SourcingOutput,
  plan: string,
  surface: ProductSurface = 'en',
): SourcingOutput {
  const previewCount = PRODUCT_CONTRACTS[surface].free.resultPreviewCount;
  if (plan !== 'free' || previewCount == null) {
    return {
      ...output,
      access: { plan, supplierDetailsLocked: false },
    };
  }

  const originalSupplierCount = output.suppliers.length;
  const previewSuppliers = output.suppliers.slice(0, previewCount).map((supplier) => ({
    ...supplier,
    url: '',
    urlCompanyMatch: false,
    verificationStatus:
      supplier.urlCompanyMatch && !supplier.govVerified && !supplier.dbVerified
        ? 'ai_estimated'
        : supplier.verificationStatus,
    productMatch: supplier.productMatch
      ? `${supplier.productMatch.slice(0, 140)}${supplier.productMatch.length > 140 ? '...' : ''}`
      : supplier.productMatch,
    estimatedPrice: '',
    moq: '',
    leadTimeDays: '',
    hscode: '',
    trustEvidence: supplier.trustEvidence.slice(0, 2),
    govEvidence: supplier.govEvidence?.slice(0, 2),
    redFlags: supplier.redFlags.slice(0, 1),
    summary: supplier.summary
      ? `${supplier.summary.slice(0, 160)}${supplier.summary.length > 160 ? '...' : ''}`
      : supplier.summary,
  }));

  return {
    ...output,
    suppliers: previewSuppliers,
    recommendation: '',
    rfqEmail: {
      en: '',
      zh: '',
    },
    aeoMatches: undefined,
    marketRiskFlags: undefined,
    access: {
      plan,
      supplierDetailsLocked: true,
      lockedReason: LOCKED_OUTPUT_MESSAGE,
      hiddenSupplierCount: Math.max(0, originalSupplierCount - previewSuppliers.length),
      resultPreviewCount: previewSuppliers.length,
    },
  };
}
