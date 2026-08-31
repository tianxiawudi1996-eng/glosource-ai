export const REFUND_POLICY = {
  firstPaymentWindowHours: 48,
  maxSearchesExclusive: 3,
  euWithdrawalPeriodDays: 14,
  termsPath: '/terms#section-3-4',
} as const;

export function refundEligibilitySummary(): string {
  return `within ${REFUND_POLICY.firstPaymentWindowHours} hours of your first payment and with fewer than ${REFUND_POLICY.maxSearchesExclusive} searches used`;
}

export function refundPolicyPublicUrl(origin = 'https://glosourceai.com'): string {
  return `${origin}${REFUND_POLICY.termsPath}`;
}
