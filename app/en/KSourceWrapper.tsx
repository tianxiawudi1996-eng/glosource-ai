'use client';

import { useState } from 'react';
import EnSourcingTool from '@/app/components/EnSourcingTool';

const QUICK_CATEGORIES = [
  {
    label: 'K-Beauty OEM',
    desc: 'Serum, sheet masks, toner, sunscreen',
    query: 'Korean collagen serum OEM 1,000 units',
    cert: 'KFDA',
    certColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    label: 'K-Food Bulk',
    desc: 'Instant noodles, snacks, sauces, beverages',
    query: 'Korean instant noodles bulk 10 tons',
    cert: 'HACCP',
    certColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    label: 'K-Fashion OEM',
    desc: 'Streetwear, hoodies, accessories',
    query: 'Korean streetwear hoodies wholesale 500 pcs',
    cert: 'OEKO-TEX',
    certColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    label: 'Electronics OEM',
    desc: 'Wireless earbuds, phone accessories',
    query: 'Korean wireless earbuds OEM 2,000 units',
    cert: 'KC · CE',
    certColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    label: 'Private Label Cosmetics',
    desc: 'Toner, essence, ampoule, sunscreen',
    query: 'Korean toner private label 2,000 bottles KFDA certified',
    cert: 'KFDA',
    certColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    label: 'Health Supplements',
    desc: 'Collagen, probiotics, vitamins',
    query: 'Korean collagen supplement wholesale 5,000 units',
    cert: 'KFDA · HACCP',
    certColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

export default function KSourceWrapper() {
  const [prefill, setPrefill] = useState('');

  const handleCategoryClick = (query: string) => {
    setPrefill(query);
    setTimeout(() => {
      document.getElementById('sourcing-tool')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  return (
    <div>
      {/* Category quick-select */}
      <div className="mb-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 text-center">
          Popular categories — click to search instantly
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_CATEGORIES.map(cat => (
            <button
              key={cat.label}
              type="button"
              onClick={() => handleCategoryClick(cat.query)}
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
                Search now →
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Sourcing tool */}
      <EnSourcingTool initialProduct={prefill} />
    </div>
  );
}
