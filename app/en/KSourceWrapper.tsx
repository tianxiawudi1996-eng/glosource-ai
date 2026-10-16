'use client';

import { useState } from 'react';
import { trackEvent } from '@/app/lib/analytics';
import Image from 'next/image';
import EnSourcingTool from '@/app/components/EnSourcingTool';
import type { PlanTier } from '@/app/lib/db/schema';

const QUICK_CATEGORIES = [
  {
    label: 'K-Beauty OEM',
    desc: 'Serum, sheet masks, toner, sunscreen',
    query: 'Korean collagen serum OEM',
    quantity: '1,000 units',
    cert: 'MFDS',
    certColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    label: 'K-Food Bulk',
    desc: 'Instant noodles, snacks, sauces, beverages',
    query: 'Korean instant noodles bulk',
    quantity: '10 tons',
    cert: 'HACCP',
    certColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    label: 'K-Fashion OEM',
    desc: 'Streetwear, hoodies, accessories',
    query: 'Korean streetwear hoodies wholesale',
    quantity: '500 pcs',
    cert: 'OEKO-TEX',
    certColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    label: 'Electronics OEM',
    desc: 'Wireless earbuds, phone accessories',
    query: 'Korean wireless earbuds OEM',
    quantity: '2,000 units',
    cert: 'KC · CE',
    certColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    label: 'Private Label Cosmetics',
    desc: 'Toner, essence, ampoule, sunscreen',
    query: 'Korean toner private label MFDS documentation',
    quantity: '2,000 bottles',
    cert: 'MFDS',
    certColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    label: 'Health Supplements',
    desc: 'Collagen, probiotics, vitamins',
    query: 'Korean collagen supplement wholesale',
    quantity: '5,000 units',
    cert: 'MFDS · HACCP',
    certColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

export default function KSourceWrapper({
  initialProduct = '',
  plan = 'free',
  freeSearchLimit = 10,
  authenticated = false,
  initialQuantity = '',
}: {
  initialProduct?: string;
  initialQuantity?: string;
  plan?: PlanTier;
  freeSearchLimit?: number;
  authenticated?: boolean;
}) {
  const [prefill, setPrefill] = useState(initialProduct);
  const [prefillQuantity, setPrefillQuantity] = useState(initialQuantity);
  const [autoSubmitFromCategory, setAutoSubmitFromCategory] = useState(false);

  // Preserve a buyer's selection through registration/login. This prefill is NOT
  // a search request: unauthenticated visitors cannot call the sourcing API.
  const queryParams = new URLSearchParams();
  if (prefill.trim()) queryParams.set('q', prefill.slice(0, 160));
  if (prefillQuantity.trim()) queryParams.set('qty', prefillQuantity.slice(0, 80));
  const returnUrl = `/en${queryParams.toString() ? `?${queryParams.toString()}` : ''}#sourcing-tool`;
  const registrationHref = `/en/register?callbackUrl=${encodeURIComponent(returnUrl)}`;
  const loginHref = `/en/login?callbackUrl=${encodeURIComponent(returnUrl)}`;

  const handleCategoryClick = (query: string, quantity: string) => {
    setPrefill(query);
    setPrefillQuantity(quantity);
    if (authenticated) setAutoSubmitFromCategory(true);
    trackEvent('sourcing_category_selected', { category: query, signed_in: authenticated });
    setTimeout(() => {
      document.getElementById(authenticated ? 'en-tool-form' : 'en-registration-preview')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  return (
    <div>
      {/* Image B — product category visual intro */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-8 shadow-sm border border-slate-100">
        <Image
          src="/images/k-product-grid.png"
          alt="Korean product samples including cosmetics, packaged food, fashion accessories, electronics, and home goods"
          width={1774}
          height={887}
          className="w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0D1B2A]/80 via-[#0D1B2A]/30 to-transparent px-6 py-5">
          <p className="text-white font-black text-sm mb-0.5">What can you source from Korea?</p>
          <p className="text-slate-300 text-xs">K-beauty · K-food · K-fashion · Electronics · Industrial · Home goods</p>
        </div>
      </div>

      {!authenticated && (
        <div id="en-registration-preview" className="mb-8 rounded-2xl border border-orange-200 bg-orange-50 p-6 text-center">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#EA580C]">Free account required</p>
          <h3 className="mt-2 text-xl font-black text-[#0D1B2A]">Sign up before searching Korean companies</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Create a verified free account to search Korean suppliers. Choose a category below first; your product and quantity will be saved when you sign up.</p>
          {prefill && <p className="mx-auto mt-3 max-w-lg rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#0D1B2A]">Selected: {prefill}{prefillQuantity ? ` · ${prefillQuantity}` : ''} — confirm your search after email verification.</p>}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a href={registrationHref} onClick={() => trackEvent('signup_intent_click', { source: 'sourcing_preview', product_selected: Boolean(prefill) })} className="rounded-xl bg-[#EA580C] px-5 py-3 text-sm font-black text-white hover:bg-[#DC4C00]">Create free account</a>
            <a href={loginHref} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-[#0D1B2A] hover:bg-slate-50">Sign in</a>
          </div>
        </div>
      )}

      {/* Category quick-select */}
      {(
      <div className="mb-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 text-center">
          {authenticated ? 'Popular categories — click to prefill product and quantity' : 'Explore categories — select a product before creating your free account'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_CATEGORIES.map(cat => (
            <button
              key={cat.label}
              type="button"
              onClick={() => handleCategoryClick(cat.query, cat.quantity)}
              className="group text-left bg-white rounded-2xl border border-slate-200 p-4 hover:border-[#EA580C]/30 hover:shadow-md hover:shadow-orange-900/5 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-black text-sm text-[#0D1B2A] group-hover:text-[#EA580C] transition-colors leading-tight">
                  {cat.label}
                </span>
                <span className={`text-[10px] font-bold border rounded-full px-1.5 py-0.5 shrink-0 ${cat.certColor}`}>
                  {cat.cert}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">{cat.desc}</p>
              <p className="mt-2 text-[10px] text-[#EA580C] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                {authenticated ? 'Prefill search →' : 'Select and sign up →'}
              </p>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Sourcing tool */}
      {authenticated && <EnSourcingTool
        initialProduct={prefill}
        initialQuantity={prefillQuantity}
        autoSubmitOnPrefill={autoSubmitFromCategory}
        plan={plan}
        freeSearchLimit={freeSearchLimit}
      />}
    </div>
  );
}
