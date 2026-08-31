import type { SourcingOutput, WeChatSourcingOutput } from '@/app/api/source/types';
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
    productMatch: '',
    estimatedPrice: '',
    moq: '',
    leadTimeDays: '',
    hscode: '',
    trustEvidence: supplier.trustEvidence.slice(0, 2),
    govEvidence: supplier.govEvidence?.slice(0, 2),
    redFlags: supplier.redFlags.slice(0, 1),
    summary: '',
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

export function redactWeChatSourcingOutputForFree(
  output: WeChatSourcingOutput,
  plan: string,
  surface: ProductSurface = 'kr',
): WeChatSourcingOutput {
  const previewCount = PRODUCT_CONTRACTS[surface].free.resultPreviewCount;
  if (plan !== 'free' || previewCount == null) {
    return { ...output };
  }

  return {
    ...output,
    posts: output.posts.slice(0, previewCount).map((post) => ({
      ...post,
      url: '',
      contactHint: '',
      productSpecs: '',
      productEvidence: '',
      priceRange: '',
      moq: '',
      location: '',
      summary: '',
    })),
    analysis: '',
  };
}

export interface PlanVisibleSourcingResult {
  output: SourcingOutput;
  supplierCount: number;
  topSuppliers: string | null;
  resultJson: string;
}

export function buildPlanVisibleSourcingResult(
  output: SourcingOutput,
  plan: string,
  surface: ProductSurface,
): PlanVisibleSourcingResult {
  const visibleOutput = redactSourcingOutputForFree(output, plan, surface);
  const visibleSuppliers = visibleOutput.suppliers;

  return {
    output: visibleOutput,
    supplierCount: visibleSuppliers.length,
    topSuppliers: visibleSuppliers.map((supplier) => supplier.name).join(', ') || null,
    resultJson: JSON.stringify(visibleOutput),
  };
}
