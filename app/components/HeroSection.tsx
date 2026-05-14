'use client';

interface HeroSectionProps {
  lang?: 'ko' | 'en';
}

const copy = {
  ko: {
    badge: 'GloSource AI · 중국 현지 채널까지 탐색',
    h1: 'GloSource AI',
    h1sub: '공급자 후보 60초 매칭',
    desc: '1688 · Baidu 爱采购 · Alibaba · WeChat 후보를 비교하고, 발주 전 공급자 리스크와 RFQ 질문 리스트를 정리합니다.',
    cta1: '무료 5회 체험 시작 →',
    cta2: '요금제 보기',
    note: 'GloSource AI는 납품 대행사가 아닙니다. 공급자 후보 발굴, 비교 분석, RFQ 준비까지 지원합니다.',
    features: ['공장 후보 3~5개 자동 탐색', '사업자·리스크 신뢰도 분석', 'RFQ 이메일 자동 생성', '예상 원가·MOQ 비교 리포트'],
    stats: [
      { num: '3~5개', label: '공급자 자동 탐색' },
      { num: '60초', label: '평균 분석 소요 시간' },
      { num: '0~100', label: '공급자 리스크 점수' },
      { num: '3단계', label: '검색·검증·RFQ 매칭' },
    ],
    mockQuery: '스테인리스 볼밸브 DN50',
    mockDone: 'AI 분석 완료 · 58초',
    mockRfq: 'RFQ 초안 생성됨',
    supplier1: { name: '上海机械制造有限公司', platform: '1688.com', score: 87, moq: 'MOQ 500개 · ¥12.8/개', lead: '납기 7일 · HS 8481.80' },
    supplier2: { name: 'Hangzhou Trade Co., Ltd', platform: 'Alibaba', score: 74, moq: 'MOQ 200개 · ¥15.2/개', lead: '납기 14일 · 한국 수출 ✓' },
  },
  en: {
    badge: 'GloSource AI · Deep into Chinese domestic channels',
    h1: 'GloSource AI',
    h1sub: 'Match Suppliers in 60s',
    desc: 'Compare 1688 · Baidu Aicaigou · Alibaba · WeChat candidates — then get risk scores and RFQ questions before you order.',
    cta1: 'Start Free — 5 Searches →',
    cta2: 'See Pricing',
    note: 'GloSource AI is a research assistant, not a sourcing agent. We help you find, compare, and prepare — you make the final call.',
    features: ['3–5 factory candidates, auto-sourced', 'Supplier risk & trust score', 'Auto-generated RFQ drafts', 'Unit price & MOQ comparison'],
    stats: [
      { num: '3–5', label: 'Suppliers per search' },
      { num: '60s', label: 'Avg. analysis time' },
      { num: '0–100', label: 'Supplier risk score' },
      { num: '3 steps', label: 'Search · Verify · RFQ' },
    ],
    mockQuery: 'Stainless Ball Valve DN50',
    mockDone: 'Analysis complete · 58s',
    mockRfq: 'RFQ draft ready',
    supplier1: { name: '上海机械制造有限公司', platform: '1688.com', score: 87, moq: 'MOQ 500 pcs · ¥12.8/pc', lead: 'Lead 7d · HS 8481.80' },
    supplier2: { name: 'Hangzhou Trade Co., Ltd', platform: 'Alibaba', score: 74, moq: 'MOQ 200 pcs · ¥15.2/pc', lead: 'Lead 14d · Korea export ✓' },
  },
};

function TrustBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-400' : score >= 65 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-20 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-200">{score}/100</span>
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
        <span className="ml-2 text-[11px] font-bold text-slate-400">GloSource AI — Analysis</span>
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
          <TrustBar score={c.supplier1.score} />
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
          <TrustBar score={c.supplier2.score} />
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
      {/* dot-grid background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* right glow */}
      <div className="absolute -right-32 top-0 h-full w-[600px] rounded-full bg-[#EA580C]/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-center">

          {/* LEFT — copy */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 border border-white/20 bg-white/10 rounded-full px-3 py-1 text-xs font-semibold text-slate-100 backdrop-blur">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {c.badge}
            </div>

            <h1 className="mb-5 text-[2.6rem] font-black leading-[0.96] tracking-tight text-white sm:text-5xl md:text-6xl">
              {c.h1}<br />
              <span className="mt-2 inline-block rounded-lg bg-[#EA580C] px-3 py-1 text-[0.68em] text-white shadow-2xl shadow-orange-950/40">
                {c.h1sub}
              </span>
            </h1>

            <p className="mb-8 max-w-xl text-lg font-semibold leading-relaxed text-slate-200 md:text-xl">
              {c.desc}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <a
                href="#sourcing-tool"
                onClick={handleScrollTo('sourcing-tool')}
                className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#DC4C00] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-900/30"
              >
                {c.cta1}
              </a>
              <a
                href="#pricing"
                onClick={handleScrollTo('pricing')}
                className="inline-flex items-center border border-white/30 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition-all backdrop-blur"
              >
                {c.cta2}
              </a>
            </div>

            <div className="mb-6 max-w-xl rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold leading-relaxed text-amber-50 backdrop-blur">
              {c.note}
            </div>

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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/10 pt-8">
              {c.stats.map(s => (
                <div key={s.num}>
                  <p className="text-2xl font-black text-white">{s.num}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — mockup panel */}
          <div className="hidden lg:block">
            <MockPreviewPanel c={c} />
          </div>

        </div>
      </div>
    </section>
  );
}
