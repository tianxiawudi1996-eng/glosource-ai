'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import CategorySelector from './components/CategorySelector';
import EmptyState from './components/EmptyState';
import ExportButton from './lib/CsvExportButton';
import WaitlistBanner from './components/WaitlistBanner';
import ShareButton from './components/ShareButton';
import UpgradeModal from './components/UpgradeModal';
import TrustCredibility from './components/TrustCredibility';
import WeChatCard from './components/WeChatCard';
import HeroSection from './components/HeroSection';
import { SupplierComparisonTable, SupplierDetail } from './components/SupplierCard';
import RFQComposer from './components/RFQComposer';
import { Icon } from './components/icons';
import type { Category } from './lib/categories';
import type { SourcingRequest, SourcingOutput, Supplier, CountryPreference, OrderFrequency, WeChatSourcingOutput } from './api/source/types';
import { trackSearch } from '@/app/lib/analytics';

type SourceMode = 'ai' | '1688' | 'wechat' | 'image';

interface ImageAnalysis {
  productNameKo: string;
  productNameEn: string;
  productNameZh: string;
  specs: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  searchQuery: string;
}

/* ══════════════════════════════════════════════
   상수
══════════════════════════════════════════════ */
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
  { value: 'china', label: '중국', desc: '1688·Alibaba 직접 탐색' },
  { value: 'korea', label: '한국', desc: 'EC21·BuyKorea·tradeKorea' },
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
  image: [
    '이미지 제품 식별 완료...',
    '1688.com 원가 탐색 중...',
    'Alibaba 공급자 검색 중...',
    '공급자 신뢰도 분석 중...',
    'RFQ 이메일 초안 작성 중...',
    '소싱 리포트 생성 중...',
  ],
};

