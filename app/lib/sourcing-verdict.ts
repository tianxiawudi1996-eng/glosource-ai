import type { Supplier } from '../api/source/types';

export type Verdict = '샘플 요청' | '조건부 검토' | 'RFQ 먼저' | '보류';

export interface PilotCost {
  sampleQty: number;
  productCost: number;
  freightBuffer: number;
  inspectionBuffer: number;
  total: number;
  currency: string;
}

function parseMoqNumber(moqStr: string): number {
  const cleaned = moqStr.replace(/,/g, '');
  const match = cleaned.match(/[\d.]+/);
  if (!match) return 50;
  const n = parseFloat(match[0]);
  return isNaN(n) || n <= 0 ? 50 : n;
}

function parseMaxPrice(priceStr: string): { value: number; currency: string } {
  let currency = 'USD';
  if (/CNY|¥|人民币|元/i.test(priceStr)) currency = 'CNY';
  else if (/EUR|€/i.test(priceStr)) currency = 'EUR';
  else if (/KRW|₩|원/i.test(priceStr)) currency = 'KRW';

  const nums = priceStr.match(/[\d.]+/g)?.map(Number).filter((n) => !isNaN(n) && n > 0) ?? [];
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return { value: max, currency };
}

export function getVerdict(supplier: Supplier): Verdict {
  const { trustScore, redFlags, verificationStatus } = supplier;

  if (trustScore < 55 || redFlags.length >= 3) return '보류';

  // AI 추정은 최대 "조건부 검토" — 인증서 미확인 상태에서 샘플 발주는 위험
  if (verificationStatus === 'ai_estimated') {
    if (trustScore >= 68) return '조건부 검토';
    return 'RFQ 먼저';
  }

  // 웹 확인 기준: 신뢰도 78+ AND 레드플래그 없어야 샘플 요청
  if (trustScore >= 78 && redFlags.length === 0) return '샘플 요청';
  if (trustScore >= 65) return '조건부 검토';
  return 'RFQ 먼저';
}

export function getVerdictStyle(verdict: Verdict): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (verdict) {
    case '샘플 요청':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    case '조건부 검토':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
    case 'RFQ 먼저':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
    case '보류':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400' };
  }
}

export function getPilotCost(supplier: Supplier): PilotCost | null {
  const moqNum = parseMoqNumber(supplier.moq);
  const { value: maxPrice, currency } = parseMaxPrice(supplier.estimatedPrice);
  if (maxPrice === 0) return null;

  const sampleQty = Math.min(Math.max(moqNum, 3), 50);
  const productCost = Math.round(maxPrice * sampleQty);
  const freightBuffer = Math.max(35, Math.round(productCost * 0.35));
  const inspectionBuffer = supplier.trustScore < 60 ? 450 : 250;

  return {
    sampleQty,
    productCost,
    freightBuffer,
    inspectionBuffer,
    total: productCost + freightBuffer + inspectionBuffer,
    currency,
  };
}
