import type { Metadata } from 'next';
import HeroSection from '@/app/components/HeroSection';
import BrandLogo from '@/app/components/BrandLogo';
import JsonLdGloSource from '@/app/components/JsonLdGloSource';
import KSourceWrapper from './KSourceWrapper';
import ScrollCTA from './ScrollCTA';
import PolarCheckoutButton from './PolarCheckoutButton';
import Link from 'next/link';
import { auth } from '@/auth';
import SampleReportLeadForm from './SampleReportLeadForm';
import PricingViewTracker from './PricingViewTracker';

export const metadata: Metadata = {
  metadataBase: new URL('https://glosource-ai.vercel.app'),
  title: 'GloSource AI — Korean K-Beauty OEM Supplier Intelligence',
  description: 'Build a risk-reduced shortlist of Korean K-Beauty OEM/ODM supplier candidates with manufacturer-vs-trader signals, certification evidence, MOQ notes, and an English RFQ draft.',
  keywords: [
    'Korean K-beauty OEM',
    'Korean cosmetics manufacturer',
    'K-beauty private label',
    'Korean skincare ODM',
    'Korean supplier shortlist',
    'K-beauty manufacturer',
    'EC21',
    'BuyKorea KOTRA',
    'tradeKorea',
    'English RFQ Korean',
    'Korean OEM',
    'Amazon FBA sourcing',
  ],
  authors: [{ name: 'GloSource AI' }],
  creator: 'GloSource AI',
  publisher: 'GloSource AI',
  openGraph: {
    title: 'GloSource AI — Korean K-Beauty OEM Supplier Intelligence',
    description: 'A risk-reduced Korean OEM/ODM supplier shortlist with evidence, MOQ notes, risk signals, and an English RFQ draft.',
    url: 'https://glosource-ai.vercel.app/en',
    siteName: 'GloSource AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/en/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'GloSource AI Korean K-Beauty OEM supplier shortlist',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GloSource AI — Korean K-Beauty OEM Supplier Intelligence',
    description: 'Shortlist Korean OEM/ODM supplier candidates with evidence, risk signals, MOQ notes, and an English RFQ.',
    images: ['/en/opengraph-image'],
    creator: '@glosourceai',
  },
  alternates: {
    canonical: 'https://glosource-ai.vercel.app/en',
    languages: {
      'en-US': 'https://glosource-ai.vercel.app/en',
      'x-default': 'https://glosource-ai.vercel.app/en',
      // 'ko-KR': 'https://glosource-ai.vercel.app/' — TODO: 한국어 버전 공개 시 추가
    },
  },
};

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tag: 'For one active product',
    price: '$19',
    unit: '/mo',
    per: '30 shortlist searches / month',
    features: [
      '3–5 Korean OEM/ODM candidates per search',
      'Manufacturer-vs-trader and risk signals',
      'Certification evidence and MOQ notes',
      'English RFQ draft ready to review',
      'Source links for independent verification',
    ],
    highlight: false,
    envKey: 'NEXT_PUBLIC_POLAR_STARTER_LINK',
  },
  {
    id: 'pro',
    name: 'Pro',
    tag: 'Best for multiple launches',
    price: '$49',
    unit: '/mo',
    per: '60 shortlist searches / month',
    features: [
      'Everything in Starter',
      'Compare multiple K-Beauty product briefs',
      'Full PDF sourcing report',
      'Buyer checklist and follow-up email draft',
      'Priority support',
    ],
    highlight: true,
    envKey: 'NEXT_PUBLIC_POLAR_PRO_LINK',
  },
] as const;


const PROBLEMS = [
  {
    number: '01',
    title: 'Manufacturer or middleman?',
    desc: 'Review public signals that suggest factory capability, trading activity, or an unclear operating role.',
  },
  {
    number: '02',
    title: 'Which claims need verification?',
    desc: 'See certification claims beside their source and the exact documents you still need to request.',
  },
  {
    number: '03',
    title: 'Will the MOQ fit your launch?',
    desc: 'Separate public MOQ information, estimates, and unknowns instead of treating them as equally reliable.',
  },
  {
    number: '04',
    title: 'What should you ask first?',
    desc: 'Start with a product-specific English RFQ rather than a generic request for a catalog and price list.',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Define the product brief',
    desc: 'Enter the product type, target market, desired MOQ, packaging, claims, and launch timing.',
  },
  {
    number: '2',
    title: 'Review Korean candidates',
    desc: 'Compare OEM/ODM candidates using source evidence, manufacturer signals, certifications, MOQ context, and risk notes.',
  },
  {
    number: '3',
    title: 'Send a stronger RFQ',
    desc: 'Edit the prepared RFQ, contact multiple candidates, and use the buyer checklist before paying for samples.',
  },
] as const;

