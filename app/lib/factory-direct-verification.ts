import type { SourcingOutput, Supplier } from '@/app/api/source/types';
import {
  enforceVerifiedSupplierQualityGate,
  type SupplierQualityGateResult,
} from '@/app/lib/supplier-verification';
import {
  verifySupplierUrlIdentities,
  type SupplierUrlVerificationOptions,
} from '@/app/lib/supplier-url-verification';
import { normalizeSupplierCandidate } from '@/app/lib/supplier-normalization';
import { parsePublicHttpUrl } from '@/app/lib/public-url';

export interface FactoryDirectRequestInput {
  productDescription: string;
  quantity: string;
  budget?: string;
  categoryCode?: string;
}

export interface FactoryDirectVerificationOptions extends SupplierUrlVerificationOptions {
  groundingHosts?: readonly string[];
}

const SOURCE_UNCONFIRMED = 'Supplier URL was not present in the Google grounding sources — verify directly.';

export function parseFactoryDirectRequest(body: unknown): FactoryDirectRequestInput | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const source = body as Record<string, unknown>;
  if (typeof source.productDescription !== 'string' || !source.productDescription.trim()) return null;
  if (typeof source.quantity !== 'string' || !source.quantity.trim()) return null;
  return {
    productDescription: source.productDescription,
    quantity: source.quantity,
    ...(typeof source.budget === 'string' ? { budget: source.budget } : {}),
    ...(typeof source.categoryCode === 'string' ? { categoryCode: source.categoryCode } : {}),
  };
}

export function isRetryableFactoryError(error: unknown, clientAborted: boolean): boolean {
  if (clientAborted) return false;
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return ['429', '503', 'request aborted', 'operation was aborted', 'timeout', 'timed out']
    .some((value) => message.includes(value));
}

function hostnameMatchesSource(hostname: string, sourceHost: string): boolean {
  return hostname === sourceHost || hostname.endsWith(`.${sourceHost}`);
}

function enforceGroundingSourceHosts(suppliers: Supplier[], sourceHosts: readonly string[]): void {
  const allowedHosts = sourceHosts
    .map((host) => host.toLowerCase().replace(/^www\./, '').replace(/\.$/, ''))
    .filter(Boolean);
  for (const supplier of suppliers) {
    if (supplier.verificationStatus !== 'grounding_confirmed') continue;
    const parsed = parsePublicHttpUrl(supplier.url);
    const hostname = parsed ? new URL(parsed.requestUrl).hostname.toLowerCase().replace(/^www\./, '') : '';
    if (hostname && allowedHosts.some((sourceHost) => hostnameMatchesSource(hostname, sourceHost))) continue;
    supplier.verificationStatus = 'ai_estimated';
    supplier.urlCompanyMatch = false;
    supplier.redFlags = supplier.redFlags.includes(SOURCE_UNCONFIRMED)
      ? supplier.redFlags
      : [SOURCE_UNCONFIRMED, ...supplier.redFlags];
  }
}

export function normalizeFactoryOutput(
  parsed: unknown,
  groundingUsed: boolean,
): SourcingOutput {
  const source = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed as Record<string, unknown>
    : {};
  const suppliers: Supplier[] = Array.isArray(source.suppliers)
    ? source.suppliers.flatMap((supplier, index) => {
      const normalized = normalizeSupplierCandidate(supplier, index, { platform: '1688', country: '중국' });
      return normalized ? [normalized] : [];
    })
    : [];
  const rfqEmail = source.rfqEmail && typeof source.rfqEmail === 'object'
    ? source.rfqEmail as Record<string, unknown>
    : {};

  return {
    suppliers,
    recommendation: typeof source.recommendation === 'string' ? source.recommendation : '',
    rfqEmail: {
      en: typeof rfqEmail.en === 'string' ? rfqEmail.en : '',
      zh: typeof rfqEmail.zh === 'string' ? rfqEmail.zh : '',
    },
    disclaimer: typeof source.disclaimer === 'string' && source.disclaimer ? source.disclaimer :
      '1688.com은 중국 내수용 플랫폼입니다. 국제 배송 및 통관은 포워딩 업체를 통해 진행하시기 바랍니다. 본 분석은 AI 참고용 자료입니다.',
    groundingUsed,
  };
}

export async function verifyFactoryDirectOutput(
  parsed: unknown,
  groundingUsed: boolean,
  verificationOptions: FactoryDirectVerificationOptions = {},
): Promise<SupplierQualityGateResult> {
  const output = normalizeFactoryOutput(parsed, groundingUsed);
  if (groundingUsed) {
    enforceGroundingSourceHosts(output.suppliers, verificationOptions.groundingHosts ?? []);
    await verifySupplierUrlIdentities(output.suppliers, verificationOptions);
  }
  return enforceVerifiedSupplierQualityGate(output);
}
