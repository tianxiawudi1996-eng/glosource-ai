import { Icon } from './icons';
import TrustScoreGauge from './TrustScoreGauge';
import type { Supplier } from '../api/source/types';

interface SupplierRowProps {
  supplier: Supplier;
  isSelected: boolean;
  onClick: () => void;
}

export function SupplierRow({ supplier: s, isSelected, onClick }: SupplierRowProps) {
  return (
    <button onClick={onClick}
      className={`w-full text-left px-4 py-3 transition-all ${isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}>
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
            {s.rank}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[#0D1B2A] truncate">{s.name}</p>
            <p className="text-xs text-slate-400">{s.platform} · {s.country}</p>
            {s.redFlags.length > 0 && (
              <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                <Icon.AlertTriangle className="w-3 h-3" />
                {s.redFlags[0]}
              </p>
            )}
          </div>
        </div>
        <div className="w-full flex-shrink-0 text-left sm:w-auto sm:text-right">
          <TrustScoreGauge score={s.trustScore} size="sm" />
          <p className="text-xs text-slate-400 mt-1">{s.estimatedPrice}</p>
        </div>
      </div>
    </button>
  );
}

interface SupplierDetailProps {
  supplier: Supplier;
}

export function SupplierDetail({ supplier: s }: SupplierDetailProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-[#0D1B2A] text-sm">{s.name}</p>
          <p className="text-xs text-slate-400">{s.platform} · {s.country}</p>
        </div>
        {s.url && (
          <a href={s.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors border border-blue-200 rounded-lg px-2.5 py-1.5">
            <Icon.ExternalLink className="w-3 h-3" />공급자 페이지
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs font-medium text-slate-500 mb-1">예상 단가</p>
          <p className="text-sm font-bold text-[#0D1B2A]">{s.estimatedPrice}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs font-medium text-slate-500 mb-1">최소 발주량(MOQ)</p>
          <p className="text-sm font-bold text-[#0D1B2A]">{s.moq}</p>
        </div>
      </div>
      {s.trustEvidence.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-bold text-emerald-700 mb-1.5">신뢰 근거</p>
          <ul className="space-y-1">
            {s.trustEvidence.map((e, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                <Icon.Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />{e}
              </li>
            ))}
          </ul>
        </div>
      )}
      {s.redFlags.length > 0 && (
        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs font-bold text-red-700 mb-1">주의사항</p>
          <ul className="space-y-1">
            {s.redFlags.map((f, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-red-600">
                <Icon.AlertTriangle className="w-3 h-3 flex-shrink-0" />{f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
