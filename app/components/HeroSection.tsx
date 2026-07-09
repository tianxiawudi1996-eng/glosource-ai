'use client';

import { trackShortlistCta } from '@/app/lib/analytics';
import HaeryeText from '@/app/en/HaeryeText';
import YetGlyph from '@/app/en/YetHangul';
import { DancheongBand, GiwaEaves, SumaksaeRosette } from '@/app/en/KoreanOrnaments';

interface HeroSectionProps {
  lang?: 'ko' | 'en';
}

const copy = {
  ko: {
    badge: 'GloSource AI · 중국 현지 채널까지 탐색',
    h1: 'GloSource AI',
    h1sub: '공급자 후보 AI 매칭',
    desc: '1688 · Baidu 爱采购 · Alibaba · WeChat 후보를 비교하고, 발주 전 공급자 리스크와 RFQ 질문 리스트를 정리합니다.',
    cta1: '무료 5회 체험 시작 →',
    cta2: '요금제 보기',
    note: 'GloSource AI는 납품 대행사가 아닙니다. 공급자 후보 발굴, 비교 분석, RFQ 준비까지 지원합니다.',
    features: ['공장 후보 3~5개 자동 탐색', '사업자·리스크 신뢰도 분석', 'RFQ 이메일 자동 생성', '예상 원가·MOQ 비교 리포트'],
    stats: [
      { num: '3~5개', label: '공급자 자동 탐색' },
      { num: '~90초', label: '평균 분석 소요 시간' },
      { num: '0~100', label: '공급자 리스크 점수' },
      { num: '3단계', label: '검색·검증·RFQ 매칭' },
    ],
    mockQuery: '스테인리스 볼밸브 DN50',
    mockDone: 'AI 분석 완료 · 58초',
    mockRfq: 'RFQ 초안 생성됨',
    aiSignalNote: 'AI 신호 · 검증된 인증 아님',
    supplier1: { name: '공급사 A (샘플 데이터)', platform: '1688.com', score: 87, moq: 'MOQ 500개 · ¥12.8/개', lead: '납기 7일 · HS 8481.80' },
    supplier2: { name: '공급사 B (샘플 데이터)', platform: 'Alibaba', score: 74, moq: 'MOQ 200개 · ¥15.2/개', lead: '납기 14일 · 한국 수출 ✓' },
  },
  en: {
    badge: 'Cross-checked against Korean government registries',
    h1: 'Find the Right Korean Suppliers',
    h1sub: 'Without Weeks of Manual Research',
    desc: 'Get a focused shortlist of Korean manufacturers with government-registry evidence, MOQ context, source links, and a ready-to-send English RFQ.',
    cta1: 'Get My Korean Supplier Shortlist →',
    cta2: 'See a Free Sample Report',
    note: 'Research support only — registry matches are evidence for your own due diligence, never a guarantee.',
    features: ['Manufacturer vs. trader signals', 'Certification evidence to verify', 'MOQ and risk notes', 'Product-specific English RFQ'],
    stats: [
      { num: '5+1', label: 'Gov registries + live tax-office check' },
      { num: '3–5', label: 'Candidates per shortlist' },
      { num: '~1 min', label: 'From brief to shortlist' },
      { num: '1 RFQ', label: 'Ready to review and send' },
    ],
    mockQuery: 'Korean collagen serum OEM · 5,000 units',
    mockDone: 'Analysis complete · 54s',
    mockRfq: 'English RFQ draft ready',
    aiSignalNote: 'AI signal · not a verified certification',
    supplier1: { name: 'Supplier A (sample data)', platform: 'BuyKorea', score: 91, moq: 'MOQ 2,000 pcs · quote required', lead: 'Lead time: 21 days · ISO 9001 signal' },
    supplier2: { name: 'Supplier B (sample data)', platform: 'EC21', score: 83, moq: 'MOQ 1,000 pcs · quote required', lead: 'Lead time: 28 days · Export history' },
  },
};

const HUNMIN_WATERMARK_GLYPHS = [
  'ㅎ', 'ㆍ', 'ㄴ', 'ㅁ', 'ㅈ', 'ㆁ', 'ㅗ', 'ㅣ',
  'ㄱ', 'ㅡ', 'ㅅ', 'ㅓ', 'ㅂ', 'ㅏ', 'ㅇ', 'ㄷ',
] as const;

