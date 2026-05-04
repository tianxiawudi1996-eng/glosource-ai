import { Icon } from './icons';
import TrustScoreGauge from './TrustScoreGauge';
import type { Supplier } from '../api/source/types';

interface SupplierRowProps {
  supplier: Supplier;
  isSelected: boolean;
  onClick: () => void;
}

function riskLabel(score: number): { label: string; color: string; dot: string } {
  if (score >= 80) return { label: '낮음', color: 'text-emerald-700', dot: 'bg-emerald-500' };
  if (score >= 60) return { label: '보통', color: 'text-amber-700', dot: 'bg-amber-500' };
  return { label: '높음', color: 'text-red-700', dot: 'bg-red-500' };
}

interface SupplierComparisonTableProps {
  suppliers: Supplier[];
  selectedRank?: number;
  onSelect: (supplier: Supplier) => void;
}

export function SupplierComparisonTable({ suppliers, selectedRank, onSelect }: SupplierComparisonTableProps) {
  if (suppliers.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon.Globe className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-bold text-[#0D1B2A]">공급자 후보 비교표</p>
        </div>
        <span className="text-xs text-slate-400">{suppliers.length}개 후보</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-[#0D1B2A] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-bold">공급자</th>
              <th className="px-4 py-3 text-xs font-bold">플랫폼</th>
              <th className="px-4 py-3 text-xs font-bold">MOQ</th>
              <th className="px-4 py-3 text-xs font-bold">예상 단가</th>
              <th className="px-4 py-3 text-xs font-bold">리드타임</th>
              <th className="px-4 py-3 text-xs font-bold">리스크</th>
              <th className="px-4 py-3 text-xs font-bold">확인 상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.map((s) => {
              const risk = riskLabel(s.trustScore);
              const selected = selectedRank === s.rank;
              return (
                <tr
                  key={s.rank}
                  onClick={() => onSelect(s)}
                  className={`cursor-pointer transition-colors ${selected ? 'bg-orange-50/70' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[#0D1B2A] text-[11px] font-black text-white">
                        {s.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="max-w-[220px] truncate text-sm font-bold text-[#0D1B2A]">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.country}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-600">{s.platform}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{s.moq || '문의 필요'}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-700">{s.estimatedPrice || '문의 필요'}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{s.leadTimeDays || '문의 필요'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${risk.dot}`} />
                      <span className={`text-xs font-bold ${risk.color}`}>{100 - s.trustScore}/100 · {risk.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${s.verificationStatus === 'grounding_confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {s.verificationStatus === 'grounding_confirmed' ? '웹 확인' : 'AI 추정'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
        행을 선택하면 신뢰 근거와 주의사항을 아래에서 확인할 수 있습니다.
      </div>
    </div>
  );
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
