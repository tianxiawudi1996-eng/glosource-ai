import HeroSection from '@/app/components/HeroSection';
import EnSourcingTool from '@/app/components/EnSourcingTool';
import ScrollCTA from './ScrollCTA';
import Link from 'next/link';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tag: 'For small buyers',
    price: '$9.9',
    unit: '/ mo',
    per: '30 analyses / month',
    features: [
      '3–5 supplier candidates per search',
      'Supplier risk & trust scoring',
      'Unit price & MOQ comparison',
      'Auto-generated RFQ email',
      'PDF report export',
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
      'Extended sourcing analysis',
      'Compliance & certification matching',
      'Priority support',
      'English & Chinese RFQ drafts',
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
    title: 'Enter your product',
    desc: 'Type a product name in English or Chinese. Optionally set order quantity, preferred region, and budget.',
  },
  {
    step: '02',
    title: 'AI scans 4 channels',
    desc: '1688 · Baidu Aicaigou · Alibaba · WeChat are searched simultaneously. Each supplier gets a risk score (0–100).',
  },
  {
    step: '03',
    title: 'Compare & contact',
    desc: 'Review the 3–5 shortlisted candidates side-by-side. Use the auto-generated RFQ draft to reach out immediately.',
  },
];

const FAQ = [
  {
    q: 'What languages does GloSource AI support?',
    a: 'You can enter queries in English, Korean, or Chinese. Results include the original Chinese supplier names with English/Korean summaries.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account needed for the first 5 free searches. After that, a subscription unlocks more monthly analyses.',
  },
  {
    q: 'Is GloSource AI an actual sourcing agent?',
    a: 'No. We are a research assistant — we surface, compare, and prepare. You contact suppliers and negotiate directly. We do not handle transactions, logistics, or payments.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We use Polar.sh as our payment processor, which accepts all major credit cards and handles VAT/tax compliance globally. No Korean business registration required on your end.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Subscriptions are month-to-month with no contracts. Cancel from your account dashboard at any time.',
  },
];

function PolarButton({ envKey, children }: { envKey: string; children: React.ReactNode }) {
  const link = process.env[envKey];
  if (!link) {
    return (
      <button
        disabled
        className="block w-full text-center py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-400 cursor-not-allowed"
        title="Payment coming soon — join waitlist"
      >
        Coming soon
      </button>
    );
  }
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all bg-[#EA580C] text-white hover:bg-[#DC4C00] shadow-lg shadow-orange-900/20"
    >
      {children}
    </a>
  );
}

const JSON_LD_ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GloSource AI',
  url: 'https://glosource-ai.vercel.app/en',
  description: 'AI-powered global sourcing assistant for international buyers. Find verified suppliers from China and Korea in 60 seconds.',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_ORGANIZATION) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_FAQ) }}
      />
      {/* nav */}
      <nav className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#EA580C] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">G</span>
            </div>
            <span className="font-black text-white text-sm">GloSource AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
              KO
            </Link>
            <a
              href="#pricing"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <ScrollCTA
              targetId="sourcing-tool"
              className="text-xs font-bold bg-[#EA580C] text-white px-4 py-2 rounded-lg hover:bg-[#DC4C00] transition-colors"
            >
              Try Free →
            </ScrollCTA>
          </div>
        </div>
      </nav>

      {/* hero */}
      <HeroSection lang="en" />

      {/* trust bar */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap shrink-0">Sourced from</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {['1688.com 诚信通', 'Baidu 爱采购', 'Alibaba.com', 'WeChat 公众号', 'Made-in-China'].map(name => (
                <span key={name} className="border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-50">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* sourcing tool */}
      <section id="sourcing-tool" className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Try it now</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-2">Find your next supplier</h2>
            <p className="text-sm text-slate-500">Search China &amp; Korea simultaneously. AI-powered in 60 seconds.</p>
          </div>
          <EnSourcingTool />
        </div>
      </section>

      {/* how it works */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-2xl font-black text-[#0D1B2A]">From product name to supplier shortlist in 60 seconds</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#0D1B2A] flex items-center justify-center mb-4">
                  <span className="font-black text-xs text-slate-400">{item.step}</span>
                </div>
                <h3 className="font-black text-[#0D1B2A] mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <ScrollCTA
              targetId="sourcing-tool"
              className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#DC4C00] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-900/30"
            >
              Try it now — 5 free searches →
            </ScrollCTA>
          </div>
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">Simple, transparent pricing</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              1 search = 3–5 supplier candidates + risk analysis + RFQ email. No contracts, cancel anytime.
            </p>
            {!polarReady && (
              <div className="mt-4 inline-flex items-center gap-2 border border-amber-200 bg-amber-50 rounded-full px-4 py-2 text-xs font-semibold text-amber-700">
                🚧 Payment integration launching soon — try it free in the meantime
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 flex flex-col relative ${plan.highlight ? 'bg-[#0D1B2A] border-[#0D1B2A]' : 'bg-white border-slate-200'}`}
              >
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
                <PolarButton envKey={plan.envKey}>
                  Get started
                </PolarButton>
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

      {/* faq */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-2xl font-black text-[#0D1B2A]">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map(item => (
              <div key={item.q} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="font-bold text-sm text-[#0D1B2A] mb-2">{item.q}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* bottom CTA */}
      <section className="bg-[#0D1B2A] text-white">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-black mb-4">Start sourcing smarter today</h2>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed">
            5 free searches, no credit card required. Get supplier candidates, risk scores, and RFQ drafts in under a minute.
          </p>
          <ScrollCTA
            targetId="sourcing-tool"
            className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#DC4C00] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-900/30 text-sm"
          >
            Start 5 free searches →
          </ScrollCTA>
          <p className="mt-4 text-xs text-slate-500">No signup required for free tier</p>
        </div>
      </section>

      {/* footer */}
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
