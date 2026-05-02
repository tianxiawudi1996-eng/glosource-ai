'use client';

import { useState, useEffect, useRef } from 'react';
import CategorySelector from './components/CategorySelector';
import EmptyState from './components/EmptyState';
import ExportButton from './components/ExportButton';
import PaywallModal from './components/PaywallModal';
import WeChatCard from './components/WeChatCard';
import { SupplierRow, SupplierDetail } from './components/SupplierCard';
import RFQComposer from './components/RFQComposer';
import { Icon } from './components/icons';
import type { Category } from './lib/categories';
import type { SourcingRequest, SourcingOutput, Supplier, CountryPreference, OrderFrequency, WeChatSourcingOutput } from './api/source/types';

type SourceMode = 'ai' | '1688' | 'wechat';

/* ══════════════════════════════════════════════
   상수
══════════════════════════════════════════════ */
const FREE_CREDITS = 5; // beta: 5 free analyses per user
const CREDITS_KEY = 'glosource_credits_v1';
const LICENSE_KEY_STORAGE = 'glosource_license_key';
const HISTORY_KEY = 'glosource_search_history';
const HISTORY_MAX = 50;

function saveToHistory(entry: {
  timestamp: string;
  source: string;
  query: Record<string, string>;
  status: number;
  raw: unknown;
}) {
  try {
    const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as unknown[];
    const next = [entry, ...prev].slice(0, HISTORY_MAX);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch { /* storage full — ignore */ }
}

const COUNTRY_OPTIONS: { value: CountryPreference; label: string; desc: string }[] = [
  { value: 'china',         label: '중국',     desc: '최대 공급망' },
  { value: 'southeast_asia',label: '동남아',   desc: '베트남·태국' },
  { value: 'europe',        label: '유럽',     desc: '고품질 특화' },
  { value: 'japan',         label: '일본',     desc: '정밀 부품' },
  { value: 'any',           label: '상관없음', desc: '전 세계' },
];

const FREQUENCY_OPTIONS: { value: OrderFrequency; label: string; desc: string }[] = [
  { value: 'one_time',       label: '1회성',   desc: '단발 발주' },
  { value: 'monthly',        label: '월 1회',  desc: '정기 발주' },
  { value: 'bimonthly_plus', label: '월 2회+', desc: '대량 정기' },
];

const LOADING_MESSAGES: Record<SourceMode, string[]> = {
  ai: [
    '1688.com 원가 탐색 중...',
    'Alibaba 공급자 검색 중...',
    'WeChat 공장 정보 확인 중...',
    '공급자 신뢰도 분석 중...',
    'RFQ 이메일 초안 작성 중...',
    '소싱 리포트 생성 중...',
  ],
  '1688': [
    '1688.com 접속 중...',
    '공장 직거래 업체 탐색 중...',
    '诚信通 인증 확인 중...',
    '원가 분석 및 Alibaba 비교 중...',
    'CNY/USD 환산 중...',
    '1688 소싱 리포트 생성 중...',
  ],
  wechat: [
    'WeChat 공식계정 검색 중...',
    'Sogou 위챗 검색 연결 중...',
    '공장 홍보 담당자 포스팅 분석 중...',
    '계정 유형 판단 중 (공장/무역상)...',
    '연락처 정보 추출 중...',
    'WeChat 인텔리전스 분석 완료...',
  ],
};

/* ══════════════════════════════════════════════
   신뢰도 점수 → 색상
══════════════════════════════════════════════ */
function getTrustColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-red-600 bg-red-50 border-red-200';
}
function getTrustLabel(score: number): string {
  if (score >= 80) return '신뢰';
  if (score >= 60) return '보통';
  return '주의';
}

