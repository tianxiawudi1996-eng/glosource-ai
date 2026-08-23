import type { Metadata } from 'next';
import HeroSection from '@/app/components/HeroSection';
import KoreaJourneySection from '@/app/components/KoreaJourneySection';
import BrandLogo from '@/app/components/BrandLogo';
import JsonLdGloSource from '@/app/components/JsonLdGloSource';
import HaeryeText from './HaeryeText';
import KSourceWrapper from './KSourceWrapper';
import ScrollCTA from './ScrollCTA';
import YetGlyph from './YetHangul';
import CategoryTileMedia from './CategoryTileMedia';
import { GiwaEaves, SaekdongBand, DancheongBand, SumaksaeRosette } from './KoreanOrnaments';
import PolarCheckoutButton from './PolarCheckoutButton';
import { PLANS as PLAN_FACTS, priceLabel, priceUnit, type PlanId } from '@/app/lib/plans';
import Link from 'next/link';
import { auth } from '@/auth';
import SampleReportLeadForm from './SampleReportLeadForm';
import PricingViewTracker from './PricingViewTracker';
import TrustCredibility from '@/app/components/TrustCredibility';
import { REFUND_POLICY } from '@/app/lib/refundPolicy';
import { FREE_SEARCH_LIMIT } from '@/app/lib/free-plan';

export const metadata: Metadata = {
  metadataBase: new URL('https://glosourceai.com'),
  title: 'GloSource AI — Find Korean Manufacturers and Exporters',
  description: 'Discover and compare Korean manufacturers and exporters across industries with company signals, certification evidence, MOQ context, source links, and English RFQ drafts.',
  keywords: [
    'Korean manufacturers',
    'Korean suppliers',
    'Korean exporters',
    'source products from Korea',
    'Korean supplier shortlist',
    'Korean OEM ODM',
    'Korean food manufacturers',
    'Korean cosmetics manufacturers',
    'Korean electronics suppliers',
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
    title: 'GloSource AI — Find Korean Manufacturers and Exporters',
    description: 'Build a focused Korean supplier shortlist with source evidence, company signals, MOQ context, and an English RFQ draft.',
    url: 'https://glosourceai.com/en',
    siteName: 'GloSource AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/en/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'GloSource AI Korean supplier intelligence workspace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GloSource AI — Find Korean Manufacturers and Exporters',
    description: 'Shortlist Korean supplier candidates with source evidence, company signals, MOQ context, and an English RFQ.',
    images: ['/en/opengraph-image'],
    creator: '@glosourceai',
  },
  alternates: {
    canonical: 'https://glosourceai.com/en',
    languages: {
      'en-US': 'https://glosourceai.com/en',
      'ko-KR': 'https://glosourceai.com/',
      'x-default': 'https://glosourceai.com/en',
    },
  },
};

// Price, quota and checkout key come from app/lib/plans.ts; only the pitch copy
// is local to the landing page.
const PLAN_COPY: Record<PlanId, { tag: string; features: string[]; cta?: string }> = {
  starter: {
    tag: 'For one active product',
    features: [
      '3–5 Korean supplier candidates per search',
      'Manufacturer-vs-trader and risk signals',
      'Certification evidence and MOQ notes',
      'English RFQ draft ready to review',
      'Source links for independent verification',
    ],
  },
  pro: {
    tag: 'Best for multiple launches',
    features: [
      'Everything in Starter',
      'Compare multiple product briefs side by side',
      'Full PDF sourcing report',
      'Buyer checklist and follow-up email draft',
      'Priority support',
    ],
  },
  enterprise: {
    tag: 'High-volume sourcing',
    features: [
      'Everything in Pro',
      'Saved projects & comparison',
      'CSV / PDF export',
      'Team workflow by request',
    ],
  },
  contact: {
    tag: 'Custom & API',
    features: [
      'Everything in Business',
      'Dedicated onboarding',
      'Team seats & SSO by request',
      'API access by request',
      'Priority SLA support',
    ],
    cta: 'Contact sales →',
  },
};

