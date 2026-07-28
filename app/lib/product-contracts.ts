import { PLANS } from './plans';
import { TOSS_PLANS } from './tossPlans';

export type ProductSurface = 'kr' | 'en';
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';

export interface SurfaceSubscription {
  plan: Exclude<SubscriptionPlan, 'free'>;
  polarSubscriptionId: string | null;
}

export type SurfacePlans = Record<ProductSurface, SubscriptionPlan>;

export const PRODUCT_CONTRACTS = {
  kr: {
    basePath: '/',
    commercialStatus: 'beta_waitlist',
    sourcingDirection: 'korea_to_overseas',
    buyer: 'Korean companies sourcing from China and other overseas markets',
    currency: 'KRW',
    free: {
      anonymousSearchesPerDay: 5,
      accountSearchesPerMonth: 5,
      resultPreviewCount: 1,
    },
    paidPlans: TOSS_PLANS,
  },
  en: {
    basePath: '/en',
    commercialStatus: 'live_commercial',
    sourcingDirection: 'overseas_to_korea',
    buyer: 'International buyers sourcing Korean manufacturers and K-products',
    currency: 'USD',
    free: {
      anonymousSearchesPerDay: 0,
      accountSearchesPerMonth: 3,
      resultPreviewCount: 1,
    },
    paidPlans: PLANS,
  },
} as const;

export function monthlySearchQuota(
  surface: ProductSurface,
  plan: SubscriptionPlan,
): number | null {
  if (plan === 'free') {
    return PRODUCT_CONTRACTS[surface].free.accountSearchesPerMonth;
  }

  if (surface === 'kr') {
    return TOSS_PLANS.find(candidate => candidate.id === plan)?.searchesPerMonth ?? null;
  }

  return PLANS.find(candidate => candidate.id === plan)?.searchesPerMonth ?? null;
}

export function resolveSurfacePlans(
  subscriptions: readonly SurfaceSubscription[],
): SurfacePlans {
  const plans: SurfacePlans = { kr: 'free', en: 'free' };

  for (const subscription of subscriptions) {
    const surface: ProductSurface = subscription.polarSubscriptionId ? 'en' : 'kr';
    if (plans[surface] === 'free') {
      plans[surface] = subscription.plan;
    }
  }

  return plans;
}
