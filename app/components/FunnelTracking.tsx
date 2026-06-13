'use client';

import { useEffect } from 'react';
import { trackBeginCheckout, trackPurchase } from '@/app/lib/analytics';

// Client wrappers so funnel events can be fired from server components
// (billing page). The checkout links open in a new tab, so the current page
// stays alive and the gtag event has time to send.

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
      target="_blank"
      rel="noopener noreferrer"
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
    trackPurchase(plan, value, currency);
  }, [plan, value, currency]);
  return null;
}
