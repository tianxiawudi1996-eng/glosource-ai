'use client';

import { useState, useEffect, useRef } from 'react';
import type { SourcingRequest, SourcingOutput, Supplier, CountryPreference, OrderFrequency, WeChatSourcingOutput } from './api/source/types';

type SourceMode = 'ai' | '1688' | 'wechat';

/* ══════════════════════════════════════════════
   SVG 아이콘
══════════════════════════════════════════════ */
const Icon = {
  Shield: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22C12 22 4 18 4 12V5.5L12 2.5L20 5.5V12C20 18 12 22 12 22Z"/>
      <polyline points="9,12 11,14 15,10"/>
    </svg>
  ),
  Search: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Globe: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Mail: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Download: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15"/>
      <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Check: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  AlertTriangle: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Zap: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
    </svg>
  ),
  ChevronRight: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  ),
  Copy: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Printer: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6,9 6,2 18,2 18,9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  ),
  ExternalLink: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  Star: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
    </svg>
  ),
  Settings: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
};

/* ══════════════════════════════════════════════
   상수
══════════════════════════════════════════════ */
const FREE_CREDITS = 1;
const CREDITS_KEY = 'glosource_credits_v1';

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
    <p class="dis">${result.disclaimer} | GloSource AI · visionlab@seowonenc.co.kr</p>
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
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [emailLang, setEmailLang] = useState<'en' | 'zh'>('en');
  const [copied, setCopied] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [credits, setCredits] = useState(FREE_CREDITS);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeSource, setActiveSource] = useState<SourceMode>('ai');
  const [wechatResult, setWechatResult] = useState<WeChatSourcingOutput | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(CREDITS_KEY);
    if (s === null) localStorage.setItem(CREDITS_KEY, String(FREE_CREDITS));
    else setCredits(parseInt(s, 10));
  }, []);

  const startLoading = () => {
    const msgs = LOADING_MESSAGES[activeSource];
    setLoading(true); setError(''); setResult(null); setSelectedSupplier(null); setWechatResult(null);
    setLoadingMsg(0);
    loadingRef.current = setInterval(() => setLoadingMsg(p => (p + 1) % msgs.length), 3000);
  };

  const stopLoading = () => {
    setLoading(false);
    if (loadingRef.current) clearInterval(loadingRef.current);
  };

  const handleGenerate = async () => {
    if (credits <= 0) { setShowPaywall(true); return; }
    if (!form.productDescription.trim()) { setError('제품/자재명을 입력해주세요.'); return; }
    if (activeSource !== 'wechat' && !form.quantity.trim()) { setError('필요 수량을 입력해주세요.'); return; }

    startLoading();

    try {
      if (activeSource === 'wechat') {
        const res = await fetch('/api/source/wechat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: form.productDescription }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || '오류가 발생했습니다.');
        setWechatResult(json.data as WeChatSourcingOutput);
      } else {
        const apiPath = activeSource === '1688' ? '/api/source/factory-direct' : '/api/source';
        const res = await fetch(apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || '오류가 발생했습니다.');
        const data = json.data as SourcingOutput;
        setResult(data);
        setSelectedSupplier(data.suppliers[0] ?? null);
      }

      const nc = credits - 1;
      setCredits(nc);
      localStorage.setItem(CREDITS_KEY, String(nc));
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      stopLoading();
    }
  };

  const handleCopyEmail = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.rfqEmail[emailLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <div className="mb-6">
              <div className="w-12 h-12 bg-[#0D1B2A] rounded-xl flex items-center justify-center mb-4">
                <Icon.Globe className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-1">무료 체험 횟수 소진</h2>
              <p className="text-slate-500 text-sm">AI 글로벌 소싱 분석을 계속 이용하려면 플랜을 선택하세요.</p>
            </div>
            <div className="space-y-2 mb-6">
              {[
                { name: '스타터', detail: '10회권', price: '10만원/월', per: '분석 10회 · PDF 다운로드 · 이메일 초안', hot: false },
                { name: '프로', detail: '무제한', price: '30만원/월', per: '무제한 분석 · 이력 관리 · 우선 지원', hot: true },
                { name: '팀', detail: '5계정', price: '70만원/월', per: '5계정 공유 · 현장별 관리 · 전담 지원', hot: false },
              ].map(p => (
                <a key={p.name} href={`mailto:visionlab@seowonenc.co.kr?subject=GloSource AI ${p.name} 플랜 문의`}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${p.hot ? 'border-[#0D1B2A] bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div>
                    <p className={`font-semibold text-sm ${p.hot ? 'text-[#0D1B2A]' : 'text-[#0D1B2A]'}`}>{p.name} <span className="font-normal text-slate-400 text-xs">· {p.detail}</span></p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.per}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#0D1B2A] text-sm">{p.price}</p>
                    <Icon.ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mb-4">세금계산서 발행 가능 · visionlab@seowonenc.co.kr</p>
            <button onClick={() => setShowPaywall(false)} className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl transition-colors">닫기</button>
          </div>
        </div>
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
            {credits > 0
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
            <h1 className="text-4xl md:text-5xl font-black leading-[1.15] tracking-tight mb-5">
              해외 공장, 믿고<br />
              <span className="text-[#EA580C]">직발주하세요.</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              AI가 <strong className="text-white">1688 공장직거래</strong>·Alibaba·<strong className="text-white">WeChat 실시간 홍보</strong>에서 공급자를 탐색하고
              신뢰도를 분석합니다. RFQ 이메일까지 자동 생성.
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
                  <button key={tab.id} onClick={() => { setActiveSource(tab.id); setResult(null); setWechatResult(null); setError(''); }}
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

                {/* ② 수량 + 예산 */}
                <div className="grid grid-cols-2 gap-4">
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

                {/* ③ 원산지 선호 (WeChat 모드에서는 숨김) */}
                {activeSource !== 'wechat' && (
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">4</span>
                      원산지 선호
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {COUNTRY_OPTIONS.map(c => (
                        <button key={c.value} onClick={() => setForm({ ...form, countryPreference: c.value })}
                          className={`py-2.5 px-2 rounded-xl border text-center transition-all ${form.countryPreference === c.value ? 'bg-[#0D1B2A] border-[#0D1B2A] text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <p className="text-xs font-semibold">{c.label}</p>
                          <p className={`text-xs mt-0.5 ${form.countryPreference === c.value ? 'text-slate-300' : 'text-slate-400'}`}>{c.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ④ 발주 주기 (WeChat 모드에서는 숨김) */}
                {activeSource !== 'wechat' && (
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">5</span>
                      발주 주기
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {FREQUENCY_OPTIONS.map(f => (
                        <button key={f.value} onClick={() => setForm({ ...form, orderFrequency: f.value })}
                          className={`py-3 px-3 rounded-xl border text-center transition-all ${form.orderFrequency === f.value ? 'bg-[#0D1B2A] border-[#0D1B2A] text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <p className="text-xs font-semibold">{f.label}</p>
                          <p className={`text-xs mt-0.5 ${form.orderFrequency === f.value ? 'text-slate-300' : 'text-slate-400'}`}>{f.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <Icon.AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button onClick={handleGenerate} disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all bg-[#EA580C] text-white hover:bg-[#DC4C00] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
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
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#0D1B2A] leading-snug">{post.articleTitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{post.accountName}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full border ${
                              post.accountType.includes('공장') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              post.accountType.includes('무역') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>{post.accountType}</span>
                            <span className="text-xs text-slate-400">{post.publishDate}</span>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg border flex-shrink-0 ${
                          post.relevanceScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          post.relevanceScore >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>{post.relevanceScore}점</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">{post.summary}</p>
                      {post.productKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.productKeywords.map((kw, ki) => (
                            <span key={ki} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{kw}</span>
                          ))}
                        </div>
                      )}
                      {post.contactHint && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
                          <p className="text-xs text-amber-800"><span className="font-semibold">연락처 힌트:</span> {post.contactHint}</p>
                        </div>
                      )}
                      <a href={post.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors">
                        <Icon.ExternalLink className="w-3 h-3" />WeChat 원문 보기
                      </a>
                    </div>
                  ))}

                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <p className="text-xs text-amber-800 leading-relaxed">{wechatResult.disclaimer}</p>
                  </div>
                </div>
              )}

              {result ? (
                <div className="space-y-4">
                  {/* 상태 + 그라운딩 뱃지 */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Icon.Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-bold text-[#0D1B2A] text-sm">소싱 분석 완료</span>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${result.groundingUsed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {result.groundingUsed ? '실시간 웹 검색 기반' : 'AI 지식 기반 분석'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">{result.recommendation}</p>
                  </div>

                  {/* 공급자 카드 리스트 */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                      <Icon.Globe className="w-4 h-4 text-slate-400" />
                      <p className="text-sm font-bold text-[#0D1B2A]">추천 공급자 {result.suppliers.length}개</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {result.suppliers.map(s => (
                        <button key={s.rank} onClick={() => setSelectedSupplier(s)}
                          className={`w-full text-left px-4 py-3 transition-all ${selectedSupplier?.rank === s.rank ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}>
                          <div className="flex items-start justify-between gap-3">
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
                            <div className="flex-shrink-0 text-right">
                              <span className={`inline-block text-xs font-bold px-2 py-1 rounded-lg border ${getTrustColor(s.trustScore)}`}>
                                {s.trustScore}점
                              </span>
                              <p className="text-xs text-slate-400 mt-1">{s.estimatedPrice}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 선택 공급자 상세 */}
                  {selectedSupplier && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-[#0D1B2A] text-sm">{selectedSupplier.name}</p>
                          <p className="text-xs text-slate-400">{selectedSupplier.platform} · {selectedSupplier.country}</p>
                        </div>
                        <a href={selectedSupplier.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors border border-blue-200 rounded-lg px-2.5 py-1.5">
                          <Icon.ExternalLink className="w-3 h-3" />공급자 페이지
                        </a>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-slate-500 mb-1">예상 단가</p>
                          <p className="text-sm font-bold text-[#0D1B2A]">{selectedSupplier.estimatedPrice}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-slate-500 mb-1">최소 발주량(MOQ)</p>
                          <p className="text-sm font-bold text-[#0D1B2A]">{selectedSupplier.moq}</p>
                        </div>
                      </div>
                      {selectedSupplier.trustEvidence.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-bold text-emerald-700 mb-1.5">신뢰 근거</p>
                          <ul className="space-y-1">
                            {selectedSupplier.trustEvidence.map((e, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Icon.Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />{e}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedSupplier.redFlags.length > 0 && (
                        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs font-bold text-red-700 mb-1">주의사항</p>
                          <ul className="space-y-1">
                            {selectedSupplier.redFlags.map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs text-red-600">
                                <Icon.AlertTriangle className="w-3 h-3 flex-shrink-0" />{f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* RFQ 이메일 */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-100">
                      <button onClick={() => setEmailLang('en')}
                        className={`flex-1 py-3 text-xs font-medium transition-all border-b-2 ${emailLang === 'en' ? 'border-[#0D1B2A] text-[#0D1B2A] bg-slate-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                        영어 이메일
                      </button>
                      <button onClick={() => setEmailLang('zh')}
                        className={`flex-1 py-3 text-xs font-medium transition-all border-b-2 ${emailLang === 'zh' ? 'border-[#0D1B2A] text-[#0D1B2A] bg-slate-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                        중국어 이메일
                      </button>
                      <button onClick={handleCopyEmail}
                        className="px-4 border-l border-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
                        <Icon.Copy className="w-3.5 h-3.5" />
                        <span className="text-xs">{copied ? '완료' : '복사'}</span>
                      </button>
                    </div>
                    <div className="p-4 h-[220px] overflow-y-auto">
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "'Pretendard','Malgun Gothic',sans-serif" }}>
                        {result.rfqEmail[emailLang]}
                      </pre>
                    </div>
                  </div>

                  {/* PDF 출력 */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon.Printer className="w-4 h-4 text-slate-400" />
                      <p className="text-sm font-bold text-[#0D1B2A]">소싱 리포트 PDF 저장</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">회사명</label>
                        <input type="text" placeholder="(주)서원토건" value={companyName} onChange={e => setCompanyName(e.target.value)}
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
                /* 빈 상태 */
                !wechatResult && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full min-h-[480px] flex items-center justify-center">
                    <div className="text-center max-w-sm px-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {activeSource === 'wechat' ? <Icon.Globe className="w-8 h-8 text-emerald-400" /> : <Icon.Search className="w-8 h-8 text-slate-400" />}
                      </div>
                      <h3 className="font-bold text-[#0D1B2A] text-lg mb-2">
                        {activeSource === 'ai' && '소싱 조건을 설정하세요'}
                        {activeSource === '1688' && '1688 공장 직거래 탐색'}
                        {activeSource === 'wechat' && 'WeChat 공장 정보 탐색'}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        {activeSource === 'ai' && '제품명과 수량 입력 후 분석 버튼을 누르면 AI가 1688·Alibaba·WeChat에서 공급자를 탐색합니다'}
                        {activeSource === '1688' && '제품명과 수량을 입력하면 1688.com 공장 직거래 공급자를 탐색합니다. Alibaba 대비 30~50% 저렴한 원가 데이터를 제공합니다'}
                        {activeSource === 'wechat' && '제품명을 입력하면 WeChat 공식계정에서 공장 홍보 담당자가 직접 올린 실시간 가격·재고·연락처 정보를 탐색합니다'}
                      </p>
                      {activeSource === '1688' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left">
                          <p className="text-xs font-bold text-emerald-700 mb-2">1688 직거래 강점</p>
                          <ul className="space-y-1">
                            {['중국 내수 원가 — 수출 마진 없음', '诚信通 인증으로 공장 신뢰도 검증', 'OEM/ODM 소량 발주 가능', 'CNY + USD 이중 가격 표시'].map(t => (
                              <li key={t} className="flex items-center gap-1.5 text-xs text-emerald-700">
                                <Icon.Check className="w-3 h-3 flex-shrink-0" />{t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {activeSource === 'wechat' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                          <p className="text-xs font-bold text-blue-700 mb-2">WeChat 탐색 강점</p>
                          <ul className="space-y-1">
                            {['공장 홍보 직원이 올린 실시간 정보', 'Alibaba에 없는 소규모 공장 발굴', '직접 연락처 힌트 추출', '계정 유형 자동 판별 (공장/무역상)'].map(t => (
                              <li key={t} className="flex items-center gap-1.5 text-xs text-blue-700">
                                <Icon.Check className="w-3 h-3 flex-shrink-0" />{t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )
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
                price: '10만원', unit: '/ 월',
                per: '분석 10회/월',
                features: ['공급자 탐색 3~5개', 'AI 신뢰도 분석', 'RFQ 이메일 자동화', 'PDF 리포트 저장'],
                highlight: false,
              }, {
                name: '프로', tag: '가장 인기',
                price: '30만원', unit: '/ 월',
                per: '무제한 분석',
                features: ['무제한 소싱 분석', '이력 관리 30일', 'RFQ 이메일 (영·중·한)', '우선 이메일 지원', '세금계산서 발행'],
                highlight: true,
              }, {
                name: '팀', tag: '기업용',
                price: '70만원', unit: '/ 월',
                per: '5계정 공유',
                features: ['5계정 공유', '현장별 분류 관리', '전담 전화·카카오 지원', '세금계산서 발행'],
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
                <a href={`mailto:visionlab@seowonenc.co.kr?subject=GloSource AI ${plan.name} 플랜 문의`}
                  className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.highlight ? 'bg-white text-[#0D1B2A] hover:bg-slate-100' : 'bg-[#0D1B2A] text-white hover:bg-slate-800'}`}>
                  도입 문의하기
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-8">세금계산서 발행 가능 · 문의: visionlab@seowonenc.co.kr · 평일 09:00–18:00</p>
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
              <p className="text-xs text-slate-400 max-w-xs">한국 제조·건설업체를 위한 AI 글로벌 소싱 에이전트. 해외 공장 직발주를 안전하게 시작하세요.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">© 2026 GloSource AI. All rights reserved.</p>
              <p className="text-xs text-slate-500 mt-1">visionlab@seowonenc.co.kr</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
