import type { Metadata } from 'next';
import HeroSection from '@/app/components/HeroSection';
import KSourceWrapper from './KSourceWrapper';
import ScrollCTA from './ScrollCTA';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'GloSource AI — Source Korean Suppliers in 60 Seconds',
  description: 'Find verified Korean manufacturers for K-beauty, K-food, K-fashion & more. AI-ranked suppliers from EC21 · BuyKorea · KOTRA · tradeKorea with trust scores and English RFQ drafts. 5 free searches.',
  openGraph: {
    title: 'GloSource AI — Source Korean Suppliers in 60 Seconds',
    description: 'Find verified Korean manufacturers for K-beauty, K-food, K-fashion & more. EC21 · BuyKorea · KOTRA · tradeKorea channels. AI trust scores + English RFQ.',
    url: 'https://glosource-ai.vercel.app/en',
    siteName: 'GloSource AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GloSource AI — Source Korean Suppliers in 60 Seconds',
    description: 'Find verified Korean manufacturers for K-beauty, K-food, K-fashion & more. 5 free searches.',
  },
  alternates: {
    canonical: 'https://glosource-ai.vercel.app/en',
  },
};

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tag: 'For small buyers',
    price: '$9.9',
    unit: '/ mo',
    per: '30 analyses / month',
    features: [
      '3–5 Korean supplier candidates per search',
      'Trust & risk scoring 0–100',
      'Unit price & MOQ comparison',
      'Auto-generated English RFQ email',
      'KC / KFDA certification check',
    ],
    highlight: false,
    envKey: 'NEXT_PUBLIC_POLAR_STARTER_LINK',
  },
  {
    id: 'pro',
    name: 'Pro',
    tag: 'Most popular',
    price: '$29',
    unit: '/ mo',
    per: '60 analyses / month',
    features: [
      'All Starter features',
      'HACCP / KS / ISO certification filter',
      'Korea + China combined sourcing',
      'Priority support',
      'Full PDF sourcing report',
    ],
    highlight: true,
    envKey: 'NEXT_PUBLIC_POLAR_PRO_LINK',
  },
  {
    id: 'agency',
    name: 'Agency',
    tag: 'For teams',
    price: '$79',
    unit: '/ mo',
    per: 'Unlimited analyses',
    features: [
      'Unlimited searches',
      '5-seat team access',
      'Project sourcing history',
      'Priority email support',
      'Custom supplier templates',
    ],
    highlight: false,
    envKey: 'NEXT_PUBLIC_POLAR_AGENCY_LINK',
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Describe what you need',
    desc: 'Type a product in English — e.g. "K-beauty collagen serum OEM 1,000 units". Use the category shortcuts below for instant examples.',
  },
  {
    step: '02',
    title: 'AI scans 4 Korean channels',
    desc: 'EC21 · BuyKorea (KOTRA) · tradeKorea · direct factory search — all at once. Every supplier is scored 0–100 for trust, certifications, and export experience.',
  },
  {
    step: '03',
    title: 'Get your shortlist + RFQ in 60s',
    desc: '3–5 verified Korean suppliers ranked side-by-side with KFDA/HACCP/KC certs, MOQ, and unit price. One click copies a ready-to-send English RFQ email.',
  },
];

