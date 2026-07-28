import type { Metadata } from 'next';
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';
import JsonLdBreadcrumb from '@/app/components/JsonLdBreadcrumb';
import FounderCard from '@/app/components/FounderCard';

export const metadata: Metadata = {
  title: 'About GloSource AI — Korean Supplier Research Tool',
  description: 'GloSource AI is an AI-powered research tool that helps international buyers find Korean supplier candidates from EC21, BuyKorea (KOTRA), and tradeKorea in under 90 seconds.',
  openGraph: {
    title: 'About GloSource AI — Korean Supplier Research Tool',
    description: 'AI-powered research for finding Korean supplier candidates from EC21, BuyKorea (KOTRA), and tradeKorea in under 90 seconds.',
    url: 'https://glosourceai.com/en/about',
    siteName: 'GloSource AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About GloSource AI',
    description: 'AI-powered Korean supplier research — EC21 · BuyKorea · tradeKorea in 90 seconds.',
    creator: '@glosourceai',
  },
  keywords: [
    'About GloSource AI',
    'Korean supplier research',
    'EC21 search',
    'BuyKorea KOTRA',
    'tradeKorea',
    'AI sourcing platform',
    'supplier discovery',
    'Korean manufacturer database',
    'trust scoring',
  ],
  alternates: {
    canonical: 'https://glosourceai.com/en/about',
    languages: {
      'en-US': 'https://glosourceai.com/en/about',
      'x-default': 'https://glosourceai.com/en/about',
    },
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <JsonLdBreadcrumb
        items={[
          { name: 'Home', url: 'https://glosourceai.com/en' },
          { name: 'About', url: 'https://glosourceai.com/en/about' },
        ]}
      />
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/en" aria-label="GloSource AI home">
            <BrandLogo compact />
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/en/blog" className="text-slate-300 hover:text-white font-semibold">Blog</Link>
            <Link href="/en#sourcing-tool" className="bg-[#EA580C] text-white font-bold px-4 py-1.5 rounded-lg hover:bg-[#DC4C00] transition-all">
              Try free
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">About</p>
          <h1 className="text-3xl font-black text-[#0D1B2A] mb-4 leading-tight">
            GloSource AI — Korean Supplier Research Tool
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            We built GloSource AI to solve a specific problem: finding Korean manufacturer candidates takes too long and too many open tabs.
          </p>
        </div>

        {/* What it is */}
        <section className="mb-10">
          <h2 className="text-lg font-black text-[#0D1B2A] mb-3">What GloSource AI does</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            GloSource AI searches Korean B2B export channels — EC21, BuyKorea (KOTRA), tradeKorea, and direct factory sources — simultaneously using Google Search grounding and AI analysis. For each search, it returns up to 3–5 supplier candidates with trust scoring, certification signals, estimated pricing, and a ready-to-send English RFQ draft.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            The process takes around 90 seconds instead of hours of manual research across separate tabs.
          </p>
        </section>

        {/* What it is NOT */}
        <section className="mb-10 bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h2 className="text-base font-black text-[#0D1B2A] mb-3">What GloSource AI is not</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold mt-0.5">✗</span>
              <span>A sourcing agent or trade middleman — we charge no commission and do not act on your behalf</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold mt-0.5">✗</span>
              <span>A supplier verification service — trust scores are AI-estimated signals, not independent audits</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold mt-0.5">✗</span>
              <span>A guaranteed source of verified suppliers — you must independently verify any supplier before ordering</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold mt-0.5">✗</span>
              <span>A logistics, customs, or payments provider</span>
            </li>
          </ul>
          <p className="text-xs text-slate-400 mt-4">
            All contracts, negotiations, and transactions are between you and the supplier directly.
          </p>
        </section>

        {/* Who built it */}
        <section className="mb-10">
          <h2 className="text-lg font-black text-[#0D1B2A] mb-3">Who built this</h2>
          <FounderCard />
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            GloSource AI is operated by John Kim, based in Korea. The product is built on top of Google Gemini with Search Grounding and is focused specifically on Korean manufacturer sourcing for international buyers.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            The goal is simple: if you want to source from Korea, GloSource AI should save you hours of research per product category. You still do the relationship-building, negotiation, and due diligence — we just help you find the right starting list faster.
          </p>
        </section>

        {/* Limitations */}
        <section className="mb-10">
          <h2 className="text-lg font-black text-[#0D1B2A] mb-3">Known limitations</h2>
          <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
            <li>AI search results depend on publicly available information — unlisted or offline suppliers will not appear</li>
            <li>Trust scores reflect AI-detected signals, not factory audits or certification verification</li>
            <li>Pricing and MOQ figures are estimates and may differ significantly from actual supplier quotes</li>
            <li>Certification mentions (MFDS, HACCP, KC) are AI-detected and require independent verification</li>
            <li>English RFQ drafts are templates — review and edit before sending to any supplier</li>
          </ul>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-lg font-black text-[#0D1B2A] mb-3">Contact</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            For questions, feedback, or support:{' '}
            <a href="mailto:hello@glosourceai.com" className="text-[#EA580C] font-semibold hover:underline">
              hello@glosourceai.com
            </a>
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Response time: 1–2 business days (Korean time, UTC+9).
          </p>
        </section>

        {/* CTA */}
        <div className="rounded-2xl bg-[#0D1B2A] p-8 text-center">
          <h2 className="text-xl font-black text-white mb-3">Try it — 3 free searches</h2>
          <p className="text-slate-300 text-sm mb-6">No credit card. See real AI-generated results in ~90 seconds.</p>
          <Link
            href="/en#sourcing-tool"
            className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#DC4C00] text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
          >
            Start free search →
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-100 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/en" aria-label="GloSource AI home">
            <BrandLogo compact />
          </Link>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link href="/en/blog" className="hover:text-slate-700">Blog</Link>
            <Link href="/terms" className="hover:text-slate-700">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
            <a href="mailto:hello@glosourceai.com" className="hover:text-slate-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
