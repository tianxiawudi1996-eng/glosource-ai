// Single source of truth for GloSource AI's commercial plan facts (EN billing).
//
// Price, monthly search quota, and the Polar checkout key live here only. The
// copy wrapped around them is deliberately different on each surface (landing,
// billing, paywall), but these numbers must match what Polar actually charges.
// The JSON-LD is generated from the same values rather than keeping its own
// copy: it had drifted to a retired $19/$49 pricing tier, which is a price
// Google quotes to buyers and the checkout will not honor.

export type PlanId = 'starter' | 'pro' | 'enterprise' | 'contact';

export interface Plan {
  id: PlanId;
  /** Buyer-facing name. `enterprise` sells as "Business" — the id is the value Polar and the DB store. */
  name: string;
  /** USD per month. null = quoted on request, so no price is ever displayed or emitted. */
  priceUsd: number | null;
  /** null = no listed cap (contact tier). */
  searchesPerMonth: number | null;
  envKey: string;
  /** What the tier adds, for structured-data descriptions. */
  blurb: string;
  highlight: boolean;
}

export const PLANS: readonly Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceUsd: 39,
    searchesPerMonth: 40,
    envKey: 'NEXT_PUBLIC_POLAR_STARTER_LINK',
    blurb: 'Korean supplier shortlists with MFDS / KC certification signals',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUsd: 99,
    searchesPerMonth: 100,
    envKey: 'NEXT_PUBLIC_POLAR_PRO_LINK',
    blurb: 'Korean supplier sourcing, full PDF report, priority support',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Business',
    priceUsd: 249,
    searchesPerMonth: 300,
    envKey: 'NEXT_PUBLIC_POLAR_AGENCY_LINK',
    blurb: 'High-volume sourcing with CSV / PDF export and project history',
    highlight: false,
  },
  {
    id: 'contact',
    name: 'Enterprise',
    priceUsd: null,
    searchesPerMonth: null,
    envKey: 'NEXT_PUBLIC_POLAR_ENTERPRISE_CONTACT',
    blurb: 'Unlimited volume, team seats and API access by request',
    highlight: false,
  },
];

export function planById(id: PlanId): Plan {
  const plan = PLANS.find(p => p.id === id);
  if (!plan) throw new Error(`Unknown plan id: ${id}`);
  return plan;
}

/** '$39' for a listed price, 'Custom' when the tier is quoted on request. */
export function priceLabel(plan: Plan): string {
  return plan.priceUsd === null ? 'Custom' : `$${plan.priceUsd}`;
}

/** '/mo' only when there is a price for it to qualify. */
export function priceUnit(plan: Plan): string {
  return plan.priceUsd === null ? '' : '/mo';
}

export function searchesLabel(plan: Plan): string {
  return plan.searchesPerMonth === null
    ? 'Unlimited volume'
    : `${plan.searchesPerMonth} searches / month`;
}

/**
 * schema.org Offer[] for the SoftwareApplication structured data.
 *
 * Unpriced tiers are dropped: an Offer needs a price to be eligible for a rich
 * result, and inventing one would misquote the checkout.
 */
export function planOffers(plans: readonly Plan[] = PLANS): Record<string, unknown>[] {
  return plans
    .filter(plan => plan.priceUsd !== null)
    .map(plan => ({
      '@type': 'Offer',
      name: plan.name,
      price: String(plan.priceUsd),
      priceCurrency: 'USD',
      url: 'https://glosourceai.com/en/billing',
      description: `${searchesLabel(plan)} · ${plan.blurb}`,
    }));
}