const WHY_KOREA = [
  {
    title: 'Government-Verified Exporters',
    desc: 'KOTRA (Korea Trade-Investment Promotion Agency) operates BuyKorea — a government-backed marketplace where only export-ready Korean companies are listed. Unlike open marketplaces, KOTRA pre-screens every supplier for export compliance.',
    badge: 'KOTRA Verified',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'World-Class Certifications',
    desc: 'Korean manufacturers hold KFDA (Korea\'s FDA equivalent), HACCP (international food safety gold standard), KC (mandatory electronics safety mark), and KS (industrial standards) — the same bar as US/EU compliance. Documentation is already prepared for import.',
    badge: 'KFDA · HACCP · KC · KS',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    title: 'K-Wave Is a Real Opportunity',
    desc: 'K-beauty, K-food, and K-fashion are the fastest-growing import categories in the US, EU, and Southeast Asia. Korean exports in beauty alone reached $8.5B in 2023. Sourcing now means entering markets ahead of the competition.',
    badge: '$8.5B K-beauty exports (2023)',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

const CERTS = [
  {
    label: 'KFDA',
    full: 'Korea Food & Drug Administration',
    desc: 'Korean equivalent of the US FDA. Mandatory for cosmetics, food supplements, and medical devices. KFDA-certified products can be imported to most markets with minimal additional compliance steps.',
    products: 'K-Beauty · Skincare OEM · Supplements · K-Food',
    color: 'border-emerald-200 bg-emerald-50',
    labelColor: 'bg-emerald-600 text-white',
  },
  {
    label: 'HACCP',
    full: 'Hazard Analysis Critical Control Points',
    desc: 'International gold standard for food safety, recognized by Codex Alimentarius (UN). Korean food manufacturers widely hold HACCP for export. Required by EU, US, and most importers for processed food.',
    products: 'Instant Noodles · Snacks · Sauces · Beverages',
    color: 'border-emerald-200 bg-emerald-50',
    labelColor: 'bg-emerald-600 text-white',
  },
  {
    label: 'KC',
    full: 'Korea Certification',
    desc: "Mandatory Korean safety certification for electronics and electrical appliances. Export models also carry CE and/or FCC marks. KC-certified products from Korea are ready for EU and US markets.",
    products: 'Electronics · Appliances · Components · Wearables',
    color: 'border-blue-200 bg-blue-50',
    labelColor: 'bg-blue-600 text-white',
  },
  {
    label: 'KS',
    full: 'Korean Industrial Standard',
    desc: 'The Korean equivalent of ISO for industrial products and materials. Ensures dimensional consistency, material quality, and performance standards. Widely trusted by industrial buyers globally.',
    products: 'Industrial Parts · Construction · Steel · Plastics',
    color: 'border-blue-200 bg-blue-50',
    labelColor: 'bg-blue-600 text-white',
  },
];

const CHANNELS = [
  {
    name: 'EC21.com',
    sub: 'Korea\'s Largest B2B Export Marketplace',
    desc: 'Over 1 million Korean companies listed. EC21 is the primary destination for international buyers looking for Korean manufacturers and traders across all product categories.',
    badge: 'Priority channel',
    badgeColor: 'bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20',
  },
  {
    name: 'BuyKorea (KOTRA)',
    sub: 'Korean Government Trade Agency',
    desc: 'Operated by KOTRA, Korea\'s official trade promotion agency. Only verified, export-ready Korean exporters are listed. The most trusted channel for compliance-conscious international buyers.',
    badge: 'Government backed',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    name: 'tradeKorea (KITA)',
    sub: 'Korea International Trade Association',
    desc: 'KITA operates tradeKorea for Korean SME manufacturers seeking international partnerships. Strong in manufacturing, materials, and industrial products alongside consumer goods.',
    badge: 'SME manufacturers',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    name: 'Direct Factory Search',
    sub: 'AI-Powered Web Research',
    desc: 'GloSource AI also searches Korean factory websites, NAVER directories, and industry-specific databases directly. Surfaces suppliers not listed on major B2B platforms.',
    badge: 'AI-powered',
    badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
  },
];

const FAQ = [
  {
    q: 'What kinds of Korean products can I source?',
    a: 'K-beauty (skincare, cosmetics, OEM), K-food (instant noodles, snacks, sauces, beverages), K-fashion (clothing, accessories, streetwear), electronics (components, wearables), supplements, industrial parts, and more. If it is manufactured in Korea and sold globally, GloSource AI can find suppliers for it.',
  },
  {
    q: 'How is BuyKorea (KOTRA) different from Alibaba?',
    a: 'BuyKorea is operated by KOTRA, a Korean government agency. Only verified, export-ready Korean companies are listed — there is no anonymous seller or open registration. Alibaba and similar platforms allow anyone to list. For Korean products specifically, KOTRA-verified suppliers offer a higher baseline of trust.',
  },
  {
    q: 'What certifications do Korean suppliers typically hold?',
    a: 'KFDA for cosmetics and food supplements (Korean equivalent of US FDA), HACCP for food safety (UN-recognized international standard), KC for electronics (mandatory Korean safety mark, equivalent to CE), and KS for industrial products. Most export-oriented Korean manufacturers hold multiple certifications.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account needed for the first 5 free searches. After that, a subscription unlocks more monthly analyses. No credit card required for the free tier.',
  },
  {
    q: 'Is GloSource AI an actual sourcing agent?',
    a: 'No. We are a research and preparation tool — we surface, compare, score, and prepare RFQ drafts. You contact suppliers and negotiate directly. We do not handle transactions, logistics, or payments on your behalf.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We use Polar.sh as our payment processor, which accepts all major credit cards and handles VAT/tax compliance globally. No Korean business registration required on your end.',
  },
];

function PolarButton({ envKey, children }: { envKey: string; children: React.ReactNode }) {
  const link = process.env[envKey];
  if (!link) {
    return (
      <button disabled
        className="block w-full text-center py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-400 cursor-not-allowed"
        title="Payment coming soon">
        Coming soon
      </button>
    );
  }
  return (
    <a href={link} target="_blank" rel="noopener noreferrer"
      className="block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all bg-[#EA580C] text-white hover:bg-[#DC4C00] shadow-lg shadow-orange-900/20">
      {children}
    </a>
  );
}

const JSON_LD_ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GloSource AI',
  url: 'https://glosource-ai.vercel.app/en',
  description: 'AI-powered sourcing assistant for international buyers. Find verified Korean suppliers (K-beauty, K-food, K-fashion) from EC21, BuyKorea, KOTRA, and tradeKorea in 60 seconds.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'like2buyglobal@gmail.com',
    contactType: 'customer service',
  },
};

