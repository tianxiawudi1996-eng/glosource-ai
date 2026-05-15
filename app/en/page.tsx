import type { Metadata } from 'next';
import Image from 'next/image';
import HeroSection from '@/app/components/HeroSection';
import KSourceWrapper from './KSourceWrapper';
import ScrollCTA from './ScrollCTA';
import Link from 'next/link';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'GloSource AI — Source Korean Suppliers with AI',
  description: 'Find Korean manufacturer candidates for K-beauty, K-food, K-fashion & more. AI-ranked suppliers from EC21 · BuyKorea (KOTRA) · tradeKorea with trust scores and English RFQ drafts. 5 free searches.',
  openGraph: {
    title: 'GloSource AI — Source Korean Suppliers with AI',
    description: 'Find Korean manufacturer candidates for K-beauty, K-food, K-fashion & more. EC21 · BuyKorea (KOTRA) · tradeKorea channels. AI trust scores + English RFQ.',
    url: 'https://glosource-ai.vercel.app/en',
    siteName: 'GloSource AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GloSource AI — Source Korean Suppliers with AI',
    description: 'Find Korean manufacturer candidates for K-beauty, K-food, K-fashion & more. 5 free searches.',
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
    price: '$9.90',
    unit: '/mo',
    per: '30 searches / month · $0.33 per search',
    features: [
      '3–5 Korean supplier candidates per search',
      'Trust & risk scoring 0–100',
      'Unit price & MOQ comparison',
      'Auto-generated English RFQ email',
      'MFDS / KC certification signal check',
    ],
    highlight: false,
    envKey: 'NEXT_PUBLIC_POLAR_STARTER_LINK',
  },
  {
    id: 'pro',
    name: 'Pro',
    tag: 'Most popular',
    price: '$29',
    unit: '/mo',
    per: '60 searches / month · $0.48 per search',
    features: [
      'All Starter features',
      'HACCP / KS / ISO certification signals',
      'China supplier add-on when needed',
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
    unit: '/mo',
    per: 'Unlimited searches',
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
    desc: 'Type a product in English — e.g. "K-beauty collagen serum OEM". Use the category shortcuts below to prefill realistic examples and quantities.',
  },
  {
    step: '02',
    title: 'AI scans Korean export channels',
    desc: 'Instead of opening EC21 · BuyKorea · tradeKorea in separate tabs, GloSource AI searches all channels via Google Search simultaneously. Every candidate is AI-scored 0–100 for trust signals and certification evidence (AI-estimated, not independently audited).',
  },
  {
    step: '03',
    title: 'Get your shortlist + RFQ draft',
    desc: '3–5 Korean supplier candidates ranked side-by-side with MFDS/HACCP/KC signals, estimated MOQ, and unit price. Unlike a generic ChatGPT template, the RFQ draft is pre-filled with the specific supplier name, platform, and detected certification signals from your search.',
  },
];

