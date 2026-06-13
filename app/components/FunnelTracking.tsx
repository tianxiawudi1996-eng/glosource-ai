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

// Fires the GA4 purchase event once when the Polar success banner renders.
// No value/transaction_id: the redirect can arrive before the webhook records
// the payment, so we keep it to a reliable plan-level conversion signal.
export function PurchaseTracker({ plan }: { plan: string }) {
  useEffect(() => {
    trackPurchase(plan);
  }, [plan]);
  return null;
}