function HunminjeongeumWatermark() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="gs-hunmin-grid absolute -left-12 top-20 hidden w-[520px] rotate-[-8deg] grid-cols-4 gap-5 text-white/[0.055] sm:grid">
        {HUNMIN_WATERMARK_GLYPHS.map((glyph, index) => (
          <span
            key={`${glyph}-${index}`}
            className="font-krold flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.045] text-5xl font-black"
          >
            {glyph}
          </span>
        ))}
      </div>
      <div className="gs-hunmin-scroll absolute bottom-10 right-4 hidden max-w-[420px] rotate-[-3deg] text-right text-[12px] font-bold leading-8 text-amber-100/[0.12] lg:block">
        <HaeryeText>나랏말싸미 듕귁에 달아 문자와로 서로 사맛디 아니할쎄</HaeryeText>
      </div>
      <div className="absolute -right-24 top-24 hidden h-[340px] w-[340px] text-amber-100/[0.045] lg:block">
        <YetGlyph char="geom" className="absolute left-0 top-0 h-40 w-40" />
        <YetGlyph char="jeung" className="absolute bottom-0 right-0 h-44 w-44" />
        <YetGlyph char="hwa" className="absolute left-24 top-24 h-32 w-32 text-[#C93A2B]/20" />
      </div>
    </div>
  );
}

function HanokHeroCanopy() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 text-[#050B12]">
      <svg viewBox="0 0 1440 128" preserveAspectRatio="none" className="block h-24 w-full sm:h-28">
        <path
          d="M0 0H1440V36C1216 28 1051 38 884 60C681 87 443 116 0 72V0Z"
          fill="currentColor"
          opacity={0.86}
        />
        <path
          d="M0 60C238 92 467 91 695 66C925 40 1136 16 1440 36"
          fill="none"
          stroke="#B89A4A"
          strokeWidth={2}
          opacity={0.75}
        />
        <path
          d="M0 72C262 111 523 104 765 72C986 43 1189 31 1440 58"
          fill="none"
          stroke="#8F3A26"
          strokeWidth={1.4}
          opacity={0.55}
        />
      </svg>
      <GiwaEaves className="-mt-1 h-7 opacity-95" />
    </div>
  );
}

function DancheongFrame() {
  return (
    <>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-[1] opacity-95">
        <DancheongBand className="border-b border-[#B89A4A]/30" />
      </div>
      <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 z-[1] opacity-90">
        <DancheongBand className="border-t border-[#B89A4A]/30" />
      </div>
      <div aria-hidden="true" className="gs-dancheong-side absolute bottom-5 left-0 top-5 z-[1] hidden w-5 opacity-80 md:block" />
      <div aria-hidden="true" className="gs-dancheong-side absolute bottom-5 right-0 top-5 z-[1] hidden w-5 opacity-80 md:block" />
    </>
  );
}

/* EN hero visual: a live-feeling product mock that shows the actual differentiator —
   a supplier card earning government-registry verification in sequence. Sample data,
   labeled as such; emerald is reserved for government evidence across the site. */
