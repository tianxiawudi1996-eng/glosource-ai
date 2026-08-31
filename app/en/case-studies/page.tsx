import type { Metadata } from 'next';
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';
import JsonLdBreadcrumb from '@/app/components/JsonLdBreadcrumb';

export const metadata: Metadata = {
  title: 'Korean Supplier Search Examples — GloSource AI',
  description: 'See what GloSource AI returns for real product searches — Korean cosmetics OEM, K-food wholesale, fashion suppliers. Demo searches with AI-generated results.',
  openGraph: {
    title: 'Korean Supplier Search Examples — GloSource AI',
    description: 'Demo searches with AI-generated results: K-beauty OEM, K-food wholesale, K-fashion suppliers.',
    url: 'https://glosourceai.com/en/case-studies',
    siteName: 'GloSource AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Korean Supplier Search Examples',
    description: 'AI-generated demo results for K-beauty OEM, K-food wholesale, K-fashion.',
    creator: '@glosourceai',
  },
  keywords: [
    'Korean supplier examples',
    'K-beauty OEM demo',
    'K-food wholesale search',
    'Korean cosmetics manufacturer',
    'Korean fashion supplier',
    'AI search demo',
    'supplier comparison',
    'RFQ examples',
    'Korea sourcing case study',
  ],
  alternates: {
    canonical: 'https://glosourceai.com/en/case-studies',
    languages: {
      'en-US': 'https://glosourceai.com/en/case-studies',
      'x-default': 'https://glosourceai.com/en/case-studies',
    },
  },
};

const DEMOS = [
  {
    slug: 'collagen-serum-oem',
    label: 'Demo search',
    vertical: 'K-Beauty',
    verticalColor: 'bg-pink-50 text-pink-700 border-pink-200',
    query: 'Korean collagen serum OEM 1000 units',
    timeSeconds: 54,
    supplierCount: 4,
    certSignals: ['MFDS', 'ISO 22716'],
    rfq: true,
    summary: 'Found 4 Korean collagen serum OEM manufacturer candidates from EC21 and BuyKorea. AI detected MFDS-registered manufacturers with ISO 22716 (cosmetics GMP) signals. Estimated MOQ 500–1,000 units at $8–12/pc ex-factory. English RFQ draft generated.',
    disclaimer: 'This is a demo search result showing the GloSource AI output format. Supplier details, prices, and signals are illustrative. Actual search results vary and require independent buyer verification.',
  },
  {
    slug: 'instant-noodle-wholesale',
    label: 'Demo search',
    vertical: 'K-Food',
    verticalColor: 'bg-amber-50 text-amber-700 border-amber-200',
    query: 'Korean instant ramen noodle OEM bulk wholesale',
    timeSeconds: 71,
    supplierCount: 3,
    certSignals: ['HACCP', 'MFDS'],
    rfq: true,
    summary: 'Found 3 Korean instant noodle / ramen OEM manufacturer candidates from tradeKorea and BuyKorea. HACCP certification signals detected for food-safety screening. Estimated MOQ 5,000–20,000 cases depending on SKU. English RFQ draft generated.',
    disclaimer: 'Demo search result showing output format. Supplier details are illustrative.',
  },
  {
    slug: 'tshirt-fashion-manufacturer',
    label: 'Demo search',
    vertical: 'K-Fashion',
    verticalColor: 'bg-purple-50 text-purple-700 border-purple-200',
    query: 'Korean cotton T-shirt manufacturer OEM label 500 pcs',
    timeSeconds: 61,
    supplierCount: 5,
    certSignals: ['OEKO-TEX signal', 'Dongdaemun export'],
    rfq: true,
    summary: 'Found 5 Korean T-shirt and apparel OEM manufacturer candidates. Mix of Seoul Dongdaemun area manufacturers and Daegu textile producers. OEKO-TEX certification signals in 2 candidates. MOQ estimated 200–1,000 pcs depending on fabric and cut.',
    disclaimer: 'Demo search result showing output format. Supplier details are illustrative.',
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <JsonLdBreadcrumb
        items={[
          { name: 'Home', url: 'https://glosourceai.com/en' },
          { name: 'Examples', url: 'https://glosourceai.com/en/case-studies' },
        ]}
      />
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/en" aria-label="GloSource AI home">
            <BrandLogo compact />
          </Link>
          <Link href="/en#sourcing-tool" className="text-xs font-bold text-[#EA580C] bg-orange-50 px-4 py-1.5 rounded-lg hover:bg-orange-100 transition-all">
            Try it free →
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Results</p>
          <h1 className="text-3xl font-black text-[#0D1B2A] mb-4 leading-tight">
            What GloSource AI Returns
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
            These are <strong>demo searches</strong> showing the format and depth of GloSource AI results. Supplier details are illustrative. Run your own search to see real candidates for your product.
          </p>

          {/* Demo label explainer */}
          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-start gap-3">
            <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Demo searches only.</strong> These examples show the GloSource AI output structure and result depth. Supplier names, prices, MOQs, and certification details are illustrative. Actual searches return real AI-generated candidates based on current Google Search data — you must verify all supplier details independently before engaging any supplier.
            </p>
          </div>
        </div>

        <div className="space-y-10">
          {DEMOS.map(demo => (
            <article key={demo.slug} className="border border-slate-200 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200 rounded-full px-2.5 py-1 uppercase tracking-wide">
                  {demo.label}
                </span>
                <span className={`text-[11px] font-bold border rounded-full px-2.5 py-1 ${demo.verticalColor}`}>
                  {demo.vertical}
                </span>
              </div>

              <div className="px-6 py-6">
                {/* Query */}
                <div className="flex items-center gap-2 bg-[#0D1B2A] rounded-lg px-4 py-2.5 mb-5">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-xs font-mono text-slate-200">{demo.query}</span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="text-center bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <p className="text-lg font-black text-emerald-700">{demo.supplierCount}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">candidates found</p>
                  </div>
                  <div className="text-center bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-lg font-black text-blue-700">~{demo.timeSeconds}s</p>
                    <p className="text-[10px] text-blue-600 font-semibold">search time</p>
                  </div>
                  <div className="text-center bg-orange-50 rounded-xl p-3 border border-orange-100">
                    <p className="text-lg font-black text-[#EA580C]">RFQ</p>
                    <p className="text-[10px] text-orange-600 font-semibold">draft ready</p>
                  </div>
                </div>

                {/* Cert signals */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {demo.certSignals.map(cert => (
                    <span key={cert} className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {cert} signal detected
                    </span>
                  ))}
                  <span className="text-[10px] text-slate-400 self-center">(AI-estimated, not audited)</span>
                </div>

                {/* Summary */}
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{demo.summary}</p>

                {/* Disclaimer */}
                <p className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 leading-relaxed">
                  {demo.disclaimer}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-[#0D1B2A] p-8 text-center">
          <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Your turn</p>
          <h2 className="text-xl font-black text-white mb-3">Run a real search for your product</h2>
          <p className="text-slate-300 text-sm mb-6">
            3 free searches per month. Preview results in about a minute.
          </p>
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
            <Link href="/en/about" className="hover:text-slate-700">About</Link>
            <Link href="/terms" className="hover:text-slate-700">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
