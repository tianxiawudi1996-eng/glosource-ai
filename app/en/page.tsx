import type { Metadata } from 'next';
import Image from 'next/image';
import HeroSection from '@/app/components/HeroSection';
import BrandLogo from '@/app/components/BrandLogo';
import KSourceWrapper from './KSourceWrapper';
import ScrollCTA from './ScrollCTA';
import PolarCheckoutButton from './PolarCheckoutButton';
import Link from 'next/link';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'GloSource AI — Source Korean Suppliers with AI',
  description: 'Find Korean manufacturer candidates for K-beauty, K-food, K-fashion & more. AI-ranked suppliers from EC21 · BuyKorea (KOTRA) · tradeKorea with trust scores and English RFQ drafts. Start with 5 free searches.',
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
    description: 'Find Korean manufacturer candidates for K-beauty, K-food, K-fashion & more. Start with 5 free searches.',
  },
  alternates: {
    canonical: 'https://glosource-ai.vercel.app/en',
  },
};

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tag: 'Test the waters',
    price: '$19',
    unit: '/mo',
    per: '30 searches / month · $0.63 per search',
    features: [
      'Up to 3–5 AI-surfaced Korean supplier candidates per search',
      'Trust & risk scoring 0–100 with Listing Quality breakdown',
      'Unit price, MOQ & lead-time comparison',
      'Auto-generated English RFQ email — ready to send',
      'MFDS / KC / HACCP certification signal check',
    ],
    highlight: false,
    envKey: 'NEXT_PUBLIC_POLAR_STARTER_LINK',
  },
  {
    id: 'pro',
    name: 'Pro',
    tag: '⭐ Best for Amazon FBA sellers',
    price: '$49',
    unit: '/mo',
    per: '60 searches / month · $0.82 per search · Korea + China sourcing',
    features: [
      'Everything in Starter',
      'China supplier add-on — compare Korea vs. China side-by-side',
      'Full PDF sourcing report — shareable with your prep center',
      'Amazon FBA-ready: FBA labeling & packaging notes included',
      'Priority support',
    ],
    highlight: true,
    envKey: 'NEXT_PUBLIC_POLAR_PRO_LINK',
  },
  {
    id: 'agency',
    name: 'Agency',
    tag: 'For teams & sourcing agents',
    price: '$149',
    unit: '/mo',
    per: 'Unlimited searches · 5-seat team access',
    features: [
      'No monthly search cap',
      '5-seat team access — collaborate with your VA or partner',
      'Project sourcing history & saved supplier lists',
      'Custom supplier report templates',
      'Priority email support',
    ],
    highlight: false,
    envKey: 'NEXT_PUBLIC_POLAR_AGENCY_LINK',
  },
] as const;


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
    desc: 'Many Korean manufacturers provide MFDS (Ministry of Food and Drug Safety — Korean FDA equivalent), HACCP (Hazard Analysis Critical Control Points — food safety), KC (Korea Certification — electronics/electrical safety), KS (Korean Standards), or ISO documentation. These are useful screening signals, but buyers must confirm destination-market requirements before import.',
    badge: 'MFDS (Korean FDA) · HACCP · KC · KS',
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
    q: 'Why not just use BuyKorea or EC21 directly? They\'re free.',
    a: 'You can — but each platform requires separate browsing, has its own search interface, and gives you no cross-platform trust scoring or English RFQ. A typical manual search across BuyKorea + EC21 + tradeKorea takes 2–3 hours. GloSource queries all three simultaneously, ranks results by AI trust signals, and delivers a pre-written English RFQ in about 90 seconds. If your time is worth more than $0.63, it pays for itself on the first search.',
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
    a: 'No account needed for the first 5 free anonymous searches. Creating a verified free account gives you a monthly free quota; paid subscriptions unlock higher monthly limits. No credit card required for the free tier.',
  },
  {
    q: 'Is GloSource AI an actual sourcing agent?',
    a: 'No. We are a research and preparation tool — we surface, compare, score, and prepare RFQ drafts. You contact suppliers and negotiate directly. We do not handle transactions, logistics, or payments on your behalf.',
  },
  {
    q: 'What if suppliers don\'t respond to my RFQ?',
    a: 'GloSource finds and ranks candidates — supplier response rates depend on your RFQ quality, the specificity of your specs, and follow-up timing. Most buyers need 2–5 outreach rounds before getting a useful reply. Tips: send RFQs to at least 3 candidates, include your target MOQ and price range, and follow up within 3 business days.',
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


const JSON_LD_ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GloSource AI',
  url: 'https://glosource-ai.vercel.app/en',
  description: 'AI-powered sourcing assistant for international buyers. Find Korean supplier candidates (K-beauty, K-food, K-fashion) from EC21, BuyKorea, KOTRA, and tradeKorea.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'glosourceai@gmail.com',
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

export default async function EnPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const initialProduct = params?.q ?? '';
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const plan = session?.user?.plan ?? 'free';
  const freeSearchLimit = isLoggedIn ? 10 : 5;

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_ORGANIZATION) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_FAQ) }} />

      {/* ── NAV ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <BrandLogo compact />
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">KO</Link>
            <a href="#why-korea" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Why Korea</a>
            <a href="#pricing" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Pricing</a>
            <Link href="/en/blog" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Blog</Link>
            <Link href="/en/case-studies" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden md:block">Examples</Link>
            <Link href="/en/about" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden md:block">About</Link>
            {isLoggedIn ? (
              <>
                <Link href="/en/dashboard" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">
                  Dashboard
                </Link>
                <Link href="/account" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link href="/en/login" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">
                  Sign in
                </Link>
                <Link href="/en/register" className="text-xs font-bold border border-white/30 text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  Sign up free
                </Link>
              </>
            )}
            <ScrollCTA targetId="sourcing-tool" className="text-xs font-bold bg-[#EA580C] text-white px-4 py-2 rounded-lg hover:bg-[#DC4C00] transition-colors">
              Try Free →
            </ScrollCTA>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <HeroSection lang="en" />


      {/* ── ROI STRIP ──────────────────────────────────────── */}
      <section className="bg-[#0D1B2A] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:divide-x sm:divide-white/10">
            {[
              { before: 'Manual search', after: '~90 sec', label: 'Time to supplier shortlist (AI-assisted)' },
              { before: '5+ tabs', after: '1 search', label: 'EC21 (Korea #1 B2B) · BuyKorea (KOTRA gov) · tradeKorea (KITA)' },
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
              Select a category below or type your own product. AI searches publicly available listings on EC21 · BuyKorea · tradeKorea, then returns ranked suppliers with AI-detected certification signals (unverified), MOQ estimates, and an RFQ draft.
            </p>
          </div>
          <KSourceWrapper initialProduct={initialProduct} plan={plan} freeSearchLimit={freeSearchLimit} />
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


      {/* ── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">Simple, transparent pricing</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              1 search = up to 3–5 Korean supplier candidates + AI trust signals + certification signals (AI-detected, unverified) + English RFQ draft.
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
                <PolarCheckoutButton
                  checkoutUrl={process.env[plan.envKey] ?? 'mailto:glosourceai@gmail.com?subject=GloSource%20AI%20Plan%20Access'}
                  label={`Get ${plan.name} →`}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 max-w-lg mx-auto text-center">
            <strong className="text-slate-700">Free tier:</strong> 5 anonymous trial searches; verified free accounts get 10 searches/month · up to 3–5 AI-surfaced Korean supplier candidates per search · Trust score · English RFQ draft
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            Secure checkout · Email fallback for early access · No Korean entity required
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


      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-[#0A1520] border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo compact />
          <p className="text-xs text-slate-600 text-center">
            GloSource AI is a sourcing research tool, not a trade agent. Contact:{' '}
            <a href="mailto:glosourceai@gmail.com" className="underline hover:text-slate-400">glosourceai@gmail.com</a>
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <Link href="/en/about" className="hover:text-slate-400 transition-colors">About</Link>
            <Link href="/en/case-studies" className="hover:text-slate-400 transition-colors">Examples</Link>
            <Link href="/en/blog" className="hover:text-slate-400 transition-colors">Blog</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-slate-400 transition-colors">Korean version →</Link>
            <a href="https://twitter.com/glosourceai" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors" aria-label="Twitter/X">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