function EnVerificationMockPanel() {
  return (
    <div className="relative flex items-stretch gap-4">
      {/* Vertical Hangul caption — traditional editorial accent */}
      <p aria-hidden="true" className="hidden xl:block self-center text-[11px] font-bold text-slate-500/80 shrink-0">
        <HaeryeText vertical>나라의 공적 기록으로 검증하니라</HaeryeText>
      </p>

      <div className="gs-fade-up gs-delay-3 relative flex-1 rounded-2xl border border-[#B89A4A]/25 bg-[#060F1A] shadow-2xl shadow-black/50 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#8F3A26,#B9782E,#B89A4A,#2F604B,#244B63)]" />
      {/* Dojang seal — stamps after the registry checks complete */}
      <span aria-hidden="true" className="gs-seal gs-seal-stamp absolute top-[178px] right-4 z-10 h-14 w-14 text-[13px] bg-[#060F1A]/40 backdrop-blur-[1px]">
        <HaeryeText>검증</HaeryeText><br /><HaeryeText>완료</HaeryeText>
      </span>
      <SumaksaeRosette label="공" className="absolute -right-7 -top-7 h-24 w-24 text-[#B89A4A]/30" />
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-2 text-[11px] font-bold text-slate-400">GloSource AI — Sample preview</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          live registry check
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* query bar */}
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs font-mono text-slate-200 truncate">Korean collagen serum OEM · 5,000 units</span>
        </div>

        {/* supplier card with gov verification */}
        <div className="rounded-xl border border-emerald-500/25 bg-white/5 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-black bg-[#EA580C] text-white rounded-md px-1.5 py-0.5 shrink-0">#1</span>
              <span className="text-xs font-bold text-white truncate">Cosmetics ODM Co. (sample data)</span>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-black text-emerald-300">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Gov-Verified
            </span>
          </div>

          {/* sequential registry checks — the memorable moment */}
          <ul className="space-y-1.5">
            <li className="gs-check-pop gs-check-1 flex items-center gap-2 text-[11px] text-emerald-200">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 shrink-0">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
              MFDS-registered cosmetics manufacturer
            </li>
            <li className="gs-check-pop gs-check-2 flex items-center gap-2 text-[11px] text-emerald-200">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 shrink-0">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
              CGMP certification on record
            </li>
            <li className="gs-check-pop gs-check-3 flex items-center gap-2 text-[11px] text-emerald-200">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 shrink-0">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
              Active business — live Korea NTS status
            </li>
          </ul>

          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <p className="text-[10px] text-slate-400">MOQ 3,000 pcs · quote required</p>
            <p className="text-[10px] text-slate-500">Lead time: 21 days</p>
          </div>
        </div>

        {/* second candidate, collapsed */}
        <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-black bg-slate-600 text-white rounded-md px-1.5 py-0.5 shrink-0">#2</span>
            <span className="text-xs font-bold text-slate-200 truncate">OEM Candidate B (sample data)</span>
          </div>
          <span className="shrink-0 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-300">EC21</span>
        </div>

        {/* RFQ pill */}
        <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2">
          <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-[11px] font-semibold text-blue-300">English RFQ draft ready</span>
        </div>

        <p className="text-[9px] text-slate-500">Sample output. Registry matches are evidence to verify, not a guarantee.</p>
      </div>
      </div>
    </div>
  );
}

function TrustBar({ score, aiSignalNote }: { score: number; aiSignalNote?: string }) {
  const color = score >= 80 ? 'bg-emerald-400' : score >= 65 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-20 rounded-full bg-white/10 overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-[10px] font-bold text-slate-200">{score}/100</span>
      </div>
      {aiSignalNote && (
        <p className="text-[9px] text-amber-400/80 mt-0.5">{aiSignalNote}</p>
      )}
    </div>
  );
}

