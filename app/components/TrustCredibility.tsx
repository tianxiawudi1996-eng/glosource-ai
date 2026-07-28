'use client';

/**
 * TrustCredibility — explains how supplier evidence is cross-checked.
 *
 * Self-contained client island: renders a nav trigger button + the modal, and
 * auto-opens once per browser (localStorage). Content mirrors the credibility
 * one-pager and is deliberately HONEST — it describes only what the code actually
 * does: AI discovery (Gemini + Google Search) cross-checked against real Korean
 * government registries (live NTS + MFDS/HACCP/CGMP). It intentionally does NOT
 * claim medical-device or AEO verification, which are not live/registry-backed.
 */
import { useEffect, useState } from 'react';

const SEEN_KEY = 'gs_trust_seen_v1';

type Lang = 'ko' | 'en';
type Tone = 'light' | 'dark';

interface Copy {
  buttonLabel: string;
  ariaOpen: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  stepsLabel: string;
  steps: { n: string; t: string; d: string }[];
  registryLabel: string;
  registryNote: string;
  registries: { name: string; freq: string; live: boolean; desc: string }[];
  badgeLabel: string;
  badges: { label: string; desc: string; tone: 'emerald' | 'slate' | 'blue' }[];
  neverLabel: string;
  never: string[];
  footer: string;
  close: string;
}

const COPY: Record<Lang, Copy> = {
  ko: {
    buttonLabel: '검증 방식',
    ariaOpen: '공신력 검증 방식 보기',
    eyebrow: 'Supplier Trust Model',
    title: '이 검색 결과는 어떻게 검증되나요?',
    subtitle: 'AI가 후보를 찾고, 식별 가능한 한글 상호를 지원되는 한국 정부 등록부와 대조합니다. 등록부 일치는 공급사 보증이 아닙니다.',
    stepsLabel: '2단계 검증 구조',
    steps: [
      { n: '01', t: '발굴 · AI', d: 'Google Gemini + 실시간 Google 검색이 EC21·BuyKorea(KOTRA)·tradeKorea 등 공개 B2B 소스에서 실존 공급사 후보를 찾습니다. 모델엔 “검색으로 찾은 것만 반환, 지어내지 말 것” 규칙이 걸려 있습니다.' },
      { n: '02', t: '교차대조 · 정부 등록부', d: '식별 가능한 한글 상호를 적용 가능한 한국 정부 공식 등록부에 대조하고, 일치한 기록만 근거로 표시합니다.' },
      { n: '03', t: '정직한 표시', d: '정부 등록부에서 일치하면 초록 “정부 원장 일치” 배지가, AI 추정에는 “추정(AI Estimate)” 라벨이 붙습니다. 가격·MOQ·리드타임은 항상 추정으로 표기합니다.' },
    ],
    registryLabel: '검증에 쓰는 국가 데이터',
    registryNote: '모든 등록부는 정부 공공데이터(data.go.kr)에서 나옵니다.',
    registries: [
      { name: '국세청 사업자 상태', freq: '실시간', live: true, desc: '사업자 실존·영업 여부 (계속/폐업/휴업)' },
      { name: '식약처 화장품 (MFDS)', freq: '공식 등록부', live: false, desc: '화장품 제조·책임판매 · 건강기능식품 · 의약외품' },
      { name: '식약처 의료기기 (MFDS)', freq: '공식 등록부', live: false, desc: '의료기기 제조·수입 허가 (제조사 vs 수입사 구분)' },
      { name: 'HACCP', freq: '공식 등록부', live: false, desc: '식품안전관리인증' },
      { name: 'CGMP', freq: '공식 등록부', live: false, desc: '우수화장품 제조·품질관리 기준' },
    ],
    badgeLabel: '배지가 말하는 것',
    badges: [
      { label: '정부 원장 일치', desc: '식별 가능한 회사 정보가 지원되는 공식 등록부 기록과 일치', tone: 'emerald' },
      { label: 'AI Estimate', desc: 'AI가 찾았으나 아직 미검증 — “추정”으로 표시', tone: 'slate' },
      { label: 'Curated', desc: 'GloSource가 직접 확인 — 모르는 값은 비워 둠', tone: 'blue' },
    ],
    neverLabel: '우리가 절대 하지 않는 것',
    never: [
      'AI 추정을 정부 확인 사실로 위장하지 않습니다.',
      '가격·MOQ·리드타임은 항상 “추정”으로 표기합니다.',
      '정부 등록부에서 못 찾으면 배지를 붙이지 않습니다.',
    ],
    footer: '추정은 추정으로 표기되며, 어떤 정부 인증도 등록부 확인 없이 부여되지 않습니다. 거래 전 반드시 공급사와 직접 확인하세요.',
    close: '닫기',
  },
  en: {
    buttonLabel: 'How we verify',
    ariaOpen: 'See how suppliers are verified',
    eyebrow: 'Supplier Trust Model',
    title: 'How supplier results are cross-checked',
    subtitle: 'AI finds candidates. When an identifiable Korean company name is available, we cross-check it against applicable registries. A match is evidence, not supplier verification.',
    stepsLabel: 'A two-layer model',
    steps: [
      { n: '01', t: 'Discovery · AI', d: 'Google Gemini with live Google Search finds real supplier candidates across public B2B sources — EC21, BuyKorea (KOTRA), tradeKorea. The model is instructed to return only suppliers found via search — never to fabricate.' },
      { n: '02', t: 'Cross-check · Government', d: 'An identifiable registered Korean company name is compared with applicable official Korean government registries.' },
      { n: '03', t: 'Honest output', d: 'A matched record earns a green “Registry Match” badge; AI findings are labeled “AI Estimate.” Price, MOQ and lead time are always shown as estimates.' },
    ],
    registryLabel: 'The government data behind it',
    registryNote: 'Every registry is sourced from Korea’s official open data (data.go.kr).',
    registries: [
      { name: 'National Tax Service', freq: 'Live', live: true, desc: 'Active-business status (open / closed / suspended)' },
      { name: 'MFDS — Cosmetics', freq: 'Official registry', live: false, desc: 'Cosmetics maker/seller · health functional food · quasi-drug' },
      { name: 'MFDS — Medical Devices', freq: 'Official registry', live: false, desc: 'Device manufacturing / import licences (maker vs importer)' },
      { name: 'HACCP', freq: 'Official registry', live: false, desc: 'Food-safety certification' },
      { name: 'CGMP', freq: 'Official registry', live: false, desc: 'Cosmetics GMP certification' },
    ],
    badgeLabel: 'What each badge means',
    badges: [
      { label: 'Registry Match', desc: 'Identifiable company information matched an applicable official registry record', tone: 'emerald' },
      { label: 'AI Estimate', desc: 'Found by AI, not yet cross-verified — labeled as an estimate', tone: 'slate' },
      { label: 'Curated', desc: 'Hand-checked by GloSource — unknown values left blank', tone: 'blue' },
    ],
    neverLabel: 'What we never do',
    never: [
      'We never present an AI estimate as a government-confirmed fact.',
      'Prices, MOQ and lead times are always labeled as estimates.',
      'No badge is shown unless the company is found in a government registry.',
    ],
    footer: 'Estimates are labeled as estimates, and no government certification is ever assigned without a registry match. Always confirm details directly with the supplier before any transaction.',
    close: 'Close',
  },
};

