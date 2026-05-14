'use client';

import { useState } from 'react';
import type { SourcingOutput, Supplier } from '@/app/api/source/types';

type SourceRegion = 'china' | 'korea' | 'both';

const REGION_BUTTONS: { value: SourceRegion; label: string }[] = [
  { value: 'china', label: '🇨🇳 China' },
  { value: 'korea', label: '🇰🇷 Korea' },
  { value: 'both', label: '🌏 Both' },
];

function TrustBar({ score }: { score: number }) {
  const bar = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-400' : 'bg-red-500';
  const txt = score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${txt}`}>{score}/100</span>
    </div>
  );
}

function SupplierCard({ s }: { s: Supplier }) {
  const isVerified = s.verificationStatus === 'grounding_confirmed';
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-[#0D1B2A] text-xs font-black text-white">{s.rank}</span>
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#0D1B2A] truncate">{s.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.platform} · {s.country}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border flex-shrink-0 ${isVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {isVerified ? 'Web verified' : 'AI estimated'}
        </span>
      </div>

      {/* Trust */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Trust score</p>
        <TrustBar score={s.trustScore} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[['Price', s.estimatedPrice || 'Inquire'], ['MOQ', s.moq || 'Inquire'], ['Lead time', s.leadTimeDays || 'TBD']].map(([label, val]) => (
          <div key={label} className="bg-slate-50 rounded-lg px-2.5 py-2">
            <p className="text-[10px] text-slate-400 font-medium">{label}</p>
            <p className="text-xs font-bold text-[#0D1B2A] mt-0.5 truncate">{val}</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      {s.summary && <p className="text-xs text-slate-500 leading-relaxed">{s.summary}</p>}

      {/* Trust evidence */}
      {s.trustEvidence.length > 0 && (
        <ul className="space-y-0.5">
          {s.trustEvidence.map((e, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              {e}
            </li>
          ))}
        </ul>
      )}

      {/* Red flags */}
      {s.redFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="text-[10px] font-bold text-red-700 uppercase tracking-wide mb-1">Caution</p>
          {s.redFlags.map((f, i) => (
            <p key={i} className="text-[11px] text-red-600">{f}</p>
          ))}
        </div>
      )}

      {/* URL */}
      {s.url && (
        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1">
          View supplier page
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      )}
    </div>
  );
}

async function callAPI(product: string, quantity: string, budget: string, country: 'china' | 'korea'): Promise<SourcingOutput> {
  const res = await fetch('/api/source', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productDescription: product,
      quantity,
      budget: budget || undefined,
      countryPreference: country,
      orderFrequency: 'one_time' as const,
      outputLanguage: 'en' as const,
      buyerCountry: 'GLOBAL' as const,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Server error ${res.status}`);
  }
  return res.json() as Promise<SourcingOutput>;
}

function mergeResults(a: SourcingOutput, b: SourcingOutput): SourcingOutput {
  const combined = [...a.suppliers, ...b.suppliers]
    .sort((x, y) => y.trustScore - x.trustScore)
    .map((s, idx) => ({ ...s, rank: idx + 1 }));
  return {
    suppliers: combined,
    recommendation: [a.recommendation, b.recommendation].filter(Boolean).join('\n\n'),
    rfqEmail: { en: a.rfqEmail.en, zh: a.rfqEmail.zh },
    disclaimer: a.disclaimer,
    groundingUsed: a.groundingUsed || b.groundingUsed,
  };
}

export default function EnSourcingTool() {
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [budget, setBudget] = useState('');
  const [region, setRegion] = useState<SourceRegion>('china');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SourcingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rfqCopied, setRfqCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let output: SourcingOutput;
      if (region === 'both') {
        const [a, b] = await Promise.all([
          callAPI(product, quantity, budget, 'china'),
          callAPI(product, quantity, budget, 'korea'),
        ]);
        output = mergeResults(a, b);
      } else {
        output = await callAPI(product, quantity, budget, region);
      }
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRFQ = async () => {
    if (!result?.rfqEmail.en) return;
    try {
      await navigator.clipboard.writeText(result.rfqEmail.en);
      setRfqCopied(true);
      setTimeout(() => setRfqCopied(false), 2000);
    } catch { /* silent */ }
  };

  return (
    <div className="w-full">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#0D1B2A] uppercase tracking-wide mb-2">Product description</label>
          <input
            type="text" value={product} onChange={e => setProduct(e.target.value)} required
            placeholder="e.g. Korean moisturizer with hyaluronic acid, MOQ 500 units"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0D1B2A] placeholder:text-slate-400 focus:border-[#EA580C] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/10 transition-all"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-[#0D1B2A] uppercase tracking-wide mb-2">Source region</label>
          <div className="flex gap-2">
            {REGION_BUTTONS.map(btn => (
              <button key={btn.value} type="button" onClick={() => setRegion(btn.value)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${region === btn.value ? 'bg-[#0D1B2A] border-[#0D1B2A] text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-bold text-[#0D1B2A] uppercase tracking-wide mb-2">Quantity</label>
            <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 500 units"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-[#0D1B2A] placeholder:text-slate-400 focus:border-[#EA580C] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/10 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0D1B2A] uppercase tracking-wide mb-2">
              Budget <span className="text-slate-400 font-normal normal-case">(optional)</span>
            </label>
            <input type="text" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. $5,000"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-[#0D1B2A] placeholder:text-slate-400 focus:border-[#EA580C] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/10 transition-all" />
          </div>
        </div>

        <button type="submit" disabled={loading || !product.trim()}
          className="w-full py-3 px-6 rounded-xl font-bold text-sm text-white bg-[#EA580C] hover:bg-[#DC4C00] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching... (up to 60s)
            </>
          ) : 'Find Suppliers →'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p className="text-sm font-bold text-red-800 mb-1">Search failed</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !result && !error && (
        <div className="text-center py-10 text-slate-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <p className="text-sm font-semibold">Enter a product to find suppliers</p>
          <p className="text-xs mt-1">Get 3–5 ranked candidates with risk scores and RFQ drafts</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-black text-[#0D1B2A]">{result.suppliers.length} supplier{result.suppliers.length !== 1 ? 's' : ''} found</p>
              {result.groundingUsed && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-bold text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Web-grounded
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.suppliers.map(s => <SupplierCard key={s.rank} s={s} />)}
            </div>
          </div>

          {result.recommendation && (
            <div className="bg-white rounded-2xl border border-[#EA580C]/20 shadow-sm p-5">
              <p className="text-xs font-bold text-[#EA580C] uppercase tracking-wide mb-3">AI Recommendation</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.recommendation}</p>
            </div>
          )}

          {result.rfqEmail.en && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-[#0D1B2A] uppercase tracking-wide">RFQ Email Draft (English)</p>
                <button type="button" onClick={handleCopyRFQ}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${rfqCopied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}>
                  {rfqCopied ? (
                    <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>Copied!</>
                  ) : (
                    <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy RFQ</>
                  )}
                </button>
              </div>
              <pre className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl border border-slate-100 p-4 font-mono overflow-x-auto">{result.rfqEmail.en}</pre>
            </div>
          )}

          {result.disclaimer && (
            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">{result.disclaimer}</p>
          )}
        </div>
      )}
    </div>
  );
}
