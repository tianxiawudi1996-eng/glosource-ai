'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { BuyerCountry, SourcingOutput, Supplier } from '@/app/api/source/types';

type Message = { role: 'user' | 'assistant'; content: string };
type SearchAction = { product: string; quantity: string; country: 'korea' | 'china'; buyerCountry: string };

const STARTERS = [
  'Find Korean private-label sunscreen manufacturers for 5,000 units',
  'Find HACCP-certified Korean snack companies that export to the US',
  'Verify whether COSMAX is a registered Korean manufacturer',
];

const GREETING: Message = {
  role: 'assistant',
  content: 'What product or Korean company are you looking for? I can find supplier candidates or check a company against supported Korean government registries.',
};

function AssistantSupplierCard({ supplier, locked }: { supplier: Supplier; locked: boolean }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-[#0D1B2A]">{supplier.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{supplier.country} · {supplier.platform}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {supplier.govVerified && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">Government record</span>}
          {supplier.govActiveBusiness && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">Active business</span>}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{supplier.summary}</p>
      {supplier.govEvidence?.length ? <ul className="mt-3 space-y-1 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">{supplier.govEvidence.slice(0, 3).map((evidence) => <li key={evidence} className="text-xs leading-5 text-emerald-900">✓ {evidence}</li>)}</ul> : null}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">MOQ: <strong className="text-slate-700">{supplier.moq || 'Ask supplier'}</strong></p>
        {locked ? <span className="text-xs font-bold text-[#EA580C]">Full comparison on paid plans</span> : <a href={supplier.url} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-[#EA580C] hover:underline">Visit company source →</a>}
      </div>
    </article>
  );
}

export default function AssistantExperience() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SourcingOutput | null>(null);
  const [query, setQuery] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);

  async function searchSuppliers(action: SearchAction) {
    setQuery(action.product);
    const response = await fetch('/api/source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productDescription: action.product,
        quantity: action.quantity || '1000',
        countryPreference: action.country,
        orderFrequency: 'one_time',
        outputLanguage: 'en',
        buyerCountry: (action.buyerCountry || 'GLOBAL') as BuyerCountry,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Supplier search failed.');
    setResult(data.data as SourcingOutput);
  }

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.reply || 'The assistant is unavailable.');
      setMessages((current) => [...current, { role: 'assistant', content: data.reply || 'I found a next step.' }]);
      if (data.action?.type === 'search') await searchSuppliers(data.action.params as SearchAction);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'Please try again.' }]);
    } finally {
      setBusy(false);
    }
  }

  const free = result?.access?.plan === 'free';
  const visible = free ? result?.suppliers.slice(0, 3) : result?.suppliers;
  const hiddenCount = free ? Math.max(0, (result?.suppliers.length ?? 0) - 3) : 0;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:px-6">
      <section className="flex min-h-[620px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="font-black">GloSource AI</p>
          <p className="text-xs text-slate-500">Government-data-backed company discovery</p>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <p className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-[#0D1B2A] text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>{message.content}</p>
            </div>
          ))}
          {busy && <p className="text-xs font-semibold text-slate-400">Checking your request…</p>}
          <div ref={endRef} />
        </div>
        {messages.length === 1 && <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 pt-3">{STARTERS.map((starter) => <button key={starter} type="button" onClick={() => void send(starter)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-600 hover:border-[#EA580C] hover:text-[#EA580C]">{starter}</button>)}</div>}
        <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex gap-2 p-4">
          <label htmlFor="assistant-input" className="sr-only">Describe the Korean company or product you need</label>
          <textarea id="assistant-input" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} rows={2} placeholder="Example: Korean vegan skincare manufacturer for the EU" className="min-h-14 flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100" />
          <button type="submit" disabled={busy || !input.trim()} className="rounded-xl bg-[#EA580C] px-5 font-black text-white hover:bg-[#DC4C00] disabled:opacity-40">Send</button>
        </form>
      </section>

      <section className="min-h-[620px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {!result ? <div className="flex h-full min-h-[560px] items-center justify-center text-center"><div><p className="text-4xl">🏛️</p><h2 className="mt-4 text-xl font-black">Official-data signals appear here</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Ask the assistant to find companies. Results distinguish government-registry evidence from AI-generated sourcing guidance.</p></div></div> : <>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-[#EA580C]">Supplier shortlist</p><h2 className="mt-1 text-2xl font-black">{result.suppliers.length} candidates found</h2><p className="mt-1 text-xs text-slate-500">For “{query}” · verify all commercial terms directly</p></div>{free && <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#EA580C]">Free preview</span>}</div>
          <div className="grid gap-4">{visible?.map((supplier, index) => <AssistantSupplierCard key={`${supplier.name}-${index}`} supplier={supplier} locked={result.access?.supplierDetailsLocked ?? false} />)}</div>
          {hiddenCount > 0 && <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-center"><p className="font-black text-[#0D1B2A]">{hiddenCount} more matched companies are ready to compare</p><p className="mt-1 text-xs text-slate-600">Upgrade for deeper matching, comparison, RFQ automation, saved projects, and exports.</p><Link href="/en/billing" className="mt-4 inline-flex rounded-xl bg-[#EA580C] px-5 py-2.5 text-sm font-black text-white hover:bg-[#DC4C00]">Unlock the sourcing workflow</Link></div>}
        </>}
      </section>
    </div>
  );
}
