'use client';

import { useState } from 'react';
import { L1_META, CATEGORY_GROUPS, getCategoriesByL1 } from '../lib/categories';
import type { Category, L1Code, CategoryGroup } from '../lib/categories';

interface CategorySelectorProps {
  onSelect: (category: Category | null) => void;
  selected: Category | null;
}

// ── Group color/style config ─────────────────────────────────────────
const GROUP_CFG: Record<CategoryGroup, {
  openCls: string;
  chipSelected: string;
  chipHover: string;
  cardBorder: string;
  tagCls: string;
}> = {
  construction: {
    openCls: 'bg-[#0D1B2A] border-[#0D1B2A] text-white',
    chipSelected: 'bg-[#EA580C] text-white border-[#EA580C]',
    chipHover: 'hover:bg-slate-100 hover:border-slate-300 hover:text-[#0D1B2A]',
    cardBorder: '',
    tagCls: 'bg-slate-100 text-slate-500',
  },
  ai_robot: {
    openCls: 'bg-violet-700 border-violet-700 text-white',
    chipSelected: 'bg-violet-700 text-white border-violet-700',
    chipHover: 'hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700',
    cardBorder: 'border-violet-200 hover:border-violet-400 hover:bg-violet-50/60',
    tagCls: 'bg-violet-50 text-violet-600',
  },
  it_hardware: {
    openCls: 'bg-blue-700 border-blue-700 text-white',
    chipSelected: 'bg-blue-700 text-white border-blue-700',
    chipHover: 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700',
    cardBorder: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/60',
    tagCls: 'bg-blue-50 text-blue-600',
  },
  smart_mfg: {
    openCls: 'bg-emerald-700 border-emerald-700 text-white',
    chipSelected: 'bg-emerald-700 text-white border-emerald-700',
    chipHover: 'hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700',
    cardBorder: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/60',
    tagCls: 'bg-emerald-50 text-emerald-600',
  },
};

