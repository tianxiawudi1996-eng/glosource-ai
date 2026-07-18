'use client';

import { useState } from 'react';
import { trackBeginCheckout, trackEvent } from '@/app/lib/analytics';
import { REFUND_POLICY } from '@/app/lib/refundPolicy';

interface PolarCheckoutButtonProps {
  checkoutUrl: string;
  label: string;
  planId: string;
  /** Set when rendered on a dark card so the consent text keeps AA contrast. */
  onDark?: boolean;
}

export default function PolarCheckoutButton({ checkoutUrl, label, planId, onDark = false }: PolarCheckoutButtonProps) {
  const [agreed, setAgreed] = useState(false);
  const [showConsentHint, setShowConsentHint] = useState(false);
  const isMailto = checkoutUrl.startsWith('mailto:');

  function handleCheckout(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!isMailto && !agreed) {
      event.preventDefault();
      setShowConsentHint(true);
      return;
    }

    trackEvent('checkout_click', { plan: planId, source: 'en_kbeauty_landing' });
    trackBeginCheckout(planId);
  }

  return (
    <div className="space-y-2.5">
      {!isMailto && (
        <label className="flex items-start gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => {
              setAgreed(e.target.checked);
              if (e.target.checked) setShowConsentHint(false);
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 shrink-0"
          />
          <span className={`text-xs leading-relaxed transition-colors ${onDark ? 'text-slate-300 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-600'}`}>
            I agree that access starts immediately upon payment. Refund eligibility is limited to the first {REFUND_POLICY.firstPaymentWindowHours} hours (see{' '}
            <a href={REFUND_POLICY.termsPath} target="_blank" rel="noopener noreferrer" className="underline">Terms §3.4</a>
            ).
          </span>
        </label>
      )}
      <a
        href={checkoutUrl}
        onClick={handleCheckout}
        className="block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all bg-[#EA580C] text-white hover:bg-[#DC4C00] shadow-lg shadow-orange-900/20 cursor-pointer"
      >
        {label}
      </a>
      {showConsentHint && (
        <p role="alert" className={`text-xs leading-relaxed ${onDark ? 'text-red-300' : 'text-red-600'}`}>
          Please confirm the checkbox above to continue to checkout.
        </p>
      )}
    </div>
  );
}
