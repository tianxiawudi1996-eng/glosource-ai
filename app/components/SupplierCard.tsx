import { Icon } from './icons';
import TrustScoreGauge from './TrustScoreGauge';
import type { Supplier } from '../api/source/types';
import { getVerdict, getVerdictStyle, getPilotCost } from '../lib/sourcing-verdict';
import { supplierVerificationKind } from '../lib/supplier-verification';

interface SupplierRowProps {
  supplier: Supplier;
  isSelected: boolean;
  onClick: () => void;
}

function riskLabel(score: number): { label: string; color: string; dot: string } {
  if (score >= 80) return { label: '낮음 (AI 추정)', color: 'text-emerald-700', dot: 'bg-emerald-500' };
  if (score >= 60) return { label: '보통 (AI 추정)', color: 'text-amber-700', dot: 'bg-amber-500' };
  return { label: '높음 (AI 추정)', color: 'text-red-700', dot: 'bg-red-500' };
}

function verificationBadge(supplier: Supplier): { label: string; className: string } {
  const badgeByKind = {
    government: { label: '정부 레지스트리 확인', className: 'bg-emerald-50 text-emerald-700' },
    curated: { label: 'GloSource 큐레이션', className: 'bg-blue-50 text-blue-700' },
    url: { label: 'URL 접속 확인', className: 'bg-emerald-50 text-emerald-700' },
    unconfirmed: { label: 'AI 추정', className: 'bg-slate-100 text-slate-500' },
  } as const;
  return badgeByKind[supplierVerificationKind(supplier)];
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

      {/* 모바일 카드 뷰 (< lg) */}
      <div className="lg:hidden divide-y divide-slate-100">
        {suppliers.map((s) => {
          const risk = riskLabel(s.trustScore);
          const verdict = getVerdict(s);
          const vs = getVerdictStyle(verdict);
          const verification = verificationBadge(s);
          const selected = selectedRank === s.rank;
          return (
            <button
              key={s.rank}
              type="button"
              onClick={() => onSelect(s)}
              className={`w-full text-left px-4 py-4 transition-colors min-h-[72px] ${selected ? 'bg-orange-50/60' : 'hover:bg-slate-50'}`}
            >
              {/* 1행: 순위 + 공급자명 + 리스크 + 판정 */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[#0D1B2A] text-[11px] font-black text-white">
                    {s.rank}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0D1B2A] truncate">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.platform} · {s.country}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-bold ${verification.className}`}>
                        {verification.label}
                      </span>
                      {s.dbVerified && s.repeatQuery && (
                        <span className="inline-flex rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                          반복 검색 큐레이션
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${risk.dot}`} />
                    <span className={`text-xs font-bold ${risk.color}`}>{risk.label}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${vs.bg} ${vs.text} ${vs.border}`}>
                    {verdict}
                  </span>
                </div>
              </div>
              {/* 2행: 가격 · MOQ · 리드타임 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                  <p className="text-[10px] text-slate-400 font-medium">단가</p>
                  <p className="text-xs font-bold text-[#0D1B2A] mt-0.5 truncate">{s.estimatedPrice || '문의'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                  <p className="text-[10px] text-slate-400 font-medium">MOQ</p>
                  <p className="text-xs font-bold text-[#0D1B2A] mt-0.5 truncate">{s.moq || '문의'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                  <p className="text-[10px] text-slate-400 font-medium">리드타임</p>
                  <p className="text-xs font-bold text-[#0D1B2A] mt-0.5 truncate">{s.leadTimeDays || '문의'}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 데스크톱 테이블 (≥ lg) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#0D1B2A] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-bold">공급자</th>
              <th className="px-4 py-3 text-xs font-bold">플랫폼</th>
              <th className="px-4 py-3 text-xs font-bold">MOQ</th>
              <th className="px-4 py-3 text-xs font-bold">예상 단가</th>
              <th className="px-4 py-3 text-xs font-bold">리드타임</th>
              <th className="px-4 py-3 text-xs font-bold">위험도 (AI 추정)</th>
              <th className="px-4 py-3 text-xs font-bold">확인 상태</th>
              <th className="px-4 py-3 text-xs font-bold">판정</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.map((s) => {
              const risk = riskLabel(s.trustScore);
              const verdict = getVerdict(s);
              const vs = getVerdictStyle(verdict);
              const verification = verificationBadge(s);
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
                    <div className="flex flex-wrap gap-1">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${verification.className}`} title={s.urlCompanyMatch ? 'URL 접속 및 페이지 내 회사명 토큰 일치' : undefined}>
                        {verification.label}
                      </span>
                      {s.dbVerified && s.repeatQuery && (
                        <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                          반복 검색 큐레이션
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black ${vs.bg} ${vs.text} ${vs.border}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${vs.dot}`} />
                      {verdict}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
        AI 추정 점수는 인증이나 보증이 아닙니다. 항목을 선택해 근거와 주의사항을 확인하세요.
      </div>
    </div>
  );
}

export function SupplierRow({ supplier: s, isSelected, onClick }: SupplierRowProps) {
  const verdict = getVerdict(s);
  const vs = getVerdictStyle(verdict);
  return (
    <button onClick={onClick}
      className={`w-full text-left px-4 py-3 transition-all ${isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}>
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
            {s.rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm text-[#0D1B2A] truncate">{s.name}</p>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black flex-shrink-0 ${vs.bg} ${vs.text} ${vs.border}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${vs.dot}`} />
                {verdict}
              </span>
            </div>
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
          <TrustScoreGauge score={s.trustScore} size="sm" muted={s.verificationStatus === 'ai_estimated' && !s.url} lang="ko" />
          {s.verificationStatus === 'ai_estimated' && !s.url && (
            <p className="text-[10px] text-amber-500 mt-0.5">AI 추정 · 웹 미확인</p>
          )}
          <p className="text-xs text-slate-400 mt-1">{s.estimatedPrice}</p>
        </div>
      </div>
    </button>
  );
}

interface SupplierDetailProps {
  supplier: Supplier;
  onStartVoiceCall?: (supplier: Supplier) => void;
}

async function trackAbuseEvent(event: string, metadata: Record<string, unknown>): Promise<void> {
  try {
    await fetch('/api/abuse/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, metadata }),
    });
  } catch { /* best-effort telemetry */ }
}

export function SupplierDetail({ supplier: s, onStartVoiceCall }: SupplierDetailProps) {
  const verdict = getVerdict(s);
  const vs = getVerdictStyle(verdict);
  const pilot = getPilotCost(s);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      {/* 헤더: 공급자명 + 판정 뱃지 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-bold text-[#0D1B2A] text-sm">{s.name}</p>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black ${vs.bg} ${vs.text} ${vs.border}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${vs.dot}`} />
              {verdict}
            </span>
          </div>
          <p className="text-xs text-slate-400">{s.platform} · {s.country}</p>
        </div>
        {s.url && (
          <a href={s.url} target="_blank" rel="noopener noreferrer"
            onClick={() => {
              void trackAbuseEvent('supplier_url_clicked', {
                supplierRank: s.rank,
                supplierName: s.name,
                platform: s.platform,
                source: 'supplier_detail',
              });
            }}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors border border-blue-200 rounded-lg px-2.5 py-1.5 flex-shrink-0 ml-2">
            <Icon.ExternalLink className="w-3 h-3" />공급자 페이지
          </a>
        )}
      </div>

      {/* GloSource Voice Call Button */}
      <button
        type="button"
        onClick={() => onStartVoiceCall?.(s)}
        className="mb-3 w-full min-h-[40px] py-2 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/10 hover:scale-[1.01]"
      >
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.56 11.56 0 018.82 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.62c0-.55-.45-1-1-1z" />
        </svg>
        Preview interpreted negotiation (demo)
      </button>

      {/* 단가 + MOQ */}
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

      {/* 파일럿 예산 위젯 */}
      {pilot ? (
        <div className="mb-3 rounded-xl border border-[#EA580C]/20 bg-orange-50/50 p-3">
          <p className="text-xs font-black text-[#EA580C] mb-0.5">1차 파일럿 예산 참고</p>
          <p className="text-[10px] text-slate-400 mb-2">AI 자동 산출 · 공급자 직접 견적 후 반드시 재확인</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">샘플 수량</span>
              <span className="font-bold text-[#0D1B2A]">{pilot.sampleQty}개</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">제품비 (AI 추정)</span>
              <span className="font-bold text-[#0D1B2A]">{pilot.currency} {pilot.productCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">배송 버퍼 (35%)</span>
              <span className="font-bold text-[#0D1B2A]">{pilot.currency} {pilot.freightBuffer.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">검증 버퍼</span>
              <span className="font-bold text-[#0D1B2A]">{pilot.currency} {pilot.inspectionBuffer.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs pt-1.5 mt-1 border-t border-orange-200">
              <span className="font-black text-[#0D1B2A]">AI 추정 총액</span>
              <span className="font-black text-[#EA580C] text-sm">{pilot.currency} {pilot.total.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-[10px] text-amber-600 mt-2 font-medium">⚠ 투자 권유가 아닙니다. 환율·운임·세관·실제 단가는 공급자 견적에서만 확인 가능합니다.</p>
        </div>
      ) : (
        <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-black text-slate-500 mb-1">1차 파일럿 예산</p>
          <p className="text-xs text-slate-400 leading-5">
            단가 정보가 부족해 자동 계산이 어렵습니다.<br />
            공급사에 <span className="font-bold text-[#0D1B2A]">FOB 단가 + MOQ 견적</span>을 먼저 요청하세요.
          </p>
        </div>
      )}

      {/* 신뢰 근거 */}
      {s.trustEvidence.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-bold text-emerald-700 mb-1.5">AI 추정 신뢰 신호</p>
          <ul className="space-y-1">
            {s.trustEvidence.map((e, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                <Icon.Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />{e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 주의사항 */}
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
