import type { Supplier } from '@/app/api/source/types';

interface SupplierDefaults {
  platform: string;
  country: string;
}

export function normalizeSupplierCandidate(
  supplier: unknown,
  index: number,
  defaults: SupplierDefaults,
): Supplier | null {
  if (!supplier || typeof supplier !== 'object' || Array.isArray(supplier)) return null;
  const source = supplier as Record<string, unknown>;
  const stringValue = (key: string): string => typeof source[key] === 'string' ? source[key] : '';
  const stringArray = (key: string): string[] => Array.isArray(source[key])
    ? source[key].filter((value): value is string => typeof value === 'string')
    : [];
  const productStage = ['raw_material', 'semi_finished', 'finished_product'].includes(stringValue('productStage'))
    ? stringValue('productStage') as Supplier['productStage']
    : 'finished_product';
  const rank = typeof source.rank === 'number' && Number.isFinite(source.rank) ? source.rank : index + 1;
  const trustScore = typeof source.trustScore === 'number' && Number.isFinite(source.trustScore)
    ? Math.max(0, Math.min(100, source.trustScore))
    : 0;

  return {
    rank,
    name: stringValue('name') || `Supplier ${index + 1}`,
    platform: stringValue('platform') || defaults.platform,
    country: stringValue('country') || defaults.country,
    url: stringValue('url'),
    trustScore,
    trustEvidence: stringArray('trustEvidence'),
    redFlags: stringArray('redFlags'),
    productMatch: stringValue('productMatch'),
    estimatedPrice: stringValue('estimatedPrice'),
    moq: stringValue('moq'),
    summary: stringValue('summary'),
    verificationStatus: source.verificationStatus === 'grounding_confirmed'
      ? 'grounding_confirmed'
      : 'ai_estimated',
    productStage,
    leadTimeDays: stringValue('leadTimeDays'),
    hscode: stringValue('hscode'),
    exportToKoreaExperience: Boolean(source.exportToKoreaExperience),
  };
}