// ── Group SVG icons ──────────────────────────────────────────────────
function IconBuilding({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

function IconRobot({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M15.75 3v1.5m0 15V21m-9.75-3.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 8.25v6.75a2.25 2.25 0 002.25 2.25zM9 12h.008v.008H9V12zm3 0h.008v.008H12V12zm3 0h.008v.008H15V12z" />
    </svg>
  );
}

function IconChip({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9.75-9h10.5c.621 0 1.125-.504 1.125-1.125v-4.5c0-.621-.504-1.125-1.125-1.125H6.75c-.621 0-1.125.504-1.125 1.125v4.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function IconGear({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
    </svg>
  );
}

const GROUP_ICON: Record<CategoryGroup, React.ReactNode> = {
  construction: <IconBuilding className="w-3.5 h-3.5" />,
  ai_robot:     <IconRobot className="w-3.5 h-3.5" />,
  it_hardware:  <IconChip className="w-3.5 h-3.5" />,
  smart_mfg:    <IconGear className="w-3.5 h-3.5" />,
};

const TECH_CARD_META: Record<Exclude<CategoryGroup, 'construction'>, { title: string; keywords: string }> = {
  ai_robot:    { title: 'AI · 로봇 · 자동화', keywords: '협동로봇 · 비전 · PLC · AGV' },
  it_hardware: { title: 'IT · 전자부품',       keywords: 'PCB · 서버 · 네트워크 · RF' },
  smart_mfg:   { title: '스마트 제조 · IoT',   keywords: 'CNC · 인버터 · SCADA · 5G' },
};

// ── Component ────────────────────────────────────────────────────────
export default function CategorySelector({ onSelect, selected }: CategorySelectorProps) {
  const [openL1, setOpenL1] = useState<L1Code | null>(null);

  const toggleL1 = (code: L1Code) => setOpenL1(prev => (prev === code ? null : code));

  const pickL2 = (cat: Category) => {
    onSelect(selected?.code === cat.code ? null : cat);
    setOpenL1(null);
  };

  const constructionGroup = CATEGORY_GROUPS.find(g => g.id === 'construction')!;
  const techGroups = CATEGORY_GROUPS.filter(g => g.id !== 'construction');
  const openTechGroup = techGroups.find(g => g.codes.includes(openL1 as L1Code));

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">
          소싱 카테고리
          <span className="text-slate-400 font-normal ml-1">(선택 시 AI 정확도 향상)</span>
        </p>
        {selected && (
          <button onClick={() => onSelect(null)} className="text-xs text-slate-400 hover:text-slate-600 underline">
            초기화
          </button>
        )}
      </div>

      {/* ── Selected pill ── */}
      {selected && (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-xs">
          <span className="font-semibold text-[#0D1B2A]">{selected.l1NameKo}</span>
          <span className="text-slate-300">›</span>
          <span className="text-orange-700 font-medium">{selected.l2NameKo}</span>
          <span className="ml-auto text-slate-400 font-mono text-[10px]">{selected.quantityUnitSuggestion}</span>
        </div>
      )}

      {/* ════════════════════════════════════════════
          ① 건설 · 건자재 Section
      ════════════════════════════════════════════ */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
          <div className="w-5 h-5 rounded bg-[#0D1B2A] flex items-center justify-center text-white">
            <IconBuilding className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-slate-700">건설 · 건자재</span>
          <span className="ml-auto text-[10px] text-slate-400">철강 · 콘크리트 · 유리 · MEP · 마감재</span>
        </div>

        {/* 2-col L1 grid */}
        <div className="p-2 pb-1 grid grid-cols-2 gap-1">
          {constructionGroup.codes.map(code => {
            const meta = L1_META[code];
            const isOpen = openL1 === code;
            const cfg = GROUP_CFG.construction;
            return (
              <button
                key={code}
                type="button"
                onClick={() => toggleL1(code)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all border ${
                  isOpen ? cfg.openCls : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{meta.nameKo}</span>
                <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 opacity-70' : 'opacity-30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            );
          })}
        </div>

        {/* L2 chips — full width, appears below the grid when a construction L1 is open */}
        {openL1 && constructionGroup.codes.includes(openL1) && (
          <div className="px-3 pb-3">
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                {L1_META[openL1].nameKo} 세부 카테고리
              </p>
              <div className="flex flex-wrap gap-1">
                {getCategoriesByL1(openL1).map(cat => {
                  const cfg = GROUP_CFG.construction;
                  return (
                    <button
                      key={cat.code}
                      type="button"
                      onClick={() => pickL2(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                        selected?.code === cat.code
                          ? cfg.chipSelected
                          : `bg-white text-slate-500 border-slate-200 ${cfg.chipHover}`
                      }`}
                    >
                      {cat.l2NameKo}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════
          ② 기술 산업 Section  (AI / IT / 스마트제조)
      ════════════════════════════════════════════ */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
          <div className="w-5 h-5 rounded bg-violet-700 flex items-center justify-center text-white">
            <IconRobot className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-slate-700">기술 산업</span>
          <span className="ml-auto text-[10px] text-slate-400">AI · IT 하드웨어 · 스마트 제조</span>
        </div>

        {/* 3 feature cards */}
        <div className="p-2 grid grid-cols-3 gap-1.5">
          {techGroups.map(group => {
            const code = group.codes[0];
            const isOpen = openL1 === code;
            const cfg = GROUP_CFG[group.id];
            const meta = TECH_CARD_META[group.id as Exclude<CategoryGroup, 'construction'>];
            return (
              <button
                key={code}
                type="button"
                onClick={() => toggleL1(code)}
                className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                  isOpen
                    ? cfg.openCls
                    : `bg-white border-slate-200 ${cfg.cardBorder}`
                }`}
              >
                <div className={`flex items-center gap-1.5 mb-1 ${isOpen ? 'text-white' : ''}`}>
                  {GROUP_ICON[group.id]}
                  <span className="text-[11px] font-bold leading-tight">{meta.title.split(' · ')[0]}</span>
                </div>
                <p className={`text-[10px] leading-snug ${isOpen ? 'text-white/70' : 'text-slate-400'}`}>
                  {meta.keywords}
                </p>
                {isOpen && (
                  <div className={`mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded inline-block ${cfg.tagCls}`}>
                    ▾ 하위 항목
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* L2 chips — full-width below the 3 cards */}
        {openTechGroup && (
          <div className="px-3 pb-3">
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                {L1_META[openTechGroup.codes[0]].nameKo} 세부 카테고리
              </p>
              <div className="flex flex-wrap gap-1">
                {getCategoriesByL1(openTechGroup.codes[0]).map(cat => {
                  const cfg = GROUP_CFG[openTechGroup.id];
                  return (
                    <button
                      key={cat.code}
                      type="button"
                      onClick={() => pickL2(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                        selected?.code === cat.code
                          ? cfg.chipSelected
                          : `bg-white text-slate-500 border-slate-200 ${cfg.chipHover}`
                      }`}
                    >
                      {cat.l2NameKo}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