/* ══════════════════════════════════════════════
   신뢰도 점수 → 색상
══════════════════════════════════════════════ */
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
    <p class="sub">GloSource AI · <span class="grounding">검증 URL 기반 공급자 후보</span></p>
    <div class="meta">
      <div class="mr"><span class="ml">회사명</span><span>${co}</span></div>
      <div class="mr"><span class="ml">분석일</span><span>${dt}</span></div>
      <div class="mr"><span class="ml">소싱 품목</span><span>${req.productDescription}</span></div>
      <div class="mr"><span class="ml">필요 수량</span><span>${req.quantity}</span></div>
      ${req.budget ? `<div class="mr"><span class="ml">예산</span><span>${req.budget}</span></div>` : ''}
    </div>
    <div class="section"><div class="sh">공급자 비교표</div>${suppliersTable}</div>
    <div class="section"><div class="sh">AI 최종 추천</div><div class="rec">${result.recommendation}</div></div>
    <p class="dis">${result.disclaimer} | GloSource AI · glosourceai@gmail.com</p>
    <script>window.onload=()=>window.print();</script>
  </body></html>`;
}

/* ══════════════════════════════════════════════
   메인 컴포넌트
══════════════════════════════════════════════ */
export default function HomePage() {
  const { data: session } = useSession();
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
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeSource, setActiveSource] = useState<SourceMode>('ai');
  const [wechatResult, setWechatResult] = useState<WeChatSourcingOutput | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [imageAnalyzing, setImageAnalyzing] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/history/me')
        .then(r => r.ok ? r.json() : null)
        .then((json: { success: boolean; data: { product: string | null }[] } | null) => {
          if (!json?.success) return;
          const products = json.data
            .map(d => d.product)
            .filter((p): p is string => !!p && p.trim().length > 0);
          const unique = [...new Set(products)].slice(0, 5);
          setRecentSearches(unique);
        })
        .catch(() => {});
    }
  }, [session?.user]);


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

  const handleGenerate = async () => {
    if (activeSource === 'image' && !imageAnalysis) { setError('먼저 제품 이미지를 업로드해주세요.'); return; }
    if (!form.productDescription.trim()) { setError('제품/자재명을 입력해주세요.'); return; }
    if (activeSource !== 'wechat' && activeSource !== 'image' && !form.quantity.trim()) { setError('필요 수량을 입력해주세요.'); return; }
    if (activeSource === 'image' && !form.quantity.trim()) { setError('필요 수량을 입력해주세요.'); return; }

    startLoading();

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

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
        if (json.error === 'quota_exceeded' || json.error === 'subscription_required') { stopLoading(); setShowPaywall(true); return; }
        if (!res.ok) throw new Error(json.message || json.error || '오류가 발생했습니다.');
        setWechatResult(json.data as WeChatSourcingOutput);
        trackSearch({ source: 'wechat' });
        saveToHistory({ timestamp: new Date().toISOString(), source: 'wechat', query: { keyword: form.productDescription }, status: res.status, raw: json });
      } else {
        const apiPath = activeSource === '1688' ? '/api/source/factory-direct' : '/api/source';
        const res = await fetch(apiPath, {
          method: 'POST',
          headers,
          body: JSON.stringify(form),
        });
        const json = await safeJson(res);
        if (json.error === 'quota_exceeded' || json.error === 'subscription_required') { stopLoading(); setShowPaywall(true); return; }
        if (!res.ok) throw new Error(json.error || '오류가 발생했습니다.');
        const data = json.data as SourcingOutput;
        setResult(data);
        setSelectedSupplier(data.suppliers[0] ?? null);
        trackSearch({ source: activeSource, country: form.countryPreference, results: data.suppliers?.length ?? 0 });
        saveToHistory({ timestamp: new Date().toISOString(), source: activeSource, query: { productDescription: form.productDescription, quantity: form.quantity }, status: res.status, raw: json });
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      const message = e instanceof Error ? e.message : '알 수 없는 오류';
      if (message.includes('찾지 못했습니다') || message.includes('검증 품질 기준')) {
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

  const handleImageFile = async (file: File) => {
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setImageAnalysis(null);
    setImageAnalyzing(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/source/image-analyze', { method: 'POST', body: fd });
      const json = await res.json() as { success?: boolean; data?: ImageAnalysis; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? '이미지 분석 실패');
      setImageAnalysis(json.data);
      const productDescription = [json.data!.productNameKo, json.data!.specs].filter(Boolean).join(' ');
      setForm(f => ({ ...f, productDescription, quantity: f.quantity || '1개' }));

      // 이미지 분석 완료 즉시 자동 소싱 시작 (2단계 → 1단계 통합)
      setImageAnalyzing(false);
      await handleGenerateWithProduct(productDescription);
      return;
    } catch (e) {
      setError(e instanceof Error ? e.message : '이미지 분석 중 오류가 발생했습니다.');
      setImageFile(null);
      setImagePreviewUrl(null);
    } finally {
      setImageAnalyzing(false);
    }
  };

  const handleGenerateWithProduct = async (productDescription: string) => {
    const currentForm: SourcingRequest = {
      productDescription,
      quantity: form.quantity || '1개',
      budget: form.budget,
      countryPreference: form.countryPreference,
      orderFrequency: form.orderFrequency,
      categoryCode: form.categoryCode,
      categoryNameZh: form.categoryNameZh,
      quantityUnit: form.quantityUnit,
    };
    startLoading();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const res = await fetch('/api/source', { method: 'POST', headers, body: JSON.stringify(currentForm) });
      const json = await res.json() as { success?: boolean; data?: SourcingOutput; error?: string; message?: string };
      if (json.error === 'quota_exceeded' || json.error === 'subscription_required') { stopLoading(); setShowPaywall(true); return; }
      if (!res.ok) throw new Error(json.message || json.error || '오류가 발생했습니다.');
      const data = json.data as SourcingOutput;
      setResult(data);
      setSelectedSupplier(data.suppliers[0] ?? null);
      trackSearch({ source: 'image', country: form.countryPreference, results: data.suppliers?.length ?? 0 });
      saveToHistory({ timestamp: new Date().toISOString(), source: 'image', query: { productDescription, quantity: currentForm.quantity }, status: res.status, raw: json });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      const message = e instanceof Error ? e.message : '알 수 없는 오류';
      if (message.includes('찾지 못했습니다') || message.includes('검증 품질 기준')) { setNoResults(true); setError(''); }
      else setError(message);
    } finally {
      stopLoading();
    }
  };

  const handleImageReset = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setImageAnalysis(null);
    setForm(f => ({ ...f, productDescription: '' }));
    if (imageInputRef.current) imageInputRef.current.value = '';
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

      {/* ── 업그레이드 모달 ── */}
      {showPaywall && <UpgradeModal onClose={() => setShowPaywall(false)} />}

      {/* ── 네비게이션 ── */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* 로고 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-[#0D1B2A] rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon.Globe className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-[#0D1B2A] tracking-tight text-sm sm:text-base">GloSource AI</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2">AI 글로벌 소싱 에이전트</span>
            </div>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <TrustCredibility lang="ko" tone="light" />

            {session?.user ? (
              <>
                {/* 플랜 뱃지 */}
                <span className="hidden sm:inline-flex text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-full capitalize">
                  {session.user.plan ?? 'free'}
                </span>
                {/* 대시보드 */}
                <a
                  href="/dashboard"
                  className="min-h-[44px] flex items-center px-3 py-2 text-xs font-bold text-[#0D1B2A] rounded-lg hover:bg-slate-50 hover:text-[#EA580C] transition-colors"
                >
                  대시보드
                </a>
                {/* 계정 */}
                <a
                  href="/account"
                  className="min-h-[44px] hidden sm:flex items-center px-3 py-2 text-xs font-bold text-slate-500 rounded-lg hover:bg-slate-50 hover:text-[#0D1B2A] transition-colors"
                >
                  계정
                </a>
                {/* 로그아웃 */}
                <button
                  type="button"
                  onClick={() => void signOut({ callbackUrl: '/' })}
                  className="min-h-[44px] hidden md:flex items-center px-3 py-2 text-xs font-bold text-slate-400 rounded-lg hover:bg-slate-50 hover:text-red-500 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <span className="hidden sm:inline-flex text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full">무료 5회 체험</span>
                <a
                  href="/auth/login"
                  className="min-h-[44px] flex items-center px-3 py-2 text-xs font-bold text-[#0D1B2A] border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  로그인
                </a>
                <a
                  href="/auth/register"
                  className="min-h-[44px] hidden sm:flex items-center px-4 py-2 text-xs font-bold bg-[#EA580C] text-white rounded-lg hover:bg-[#DC4C00] transition-colors"
                >
                  무료 시작
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── 히어로 ── */}
      <HeroSection lang="ko" />

      {/* ── 베타 웨이트리스트 배너 ── */}
      <section className="max-w-2xl mx-auto w-full px-6 py-4">
        <WaitlistBanner />
      </section>

      {/* ── 신뢰 배지 바 ── */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap shrink-0">분석 대상 소싱 채널</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {(['1688.com 诚信通', 'Baidu 爱采购', 'Made-in-China · Global Sources', 'WeChat 公众号'] as const).map(name => (
                <span key={name} className="border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-50">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ROI 스트립 ── */}
      <section className="bg-[#0D1B2A] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:divide-x sm:divide-white/10">
            {[
              { before: '수동 검색', after: '~90초', label: '공급자 후보 3~5개 확보까지 (AI 보조)' },
              { before: '5개+ 탭', after: '검색 1번', label: '1688 · Alibaba · WeChat 동시 탐색' },
              { before: '직접 작성', after: '자동 생성', label: '영문·중문 RFQ 초안 즉시 준비' },
            ].map(({ before, after, label }) => (
              <div key={label} className="flex items-center gap-4 sm:px-6 first:pl-0 last:pr-0">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 text-sm font-semibold line-through">{before}</span>
                  <svg className="w-4 h-4 text-[#EA580C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-white text-sm font-black">{after}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 채널 맵 ── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Channel Intelligence</p>
              <h2 className="text-2xl font-black leading-tight text-[#0D1B2A]">현지 채널과 글로벌 채널을 분리해서 비교합니다</h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-slate-500">
              중국 내수 플랫폼의 가격 신호와 외국인 선호 플랫폼의 거래 조건을 함께 비교해, 발주 전 후보군을 좁히는 데 집중합니다.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_260px_1fr]">
              <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#0D1B2A]">중국 현지 채널</h3>
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-[#EA580C]">가격 신호</span>
                </div>
                <div className="space-y-3">
                  {[
                    ['1688.com 诚信通', '공장가, MOQ, 청신통 연한 확인'],
                    ['Baidu 爱采购', '중국어 검색 기반 공급자 후보'],
                    ['供应商网 · 慧聪网', '현지 B2B 디렉터리 보조 확인'],
                    ['WeChat 公众号', '공장 홍보글과 연락 힌트 확인'],
                  ].map(([title, desc]) => (
                    <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-bold text-[#0D1B2A]">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 border-y border-slate-200 bg-[#0D1B2A] p-6 text-white lg:border-x lg:border-y-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <Icon.Search className="h-7 w-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-base font-black">GloSource AI 매칭</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">후보 수집 · 리스크 정리 · RFQ 질문 생성</p>
                </div>
                <div className="grid w-full grid-cols-3 gap-2 text-center">
                  {['검색', '비교', '질문'].map(step => (
                    <span key={step} className="rounded-lg bg-white/10 px-2 py-2 text-[11px] font-bold text-slate-200">
                      {step}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#0D1B2A]">글로벌 수출 채널</h3>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">수출 조건</span>
                </div>
                <div className="space-y-3">
                  {[
                    ['Alibaba.com', '수출 대응, MOQ, Trade Assurance 참고'],
                    ['Made-in-China', 'Audited Supplier와 인증 키워드 확인'],
                    ['Global Sources', '수출형 공급자와 카테고리 후보'],
                    ['직접 RFQ', '영문·중문 문의 초안으로 직접 확인'],
                  ].map(([title, desc]) => (
                    <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-bold text-[#0D1B2A]">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs leading-relaxed text-slate-500">
              위 다이어그램은 실제 GloSource AI가 비교 대상으로 삼는 채널 구조를 설명한 것입니다. 특정 공급자나 거래 성사율을 보증하지 않습니다.
            </div>
          </div>
        </div>
      </section>

      {/* ── 전문 소싱 운영 범위 ── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Sourcing Match Desk</p>
              <h2 className="text-2xl font-black text-[#0D1B2A] leading-tight mb-4">
                발주 전 공급자 매칭과 검증 판단을 빠르게 만듭니다
              </h2>
              <p className="text-sm leading-relaxed text-slate-500 mb-6 max-w-xl">
                전문 소싱사는 가격표만 보지 않습니다. 사양 일치, 공급자 실체, MOQ, 리드타임, 인증 근거를 먼저 비교합니다.
                GloSource AI는 이 중간 판단 자료를 리포트와 RFQ 형태로 정리해, 사용자가 직접 거래를 이어갈 수 있게 돕습니다.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { title: 'Cost Signal View', desc: '공장가, MOQ, 리드타임, 가격 이상치를 후보별로 비교' },
                  { title: 'Supplier Reality Check', desc: '1688 诚信通, 플랫폼 이력, 레드플래그를 신뢰도 점수화' },
                  { title: 'Spec & Certification Fit', desc: 'KS인증, 자재 규격, 현장 적용 조건을 의사결정 메모로 정리' },
                  { title: 'RFQ Matching Kit', desc: '영문·중문 RFQ와 공급자에게 확인할 질문 리스트를 생성' },
                ].map(item => (
                  <div key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-[#0D1B2A] mb-1">{item.title}</p>
                    <p className="text-xs leading-relaxed text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[300px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
              <Image
                src="/images/glosource-sourcing-workspace.png"
                alt="건설 자재 소싱 분석 워크스페이스"
                fill
                sizes="(min-width: 1024px) 520px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl font-black leading-tight text-[#0D1B2A]">3단계로 완성되는 소싱 워크플로우</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: '제품명 입력',
                desc: '한국어·영어·중문 모두 지원. AI가 1688 최적화 중문 검색어로 자동 번역합니다.',
                image: '/images/workflow-product-input.png',
                imageAlt: '제품명 입력과 중국 소싱 키워드 변환 화면',
                icon: (
                  <svg className="w-5 h-5 text-[#0D1B2A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'AI 공급자 분석',
                desc: '신뢰도 0~100점 자동 채점. 예상 단가·MOQ·리드타임·KS인증 참고 여부까지 한 번에 추출합니다.',
                image: '/images/workflow-supplier-analysis.png',
                imageAlt: 'AI 공급자 신뢰도 분석 대시보드',
                icon: (
                  <svg className="w-5 h-5 text-[#0D1B2A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'RFQ 매칭 준비',
                desc: '영문·중문 RFQ와 공급자에게 확인할 질문을 자동 생성합니다. 이후 거래 실행은 사용자가 직접 결정합니다.',
                image: '/images/workflow-rfq-match.png',
                imageAlt: 'RFQ 문서와 공급자 질문 리스트 준비 화면',
                icon: (
                  <svg className="w-5 h-5 text-[#0D1B2A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                ),
              },
            ].map(item => (
              <div key={item.step} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-36 bg-slate-100 sm:h-40">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 768px) 320px, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/45 to-transparent" />
                  <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D1B2A] text-sm font-black text-white shadow-lg">
                    {item.step}
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                    {item.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-black leading-tight text-[#0D1B2A]">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 메인 툴 ── */}
      <section id="sourcing-tool" className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Sourcing Intelligence</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] leading-tight mb-2">가격 검색이 아니라, 거래 리스크까지 보는 소싱 워크플로우</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">공급자 탐색부터 RFQ 전송까지 — 발주 전 판단 자료를 한 화면에서</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">

            {/* 입력 폼 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              {/* 소스 탭 */}
              <div className="flex overflow-x-auto scrollbar-none border-b border-slate-100">
                {([
                  { id: 'ai'     as SourceMode, label: 'AI 종합',    badge: '1688+Alibaba+WeChat' },
                  { id: '1688'   as SourceMode, label: '1688 직거래',  badge: '원가 30~50% 절감' },
                  { id: 'wechat' as SourceMode, label: 'WeChat',      badge: '공장 홍보 직접 탐색' },
                  { id: 'image'  as SourceMode, label: '사진 검색',   badge: 'AI 이미지 매칭' },
                ] as const).map(tab => (
                  <button key={tab.id} onClick={() => { setActiveSource(tab.id); setResult(null); setWechatResult(null); setError(''); setNoResults(false); }}
                    className={`flex-none min-w-[80px] sm:flex-1 py-3 px-2 sm:px-1 text-center transition-all border-b-2 min-h-[52px] ${activeSource === tab.id ? 'border-[#EA580C] bg-orange-50/30' : 'border-transparent hover:bg-slate-50'}`}>
                    <p className={`text-xs font-bold whitespace-nowrap ${activeSource === tab.id ? 'text-[#0D1B2A]' : 'text-slate-400'}`}>{tab.label}</p>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5 hidden sm:block truncate">{tab.badge}</p>
                  </button>
                ))}
              </div>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  {activeSource === 'wechat' ? <Icon.Globe className="w-4 h-4 text-slate-500" /> : <Icon.Settings className="w-4 h-4 text-slate-500" />}
                </div>
                <div>
                  <p className="font-bold text-[#0D1B2A] text-sm">
                    {activeSource === 'ai' ? '소싱 조건 설정' : activeSource === '1688' ? '1688 공장직거래 검색' : activeSource === 'wechat' ? 'WeChat 공장 홍보 탐색' : 'AI 이미지 매칭 소싱'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {activeSource === 'ai' ? '5가지 항목 입력 후 AI 종합 분석' : activeSource === '1688' ? '1688.com 원가 + 诚信通 신뢰도 분석' : activeSource === 'wechat' ? '微信公众号 공장 홍보 담당자 포스팅 탐색' : '제품 사진 업로드 → AI가 제품 식별 → 자동 소싱'}
                  </p>
                </div>
              </div>
              <div className="p-6 space-y-6">

                {/* ── 이미지 업로드 (image 모드) ── */}
                {activeSource === 'image' && (
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">1</span>
                      제품 사진 업로드 <span className="font-normal normal-case text-red-400">필수</span>
                    </label>

                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) void handleImageFile(f); }}
                    />

                    {!imageFile ? (
                      <div
                        onDragOver={e => { e.preventDefault(); setImageDragOver(true); }}
                        onDragLeave={() => setImageDragOver(false)}
                        onDrop={e => { e.preventDefault(); setImageDragOver(false); const f = e.dataTransfer.files[0]; if (f) void handleImageFile(f); }}
                        onClick={() => imageInputRef.current?.click()}
                        className={`cursor-pointer border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors ${imageDragOver ? 'border-[#EA580C] bg-orange-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white'}`}
                      >
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-600">클릭하거나 사진을 드래그하세요</p>
                          <p className="text-xs text-slate-400 mt-1">JPEG · PNG · WebP · 최대 10MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 overflow-hidden">
                        {/* 이미지 프리뷰 */}
                        <div className="relative h-40 bg-slate-100">
                          {imagePreviewUrl && (
                            <Image src={imagePreviewUrl} alt="업로드된 제품 이미지" fill className="object-contain" />
                          )}
                          {imageAnalyzing && (
                            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                              <div className="w-6 h-6 border-2 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
                              <p className="text-xs font-semibold text-slate-600">AI가 제품을 분석하는 중...</p>
                            </div>
                          )}
                        </div>

                        {/* 분석 결과 카드 */}
                        {imageAnalysis && (
                          <div className="p-4 bg-white border-t border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                </div>
                                <span className="text-xs font-bold text-[#0D1B2A]">제품 인식 완료</span>
                              </div>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${imageAnalysis.confidence === 'high' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : imageAnalysis.confidence === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                {imageAnalysis.confidence === 'high' ? '높은 신뢰도' : imageAnalysis.confidence === 'medium' ? '보통 신뢰도' : '낮은 신뢰도'}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex gap-2"><span className="text-slate-400 w-12 shrink-0">한국어</span><span className="font-semibold text-[#0D1B2A]">{imageAnalysis.productNameKo}</span></div>
                              {imageAnalysis.productNameEn && <div className="flex gap-2"><span className="text-slate-400 w-12 shrink-0">English</span><span className="text-slate-600">{imageAnalysis.productNameEn}</span></div>}
                              {imageAnalysis.productNameZh && <div className="flex gap-2"><span className="text-slate-400 w-12 shrink-0">中文</span><span className="text-slate-600">{imageAnalysis.productNameZh}</span></div>}
                              {imageAnalysis.specs && <div className="flex gap-2"><span className="text-slate-400 w-12 shrink-0">규격</span><span className="text-slate-600">{imageAnalysis.specs}</span></div>}
                              {imageAnalysis.category && <div className="flex gap-2"><span className="text-slate-400 w-12 shrink-0">카테고리</span><span className="text-slate-500">{imageAnalysis.category}</span></div>}
                            </div>
                          </div>
                        )}

                        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-end">
                          <button onClick={handleImageReset} className="text-xs text-slate-400 hover:text-slate-600 underline">다른 이미지로 변경</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ① 제품/자재명 */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">{activeSource === 'image' ? '2' : '1'}</span>
                    {activeSource === 'image' ? '인식된 제품명 (수정 가능)' : '제품/자재명'} <span className="font-normal normal-case text-red-400">필수</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="예: SS400 강판 6T × 1,000장, 건설 현장용&#10;예: 알루미늄 압출 프로파일 40×40, OEM 가능"
                    value={form.productDescription}
                    onChange={e => setForm({ ...form, productDescription: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 focus:border-[#0D1B2A] focus:ring-2 focus:ring-slate-100 focus:outline-none resize-none"
                  />
                  {recentSearches.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 self-center">최근:</span>
                      {recentSearches.map(q => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, productDescription: q }))}
                          className="text-[11px] px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors truncate max-w-[160px]"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
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
                      <span className="ml-1 bg-slate-100 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-normal">현재 중국 집중 서비스</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
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
                    : <>
                        <Icon.Search className="w-4 h-4" />
                        {activeSource === 'ai' && '공급자 탐색 · AI 신뢰도 분석 시작'}
                        {activeSource === '1688' && '1688 공장직거래 탐색 시작'}
                        {activeSource === 'wechat' && 'WeChat 공장 홍보 정보 탐색'}
                        {activeSource === 'image' && (imageAnalysis ? '이미지 매칭 공급자 탐색 시작' : '이미지를 먼저 업로드해주세요')}
                      </>
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
                    {wechatResult.translatedKeyword && (
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs text-orange-700">
                        <span className="font-semibold">중국어 검색어</span>
                        <span>{wechatResult.translatedKeyword}</span>
                      </div>
                    )}
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
                <EmptyState type="error" errorMessage={error} onRetry={handleRetry} lang="ko" />
              ) : noResults && !loading ? (
                <EmptyState type="no_results" lang="ko" />
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
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                        검증 URL 통과 {result.qualityGate ? `${result.qualityGate.acceptedCount}개` : ''}
                      </span>
                      <ExportButton suppliers={result.suppliers} keyword={form.productDescription} />
                      <ShareButton keyword={form.productDescription} supplierCount={result.suppliers.length} />
                    </div>
                    <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">{result.recommendation}</p>
                  </div>

                  {result.suppliers.length > 0 ? (
                    <SupplierComparisonTable
                      suppliers={result.suppliers}
                      selectedRank={selectedSupplier?.rank}
                      onSelect={setSelectedSupplier}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                      <EmptyState type="no_results" lang="ko" />
                    </div>
                  )}

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
                !wechatResult && <EmptyState type="initial" lang="ko" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 발주 전 판단 항목 ── */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Decision Checklist</p>
            <h2 className="text-3xl font-black leading-tight text-[#0D1B2A]">GloSource AI가 확인하는 발주 전 판단 항목</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              거래를 대신 보증하지 않고, 사용자가 직접 판단해야 할 핵심 질문을 구조화합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['사업자/플랫폼 이력', '1688 诚信通, 플랫폼 활동 흔적, 업체명 일관성을 확인합니다.'],
              ['MOQ/단가 이상치', '동일 품목 대비 지나치게 낮거나 높은 조건을 리스크 신호로 분류합니다.'],
              ['인증/규격 키워드', 'KS, CE, RoHS, ISO 등 품목별 확인 키워드를 RFQ 질문에 반영합니다.'],
              ['중문 검색 적합도', '한국어 제품명을 현지 구매자가 쓰는 중국어 검색어로 변환합니다.'],
              ['RFQ 확인 질문', '가격, 샘플, 포장, 리드타임, 결제조건 질문을 자동 정리합니다.'],
              ['직접 검증 필요 항목', '계약, 결제, 샘플, 공장 실사는 사용자가 직접 확인해야 할 항목으로 분리합니다.'],
            ].map(([title, desc], idx) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0D1B2A] text-xs font-black text-white">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 className="mb-2 text-base font-black text-[#0D1B2A]">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 활용 사례 시뮬레이션 ── */}
      <section className="bg-[#0D1B2A]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Use Cases</p>
            <h2 className="text-3xl font-black leading-tight text-white">실제 소싱 시뮬레이션</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
              GloSource AI가 실제 건자재·산업재 품목에서 어떤 결과를 도출했는지 확인하세요.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                tag: '철강',
                product: 'SD400 D16 철근 50ton',
                suppliers: 4,
                priceRange: '¥3,200~3,850/ton',
                saving: 'Alibaba 대비 ~38% 절감',
                moq: '20ton',
                highlight: '诚信通 인증 공장 3개소, 韩国 수출 경험 포함',
              },
              {
                tag: '알루미늄',
                product: '알루미늄 커튼월 프레임 6063-T5',
                suppliers: 3,
                priceRange: '¥28~41/kg',
                saving: '국내 수입 대비 ~45% 절감',
                moq: '500kg',
                highlight: 'OEM 가능 2개소, CE 인증 1개소',
              },
              {
                tag: '스마트팩토리',
                product: '협동로봇 6축 UR10e 동급',
                suppliers: 5,
                priceRange: '¥58,000~72,000/대',
                saving: '유럽 브랜드 대비 ~52% 절감',
                moq: '1대',
                highlight: 'ISO 10218 인증 후보 2개사, 한국 A/S 파트너십 보유',
              },
            ].map(({ tag, product, suppliers, priceRange, saving, moq, highlight }) => (
              <div key={tag} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <span className="inline-block rounded-full border border-[#EA580C]/40 bg-[#EA580C]/10 px-3 py-1 text-xs font-bold text-[#EA580C] mb-4">
                  {tag}
                </span>
                <p className="text-xs text-slate-400 mb-1">검색어</p>
                <h3 className="text-base font-black text-white mb-5 leading-snug">{product}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">발굴 공급자</span>
                    <span className="font-bold text-white">{suppliers}개사</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">가격 범위</span>
                    <span className="font-bold text-white">{priceRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">최소 발주</span>
                    <span className="font-bold text-white">{moq}</span>
                  </div>
                  <div className="rounded-lg bg-[#EA580C]/10 px-3 py-2 text-xs text-[#EA580C] font-semibold">
                    {saving}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{highlight}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-slate-500">
            * 위 수치는 GloSource AI 탐색 시뮬레이션 결과이며 실제 거래 조건은 공급자와 직접 협의 후 확정됩니다.
          </p>
        </div>
      </section>

      {/* ── 결과물 미리보기 ── */}
      <section className="bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Deliverables</p>
            <h2 className="text-3xl font-black leading-tight text-[#0D1B2A]">받게 되는 결과물</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
              공급자 후보를 단순 목록으로 끝내지 않고, 비교표와 RFQ 초안으로 바로 실행 가능한 판단 자료를 만듭니다.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h3 className="text-lg font-black text-[#0D1B2A]">공급자 후보 비교표</h3>
                <p className="mt-1 text-sm text-slate-500">실제 결과 화면과 같은 필드로 MOQ, 단가, 리드타임, 리스크, 확인 상태를 비교합니다.</p>
              </div>
              <div className="p-5">
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.7fr] bg-[#0D1B2A] text-[11px] font-bold text-white">
                    <div className="px-3 py-2">공급자</div>
                    <div className="px-3 py-2">MOQ</div>
                    <div className="px-3 py-2">예상 단가</div>
                    <div className="px-3 py-2">리스크</div>
                  </div>
                  {[
                    ['1688 후보 A', '500개', '¥45~60', '18/100'],
                    ['Baidu 후보 B', '1,000개', '문의 필요', '34/100'],
                    ['Alibaba 후보 C', '300개', 'USD 6~8', '42/100'],
                  ].map(([name, moq, price, risk], idx) => (
                    <div key={name} className={`grid grid-cols-[1.1fr_0.8fr_0.8fr_0.7fr] border-t border-slate-200 text-xs ${idx === 0 ? 'bg-orange-50/60' : 'bg-white'}`}>
                      <div className="px-3 py-3 font-bold text-[#0D1B2A]">{name}</div>
                      <div className="px-3 py-3 text-slate-600">{moq}</div>
                      <div className="px-3 py-3 text-slate-600">{price}</div>
                      <div className="px-3 py-3 font-bold text-emerald-700">{risk}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-400">분석 후 실제 공급자 데이터로 채워지는 화면 예시입니다.</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h3 className="text-lg font-black text-[#0D1B2A]">영문·중문 RFQ 초안</h3>
                <p className="mt-1 text-sm text-slate-500">공급자에게 확인해야 할 사양, 샘플, 포장, 결제조건 질문을 정리합니다.</p>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-[1fr_160px]">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-start justify-between border-b border-slate-200 pb-3">
                    <div>
                      <p className="text-lg font-black text-[#0D1B2A]">RFQ Draft</p>
                      <p className="text-xs text-slate-400">영어 / 중국어 탭 전환</p>
                    </div>
                    <span className="rounded-md bg-[#EA580C] px-2 py-1 text-[10px] font-black text-white">DRAFT</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-[76px_1fr] rounded border border-slate-200">
                      <span className="bg-slate-50 px-2 py-1.5 font-bold text-slate-500">Product</span>
                      <span className="px-2 py-1.5 text-slate-600">your product</span>
                    </div>
                    <div className="grid grid-cols-[76px_1fr] rounded border border-slate-200">
                      <span className="bg-slate-50 px-2 py-1.5 font-bold text-slate-500">Quantity</span>
                      <span className="px-2 py-1.5 text-slate-600">[수량]</span>
                    </div>
                    <div className="rounded bg-slate-50 p-3 leading-relaxed text-slate-500">
                      Unit price, MOQ, lead time, sample, certification, payment terms...
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-black text-[#0D1B2A]">확인 질문</p>
                  {['Certification', 'Sample', 'Packing', 'Payment', 'Lead Time'].map(item => (
                    <div key={item} className="mb-2 rounded bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-600">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 실제 사용 케이스 ── */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Use Cases</p>
            <h2 className="text-3xl font-black leading-tight text-[#0D1B2A]">이런 상황에서 사용합니다</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              발주 실행 전에 후보군과 확인 질문을 정리해야 할 때, 소싱 담당자의 첫 판단 자료로 활용합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              ['처음 중국 공급자를 찾을 때', '제품명은 있지만 어떤 중국어 키워드로 찾아야 할지 모를 때 후보 채널과 검색어를 정리합니다.'],
              ['기존 공급자 견적이 비싼지 확인할 때', 'MOQ, 단가, 리드타임을 다른 후보와 비교해 협상 전 기준점을 만듭니다.'],
              ['RFQ를 영어/중국어로 보내야 할 때', '사양, 샘플, 포장, 결제조건 질문을 영문·중문 초안으로 빠르게 정리합니다.'],
              ['발주 전 판단 자료가 필요할 때', '거래 실행 전에 후보군, 리스크 신호, 직접 확인해야 할 항목을 분리합니다.'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-2 text-lg font-black text-[#0D1B2A]">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 요금제 ── */}
      <section id="pricing" className="bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">요금제</p>
              <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">규모에 맞는 플랜을 선택하세요</h2>
              <p className="text-sm leading-relaxed text-slate-500 mb-2">
                1회 = 공급자 후보 3~5개 탐색 + 리스크 분석 + RFQ 질문 리스트 + PDF 리포트.
                GloSource AI는 거래 실행, 납품, 결제, 물류를 대행하지 않습니다.
              </p>
              <p className="text-xs text-slate-400 mb-4">한국 바이어 전용 · 원화(KRW) 결제 · 해외 바이어는 <a href="/en#pricing" className="underline text-[#0D1B2A] hover:text-slate-700">영어 플랜(USD)</a>을 이용하세요</p>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                연간 결제 시 2개월 무료
              </span>
            </div>
            <div className="relative min-h-[220px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
              <Image
                src="/images/glosource-enterprise-ops.png"
                alt="건설 소싱 문서와 공급자 비교 데스크"
                fill
                sizes="(min-width: 1024px) 540px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: '스타터', tag: '소규모 발주',
                price: '19만원', unit: '/ 월',
                per: '분석 30회/월',
                features: ['공급자 탐색 3~5개', 'KS인증 참고 매칭', '예상 원가 비교', 'RFQ 이메일 자동화', 'PDF 리포트 저장'],
                highlight: false,
              }, {
                name: '프로', tag: '가장 인기',
                price: '49만원', unit: '/ 월',
                per: '분석 60회/월',
                features: ['확장 소싱 분석', 'KS인증·규격 참고 매칭', '세금계산서 발행', '한국어 의사결정 PDF', '한국어 RFQ 작성 지원'],
                highlight: true,
              }, {
                name: '팀', tag: '기업용',
                price: '99만원', unit: '/ 월',
                per: '5계정 공유',
                features: ['5계정 공유', '프로젝트별 소싱 이력 관리', '우선 문의 지원', '공급자 검증 템플릿', '세금계산서 발행'],
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
                <a
                  href="/billing"
                  className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.highlight ? 'bg-white text-[#0D1B2A] hover:bg-slate-100' : 'bg-[#0D1B2A] text-white hover:bg-slate-800'}`}>
                  시작하기
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-8">세금계산서 발행 가능 · 문의: glosourceai@gmail.com · 평일 09:00–18:00</p>
        </div>
      </section>

      {/* ── CTA 스트립 ── */}
      <section className="bg-[#0D1B2A] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">지금 바로 5회 무료 체험을 시작하세요</h2>
          <p className="text-slate-400 text-sm mb-8">신용카드 없이 · 계정 생성 없이 · 제품명만 입력하면 끝</p>
          <a
            href="#sourcing-tool"
            onClick={(e) => { e.preventDefault(); document.getElementById('sourcing-tool')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#DC4C00] text-white font-bold text-sm px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-900/40"
          >
            소싱 시작하기 →
          </a>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="bg-[#0D1B2A] border-t border-white/10 text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                  <Icon.Globe className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">GloSource AI</span>
              </div>
              <p className="text-xs text-slate-400 max-w-xs">중국·해외 공급자 후보 발굴과 RFQ 준비를 돕는 AI 소싱 매칭 도구입니다. 거래 실행과 납품은 사용자가 직접 판단합니다.</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-4 mb-1.5 text-xs">
                <a href="/terms" className="text-slate-500 hover:text-slate-300 transition-colors">이용약관</a>
                <a href="/privacy" className="text-slate-500 hover:text-slate-300 transition-colors">개인정보처리방침</a>
              </div>
              <p className="text-xs text-slate-400">© 2026 GloSource AI. All rights reserved.</p>
              <p className="text-xs text-slate-500 mt-1">glosourceai@gmail.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
