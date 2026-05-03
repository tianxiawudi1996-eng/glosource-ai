'use client';

import { useState } from 'react';
import { L1_META, CATEGORY_GROUPS, getCategoriesByL1 } from '../lib/categories';
import type { Category, L1Code } from '../lib/categories';

interface CategorySelectorProps {
  onSelect: (category: Category | null) => void;
  selected: Category | null;
}

export default function CategorySelector({ onSelect, selected }: CategorySelectorProps) {
  const [openL1, setOpenL1] = useState<L1Code | null>(null);

  const handleL1Click = (code: L1Code) => {
    setOpenL1(prev => (prev === code ? null : code));
  };

  const handleL2Click = (cat: Category) => {
    if (selected?.code === cat.code) {
      onSelect(null);
    } else {
      onSelect(cat);
      setOpenL1(null);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-slate-600">
          소싱 카테고리 <span className="text-slate-400 font-normal">(선택 시 AI 정확도 향상)</span>
        </p>
        {selected && (
          <button onClick={() => onSelect(null)} className="text-xs text-slate-400 hover:text-slate-600 underline">
            초기화
          </button>
        )}
      </div>

      {selected ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-xs">
          <span className="font-semibold text-[#0D1B2A]">{selected.l1NameKo}</span>
          <span className="text-slate-400">›</span>
          <span className="text-orange-700 font-medium">{selected.l2NameKo}</span>
          <span className="ml-auto text-slate-400 font-mono">{selected.quantityUnitSuggestion}</span>
        </div>
      ) : (
        <div className="space-y-2">
          {CATEGORY_GROUPS.map(group => (
            <div key={group.id}>
              <div className="flex items-center gap-1 px-1 pb-0.5 mb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">{group.label}</span>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {group.codes.map(code => {
                  const meta = L1_META[code];
                  const isOpen = openL1 === code;
                  return (
                    <div key={code}>
                      <button
                        type="button"
                        onClick={() => handleL1Click(code)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${
                          isOpen
                            ? 'bg-[#0D1B2A] text-white border-[#0D1B2A]'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-medium">{meta.nameKo}</span>
                      </button>
                      {isOpen && (
                        <div className="mt-0.5 ml-1 space-y-0.5">
                          {getCategoriesByL1(code).map(cat => (
                            <button
                              key={cat.code}
                              type="button"
                              onClick={() => handleL2Click(cat)}
                              className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-slate-600 hover:bg-orange-50 hover:text-orange-700 transition-colors border border-transparent hover:border-orange-200"
                            >
                              {cat.l2NameKo}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