const PLANS = PLAN_FACTS.map(plan => ({
  ...plan,
  price: priceLabel(plan),
  unit: priceUnit(plan),
  per: plan.searchesPerMonth === null
    ? 'Unlimited volume · team · API'
    : `${plan.searchesPerMonth} shortlist searches / month`,
  ...PLAN_COPY[plan.id],
}));


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
  url: 'https://glosourceai.com/en',
  description: 'AI-powered Korean supplier intelligence for international buyers researching manufacturers and exporters across industries.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@glosourceai.com',
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
  const freeSearchLimit = FREE_SEARCH_LIMIT;

  // overflow-x-clip, not -hidden: -hidden computes overflow-y to auto, which would make
  // this a scroll container and silently break every view() timeline inside.
  return (
    <div className="min-h-screen bg-white overflow-x-clip">
      <SaekdongBand />
      <JsonLdGloSource />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_ORGANIZATION) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_FAQ) }} />

      {/* ── NAV ────────────────────────────────────────────── */}
      <nav className="gs-en-nav sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10" data-style-dna="atelier-dancheong">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <BrandLogo compact />
          <div className="flex items-center gap-3">
            <Link href="/en/assistant" className="hidden sm:block text-xs font-bold text-orange-300 hover:text-orange-200 transition-colors">AI Assistant</Link>
            <a href="#sample-reports" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Sample report</a>
            <a href="#pricing" className="hidden sm:block text-xs font-semibold text-slate-300 hover:text-white transition-colors">Pricing</a>
            <Link href="/en/blog" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Blog</Link>
            <Link href="/en/case-studies" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden md:block">Examples</Link>
            <Link href="/en/about" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden md:block">About</Link>
            <span className="hidden sm:block"><TrustCredibility lang="en" tone="dark" /></span>
            {isLoggedIn ? (
              <>
                <Link href="/en/dashboard" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">
                  Dashboard
                </Link>
                <Link href="/en/account" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link href="/en/login" className="whitespace-nowrap text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link href="/en/register" className="whitespace-nowrap text-xs font-bold border border-white/30 text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  Sign up free
                </Link>
              </>
            )}
            <ScrollCTA targetId="sourcing-tool" className="whitespace-nowrap text-xs font-bold bg-[#EA580C] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#DC4C00] transition-colors">
              Get my shortlist →
            </ScrollCTA>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <HeroSection lang="en" />

      {/* ── GOVERNMENT REGISTRY CROSS-CHECK ────────────────── */}
      {/* overflow-clip, not -hidden: -hidden would make this section a scroll container
          and freeze the view() timelines of the cards inside it. */}
      <section className="relative overflow-clip border-b border-slate-200 bg-[#0A1520] bg-lattice-dark text-white">
        <div aria-hidden="true" className="gs-hangul-watermark right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 text-white/[0.05]">
          <YetGlyph char="geom" className="h-52 w-52" />
          <YetGlyph char="jeung" className="h-52 w-52" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-20">
          <div className="gs-reveal max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">Evidence, not promises · <HaeryeText className="tracking-normal">증거</HaeryeText></p>
            <h2 className="font-display mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Identifiable Korean candidates are <em className="text-emerald-300">cross-checked</em> against applicable government registries.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              When a candidate&apos;s registered Korean company name matches official records, the evidence is pinned to its card — so you start due diligence from government data, not marketing claims.
            </p>
          </div>
          <div className="gs-stagger mt-10 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">MFDS · <HaeryeText>식약처</HaeryeText></p>
              <h3 className="mt-3 text-base font-black text-white">Manufacturer of record</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Cosmetics, quasi-drug, health-food, and medical-device registries reveal whether a company actually manufactures — or only distributes.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">HACCP · CGMP</p>
              <h3 className="mt-3 text-base font-black text-white">Certification on record</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Food-safety and cosmetics-GMP certification records are matched from official data — separated from self-reported claims.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">NTS · <HaeryeText>국세청</HaeryeText></p>
              <h3 className="mt-3 text-base font-black text-white">Alive right now</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                A live National Tax Service lookup confirms the business registration is active today — the fastest way to screen out ghost companies.
              </p>
            </article>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-slate-400">
            Registry matches are surfaced automatically when records align, and shown as evidence for your own verification — never as a guarantee or endorsement. Not every company appears in a registry; fashion and general goods have no equivalent public registry.
          </p>
        </div>
      </section>

      {/* ── CATEGORIES — jogakbo patchwork grid ────────────── */}
      <section className="bg-hanji border-b border-slate-200">
        {/* 기와 처마 — the registry section's dark roof overhangs the hanji courtyard */}
        <div className="text-[#0A1520]"><GiwaEaves className="h-7" /></div>
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="gs-reveal max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8F3A26]">What Korea makes best · <HaeryeText className="tracking-normal">한국의 제조</HaeryeText></p>
            <h2 className="font-display mt-3 text-3xl font-black leading-tight text-[#0D1B2A] sm:text-4xl">
              Source the categories the world already trusts Korea for.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Each category is matched against the registries that govern it — so a K-Beauty candidate is checked as a cosmetics manufacturer, and a K-Food candidate as a certified food maker.
            </p>
          </div>
          <div className="gs-reveal mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { glyph: 'hwa', img: 'hwa', tint: '#8F3A26', en: 'K-Beauty', note: 'MFDS cosmetics registry · CGMP', accent: 'border-[#8F3A26]/30 hover:border-[#8F3A26]', chip: 'text-[#8F3A26] bg-[#8F3A26]/5', span: 'row-span-2', big: true },
              { glyph: 'sik', img: 'sik', tint: '#B45309', en: 'K-Food', note: 'HACCP-certified manufacturers', accent: 'border-amber-500/30 hover:border-amber-600', chip: 'text-amber-700 bg-amber-500/10' },
              { glyph: 'pae', img: 'pae', tint: '#1D4ED8', en: 'K-Fashion', note: 'Manually curated candidates', accent: 'border-blue-700/25 hover:border-blue-700', chip: 'text-blue-800 bg-blue-700/5' },
              { glyph: 'ui', img: 'ui', tint: '#475569', en: 'Medical devices', note: 'MFDS device licences', accent: 'border-slate-400/40 hover:border-slate-500', chip: 'text-slate-600 bg-slate-500/10' },
              { glyph: 'geon', img: 'geon', tint: '#047857', en: 'Health foods', note: 'MFDS functional-food registry', accent: 'border-emerald-600/30 hover:border-emerald-600', chip: 'text-emerald-700 bg-emerald-600/10' },
              { glyph: 'uiyakoepum', img: 'uiyakoepum', tint: '#0D1B2A', en: 'Quasi-drugs', ko: '의약외품', note: 'MFDS quasi-drug permits', accent: 'border-[#0D1B2A]/30 hover:border-[#0D1B2A]', chip: 'text-[#0D1B2A] bg-[#0D1B2A]/5' },
              { glyph: null, en: 'Every other category', note: 'Live NTS business-status check', accent: 'border-dashed border-slate-300 hover:border-[#EA580C]', chip: 'text-[#EA580C] bg-[#EA580C]/5' },
            ].map(cat => (
              // overflow-clip, not -hidden: -hidden would make the tile a scroll container
              // and freeze the stroke-order timeline of the glyph inside it.
              // gs-tile owns the hover lift/shadow + border-color transition.
              <ScrollCTA key={cat.en} targetId="sourcing-tool"
                className={`gs-tile group relative overflow-clip flex flex-col justify-between rounded-2xl border-2 bg-white/70 p-5 text-left ${cat.accent} ${cat.span ?? ''}`}>
                {/* product-category imagery — low-opacity duotone atmosphere, sits under everything */}
                {'img' in cat && cat.img && <CategoryTileMedia name={cat.img} tint={cat.tint as string} />}
                {/* faint oversized glyph fills the tile like a paper watermark */}
                {cat.glyph && cat.glyph !== 'uiyakoepum' && (
                  <YetGlyph char={cat.glyph as 'hwa'} className={`pointer-events-none absolute -bottom-8 -right-6 ${cat.big ? 'h-64 w-64' : 'h-32 w-32'} opacity-[0.05] ${cat.chip.split(' ')[0]}`} />
                )}
                {cat.glyph === 'uiyakoepum' ? (
                  <span aria-hidden="true" className={`relative z-10 grid w-fit grid-cols-2 gap-1 ${cat.chip.split(' ')[0]}`}>
                    <YetGlyph char="ui" className="gs-glyph-draw h-7 w-7" />
                    <YetGlyph char="yak" className="gs-glyph-draw h-7 w-7" />
                    <YetGlyph char="oe" className="gs-glyph-draw h-7 w-7" />
                    <YetGlyph char="pum" className="gs-glyph-draw h-7 w-7" />
                  </span>
                ) : cat.glyph ? (
                  <YetGlyph char={cat.glyph as 'hwa'} className={`gs-glyph-draw relative z-10 ${cat.big ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-14 w-14'} ${cat.chip.split(' ')[0]}`} />
                ) : (
                  <span aria-hidden="true" className={`relative z-10 text-4xl font-black leading-none ${cat.chip.split(' ')[0]}`}>+</span>
                )}
                <span className="relative z-10 mt-6 block">
                  <span className="block text-sm font-black text-[#0D1B2A]">
                    {cat.en}{'ko' in cat && cat.ko ? <> (<HaeryeText>{cat.ko}</HaeryeText>)</> : null}
                  </span>
                  <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${cat.chip}`}>{cat.note}</span>
                  <span className="mt-2 block text-[11px] font-semibold text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">Search this category →</span>
                </span>
              </ScrollCTA>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            Tile marks are drawn in the letterforms of the 1446 Hunminjeongeum Haerye edition — <HaeryeText>화</HaeryeText> cosmetics · <HaeryeText>식</HaeryeText> food · <HaeryeText>패</HaeryeText> fashion · <HaeryeText>의</HaeryeText> medical · <HaeryeText>건</HaeryeText> health · <HaeryeText>의약외품</HaeryeText> quasi-drugs.
          </p>
        </div>
      </section>

      {/* ── KOREA VISUAL JOURNEY — after product proof ────── */}
      <KoreaJourneySection lang="en" />

      {/* ── PROBLEM ─────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="gs-reveal max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8F3A26]">The sourcing gap · <HaeryeText className="tracking-normal">간극</HaeryeText></p>
            <h2 className="font-display mt-3 text-3xl font-black leading-tight text-[#0D1B2A] sm:text-4xl">
              Finding a Korean factory is easy. Knowing who is worth contacting is not.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Supplier directories give you names. They do not clearly tell you who manufactures, which claims need evidence, whether the MOQ fits, or what to ask in the first email.
            </p>
          </div>
          {/* Revealed as one block: overflow-hidden makes this grid a scroll container,
              so a per-card view() timeline would resolve against it and never advance. */}
          <div className="gs-reveal mt-10 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
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
      <section id="sample-reports" className="scroll-mt-16 border-b border-slate-200 bg-hanji">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="gs-reveal mb-10 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8F3A26]">Free sample reports · <HaeryeText className="tracking-normal">견본</HaeryeText></p>
            <h2 className="font-display mt-3 text-3xl font-black text-[#0D1B2A]">See the shortlist format before you pay</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Choose a K-Beauty category and request the report structure used to compare supplier candidates, evidence, unresolved risks, and RFQ questions.
            </p>
          </div>
          <SampleReportLeadForm />
        </div>
      </section>

      {/* ── SOURCING TOOL ──────────────────────────────────── */}
      <section id="sourcing-tool" className="scroll-mt-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="gs-reveal mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8F3A26] mb-3">Build your first shortlist · <HaeryeText className="tracking-normal">검색</HaeryeText></p>
            <h2 className="font-display text-3xl font-black text-[#0D1B2A] mb-2">Get my Korean supplier shortlist</h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Describe the product you want to source from Korea. Review supplier candidates with source links, company and certification signals, MOQ context, and an English RFQ draft.
            </p>
          </div>
          <KSourceWrapper initialProduct={initialProduct} plan={plan} freeSearchLimit={freeSearchLimit} authenticated={isLoggedIn} />
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="gs-reveal mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8F3A26] mb-3">How it works · <HaeryeText className="tracking-normal">절차</HaeryeText></p>
            <h2 className="font-display text-3xl font-black text-[#0D1B2A] mb-3">From product idea to a usable Korean supplier shortlist</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              The output is a first-pass research shortcut, not a supplier guarantee, audit, or sourcing-agent service.
            </p>
          </div>
          <div className="gs-stagger grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(item => (
              <article key={item.number} className="border-t-2 border-[#0D1B2A] pt-6">
                {/* 연꽃 수막새 medallion carries the step number */}
                <SumaksaeRosette label={item.number} className="h-14 w-14 text-[#EA580C]" />
                <h3 className="mt-4 font-black text-[#0D1B2A]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>


      {/* ── PRICING ────────────────────────────────────────── */}
      <DancheongBand />
      <section id="pricing" className="scroll-mt-16 bg-white border-b border-slate-200">
        <PricingViewTracker />
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="gs-reveal mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8F3A26] mb-3">Pricing · <HaeryeText className="tracking-normal">요금</HaeryeText></p>
            <h2 className="font-display text-3xl font-black text-[#0D1B2A] mb-3">Start with evidence. Upgrade for an active sourcing project.</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Start with a free search preview. Paid plans support repeated Korean supplier research and export-ready outputs for active sourcing projects.
            </p>
            <p className="mt-2 text-xs text-slate-400">For international buyers · Priced in USD · Source directly from Korean manufacturers</p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 max-w-lg mx-auto text-left">
              <strong className="text-slate-700">Research tool disclaimer:</strong> GloSource AI provides AI-generated supplier research and registry-match evidence only. We do not audit or endorse suppliers, guarantee product quality, or handle transactions. Trust scores are AI-estimated signals — always conduct independent due diligence before signing any contract.
            </div>
          </div>

          {/* Block-level reveal: the highlighted plan carries lg:-translate-y-2, which a
              per-card fill-mode:both animation would flatten. */}
          <div className="gs-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {PLANS.map(plan => (
              <div key={plan.id}
                className={`rounded-2xl border p-6 flex flex-col relative transition-all duration-200 ${plan.highlight ? 'bg-[#0D1B2A] border-[#0D1B2A] shadow-xl shadow-slate-900/15 lg:-translate-y-2' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
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
                  <p className="text-xs text-slate-400">{plan.per}</p>
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
                  checkoutUrl={process.env[plan.envKey] ?? `mailto:hello@glosourceai.com?subject=${encodeURIComponent(`GloSource AI ${plan.name} plan inquiry`)}`}
                  label={plan.cta ?? `Get ${plan.name} →`}
                  planId={plan.id}
                  onDark={plan.highlight}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 max-w-lg mx-auto text-center">
            <strong className="text-slate-700">Free tier:</strong> 3 searches/month · search preview only · paid plans unlock full supplier details, source URLs, RFQ drafts, and exports
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            Secure checkout via Polar ·{' '}
            <Link href={REFUND_POLICY.termsPath} className="underline hover:text-slate-300">Refund policy (Terms §3.4)</Link>
            {' '}· No Korean entity required
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="bg-hanji border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="gs-reveal mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8F3A26] mb-3">FAQ · <HaeryeText className="tracking-normal">문답</HaeryeText></p>
            <h2 className="font-display text-3xl font-black text-[#0D1B2A]">Frequently asked questions</h2>
          </div>
          <div className="gs-stagger space-y-3">
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
          <div className="text-center">
            <p className="text-xs text-slate-300">
              GloSource AI is a sourcing research tool, not a trade agent. Contact:{' '}
              <a href="mailto:hello@glosourceai.com" className="underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]">hello@glosourceai.com</a>
            </p>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Built in Korea on Korean government open data · <HaeryeText className="text-slate-400">나라의 공공데이터로 낱낱이 검증하니라</HaeryeText>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <Link href="/en/about" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]">About</Link>
            <Link href="/en/case-studies" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]">Examples</Link>
            <Link href="/en/blog" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]">Blog</Link>
            <Link href="/terms" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]">Privacy</Link>
            <Link href="/" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]">Korean version →</Link>
            <a href="https://twitter.com/glosourceai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]" aria-label="Twitter/X">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
