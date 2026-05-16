'use client';

import { useState, useEffect } from 'react';
import type { SourcingOutput, Supplier } from '@/app/api/source/types';

type SourceRegion = 'china' | 'korea';

const FREE_LIMIT = 5;
const FREE_COUNT_KEY = 'glosource_en_free_count';

interface EnSourcingToolProps {
  initialProduct?: string;
  initialQuantity?: string;
}

const REGION_BUTTONS: { value: SourceRegion; label: string; sub: string }[] = [
  { value: 'korea', label: 'Korea', sub: 'EC21 · BuyKorea · tradeKorea' },
  { value: 'china', label: 'China add-on', sub: '1688 · Alibaba · WeChat' },
];

const KOREA_LOADING_STEPS = [
  'Searching EC21 — Korea\'s largest B2B marketplace (1/3)...',
  'Checking BuyKorea — KOTRA government-verified exporters (2/3)...',
  'Scanning tradeKorea — KITA-listed manufacturers (3/3)...',
  'Evaluating MFDS · HACCP · KC · KS certification signals...',
  'Ranking suppliers by trust score and export evidence...',
  'Generating your pre-filled English RFQ draft...',
];

const CHINA_LOADING_STEPS = [
  'Searching 1688.com — China\'s wholesale marketplace (1/3)...',
  'Checking Alibaba factory-direct suppliers (2/3)...',
  'Scanning WeChat trade channels (3/3)...',
  'Evaluating factory certification signals...',
  'Ranking suppliers by trust score and export evidence...',
  'Generating your pre-filled English RFQ draft...',
];

