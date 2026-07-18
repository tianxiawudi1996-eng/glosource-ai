export type TossPlanId = 'starter' | 'pro' | 'enterprise';

export interface TossPlan {
  id: TossPlanId;
  name: string;
  amount: number;
  searchesLabel: string;
}

export const TOSS_PLANS: readonly TossPlan[] = [
  { id: 'starter', name: 'Starter', amount: 190_000, searchesLabel: '소싱 30회/월' },
  { id: 'pro', name: 'Pro', amount: 490_000, searchesLabel: '소싱 60회/월' },
  { id: 'enterprise', name: 'Enterprise', amount: 990_000, searchesLabel: '무제한' },
];

export function tossPlanById(id: string): TossPlan | undefined {
  return TOSS_PLANS.find(plan => plan.id === id);
}

export function tossPlanByAmount(amount: number): TossPlan | undefined {
  return TOSS_PLANS.find(plan => plan.amount === amount);
}

export type TossStoredPaymentStatus = 'pending' | 'done' | 'canceled' | 'failed';

export function tossPaymentStatus(status: string): TossStoredPaymentStatus {
  if (status === 'DONE' || status === 'PARTIAL_CANCELED') return 'done';
  if (status === 'CANCELED') return 'canceled';
  if (status === 'READY' || status === 'IN_PROGRESS' || status === 'WAITING_FOR_DEPOSIT') return 'pending';
  return 'failed';
}

export function shouldApplyTossPaymentStatus(
  current: TossStoredPaymentStatus,
  next: TossStoredPaymentStatus,
): boolean {
  if (current === 'canceled') return false;
  if (current === 'done') return next === 'canceled';
  return true;
}

export function isTossCheckoutConfigured(
  env: Readonly<Record<string, string | undefined>>,
): boolean {
  return Boolean(
    env.NEXT_PUBLIC_TOSS_CLIENT_KEY
    && env.TOSS_SECRET_KEY
    && env.TOSS_WEBHOOK_SECRET,
  );
}

export function tossPeriodEnd(periodStart: Date): Date {
  const periodEnd = new Date(periodStart);
  const targetDay = periodEnd.getUTCDate();
  periodEnd.setUTCDate(1);
  periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(
    periodEnd.getUTCFullYear(),
    periodEnd.getUTCMonth() + 1,
    0,
  )).getUTCDate();
  periodEnd.setUTCDate(Math.min(targetDay, lastDay));
  return periodEnd;
}

export function nextTossPeriodEnd(approvedAt: Date, currentPeriodEnd: Date | null): Date {
  const extensionBase = currentPeriodEnd && currentPeriodEnd > approvedAt
    ? currentPeriodEnd
    : approvedAt;
  return tossPeriodEnd(extensionBase);
}