function MockPreviewPanel({ c }: { c: typeof copy.ko }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#060F1A] shadow-2xl shadow-black/50 overflow-hidden">
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-2 text-[11px] font-bold text-slate-400">GloSource AI — Sample Preview</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          live
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* query bar */}
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs font-mono text-slate-200 truncate">{c.mockQuery}</span>
        </div>

        {/* status */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {c.mockDone}
        </div>

        {/* supplier 1 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-[#EA580C] text-white rounded-md px-1.5 py-0.5">#1</span>
              <span className="text-xs font-bold text-white truncate max-w-[140px]">{c.supplier1.name}</span>
            </div>
            <span className="shrink-0 rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-300">{c.supplier1.platform}</span>
          </div>
          <TrustBar score={c.supplier1.score} aiSignalNote={c.aiSignalNote} />
          <p className="text-[10px] text-slate-400">{c.supplier1.moq}</p>
          <p className="text-[10px] text-slate-500">{c.supplier1.lead}</p>
        </div>

        {/* supplier 2 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-slate-600 text-white rounded-md px-1.5 py-0.5">#2</span>
              <span className="text-xs font-bold text-white truncate max-w-[140px]">{c.supplier2.name}</span>
            </div>
            <span className="shrink-0 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">{c.supplier2.platform}</span>
          </div>
          <TrustBar score={c.supplier2.score} aiSignalNote={c.aiSignalNote} />
          <p className="text-[10px] text-slate-400">{c.supplier2.moq}</p>
          <p className="text-[10px] text-slate-500">{c.supplier2.lead}</p>
        </div>

        {/* RFQ pill */}
        <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2">
          <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-[11px] font-semibold text-blue-300">{c.mockRfq}</span>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection({ lang = 'ko' }: HeroSectionProps) {
  const c = copy[lang];

  const handleScrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-[#0D1B2A] text-white">
      {lang === 'en' && (
        <>
          <DancheongFrame />
          <HanokHeroCanopy />
          <HunminjeongeumWatermark />
        </>
      )}
      {/* dot-grid background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      {lang === 'en' && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 620px 360px at 18% 18%, rgba(143,58,38,0.16), transparent 62%), radial-gradient(ellipse 520px 420px at 84% 72%, rgba(184,154,74,0.13), transparent 68%), linear-gradient(120deg, rgba(47,96,75,0.08), transparent 36%, rgba(36,75,99,0.09))',
          }}
        />
      )}
      {/* right glow */}
      <div className="absolute -right-32 top-0 h-full w-[600px] rounded-full bg-[#EA580C]/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-center">

          {/* LEFT — copy */}
          <div>
            {lang === 'en' && (
              <div className="gs-fade-up mb-5 flex items-center gap-3 text-[#B89A4A]">
                <span className="h-px w-12 bg-current" />
                <HaeryeText className="text-xs font-bold tracking-[0.28em] text-amber-100/80">훈민정음 해례본의 결</HaeryeText>
              </div>
            )}
            <div className="gs-fade-up mb-4 inline-flex items-center gap-2 border border-emerald-400/25 bg-emerald-500/10 rounded-full px-3 py-1 text-xs font-semibold text-emerald-100 backdrop-blur">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {c.badge}
            </div>

            <h1 className={`gs-fade-up gs-delay-1 mb-5 text-[2.6rem] leading-[1.02] tracking-tight text-white sm:text-5xl md:text-6xl ${lang === 'en' ? 'font-display font-black' : 'font-black leading-[0.96]'}`}>
              {c.h1}<br />
              <span className={`mt-3 inline-block rounded-lg bg-[#EA580C] px-3 py-1 text-[0.62em] text-white shadow-2xl shadow-orange-950/40 ${lang === 'en' ? 'font-sans font-black tracking-normal' : ''}`}>
                {c.h1sub}
              </span>
            </h1>

            <p className="gs-fade-up gs-delay-2 mb-8 max-w-xl text-lg font-semibold leading-relaxed text-slate-200 md:text-xl">
              {c.desc}
            </p>

            <div className="gs-fade-up gs-delay-3 flex flex-wrap items-center gap-3 mb-4">
              <a
                href="#sourcing-tool"
                onClick={(event) => {
                  trackShortlistCta('hero');
                  handleScrollTo('sourcing-tool')(event);
                }}
                className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#DC4C00] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-900/30"
              >
                {c.cta1}
              </a>
              <a
                href="#sample-reports"
                onClick={handleScrollTo('sample-reports')}
                className="inline-flex items-center border border-white/30 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition-all backdrop-blur"
              >
                {c.cta2}
              </a>
            </div>

            <p className="gs-fade-up gs-delay-3 mb-10 max-w-xl text-xs leading-relaxed text-slate-400">
              {c.note}
            </p>

            {lang === 'ko' && (
              <div className="flex flex-wrap gap-2 mb-10">
                {c.features.map(f => (
                  <span key={f} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 backdrop-blur">
                    <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </span>
                ))}
              </div>
            )}

            <div className="gs-fade-up gs-delay-4 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/10 pt-8">
              {c.stats.map(s => (
                <div key={s.num}>
                  <p className="text-2xl font-black text-white">{s.num}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — hero visual */}
          <div className="block">
            {lang === 'en' ? (
              <EnVerificationMockPanel />
            ) : (
              <MockPreviewPanel c={c} />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