const BADGE_TONE: Record<'emerald' | 'slate' | 'blue', string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
};

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.06 13.54L7.4 11l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.65 5.65z" />
    </svg>
  );
}

export default function TrustCredibility({ lang, tone = 'light' }: { lang: Lang; tone?: Tone }) {
  const t = COPY[lang];
  const [open, setOpen] = useState(false);

  // Auto-open once per browser, slightly delayed so it doesn't fight first paint.
  useEffect(() => {
    let seen = true;
    try { seen = !!localStorage.getItem(SEEN_KEY); } catch { /* storage blocked */ }
    if (seen) return;
    const timer = setTimeout(() => {
      setOpen(true);
      try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // ESC to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const triggerClass = tone === 'dark'
    ? 'border-white/25 text-slate-200 hover:bg-white/10 hover:text-white'
    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-[#0D1B2A]';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.ariaOpen}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-1 ${triggerClass}`}
      >
        <ShieldIcon className="h-3.5 w-3.5 text-emerald-500" />
        {t.buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0D1B2A]/60 px-4 py-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "'Pretendard','Inter','Apple SD Gothic Neo','Malgun Gothic',sans-serif" }}
          >
            {/* Header */}
            <div className="relative border-b border-slate-100 px-6 pb-5 pt-6 sm:px-8">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.close}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-5 w-5 text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#EA580C]">{t.eyebrow}</span>
              </div>
              <h2 className="mt-2 pr-8 text-xl font-black leading-tight text-[#0D1B2A] sm:text-2xl">{t.title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">{t.subtitle}</p>
            </div>

            {/* Body */}
            <div className="space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
              {/* Pipeline */}
              <section>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">{t.stepsLabel}</p>
                <div className="space-y-3">
                  {t.steps.map((s, i) => (
                    <div key={s.n} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#0D1B2A] text-[11px] font-black text-white">{s.n}</span>
                        {i < t.steps.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
                      </div>
                      <div className="pb-1">
                        <p className="text-sm font-bold text-[#0D1B2A]">{s.t}</p>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Registries */}
              <section>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">{t.registryLabel}</p>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  {t.registries.map((r, i) => (
                    <div key={r.name} className={`flex items-start justify-between gap-3 px-4 py-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                      <div>
                        <p className="text-sm font-bold text-[#0D1B2A]">{r.name}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{r.desc}</p>
                      </div>
                      <span className={`mt-0.5 flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${r.live ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {r.live && <span className="mr-1">●</span>}{r.freq}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">{t.registryNote}</p>
              </section>

              {/* Badges */}
              <section>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">{t.badgeLabel}</p>
                <div className="space-y-2">
                  {t.badges.map((b) => (
                    <div key={b.label} className="flex items-center gap-3">
                      <span className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${BADGE_TONE[b.tone]}`}>{b.label}</span>
                      <span className="text-[13px] leading-snug text-slate-500">{b.desc}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Never */}
              <section className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-4">
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-emerald-700">{t.neverLabel}</p>
                <ul className="space-y-2">
                  {t.never.map((n) => (
                    <li key={n} className="flex items-start gap-2 text-[13px] font-semibold leading-snug text-emerald-900">
                      <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {n}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="max-w-md text-[11px] leading-relaxed text-slate-400">{t.footer}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-shrink-0 rounded-xl bg-[#0D1B2A] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
