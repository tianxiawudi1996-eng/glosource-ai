'use client';

import { useState } from 'react';
import { trackBeginCheckout, trackEvent } from '@/app/lib/analytics';

interface PolarCheckoutButtonProps {
  checkoutUrl: string;
  label: string;
}

export default function PolarCheckoutButton({ checkoutUrl, label }: PolarCheckoutButtonProps) {
  const [agreed, setAgreed] = useState(false);
  const isExternal = !checkoutUrl.startsWith('mailto:');

  function handleCheckout(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!agreed) {
      event.preventDefault();
      return;
    }

    const plan = label.replace(/^Get\s+/i, '').replace(/\s*→$/, '').trim().toLowerCase();
    trackEvent('checkout_click', { plan, source: 'en_kbeauty_landing' });
    trackBeginCheckout(plan);
  }

  return (
    <div className="space-y-2.5">
      <label className="flex items-start gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 shrink-0"
        />
        <span className="text-[10px] text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">
          I request immediate service access and acknowledge that my 14-day right of withdrawal
          (EU Consumer Rights Directive Art. 16(m)) ends upon my first search.
        </span>
      </label>
      <a
        href={agreed ? checkoutUrl : undefined}
        onClick={handleCheckout}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        aria-disabled={!agreed}
        className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${
          agreed
            ? 'bg-[#EA580C] text-white hover:bg-[#DC4C00] shadow-lg shadow-orange-900/20 cursor-pointer'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none'
        }`}
      >
        {label}
      </a>
    </div>
  );
}