const WHY_KOREA = [
  {
    title: 'BuyKorea — KOTRA-Operated Export Marketplace',
    desc: 'BuyKorea is operated by KOTRA (Korea Trade-Investment Promotion Agency), a Korean government agency. It focuses on registered, export-oriented Korean companies. Compared to open marketplaces where anyone can list, it can be a useful starting point for supplier screening — but buyers should still verify each supplier independently.',
    badge: 'Listed on BuyKorea (KOTRA)',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'World-Class Certifications',
    desc: 'Many Korean manufacturers provide MFDS, HACCP, KC, KS, ISO, or category-specific documentation. These are useful screening signals, but buyers still need to confirm destination-market requirements before import.',
    badge: 'MFDS · HACCP · KC · KS',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    title: 'K-Wave Is a Real Opportunity',
    desc: 'K-beauty, K-food, and K-fashion continue to show strong global demand across the US, EU, and Southeast Asia. Korean beauty exports reached $8.5B in 2023 — importers who source Korean products now are positioning themselves ahead of growing global competition.',
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
    label: 'MFDS',
    full: 'Ministry of Food and Drug Safety',
    desc: 'Korea\'s food, drug, cosmetics, and medical-device regulator. MFDS records and related documents help screen suppliers, but importers must still verify labeling, ingredients, and destination-market rules.',
    products: 'K-Beauty · Skincare OEM · Supplements · K-Food',
    color: 'border-emerald-200 bg-emerald-50',
    labelColor: 'bg-emerald-600 text-white',
  },
  {
    label: 'HACCP',
    full: 'Hazard Analysis Critical Control Points',
    desc: 'Internationally recognized food-safety management system. Many Korean food manufacturers hold HACCP for export, and importers can use it as an important due-diligence signal.',
    products: 'Instant Noodles · Snacks · Sauces · Beverages',
    color: 'border-emerald-200 bg-emerald-50',
    labelColor: 'bg-emerald-600 text-white',
  },
  {
    label: 'KC',
    full: 'Korea Certification',
    desc: "Mandatory Korean safety certification for electronics and electrical appliances sold in Korea. Export buyers should still confirm CE, FCC, UKCA, or other destination-market requirements separately.",
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
    sub: 'Korea-Based B2B Export Marketplace',
    desc: 'A major Korea-based B2B marketplace used by international buyers looking for Korean manufacturers and traders across many product categories.',
    badge: 'Priority channel',
    badgeColor: 'bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20',
  },
  {
    name: 'BuyKorea (KOTRA)',
    sub: 'Korean Government Trade Agency',
    desc: 'Operated by KOTRA, Korea\'s official trade promotion agency. Useful for finding Korean exporters and starting supplier due diligence with more structured company information.',
    badge: 'Government backed',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    name: 'tradeKorea (KITA)',
    sub: 'Korea International Trade Association',
    desc: 'KITA operates tradeKorea for Korean SME manufacturers seeking international partnerships. Particularly strong in manufacturing, materials, and industrial products, as well as consumer goods.',
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
    a: 'K-beauty (skincare, cosmetics, OEM), K-food (instant noodles, snacks, sauces, beverages), K-fashion (clothing, accessories, streetwear), electronics (components, wearables), supplements, industrial parts, and more. If it is manufactured in Korea and sold globally, GloSource AI can usually build a supplier shortlist for it.',
  },
  {
    q: 'Why not just search Alibaba for Korean suppliers?',
    a: 'Alibaba includes Korean traders, re-exporters, and resellers mixed together with manufacturers — it\'s hard to tell them apart. GloSource specifically filters for Korean manufacturers with MFDS/HACCP/KC certification signals, which Alibaba does not surface. You also get an English RFQ pre-filled with supplier-specific details, saving hours of manual cross-referencing across BuyKorea, EC21, and tradeKorea.',
  },
  {
    q: 'How is BuyKorea (KOTRA) different from Alibaba?',
    a: 'BuyKorea is operated by KOTRA, a Korean government agency. It focuses on registered, export-oriented Korean companies, giving buyers more structured company information than a fully open marketplace. For Korean products specifically, KOTRA-listed suppliers can be a stronger starting point for due diligence.',
  },
  {
    q: 'What certifications do Korean suppliers typically hold?',
    a: 'MFDS-related documentation for cosmetics, food, and health products, HACCP for food safety, KC for Korean electronics safety, and KS for industrial standards. These are useful screening signals, but buyers must still confirm destination-market compliance.',
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
    q: 'How do I subscribe to a paid plan?',
    a: 'Click "Get started" on any paid plan. You will be taken to a secure checkout. After payment, an account is automatically created using your payment email and you will receive an email to set your password. No Korean business registration or ID is required.',
  },
  {
    q: 'Does a failed or errored search count against my free quota?',
    a: 'No. Only successful searches that return supplier results count toward your free tier or monthly plan quota. If a search fails due to a technical error or timeout, your count is not affected.',
  },
];

