'use client';

import { useState, useRef, useEffect } from 'react';

interface Verification {
  query: string;
  found: boolean;
  registries: string[];
  evidence: string[];
  redFlags: string[];
  activeBusiness: boolean | null;
}

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  verification?: Verification | null;
}

type SearchParams = { product: string; quantity: string; country: 'korea' | 'china'; buyerCountry: string };

const GREETING: Msg = {
  role: 'assistant',
  content:
    "Hi! Paste any Korean supplier name and I'll verify it against government registries (MFDS, HACCP, medical-device, health-food, quasi-drug) + a live tax-office check. On Pro, I can also source suppliers for you.",
};

function VerificationPanel({ v }: { v: Verification }) {
  if (v.found) {
    return (
      <div className="mt-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-600 fill-current" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.06 13.54L7.4 11l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.65 5.65z" /></svg>
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">Registry match{v.activeBusiness ? ' · Active business' : ''}</p>
        </div>
        <ul className="space-y-1">
          {v.evidence.map((e, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] font-semibold text-emerald-900 leading-snug">
              <svg className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              {e}
            </li>
          ))}
        </ul>
        {v.registries.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {v.registries.map((r) => (
              <span key={r} className="text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded px-1.5 py-0.5">{r}</span>
            ))}
          </div>
        )}
        {v.redFlags.map((f, i) => (
          <p key={i} className="text-[11px] text-red-600 mt-1.5">⚠ {f}</p>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
      <p className="text-[11px] text-amber-800">
        <span className="font-bold">“{v.query}”</span> isn’t in the government registries I check. That doesn’t prove it’s fake — ask the supplier for their business-registration number (사업자등록번호) so it can be verified.
      </p>
    </div>
  );
}

export default function SourcingChatWidget({ onSearch }: { onSearch?: (p: SearchParams) => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json().catch(() => ({ reply: 'Sorry, something went wrong.' }));
      setMessages((m) => [...m, { role: 'assistant', content: data.reply ?? '…', verification: data.verification ?? null }]);
      if (data.action?.type === 'search' && data.action.params && onSearch) {
        onSearch(data.action.params as SearchParams);
        setTimeout(() => setOpen(false), 800);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Network error — please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open GloSource verification assistant"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#0D1B2A] text-white pl-4 pr-5 py-3 shadow-xl hover:scale-[1.03] transition-transform"
      >
        <svg className="w-5 h-5 text-emerald-400 fill-current" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.06 13.54L7.4 11l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.65 5.65z" /></svg>
        <span className="text-sm font-bold">{open ? 'Close' : 'Verify a supplier'}</span>
      </button>

      {open && (
        <div role="dialog" aria-label="GloSource verification assistant" className="fixed bottom-20 right-3 sm:right-5 z-40 w-[94vw] max-w-sm h-[72vh] max-h-[580px] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#0D1B2A] text-white">
            <svg className="w-5 h-5 text-emerald-400 fill-current" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.06 13.54L7.4 11l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.65 5.65z" /></svg>
            <div className="min-w-0">
              <p className="text-sm font-black leading-tight">GloSource Assistant</p>
              <p className="text-[10px] text-slate-300 leading-tight">Government-backed Korean supplier verification</p>
            </div>
          </div>

          <div ref={scrollRef} aria-live="polite" aria-atomic="false" className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                <div className={m.role === 'user' ? 'max-w-[85%]' : 'max-w-[92%]'}>
                  <div className={`inline-block rounded-2xl px-3 py-2 text-[12px] leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-[#0D1B2A] text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                    {m.content}
                  </div>
                  {m.verification && <VerificationPanel v={m.verification} />}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 text-slate-400 text-[12px] px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-2.5 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
                rows={1}
                aria-label="Message the verification assistant"
                placeholder="Paste a Korean supplier name…"
                className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40 max-h-24"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="rounded-xl bg-[#EA580C] text-white px-3.5 py-2 text-sm font-bold disabled:opacity-40 hover:bg-orange-600 transition-colors"
              >
                <span aria-hidden="true">➤</span>
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-1 px-1">Verification reflects Korean government registries + live tax-office status. Not legal/financial advice.</p>
          </div>
        </div>
      )}
    </>
  );
}
