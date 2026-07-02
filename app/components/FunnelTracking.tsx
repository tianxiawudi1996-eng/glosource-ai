'use client';

import { useEffect } from 'react';
import { trackBeginCheckout, trackPurchase } from '@/app/lib/analytics';

// Client wrappers so funnel events can be fired from server components
// (billing page).

export function CheckoutLink({
  href,
  plan,
  className,
  children,
}: {
  href: string;
  plan: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={() => trackBeginCheckout(plan)}
      className={className}
    >
      {children}
    </a>
  );
}

// Fires the GA4 purchase event once when a payment success page renders.
// value/currency are optional: the Polar (EN) redirect can arrive before the
// webhook records the amount, so EN passes plan only; the Toss (KO) success page
// confirms server-side and passes the real KRW amount.
export function PurchaseTracker({
  plan,
  value,
  currency,
}: {
  plan: string;
  value?: number;
  currency?: string;
}) {
  useEffect(() => {
    const key = `glosource_purchase_tracked:${window.location.pathname}:${window.location.search}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    trackPurchase(plan, value, currency);
  }, [plan, value, currency]);
  return null;
}