function PolarButton({ envKey, label }: { envKey: string; label: string }) {
  const checkoutUrl = process.env[envKey];
  const href = checkoutUrl ?? 'mailto:like2buyglobal@gmail.com?subject=GloSource%20AI%20English%20Plan%20Access';
  const isExternal = !href.startsWith('mailto:');
  return (
    <div className="space-y-2">
      <p className="text-[10px] text-slate-500 text-center leading-relaxed">
        By subscribing, you request immediate service access and acknowledge that your 14-day right of withdrawal (EU Consumer Rights Directive Art. 16(m)) ends upon your first search.
      </p>
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all bg-[#EA580C] text-white hover:bg-[#DC4C00] shadow-lg shadow-orange-900/20"
      >
        {label}
      </a>
    </div>
  );
}

const JSON_LD_ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GloSource AI',
  url: 'https://glosource-ai.vercel.app/en',
  description: 'AI-powered sourcing assistant for international buyers. Find Korean supplier candidates (K-beauty, K-food, K-fashion) from EC21, BuyKorea, KOTRA, and tradeKorea.',
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

export default async function EnPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

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
            <a href="#pricing" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Pricing</a>
            {isLoggedIn ? (
              <Link href="/en/dashboard" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                My Account
              </Link>
            ) : (
              <Link href="/en/login" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                Sign in
              </Link>
            )}
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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap shrink-0">AI searches via Google</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {[
                { name: 'EC21.com', note: 'Korea B2B' },
                { name: 'BuyKorea', note: 'KOTRA Gov.' },
                { name: 'tradeKorea', note: 'KITA' },
                { name: 'Direct factories', note: 'Korea web' },
                { name: 'NAVER directories', note: 'Korea local' },
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

      {/* ── ROI STRIP ──────────────────────────────────────── */}
      <section className="bg-[#0D1B2A] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:divide-x sm:divide-white/10">
            {[
              { before: 'Manual search', after: '~90 sec', label: 'Time to supplier shortlist (AI-assisted)' },
              { before: '5+ tabs', after: '1 search', label: 'EC21 · BuyKorea · tradeKorea · more' },
              { before: 'Manual RFQ', after: 'Auto-drafted', label: 'English RFQ template, ready to edit' },
            ].map(({ before, after, label }) => (
              <div key={label} className="flex items-center gap-4 sm:px-6 first:pl-0 last:pr-0">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 text-sm font-semibold line-through">{before}</span>
                  <svg className="w-4 h-4 text-[#EA580C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-white text-sm font-black">{after}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{label}</p>
              </div>
            ))}
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
              Select a category below or type your own product. AI scans EC21 · BuyKorea · tradeKorea and direct Korean factory sources, then returns ranked suppliers with certification evidence, MOQ, and an RFQ draft.
            </p>
          </div>
          <KSourceWrapper />
        </div>
      </section>

      {/* ── WHY KOREA ──────────────────────────────────────── */}
      <section id="why-korea" className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          {/* Image C — K-Wave demand visual with overlay */}
          <div className="relative w-full rounded-2xl overflow-hidden mb-12 h-56 sm:h-72 shadow-md">
            <Image
              src="/images/k-wave-demand.png"
              alt="K-wave — K-drama, K-pop, and K-fashion driving global demand for Korean products"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/90 via-[#0D1B2A]/60 to-transparent flex items-center">
              <div className="px-8 sm:px-12 max-w-lg">
                <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-2">K-Wave × Global Trade</p>
                <h3 className="text-white font-black text-2xl sm:text-3xl leading-tight mb-3">
                  K-drama, K-pop, K-food.<br />The demand is real.
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Korean content has created measurable global consumer demand. Buyers who source Korean products early can test markets before competition catches up.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Why source from Korea?</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">Three reasons Korean suppliers are different</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Not all sourcing channels are equal. Here is what makes Korea a stronger starting point for many K-product buyers.
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
              GloSource AI looks for certification signals and displays them for each supplier candidate — giving you a head start before you reach out.
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
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">Korean export channels, searched simultaneously</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              GloSource AI covers the main Korean export channels and direct factory sources in one search — no manual browsing required.
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
            <h2 className="text-2xl font-black text-[#0D1B2A]">From product idea to a Korean supplier shortlist</h2>
          </div>
          {/* Image D — supplier verification process visual */}
          <div className="relative w-full rounded-2xl overflow-hidden mb-10 shadow-sm border border-slate-100">
            <Image
              src="/images/k-supplier-process.png"
              alt="Buyer reviewing Korean supplier samples, packaging, inspection notes, and fabric swatches"
              width={1448}
              height={1086}
              className="w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0D1B2A]/75 to-transparent px-6 py-4">
              <p className="text-white text-xs font-bold">How buyers evaluate Korean supplier samples — this is the process GloSource AI prepares you for.</p>
            </div>
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
              1 search = 3–5 Korean supplier candidates + AI trust signals + certification evidence + English RFQ draft.
            </p>
            <p className="mt-2 text-xs text-slate-400">For international buyers · Priced in USD · Korean-market plans available at <Link href="/" className="underline text-[#0D1B2A] hover:text-slate-700">glosource-ai.vercel.app</Link></p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 max-w-lg mx-auto text-left">
              <strong className="text-slate-700">Research tool disclaimer:</strong> GloSource AI provides AI-generated supplier research only. We do not verify suppliers, guarantee product quality, or handle transactions. Trust scores are AI-estimated signals — always conduct independent due diligence before signing any contract.
            </div>
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
                <PolarButton envKey={plan.envKey} label={`Get ${plan.name} →`} />
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Secure checkout via Polar.sh · Cancel anytime · No Korean entity required
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
            Find your Korean supplier shortlist<br className="hidden sm:block" /> with AI-ranked evidence
          </h2>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed max-w-lg mx-auto">
            5 free searches, no credit card required. Get ranked Korean supplier candidates with MFDS/HACCP/KC certification signals and an English RFQ draft — in under a minute.
          </p>
          <ScrollCTA targetId="sourcing-tool"
            className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#DC4C00] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-900/30 text-sm">
            Start 5 free searches →
          </ScrollCTA>
          <p className="mt-4 text-xs text-slate-500">No signup required · No credit card required</p>
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
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-slate-400 transition-colors">Korean version →</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
