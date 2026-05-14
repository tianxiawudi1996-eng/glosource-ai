'use client';

import { useState, useEffect } from 'react';
import type { SourcingOutput, Supplier } from '@/app/api/source/types';

type SourceRegion = 'china' | 'korea';

interface EnSourcingToolProps {
  initialProduct?: string;
  initialQuantity?: string;
}

const REGION_BUTTONS: { value: SourceRegion; label: string; sub: string }[] = [
  { value: 'korea', label: 'Korea', sub: 'EC21 · BuyKorea · tradeKorea' },
  { value: 'china', label: 'China add-on', sub: '1688 · Alibaba · WeChat' },
];

const KOREA_LOADING_STEPS = [
  'Searching Korean export channels...',
  'Querying AI knowledge base...',
  'Evaluating certification signals...',
  'Ranking by trust score...',
  'Generating English RFQ draft...',
  'Compiling supplier shortlist...',
];

const CHINA_LOADING_STEPS = [
  'Searching China supplier channels...',
  'Checking factory-direct signals...',
  'Comparing export platform evidence...',
  'Ranking by trust score...',
  'Generating English RFQ draft...',
  'Compiling supplier shortlist...',
];

// Known certification patterns → display label + color class
const CERT_PATTERNS: { re: RegExp; label: string; cls: string }[] = [
  { re: /KFDA|MFDS|식약처/i,          label: 'MFDS',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { re: /HACCP/i,                     label: 'HACCP',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { re: /\bKC\b|Korea Certification/i,label: 'KC',        cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  { re: /\bKS\b|Korean Standard/i,    label: 'KS',        cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  { re: /ISO 22716/i,                 label: 'ISO 22716', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  { re: /ISO 22000/i,                 label: 'ISO 22000', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  { re: /ISO 9001/i,                  label: 'ISO 9001',  cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  { re: /HALAL/i,                     label: 'HALAL',     cls: 'bg-green-50 text-green-700 border-green-200' },
  { re: /KOTRA\s*[Ll]isted|BuyKorea/i, label: 'On BuyKorea', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  { re: /\bCE\b/,                     label: 'CE',        cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  { re: /\bSGS\b/i,                   label: 'SGS',       cls: 'bg-slate-100 text-slate-600 border-slate-200' },
];

function extractCerts(evidence: string[]): { label: string; cls: string }[] {
  const joined = (Array.isArray(evidence) ? evidence : []).join(' ');
  return CERT_PATTERNS.filter(p => p.re.test(joined)).map(p => ({ label: p.label, cls: p.cls }));
}

function TrustBar({ score }: { score: number }) {
  const bar = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-400' : 'bg-red-500';
  const txt = score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${txt}`}>{score}/100</span>
    </div>
  );
}

function formatLeadTime(value: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return 'TBD';
  return /^\d+$/.test(trimmed) ? `${trimmed} days` : trimmed;
}

function SupplierCard({ s, rank }: { s: Supplier; rank: number }) {
  const isVerified = s.verificationStatus === 'grounding_confirmed';
  const trustEvidence = Array.isArray(s.trustEvidence) ? s.trustEvidence : [];
  const redFlags = Array.isArray(s.redFlags) ? s.redFlags : [];
  const certs = extractCerts(trustEvidence);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-slate-300 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white ${rank === 1 ? 'bg-[#EA580C]' : rank === 2 ? 'bg-[#0D1B2A]' : 'bg-slate-500'}`}>
            {rank}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#0D1B2A] truncate">{s.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.platform} · {s.country}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border flex-shrink-0 ${isVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {isVerified ? 'AI search evidence' : 'AI estimate only'}
        </span>
      </div>

      {/* Cert badges */}
      {certs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {certs.map(c => (
            <span key={c.label} className={`text-[10px] font-bold border rounded-full px-1.5 py-0.5 ${c.cls}`}>
              {c.label}
            </span>
          ))}
        </div>
      )}

      {/* Trust */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
          Trust score <span className="font-normal normal-case text-slate-400">(AI signal · not a guarantee)</span>
        </p>
        <TrustBar score={s.trustScore} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[['Price', s.estimatedPrice || 'Inquire'], ['MOQ', s.moq || 'Inquire'], ['Lead time', formatLeadTime(s.leadTimeDays)]].map(([label, val]) => (
          <div key={label} className="bg-slate-50 rounded-lg px-2.5 py-2">
            <p className="text-[10px] text-slate-400 font-medium">{label}</p>
            <p className="text-xs font-bold text-[#0D1B2A] mt-0.5 truncate">{val}</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      {s.summary && <p className="text-xs text-slate-500 leading-relaxed">{s.summary}</p>}

      {/* Trust evidence */}
      {trustEvidence.length > 0 && (
        <ul className="space-y-0.5">
          {trustEvidence.slice(0, 4).map((e, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              {e}
            </li>
          ))}
        </ul>
      )}

      {/* Red flags */}
      {redFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="text-[10px] font-bold text-red-700 uppercase tracking-wide mb-1">Caution</p>
          {redFlags.map((f, i) => (
            <p key={i} className="text-[11px] text-red-600">{f}</p>
          ))}
        </div>
      )}

      {/* URL — only show for AI-search-evidence suppliers; AI estimates may have unverified links */}
      {s.url && isVerified && (
        <a href={s.url} target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1">
          View supplier page
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
      {s.url && !isVerified && (
        <p className="text-[11px] text-slate-400 italic">Verify supplier contact details independently before outreach.</p>
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
    const err = await res.json().catch(() => ({})) as { error?: string; message?: string };
    throw new Error(err.message ?? err.error ?? `Server error ${res.status}`);
  }
  const json = await res.json() as { success: boolean; data: SourcingOutput };
  return json.data;
}

export default function EnSourcingTool({ initialProduct = '', initialQuantity = '' }: EnSourcingToolProps) {
  const [product, setProduct] = useState(initialProduct);
  const [quantity, setQuantity] = useState('');
  const [budget, setBudget] = useState('');
  const [region, setRegion] = useState<SourceRegion>('korea');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<SourcingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rfqCopied, setRfqCopied] = useState(false);
  const loadingSteps = region === 'china' ? CHINA_LOADING_STEPS : KOREA_LOADING_STEPS;
  const submitLabel = region === 'china' ? 'Find China Suppliers →' : 'Find Korean Suppliers →';

  // Sync prefill from parent category clicks
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setQuantity(initialQuantity);
      setResult(null);
      setError(null);
    }
  }, [initialProduct, initialQuantity]);

  // Cycle through loading steps
  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    const iv = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingSteps.length);
    }, 8000);
    return () => clearInterval(iv);
  }, [loading, loadingSteps.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim() || !quantity.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const output = await callAPI(product, quantity, budget, region);
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
          <label className="block text-xs font-bold text-[#0D1B2A] uppercase tracking-wide mb-2">
            Product description <span className="text-[#EA580C]">*</span>
          </label>
          <input
            type="text" value={product} onChange={e => setProduct(e.target.value)} required
            placeholder="e.g. Korean collagen serum OEM, K-beauty sheet mask, Korean instant noodles bulk"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0D1B2A] placeholder:text-slate-400 focus:border-[#EA580C] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/10 transition-all"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-[#0D1B2A] uppercase tracking-wide mb-2">Source region</label>
          <div className="flex flex-col sm:flex-row gap-2">
            {REGION_BUTTONS.map(btn => (
              <button key={btn.value} type="button" onClick={() => setRegion(btn.value)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm border transition-all text-left sm:text-center ${region === btn.value ? 'bg-[#0D1B2A] border-[#0D1B2A] text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                <span className="font-bold block">{btn.label}</span>
                <span className={`text-[10px] font-normal ${region === btn.value ? 'text-slate-300' : 'text-slate-400'}`}>{btn.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-bold text-[#0D1B2A] uppercase tracking-wide mb-2">
              Quantity <span className="text-[#EA580C]">*</span>
            </label>
            <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 500 units" required
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

        <button type="submit" disabled={loading || !product.trim() || !quantity.trim()}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#EA580C] hover:bg-[#DC4C00] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="transition-all">{loadingSteps[loadingStep]}</span>
            </>
          ) : submitLabel}
        </button>

        {loading && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {loadingSteps.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === loadingStep ? 'bg-[#EA580C] scale-125' : 'bg-slate-200'}`} />
            ))}
          </div>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-red-800 mb-1">Search failed</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !result && !error && (
        <div className="text-center py-12 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-sm font-semibold text-slate-500">Enter a product and quantity above</p>
          <p className="text-xs mt-1.5 text-slate-400">
            {region === 'china'
              ? 'AI searches China supplier channels and prepares an English RFQ draft'
              : 'AI searches EC21 · BuyKorea (KOTRA) · tradeKorea · direct factories in 60 seconds'}
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Grounding warning — shown when AI could not confirm results via live search */}
          {!result.groundingUsed && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-2.5">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div>
                <p className="text-xs font-bold text-amber-800">AI knowledge base only — live search not available</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  These results could not be confirmed via live web search. Supplier names, pricing, and MOQ are AI estimates only.
                  Independently verify all details before outreach.
                </p>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-black text-[#0D1B2A]">
                {result.suppliers.length} supplier{result.suppliers.length !== 1 ? 's' : ''} found
              </p>
              {result.groundingUsed && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-bold text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  AI search evidence found
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.suppliers.map((s, i) => <SupplierCard key={s.rank} s={s} rank={i + 1} />)}
            </div>
          </div>

          {result.recommendation && (
            <div className="bg-white rounded-2xl border border-[#EA580C]/20 shadow-sm p-5">
              <p className="text-xs font-bold text-[#EA580C] uppercase tracking-wide mb-3">AI Recommendation</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.recommendation}</p>
            </div>
          )}

          {result.rfqEmail?.en && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              {/* Amber warning: RFQ is an AI template, not confirmed data */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 mb-4 flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>AI-generated template.</strong> MOQ, pricing, and lead times are <strong>estimates only</strong> — they may not reflect actual supplier terms.
                  Review every line and confirm details with the supplier before sending.
                </p>
              </div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-[#0D1B2A] uppercase tracking-wide">RFQ Email Draft — Review Before Sending</p>
                <button type="button" onClick={handleCopyRFQ}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${rfqCopied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-[#EA580C] border-[#EA580C] text-white hover:bg-[#DC4C00]'}`}>
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