const JSON_LD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function EnPage() {
  const polarReady = PLANS.some(p => Boolean(process.env[p.envKey]));

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_ORGANIZATION) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_FAQ) }} />

      {/* ── NAV ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#EA580C] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">G</span>
            </div>
            <span className="font-black text-white text-sm">GloSource AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">KO</Link>
            <a href="#why-korea" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Why Korea</a>
            <a href="#pricing" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">Pricing</a>
            <ScrollCTA targetId="sourcing-tool" className="text-xs font-bold bg-[#EA580C] text-white px-4 py-2 rounded-lg hover:bg-[#DC4C00] transition-colors">
              Try Free →
            </ScrollCTA>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <HeroSection lang="en" />

      {/* ── CHANNEL TRUST BAR ──────────────────────────────── */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap shrink-0">Sourced from</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {[
                { name: 'EC21.com', note: 'Korea #1 B2B' },
                { name: 'BuyKorea', note: 'KOTRA Gov.' },
                { name: 'tradeKorea', note: 'KITA' },
                { name: '1688.com', note: 'China factory' },
                { name: 'Alibaba.com', note: 'Global' },
              ].map(({ name, note }) => (
                <span key={name} className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 flex items-center gap-1.5">
                  {name}
                  <span className="text-[10px] text-slate-400 font-normal">{note}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOURCING TOOL ──────────────────────────────────── */}
      <section id="sourcing-tool" className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Try it free — 5 searches</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-2">Find your Korean supplier now</h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Select a category below or type your own product. AI scans EC21 · BuyKorea · KOTRA · tradeKorea and returns ranked suppliers with certifications, MOQ, and a ready-to-send RFQ in under 60 seconds.
            </p>
          </div>
          <KSourceWrapper />
        </div>
      </section>

      {/* ── WHY KOREA ──────────────────────────────────────── */}
      <section id="why-korea" className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Why source from Korea?</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">Three reasons Korean suppliers are different</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Not all sourcing channels are equal. Here is what sets Korean suppliers apart from typical Alibaba searches.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY_KOREA.map(item => (
              <div key={item.title} className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#0D1B2A] flex items-center justify-center text-slate-300">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-black text-[#0D1B2A] mb-2 leading-snug">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
                <span className={`self-start text-xs font-bold border rounded-full px-2.5 py-1 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CERTIFICATION GUIDE ────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Certification guide</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">What Korean certifications actually mean</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              GloSource AI checks and displays these certifications for each supplier — so you know before you send an RFQ.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CERTS.map(cert => (
              <div key={cert.label} className={`rounded-2xl border p-6 ${cert.color}`}>
                <div className="flex items-start gap-4 mb-3">
                  <span className={`text-sm font-black rounded-lg px-3 py-1.5 shrink-0 ${cert.labelColor}`}>
                    {cert.label}
                  </span>
                  <div>
                    <p className="font-bold text-sm text-[#0D1B2A] leading-snug">{cert.full}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{cert.products}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHANNELS EXPLAINED ─────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Where we search</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">4 Korean channels, searched simultaneously</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              GloSource AI covers every major Korean export channel in one search — no manual browsing required.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CHANNELS.map(ch => (
              <div key={ch.name} className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-black text-[#0D1B2A] text-sm">{ch.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{ch.sub}</p>
                  </div>
                  <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 shrink-0 ${ch.badgeColor}`}>
                    {ch.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{ch.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <ScrollCTA targetId="sourcing-tool"
              className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#DC4C00] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-900/30">
              Search all 4 channels now →
            </ScrollCTA>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-2xl font-black text-[#0D1B2A]">From product idea to verified Korean supplier in 60 seconds</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, idx) => (
              <div key={item.step} className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-3 w-6 h-px bg-slate-300 z-10" />
                )}
                <div className="w-10 h-10 rounded-xl bg-[#EA580C] flex items-center justify-center mb-4">
                  <span className="font-black text-xs text-white">{item.step}</span>
                </div>
                <h3 className="font-black text-[#0D1B2A] mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <ScrollCTA targetId="sourcing-tool"
              className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#DC4C00] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-900/30">
              Try it now — 5 free searches →
            </ScrollCTA>
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">Simple, transparent pricing</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              1 search = 3–5 Korean supplier candidates + trust scoring + certification check + English RFQ email. No contracts, cancel anytime.
            </p>
            {!polarReady && (
              <div className="mt-4 inline-flex items-center gap-2 border border-amber-200 bg-amber-50 rounded-full px-4 py-2 text-xs font-semibold text-amber-700">
                Payment integration launching soon — try it free in the meantime
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map(plan => (
              <div key={plan.id}
                className={`rounded-2xl border p-6 flex flex-col relative ${plan.highlight ? 'bg-[#0D1B2A] border-[#0D1B2A]' : 'bg-white border-slate-200'}`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#EA580C] text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                )}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-bold ${plan.highlight ? 'text-white' : 'text-[#0D1B2A]'}`}>{plan.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${plan.highlight ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>{plan.tag}</span>
                  </div>
                  <div className="flex items-end gap-1 mb-0.5">
                    <span className={`text-3xl font-black ${plan.highlight ? 'text-white' : 'text-[#0D1B2A]'}`}>{plan.price}</span>
                    <span className={`text-sm mb-1 ${plan.highlight ? 'text-slate-300' : 'text-slate-400'}`}>{plan.unit}</span>
                  </div>
                  <p className={`text-xs ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>{plan.per}</p>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-white/10' : 'bg-slate-100'}`}>
                        <svg className={`w-2.5 h-2.5 ${plan.highlight ? 'text-white' : 'text-[#0D1B2A]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`text-xs ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <PolarButton envKey={plan.envKey}>Get started</PolarButton>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Payments processed by{' '}
            <a href="https://polar.sh" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">Polar.sh</a>
            {' '}· Global tax & VAT handled · All major credit cards accepted
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-2xl font-black text-[#0D1B2A]">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map(item => (
              <div key={item.q} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="font-bold text-sm text-[#0D1B2A] mb-2">{item.q}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────── */}
      <section className="bg-[#0D1B2A] text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-4">Start sourcing today</p>
          <h2 className="text-3xl font-black mb-5 leading-tight">
            Find your verified Korean supplier<br className="hidden sm:block" /> in the next 60 seconds
          </h2>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed max-w-lg mx-auto">
            5 free searches, no credit card required. Get ranked Korean supplier candidates with KFDA/HACCP/KC certification status and a ready-to-send English RFQ draft — in under a minute.
          </p>
          <ScrollCTA targetId="sourcing-tool"
            className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#DC4C00] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-900/30 text-sm">
            Start 5 free searches →
          </ScrollCTA>
          <p className="mt-4 text-xs text-slate-500">No signup required · No credit card</p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-[#0A1520] border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#EA580C] rounded-md flex items-center justify-center">
              <span className="text-white font-black text-[10px]">G</span>
            </div>
            <span className="font-black text-slate-300 text-xs">GloSource AI</span>
          </div>
          <p className="text-xs text-slate-600 text-center">
            GloSource AI is a sourcing research tool, not a trade agent. Contact:{' '}
            <a href="mailto:like2buyglobal@gmail.com" className="underline hover:text-slate-400">like2buyglobal@gmail.com</a>
          </p>
          <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Korean version →
          </Link>
        </div>
      </footer>
    </div>
  );
}