// Known certification patterns → display label + color class
const CERT_PATTERNS: { re: RegExp; label: string; cls: string }[] = [
  { re: /KFDA|MFDS|식약처/i,          label: 'MFDS',      cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  { re: /HACCP/i,                     label: 'HACCP',     cls: 'bg-amber-50 text-amber-700 border-amber-200' },
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
  const label = score >= 75 ? 'High confidence' : score >= 50 ? 'Moderate' : 'Low signals';
  const tooltip = 'AI-estimated from: certification mentions (MFDS/HACCP/KC), export platform presence (EC21/BuyKorea), listing quality, and Google Search verification. Not an independent audit.';
  return (
    <div className="flex items-center gap-2" title={tooltip}>
      <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${txt}`}>{score}/100</span>
      <span className="text-[10px] text-slate-400">({label})</span>
    </div>
  );
}

function TradeReadinessScore({ s, certs, isVerified }: { s: Supplier; certs: { label: string }[]; isVerified: boolean }) {
  const scores = [
    { label: 'Google-verified URL', pts: 30, met: isVerified },
    { label: 'Certification signals', pts: 25, met: certs.length > 0 },
    { label: 'MOQ specified', pts: 15, met: !!(s.moq && s.moq !== 'Inquire' && s.moq !== 'N/A') },
    { label: 'Lead time specified', pts: 15, met: !!(s.leadTimeDays && s.leadTimeDays !== 'TBD') },
    { label: 'Platform listing found', pts: 15, met: !!(s.url || s.platform) },
  ];
  const total = scores.reduce((sum, item) => sum + (item.met ? item.pts : 0), 0);
  const barColor = total >= 70 ? 'bg-emerald-500' : total >= 45 ? 'bg-yellow-400' : 'bg-slate-300';
  return (
    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Trade Readiness</p>
        <span className={`text-xs font-black tabular-nums ${total >= 70 ? 'text-emerald-600' : total >= 45 ? 'text-yellow-600' : 'text-slate-400'}`}>{total}/100</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden mb-2">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${total}%` }} />
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {scores.map(item => (
          <span key={item.label} className={`text-[10px] flex items-center gap-0.5 ${item.met ? 'text-slate-600' : 'text-slate-300'}`}>
            <span>{item.met ? '✓' : '○'}</span>{item.label}
          </span>
        ))}
      </div>
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
          {isVerified ? 'URL found via Google Search' : 'AI Estimate — Not Search-Verified'}
        </span>
      </div>

      {/* Cert badges */}
      {certs.length > 0 && (
        <div>
          <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wide mb-1">Detected source signals — verify independently</p>
          <div className="flex flex-wrap gap-1">
            {certs.map(c => (
              <span key={c.label} className={`text-[10px] font-bold border rounded-full px-1.5 py-0.5 ${c.cls}`}>
                {c.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Trust */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
          Trust score <span className="font-normal normal-case text-amber-600">(AI estimate only — not an audit or guarantee of quality)</span>
        </p>
        <TrustBar score={s.trustScore} />
      </div>

      {/* Trade Readiness */}
      <TradeReadinessScore s={s} certs={certs} isVerified={isVerified} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[['Est. Price', s.estimatedPrice || 'Inquire'], ['Est. MOQ', s.moq || 'Inquire'], ['Lead time', formatLeadTime(s.leadTimeDays)]].map(([label, val]) => (
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

      {/* URL — only show for suppliers that passed the server quality gate */}
      {s.url && isVerified && (
        <a href={s.url} target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1">
          Visit search result URL (not live-verified)
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
  if (res.status === 429) {
    throw new Error('__quota_exceeded__');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; message?: string; code?: string };
    if (err.code === 'quota_exceeded' || err.error === 'quota_exceeded') {
      throw new Error('__quota_exceeded__');
    }
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
  const [rfqLang, setRfqLang] = useState<'en' | 'ko' | 'zh'>('en');
  const [rfqKoCache, setRfqKoCache] = useState<string | null>(null);
  const [rfqTranslating, setRfqTranslating] = useState(false);
  const [rfqTranslateError, setRfqTranslateError] = useState<string | null>(null);
  const [freeCount, setFreeCount] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const loadingSteps = region === 'china' ? CHINA_LOADING_STEPS : KOREA_LOADING_STEPS;
  const submitLabel = region === 'china' ? 'Find China Suppliers →' : 'Find Korean Suppliers →';
  const searchesLeft = Math.max(0, FREE_LIMIT - freeCount);

  // Load free count from localStorage
  useEffect(() => {
    try {
      const c = parseInt(localStorage.getItem(FREE_COUNT_KEY) ?? '0', 10);
      setFreeCount(isNaN(c) ? 0 : c);
    } catch { /* ignore */ }
  }, []);

  // Sync prefill from parent category clicks
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setQuantity(initialQuantity);
      setResult(null);
      setError(null);
      setShowUpgrade(false);
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
    setShowUpgrade(false);
    try {
      const output = await callAPI(product, quantity, budget, region);
      setResult(output);
      // Only increment free counter when grounding was used (mirrors server-side quota logic)
      if (output.groundingUsed) {
        const newCount = freeCount + 1;
        setFreeCount(newCount);
        try { localStorage.setItem(FREE_COUNT_KEY, String(newCount)); } catch { /* ignore */ }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      if (msg === '__quota_exceeded__' || /quota|subscription|limit/i.test(msg)) {
        setShowUpgrade(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const activeRfqText = (result: SourcingOutput | null): string => {
    if (!result) return '';
    if (rfqLang === 'zh') return result.rfqEmail.zh || result.rfqEmail.en;
    if (rfqLang === 'ko') return rfqKoCache || result.rfqEmail.en;
    return result.rfqEmail.en;
  };

  const handleCopyRFQ = async () => {
    const text = activeRfqText(result);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setRfqCopied(true);
      setTimeout(() => setRfqCopied(false), 2000);
    } catch { /* silent */ }
  };

  const handleRfqLangChange = async (lang: 'en' | 'ko' | 'zh') => {
    setRfqLang(lang);
    setRfqTranslateError(null);
    if (lang === 'ko' && !rfqKoCache && result?.rfqEmail.en) {
      setRfqTranslating(true);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: result.rfqEmail.en, targetLang: 'ko' }),
        });
        const data = await res.json() as { translated?: string; error?: string };
        if (data.translated) {
          setRfqKoCache(data.translated);
        } else {
          setRfqTranslateError(data.error ?? 'Translation failed');
          setRfqLang('en');
        }
      } catch {
        setRfqTranslateError('Translation failed. Please try again.');
        setRfqLang('en');
      } finally {
        setRfqTranslating(false);
      }
    }
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

        {/* Searches-left counter — shown for all remaining free searches */}
        {searchesLeft > 0 && (
          <div className="mb-3 flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {searchesLeft} free search{searchesLeft !== 1 ? 'es' : ''} remaining ·{' '}
            <a href="#pricing" className="underline hover:text-amber-900">Upgrade for more</a>
          </div>
        )}

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

      {/* Upgrade panel — shown when free quota is exhausted */}
      {showUpgrade && !loading && (
        <div className="rounded-2xl border border-[#EA580C]/30 bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#0D1B2A] px-6 py-5 text-center">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-1">Free tier complete</p>
            <h3 className="text-xl font-black text-white mb-1">You&apos;ve used all 5 free searches</h3>
            <p className="text-xs text-slate-400">Upgrade to keep finding Korean suppliers</p>
          </div>

          {/* Blurred mock suppliers — visual hint of what Pro unlocks */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Subscribe to unlock your actual search results:</p>
            <div className="space-y-2 select-none pointer-events-none relative">
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="bg-slate-700 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-wide">SAMPLE PREVIEW — NOT YOUR RESULTS</span>
              </div>
              {[
                { rank: 1, name: 'Korean Supplier A', score: 88, platform: 'BuyKorea' },
                { rank: 2, name: 'Korean Supplier B', score: 74, platform: 'EC21' },
              ].map(m => (
                <div key={m.rank} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3 blur-[3px]">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0 ${m.rank === 1 ? 'bg-[#EA580C]' : 'bg-[#0D1B2A]'}`}>{m.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0D1B2A] truncate">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.platform} · Trust {m.score}/100</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">AI evidence</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing CTA */}
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { name: 'Starter', price: '$9.90/mo', searches: '30 searches/month', highlight: false },
                { name: 'Pro', price: '$29/mo', searches: '60 searches + HACCP/KS signals', highlight: true },
              ].map(p => (
                <div key={p.name} className={`rounded-xl border p-4 ${p.highlight ? 'border-[#EA580C] bg-orange-50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-bold text-sm ${p.highlight ? 'text-[#EA580C]' : 'text-[#0D1B2A]'}`}>{p.name}</p>
                    {p.highlight && <span className="text-[10px] font-bold bg-[#EA580C] text-white px-2 py-0.5 rounded-full">Popular</span>}
                  </div>
                  <p className="text-lg font-black text-[#0D1B2A]">{p.price}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.searches}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <a href={process.env.NEXT_PUBLIC_POLAR_STARTER_LINK ?? '/en/billing'}
                target="_blank" rel="noopener noreferrer"
                className="block w-full text-center py-3.5 rounded-xl font-bold text-sm text-white bg-[#EA580C] hover:bg-[#DC4C00] transition-all shadow-lg shadow-orange-900/20">
                Get Starter — $9.90/mo →
              </a>
              <a href="/en/billing"
                className="block w-full text-center py-2.5 rounded-xl font-semibold text-sm text-[#0D1B2A] bg-slate-100 hover:bg-slate-200 transition-all">
                View all plans →
              </a>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">Secure checkout where available · Email fallback for early access · No Korean entity required</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !result && !error && !showUpgrade && (
        <div className="text-center py-12 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-sm font-semibold text-slate-500">Enter a product and quantity above</p>
          <p className="text-xs mt-1.5 text-slate-400">
            {region === 'china'
              ? 'AI searches China supplier channels and prepares an English RFQ draft'
              : 'AI searches EC21 · BuyKorea (KOTRA) · tradeKorea · direct factories and returns a ranked shortlist'}
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-black text-[#0D1B2A]">
                {result.suppliers.length} supplier{result.suppliers.length !== 1 ? 's' : ''} found
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-bold text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Google Search-confirmed URLs
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.suppliers.map((s, i) => (
                <div key={s.rank}>
                  <SupplierCard s={s} rank={i + 1} />
                </div>
              ))}
            </div>
          </div>

          {result.recommendation && (
            <div className="bg-white rounded-2xl border border-[#EA580C]/20 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-[#EA580C] uppercase tracking-wide">AI Sourcing Notes</p>
                <span className="text-[10px] text-slate-400 italic">AI-generated · not a purchase recommendation</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.recommendation}</p>
              {!result.disclaimer && (
                <p className="mt-3 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                  AI-generated sourcing notes for research purposes only. Independently verify all supplier information before outreach or any purchasing decision.
                </p>
              )}
            </div>
          )}

          {result.rfqEmail?.en && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              {/* Amber warning */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 mb-4 flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>AI-generated template.</strong> MOQ, pricing, and lead times are <strong>estimates only</strong> — confirm details with the supplier before sending.
                  {rfqLang !== 'en' && <> <strong>Translations are AI-generated — do not use as official contract documents.</strong></>}
                </p>
              </div>

              {/* Header row: title + lang toggle + copy */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="text-xs font-bold text-[#0D1B2A] uppercase tracking-wide">RFQ Email Draft</p>
                <div className="flex items-center gap-2">
                  {/* Language toggle */}
                  <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[11px] font-bold">
                    {(['en', 'ko', 'zh'] as const).map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleRfqLangChange(lang)}
                        disabled={rfqTranslating}
                        className={`px-2.5 py-1.5 transition-all ${rfqLang === lang ? 'bg-[#0D1B2A] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                      >
                        {lang === 'en' ? 'EN' : lang === 'ko' ? '한' : '中'}
                      </button>
                    ))}
                  </div>
                  {/* Copy button */}
                  <button type="button" onClick={handleCopyRFQ} disabled={rfqTranslating}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${rfqCopied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-[#EA580C] border-[#EA580C] text-white hover:bg-[#DC4C00]'}`}>
                    {rfqCopied ? (
                      <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>Copied!</>
                    ) : (
                      <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                    )}
                  </button>
                </div>
              </div>

              {/* RFQ body */}
              {rfqTranslating ? (
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-100 p-4 text-xs text-slate-500">
                  <svg className="w-3.5 h-3.5 animate-spin text-[#EA580C]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Translating with AI…
                </div>
              ) : rfqTranslateError ? (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700 mb-2">{rfqTranslateError}</div>
              ) : null}

              {!rfqTranslating && (
                <pre className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl border border-slate-100 p-4 font-mono overflow-x-auto">
                  {activeRfqText(result)}
                </pre>
              )}

              {rfqLang !== 'en' && !rfqTranslating && (
                <p className="mt-2 text-[10px] text-slate-400">
                  AI translation · for reference only · not a legally binding document
                </p>
              )}
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