const FAQ = [
  {
    q: 'Is GloSource AI a sourcing agent?',
    a: 'No. GloSource AI prepares research, supplier-candidate comparisons, and RFQ drafts. You contact, verify, negotiate with, and pay suppliers directly.',
  },
  {
    q: 'Are the suppliers verified?',
    a: 'No. GloSource AI surfaces public evidence and risk signals for first-pass review. Every supplier, certificate, bank account, sample, and manufacturing claim requires independent verification.',
  },
  {
    q: 'How do you distinguish a manufacturer from a trader?',
    a: 'We review public signals such as OEM/ODM language, factory addresses, production capabilities, company registrations, export listings, and company-site evidence. The result is a signal, not a legal determination.',
  },
  {
    q: 'Which certifications do you check?',
    a: 'Depending on the product and available evidence, a report may surface ISO 22716, cosmetics GMP/CGMP, ISO 9001, MFDS-related manufacturing information, and vegan or cruelty-free claims. Confirm every claim with the supplier and issuing body.',
  },
  {
    q: 'Will the report include MOQ and pricing?',
    a: 'Only when publicly available or reasonably supported. Estimates are labeled as estimates. Unknown information is turned into an RFQ question rather than invented.',
  },
  {
    q: 'Can you guarantee US or EU compliance?',
    a: 'No. Regulatory suitability depends on the formula, claims, testing, labeling, responsible parties, and target market. Consult qualified regulatory professionals before sale.',
  },
  {
    q: 'What should I do after receiving a shortlist?',
    a: 'Contact at least three candidates, request company and certification documents, compare samples, verify legal and bank identities, confirm formula ownership and testing, and use a written manufacturing agreement.',
  },
];


const JSON_LD_ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GloSource AI',
  url: 'https://glosource-ai.vercel.app/en',
  description: 'Korea-only supplier intelligence for overseas K-Beauty buyers researching Korean OEM/ODM manufacturer candidates.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@glosource.ai',
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
      <JsonLdGloSource />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_ORGANIZATION) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_FAQ) }} />

      {/* ── NAV ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <BrandLogo compact />
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">KO</Link>
            <a href="#sample-reports" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Sample report</a>
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
              Get my shortlist →
            </ScrollCTA>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <HeroSection lang="en" />


      {/* ── PROBLEM ─────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#EA580C]">The sourcing gap</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#0D1B2A] sm:text-4xl">
              Finding a Korean factory is easy. Knowing who is worth contacting is not.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Supplier directories give you names. They do not clearly tell you who manufactures, which claims need evidence, whether the MOQ fits, or what to ask in the first email.
            </p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
            {PROBLEMS.map((item) => (
              <article key={item.number} className="bg-white p-6 sm:p-8">
                <p className="font-mono text-xs font-bold text-[#EA580C]">{item.number}</p>
                <h3 className="mt-3 text-lg font-black text-[#0D1B2A]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAMPLE REPORTS ─────────────────────────────────── */}
      <section id="sample-reports" className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#EA580C]">Free sample reports</p>
            <h2 className="mt-3 text-3xl font-black text-[#0D1B2A]">See the shortlist format before you pay</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Choose a K-Beauty category and request the report structure used to compare supplier candidates, evidence, unresolved risks, and RFQ questions.
            </p>
          </div>
          <SampleReportLeadForm />
        </div>
      </section>

      {/* ── SOURCING TOOL ──────────────────────────────────── */}
      <section id="sourcing-tool" className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Build your first shortlist</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-2">Get my Korean supplier shortlist</h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Describe the K-Beauty product you want to make. Review Korean supplier candidates with source links, unverified certification signals, MOQ context, and an English RFQ draft.
            </p>
          </div>
          <KSourceWrapper initialProduct={initialProduct} plan={plan} freeSearchLimit={freeSearchLimit} />
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">From product idea to a usable Korean supplier shortlist</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              The output is a first-pass research shortcut, not a supplier guarantee, audit, or sourcing-agent service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(item => (
              <article key={item.number} className="border-t-2 border-[#0D1B2A] pt-5">
                <p className="text-4xl font-black text-orange-100">{item.number}</p>
                <h3 className="mt-3 font-black text-[#0D1B2A]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>


      {/* ── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="bg-white border-b border-slate-200">
        <PricingViewTracker />
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">Start with evidence. Upgrade for an active sourcing project.</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Start with a free sample report. Paid plans support repeated Korean OEM/ODM shortlist research for real product launches.
            </p>
            <p className="mt-2 text-xs text-slate-400">For international buyers · Priced in USD · Korean-market plans available at <Link href="/" className="underline text-[#0D1B2A] hover:text-slate-700">glosource-ai.vercel.app</Link></p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 max-w-lg mx-auto text-left">
              <strong className="text-slate-700">Research tool disclaimer:</strong> GloSource AI provides AI-generated supplier research only. We do not verify suppliers, guarantee product quality, or handle transactions. Trust scores are AI-estimated signals — always conduct independent due diligence before signing any contract.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
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
                  checkoutUrl={process.env[plan.envKey] ?? 'mailto:hello@glosource.ai?subject=GloSource%20AI%20Plan%20Access'}
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
            <a href="mailto:hello@glosource.ai" className="underline hover:text-slate-400">hello@glosource.ai</a>
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