/* ══════════════════════════════════════════════
   PDF 생성
══════════════════════════════════════════════ */
function generateReportHTML(result: SourcingOutput, req: SourcingRequest, company: string, date: string): string {
  const co = company || '(회사명 미입력)';
  const dt = new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const css = `<style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Noto Sans KR','맑은 고딕',sans-serif;padding:15mm 20mm;color:#0F172A;font-size:10pt;line-height:1.65}
    h1{font-size:18pt;font-weight:900;text-align:center;padding-bottom:8px;border-bottom:2px solid #0F172A;margin-bottom:10px}
    .sub{text-align:center;color:#475569;font-size:9pt;margin-bottom:12px}
    .meta{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:10px 14px;margin-bottom:14px;display:grid;grid-template-columns:1fr 1fr;gap:3px 20px}
    .mr{font-size:9pt;display:flex;gap:8px}.ml{font-weight:700;min-width:70px;color:#374151}
    .section{margin-bottom:16px}
    .sh{font-size:11pt;font-weight:700;border-left:4px solid #0D1B2A;padding-left:10px;margin-bottom:8px}
    table{width:100%;border-collapse:collapse;margin-top:6px;font-size:9pt}
    th{background:#0D1B2A;color:#fff;padding:7px 8px;text-align:left;border:1px solid #0D1B2A}
    td{padding:6px 8px;border:1px solid #CBD5E1;vertical-align:top}
    tr:nth-child(even)td{background:#F8FAFC}
    .score-h{font-weight:700;color:#16a34a}.score-m{font-weight:700;color:#d97706}.score-l{font-weight:700;color:#dc2626}
    .ev{font-size:8.5pt;color:#475569;margin-top:3px}
    .rf{font-size:8.5pt;color:#dc2626;margin-top:3px}
    .rec{background:#EFF6FF;border:1px solid #BFDBFE;border-radius:6px;padding:10px 14px;margin-bottom:14px;font-size:9.5pt}
    .dis{margin-top:12px;padding-top:8px;border-top:1px solid #E2E8F0;font-size:7.5pt;color:#94A3B8;text-align:center}
    .grounding{display:inline-block;background:#DCFCE7;color:#16a34a;font-size:7.5pt;padding:2px 8px;border-radius:10px;margin-bottom:8px}
    @media print{@page{size:A4;margin:0}body{padding:10mm 15mm}}
  </style>`;

  const suppliersTable = `<table>
    <tr><th>#</th><th>공급자명</th><th>플랫폼</th><th>신뢰도</th><th>예상 단가</th><th>MOQ</th></tr>
    ${result.suppliers.map(s => {
      const cls = s.trustScore >= 80 ? 'score-h' : s.trustScore >= 60 ? 'score-m' : 'score-l';
      return `<tr>
        <td>${s.rank}</td>
        <td><strong>${s.name}</strong><div class="ev">${s.trustEvidence.slice(0, 2).join(' · ')}</div>${s.redFlags.length ? `<div class="rf">⚠ ${s.redFlags.join(' / ')}</div>` : ''}</td>
        <td>${s.platform}</td>
        <td class="${cls}">${s.trustScore}/100<br><small>${getTrustLabel(s.trustScore)}</small></td>
        <td>${s.estimatedPrice}</td>
        <td>${s.moq}</td>
      </tr>`;
    }).join('')}
  </table>`;

  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">${css}<title>글로벌 소싱 리포트 — ${co}</title></head><body>
    <h1>글로벌 소싱 리포트</h1>
    <p class="sub">GloSource AI · ${result.groundingUsed ? '<span class="grounding">실시간 웹 검색 기반</span>' : 'AI 지식 기반'}</p>
    <div class="meta">
      <div class="mr"><span class="ml">회사명</span><span>${co}</span></div>
      <div class="mr"><span class="ml">분석일</span><span>${dt}</span></div>
      <div class="mr"><span class="ml">소싱 품목</span><span>${req.productDescription}</span></div>
      <div class="mr"><span class="ml">필요 수량</span><span>${req.quantity}</span></div>
      ${req.budget ? `<div class="mr"><span class="ml">예산</span><span>${req.budget}</span></div>` : ''}
    </div>
    <div class="section"><div class="sh">공급자 비교표</div>${suppliersTable}</div>
    <div class="section"><div class="sh">AI 최종 추천</div><div class="rec">${result.recommendation}</div></div>
    <p class="dis">${result.disclaimer} | GloSource AI · like2buyglobal@gmail.com</p>
    <script>window.onload=()=>window.print();</script>
  </body></html>`;
}

/* ══════════════════════════════════════════════
   메인 컴포넌트
══════════════════════════════════════════════ */
export default function HomePage() {
  const [form, setForm] = useState<SourcingRequest>({
    productDescription: '',
    quantity: '',
    budget: '',
    countryPreference: 'china',
    orderFrequency: 'one_time',
  });
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<SourcingOutput | null>(null);
  const [error, setError] = useState('');
  const [noResults, setNoResults] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [credits, setCredits] = useState(FREE_CREDITS);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeSource, setActiveSource] = useState<SourceMode>('ai');
  const [wechatResult, setWechatResult] = useState<WeChatSourcingOutput | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // test mode: always reset to unlimited
    localStorage.setItem(CREDITS_KEY, String(FREE_CREDITS));
    setCredits(FREE_CREDITS);
    const lk = localStorage.getItem(LICENSE_KEY_STORAGE);
    if (lk) setLicenseKey(lk);
  }, []);

  const startLoading = () => {
    const msgs = LOADING_MESSAGES[activeSource];
    setLoading(true); setError(''); setNoResults(false); setResult(null); setSelectedSupplier(null); setWechatResult(null);
    setLoadingMsg(0);
    loadingRef.current = setInterval(() => setLoadingMsg(p => (p + 1) % msgs.length), 3000);
  };

  const stopLoading = () => {
    setLoading(false);
    if (loadingRef.current) clearInterval(loadingRef.current);
  };

  const handleLicenseActivated = (key: string) => {
    localStorage.setItem(LICENSE_KEY_STORAGE, key);
    setLicenseKey(key);
  };

  const handleGenerate = async () => {
    if (!licenseKey && credits <= 0) { setShowPaywall(true); return; }
    if (!form.productDescription.trim()) { setError('제품/자재명을 입력해주세요.'); return; }
    if (activeSource !== 'wechat' && !form.quantity.trim()) { setError('필요 수량을 입력해주세요.'); return; }

    startLoading();

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (licenseKey) headers['X-License-Key'] = licenseKey;

    const safeJson = async (res: Response) => {
      const text = await res.text();
      try { return JSON.parse(text); }
      catch { throw new Error(`서버 오류 (${res.status}): ${text.slice(0, 120)}`); }
    };

    try {
      if (activeSource === 'wechat') {
        const res = await fetch('/api/source/wechat', {
          method: 'POST',
          headers,
          body: JSON.stringify({ keyword: form.productDescription }),
        });
        const json = await safeJson(res);
        if (json.error === 'subscription_required') { stopLoading(); setShowPaywall(true); return; }
        if (!res.ok) throw new Error(json.error || '오류가 발생했습니다.');
        setWechatResult(json.data as WeChatSourcingOutput);
        saveToHistory({ timestamp: new Date().toISOString(), source: 'wechat', query: { keyword: form.productDescription }, status: res.status, raw: json });
      } else {
        const apiPath = activeSource === '1688' ? '/api/source/factory-direct' : '/api/source';
        const res = await fetch(apiPath, {
          method: 'POST',
          headers,
          body: JSON.stringify(form),
        });
        const json = await safeJson(res);
        if (json.error === 'subscription_required') { stopLoading(); setShowPaywall(true); return; }
        if (!res.ok) throw new Error(json.error || '오류가 발생했습니다.');
        const data = json.data as SourcingOutput;
        setResult(data);
        setSelectedSupplier(data.suppliers[0] ?? null);
        saveToHistory({ timestamp: new Date().toISOString(), source: activeSource, query: { productDescription: form.productDescription, quantity: form.quantity }, status: res.status, raw: json });
      }

      if (!licenseKey) {
        const nc = credits - 1;
        setCredits(nc);
        localStorage.setItem(CREDITS_KEY, String(nc));
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      const message = e instanceof Error ? e.message : '알 수 없는 오류';
      if (message.includes('찾지 못했습니다')) {
        setNoResults(true);
        setError('');
      } else {
        setError(message);
      }
    } finally {
      stopLoading();
    }
  };

  const handleRetry = () => {
    void handleGenerate();
  };

  const handleCategorySelect = (cat: Category | null) => {
    setSelectedCategory(cat);
    setForm(f => ({
      ...f,
      categoryCode: cat?.code,
      categoryNameZh: cat?.l2NameZh,
      quantityUnit: cat?.quantityUnitSuggestion ?? f.quantityUnit,
    }));
  };

  const handlePrintReport = () => {
    if (!result) return;
    const html = generateReportHTML(result, form, companyName, reportDate);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { alert('팝업 차단을 해제해주세요.'); return; }
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Pretendard','Inter','Apple SD Gothic Neo','Malgun Gothic',sans-serif" }}>

      {/* ── 결제 모달 ── */}
      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onLicenseActivated={handleLicenseActivated}
        />
      )}

      {/* ── 네비게이션 ── */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0D1B2A] rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon.Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-[#0D1B2A] tracking-tight">GloSource AI</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2">AI 글로벌 소싱 에이전트</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <Icon.Shield className="w-3 h-3" />
              <span>AI 공급자 신뢰도 검증</span>
            </div>
            {licenseKey
              ? <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full">🔑 구독 활성</span>
              : credits > 0
                ? <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full">무료 체험 {credits}회 남음</span>
                : <button onClick={() => setShowPaywall(true)} className="text-xs font-semibold bg-[#EA580C] text-white px-3 py-1.5 rounded-full hover:bg-[#DC4C00] transition-colors">크레딧 충전</button>
            }
          </div>
        </div>
      </nav>

      {/* ── 히어로 ── */}
      <section className="bg-[#0D1B2A] text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-3 py-1 text-xs text-slate-300 mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              1688.com · Alibaba · WeChat公众号 실시간 탐색
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black leading-[1.15] tracking-tight mb-5">
              한국 건설업계 전용<br />
              <span className="text-[#EA580C]">해외 자재 직소싱 AI</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              <strong className="text-white">기존 거래처를 끊지 마세요.</strong> GloSource는 협상 도구입니다.
              KS인증·관세·세금계산서·통관까지 한국 건설사가 필요한 모든 것을 자동화합니다.
              <strong className="text-white">한국 건설 현장 출신</strong>이 만들었습니다.
            </p>
            <div className="flex flex-wrap gap-3 mb-12">
              {[
                { icon: <Icon.Search className="w-3.5 h-3.5" />, text: '공급자 3~5개 자동 탐색' },
                { icon: <Icon.Shield className="w-3.5 h-3.5" />, text: '신뢰도 AI 분석' },
                { icon: <Icon.Mail className="w-3.5 h-3.5" />, text: 'RFQ 이메일 자동 생성' },
                { icon: <Icon.Download className="w-3.5 h-3.5" />, text: '한국어 리포트 PDF' },
              ].map(b => (
                <span key={b.text} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                  {b.icon}{b.text}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-8">
              {[
                { num: '3~5개', label: '공급자 자동 탐색' },
                { num: '60초', label: '평균 분석 소요 시간' },
                { num: '0~100', label: '신뢰도 점수 채점' },
                { num: '2개국어', label: 'RFQ 이메일 자동화' },
              ].map(s => (
                <div key={s.num}>
                  <p className="text-2xl font-black text-white">{s.num}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 메인 툴 ── */}
      <section className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">

            {/* 입력 폼 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              {/* 소스 탭 */}
              <div className="flex border-b border-slate-100">
                {([
                  { id: 'ai'     as SourceMode, label: 'AI 종합 소싱',    badge: '1688+Alibaba+WeChat' },
                  { id: '1688'   as SourceMode, label: '1688 직거래',      badge: '원가 30~50% 절감' },
                  { id: 'wechat' as SourceMode, label: 'WeChat 실시간',    badge: '공장 홍보 직접 탐색' },
                ] as const).map(tab => (
                  <button key={tab.id} onClick={() => { setActiveSource(tab.id); setResult(null); setWechatResult(null); setError(''); setNoResults(false); }}
                    className={`flex-1 py-3 px-1 text-center transition-all border-b-2 ${activeSource === tab.id ? 'border-[#EA580C] bg-orange-50/30' : 'border-transparent hover:bg-slate-50'}`}>
                    <p className={`text-xs font-bold ${activeSource === tab.id ? 'text-[#0D1B2A]' : 'text-slate-400'}`}>{tab.label}</p>
                    <p className="text-xs text-slate-400 font-normal mt-0.5 hidden sm:block">{tab.badge}</p>
                  </button>
                ))}
              </div>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  {activeSource === 'wechat' ? <Icon.Globe className="w-4 h-4 text-slate-500" /> : <Icon.Settings className="w-4 h-4 text-slate-500" />}
                </div>
                <div>
                  <p className="font-bold text-[#0D1B2A] text-sm">
                    {activeSource === 'ai' ? '소싱 조건 설정' : activeSource === '1688' ? '1688 공장직거래 검색' : 'WeChat 공장 홍보 탐색'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {activeSource === 'ai' ? '5가지 항목 입력 후 AI 종합 분석' : activeSource === '1688' ? '1688.com 원가 + 诚信通 신뢰도 분석' : '微信公众号 공장 홍보 담당자 포스팅 탐색'}
                  </p>
                </div>
              </div>
              <div className="p-6 space-y-6">

                {/* ① 제품/자재명 */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">1</span>
                    제품/자재명 <span className="font-normal normal-case text-red-400">필수</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="예: SS400 강판 6T × 1,000장, 건설 현장용&#10;예: 알루미늄 압출 프로파일 40×40, OEM 가능"
                    value={form.productDescription}
                    onChange={e => setForm({ ...form, productDescription: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 focus:border-[#0D1B2A] focus:ring-2 focus:ring-slate-100 focus:outline-none resize-none"
                  />
                </div>

                {/* ① 카테고리 (AI/1688 모드만) */}
                {activeSource !== 'wechat' && (
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-black">2</span>
                      건자재 카테고리 <span className="font-normal normal-case text-slate-400">선택</span>
                    </label>
                    <CategorySelector selected={selectedCategory} onSelect={handleCategorySelect} />
                  </div>
                )}

                {/* ③ 수량 + 예산 */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">2</span>
                      필요 수량
                    </label>
                    <input
                      type="text"
                      placeholder="예: 1,000장 / 500개"
                      value={form.quantity}
                      onChange={e => setForm({ ...form, quantity: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 focus:border-[#0D1B2A] focus:ring-2 focus:ring-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-black">3</span>
                      예산 범위 <span className="font-normal normal-case text-slate-400">선택</span>
                    </label>
                    <input
                      type="text"
                      placeholder="예: 개당 $10 이하"
                      value={form.budget}
                      onChange={e => setForm({ ...form, budget: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 focus:border-[#0D1B2A] focus:ring-2 focus:ring-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                {/* WeChat 모드일 때 힌트 표시 */}
                {activeSource === 'wechat' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs text-emerald-700">
                    <p className="font-semibold mb-1">WeChat 탐색 방법</p>
                    <p>제품명을 입력하면 Sogou 위챗 검색을 통해 공장 홍보 담당자가 직접 올린 실시간 가격·재고 정보를 탐색합니다. 중문 병기 시 정확도 향상 (예: 알루미늄 프로파일 铝合金型材)</p>
                  </div>
                )}

                {/* ④ 원산지 선호 (WeChat 모드에서는 숨김) */}
                {activeSource !== 'wechat' && (
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">4</span>
                      원산지 선호
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                      {COUNTRY_OPTIONS.map(c => (
                        <button key={c.value} onClick={() => setForm({ ...form, countryPreference: c.value })}
                          className={`min-h-[44px] py-2.5 px-2 rounded-xl border text-center transition-all ${form.countryPreference === c.value ? 'bg-[#0D1B2A] border-[#0D1B2A] text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <p className="text-xs font-semibold">{c.label}</p>
                          <p className={`text-xs mt-0.5 ${form.countryPreference === c.value ? 'text-slate-300' : 'text-slate-400'}`}>{c.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ⑤ 발주 주기 (WeChat 모드에서는 숨김) */}
                {activeSource !== 'wechat' && (
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">5</span>
                      발주 주기
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {FREQUENCY_OPTIONS.map(f => (
                        <button key={f.value} onClick={() => setForm({ ...form, orderFrequency: f.value })}
                          className={`min-h-[44px] py-3 px-3 rounded-xl border text-center transition-all ${form.orderFrequency === f.value ? 'bg-[#0D1B2A] border-[#0D1B2A] text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <p className="text-xs font-semibold">{f.label}</p>
                          <p className={`text-xs mt-0.5 ${form.orderFrequency === f.value ? 'text-slate-300' : 'text-slate-400'}`}>{f.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={handleGenerate} disabled={loading}
                  className="w-full min-h-[44px] py-4 rounded-xl font-bold text-sm transition-all bg-[#EA580C] text-white hover:bg-[#DC4C00] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{LOADING_MESSAGES[activeSource][loadingMsg]}</>
                    : credits > 0
                      ? <>
                          <Icon.Search className="w-4 h-4" />
                          {activeSource === 'ai' && '공급자 탐색 · AI 신뢰도 분석 시작'}
                          {activeSource === '1688' && '1688 공장직거래 탐색 시작'}
                          {activeSource === 'wechat' && 'WeChat 공장 홍보 정보 탐색'}
                        </>
                      : <><Icon.Zap className="w-4 h-4" />크레딧 충전 후 분석하기</>
                  }
                </button>

                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <Icon.AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">AI 분석은 참고용입니다. 최종 거래 결정은 반드시 직접 확인 후 진행하세요. 특정 공급자를 보증하지 않습니다.</p>
                </div>
              </div>
            </div>

            {/* 결과 패널 */}
            <div ref={resultRef}>
              {/* WeChat 결과 */}
              {wechatResult && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Icon.Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-bold text-[#0D1B2A] text-sm">WeChat 공장 정보 분석 완료</span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full ml-auto">Sogou 위챗 검색</span>
                    </div>
                    <p className="text-xs text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 leading-relaxed">{wechatResult.analysis}</p>
                  </div>

                  {wechatResult.posts.map((post, i) => (
                    <WeChatCard key={i} post={post} />
                  ))}

                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <p className="text-xs text-amber-800 leading-relaxed">{wechatResult.disclaimer}</p>
                  </div>
                </div>
              )}

              {error && !loading ? (
                <EmptyState type="error" errorMessage={error} onRetry={handleRetry} />
              ) : noResults && !loading ? (
                <EmptyState type="no_results" />
              ) : result ? (
                <div className="space-y-4">
                  {/* 상태 + 그라운딩 뱃지 */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Icon.Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-bold text-[#0D1B2A] text-sm">소싱 분석 완료</span>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${result.groundingUsed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {result.groundingUsed ? '실시간 웹 검색 기반' : 'AI 지식 기반 분석'}
                      </span>
                      <ExportButton suppliers={result.suppliers} keyword={form.productDescription} />
                    </div>
                    <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">{result.recommendation}</p>
                  </div>

                  {/* 공급자 카드 리스트 */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                      <Icon.Globe className="w-4 h-4 text-slate-400" />
                      <p className="text-sm font-bold text-[#0D1B2A]">추천 공급자 {result.suppliers.length}개</p>
                    </div>
                    {result.suppliers.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {result.suppliers.map(s => (
                          <SupplierRow
                            key={s.rank}
                            supplier={s}
                            isSelected={selectedSupplier?.rank === s.rank}
                            onClick={() => setSelectedSupplier(s)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-4">
                        <EmptyState type="no_results" />
                      </div>
                    )}
                  </div>

                  {/* 선택 공급자 상세 */}
                  {selectedSupplier && (
                    <SupplierDetail supplier={selectedSupplier} />
                  )}

                  {/* RFQ 이메일 */}
                  <RFQComposer rfqEmail={result.rfqEmail} />

                  {/* PDF 출력 */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon.Printer className="w-4 h-4 text-slate-400" />
                      <p className="text-sm font-bold text-[#0D1B2A]">소싱 리포트 PDF 저장</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">회사명</label>
                        <input type="text" placeholder="(주)한국건설" value={companyName} onChange={e => setCompanyName(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-[#0D1B2A] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">분석일자</label>
                        <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-[#0D1B2A] focus:outline-none" />
                      </div>
                    </div>
                    <button onClick={handlePrintReport}
                      className="w-full py-2.5 rounded-xl bg-[#0D1B2A] text-white font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5">
                      <Icon.Download className="w-3.5 h-3.5" />소싱 리포트 PDF 저장 (공급자 비교표 포함)
                    </button>
                  </div>
                </div>
              ) : (
                !wechatResult && <EmptyState type="initial" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 요금제 ── */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">요금제</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">규모에 맞는 플랜을 선택하세요</h2>
            <p className="text-sm text-slate-500">1회 = 공급자 3~5개 탐색 + 신뢰도 분석 + RFQ 이메일 + PDF 리포트</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: '스타터', tag: '소규모 발주',
                price: '19만원', unit: '/ 월',
                per: '분석 20회/월',
                features: ['공급자 탐색 3~5개', 'KS인증 자동 매칭', '도착가 자동 계산', 'RFQ 이메일 자동화', 'PDF 리포트 저장'],
                highlight: false,
              }, {
                name: '프로', tag: '가장 인기',
                price: '49만원', unit: '/ 월',
                per: '무제한 분석',
                features: ['무제한 소싱 분석', 'KS인증·관세 자동 매칭', '세금계산서 발행 결제', '한국어 의사결정 PDF', '한국어 AS 채널'],
                highlight: true,
              }, {
                name: '팀', tag: '기업용',
                price: '99만원', unit: '/ 월',
                per: '5계정 공유',
                features: ['5계정 공유', '현장별 분류 관리', '전담 전화·카카오 지원', '하자 분쟁 중재', '세금계산서 발행'],
                highlight: false,
              },
            ].map(plan => (
              <div key={plan.name} className={`rounded-2xl border p-6 flex flex-col relative ${plan.highlight ? 'bg-[#0D1B2A] border-[#0D1B2A]' : 'bg-white border-slate-200'}`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#EA580C] text-white text-xs font-bold px-3 py-1 rounded-full">가장 인기</span>
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
                        <Icon.Check className={`w-2.5 h-2.5 ${plan.highlight ? 'text-white' : 'text-[#0D1B2A]'}`} />
                      </div>
                      <span className={`text-xs ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={`mailto:like2buyglobal@gmail.com?subject=GloSource AI ${plan.name} 플랜 문의`}
                  className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.highlight ? 'bg-white text-[#0D1B2A] hover:bg-slate-100' : 'bg-[#0D1B2A] text-white hover:bg-slate-800'}`}>
                  도입 문의하기
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-8">세금계산서 발행 가능 · 문의: like2buyglobal@gmail.com · 평일 09:00–18:00</p>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="bg-[#0D1B2A] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                  <Icon.Globe className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">GloSource AI</span>
              </div>
              <p className="text-xs text-slate-400 max-w-xs">한국 건설업계 전용 해외 자재 직소싱 AI. KS인증·관세·세금계산서까지 자동화합니다.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">© 2026 GloSource AI. All rights reserved.</p>
              <p className="text-xs text-slate-500 mt-1">like2buyglobal@gmail.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
