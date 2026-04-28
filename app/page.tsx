'use client';

import { useState, useEffect, useRef } from 'react';
import type { GenerateRequest, SafetyEducationOutput, WorkerType, EducationType } from './api/generate/route';

/* ─── 상수 ─── */
const CONSTRUCTION_TYPES = [
  '철근콘크리트 공사', '조적·미장 공사', '도장 공사', '가설 공사',
  '토공사·굴착', '철골 공사', '전기·설비 공사', '인테리어·마감 공사',
];

const HAZARD_TYPES = [
  '고소작업(추락)', '중장비 협착', '전기 감전', '밀폐공간',
  '화재·폭발', '낙하·비래', '질식·유해가스', '근골격계 부담',
];

const WORKER_TYPES: { value: WorkerType; label: string; sub: string }[] = [
  { value: 'office',  label: '사무직',      sub: '분기 3시간' },
  { value: 'field',   label: '현장 근로자',  sub: '분기 6시간' },
  { value: 'special', label: '특별위험작업', sub: '특별교육 16h' },
];

const EDUCATION_TYPES: { value: EducationType; label: string; desc: string }[] = [
  { value: 'regular',    label: '정기교육',        desc: '분기별 의무' },
  { value: 'onboarding', label: '채용 시 교육',     desc: '신규 채용' },
  { value: 'change',     label: '작업 변경 교육',   desc: '공종 변경' },
  { value: 'special',    label: '특별교육',         desc: '위험작업 전' },
];

const LEGAL_HOURS: Record<WorkerType, Record<EducationType, number>> = {
  office:  { regular: 3,  onboarding: 4,  change: 1,  special: 2 },
  field:   { regular: 6,  onboarding: 8,  change: 2,  special: 16 },
  special: { regular: 6,  onboarding: 8,  change: 2,  special: 16 },
};

const WORKER_LABELS: Record<WorkerType, string> = {
  office: '사무직', field: '현장 근로자', special: '특별위험작업 근로자',
};
const EDU_LABELS: Record<EducationType, string> = {
  regular: '정기교육', onboarding: '채용 시 교육', change: '작업 변경 시 교육', special: '특별교육',
};
const DURATION_LABELS: Record<string, string> = {
  '30min': '30분', '1hr': '1시간', '2hr': '2시간',
};

type ResultTab = 'pptScript' | 'quiz' | 'attendance' | 'certificate';

const TABS: { key: ResultTab; label: string; icon: string }[] = [
  { key: 'pptScript',  label: 'PPT 스크립트',  icon: '📊' },
  { key: 'quiz',       label: '퀴즈 10문항',   icon: '📝' },
  { key: 'attendance', label: '출석부',         icon: '📋' },
  { key: 'certificate',label: '이수확인서',     icon: '🏆' },
];

const FREE_CREDITS = 1;
const CREDITS_KEY = 'safedoc_credits_v3';

/* ─── PDF HTML 생성 ─── */
function generatePrintHTML(
  tab: ResultTab,
  result: SafetyEducationOutput,
  companyName: string,
  trainingDate: string,
  form: GenerateRequest
): string {
  const company = companyName || '(회사명 입력 필요)';
  const dateStr = new Date(trainingDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const css = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
      * { box-sizing:border-box; margin:0; padding:0; }
      body { font-family:'Noto Sans KR','맑은 고딕',sans-serif; padding:15mm 20mm; color:#0F172A; font-size:10pt; line-height:1.6; }
      h1 { font-size:18pt; font-weight:900; text-align:center; padding-bottom:8px; border-bottom:2px solid #0F172A; margin-bottom:14px; }
      .subtitle { text-align:center; color:#475569; font-size:10pt; margin-bottom:14px; }
      .meta { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px; padding:10px 14px; margin-bottom:16px; display:grid; grid-template-columns:1fr 1fr; gap:4px 20px; }
      .meta-row { font-size:9pt; display:flex; gap:8px; }
      .meta-label { font-weight:700; min-width:70px; color:#374151; }
      pre { font-family:'Noto Sans KR','맑은 고딕',sans-serif; white-space:pre-wrap; font-size:9.5pt; line-height:1.75; }
      .slide { margin-bottom:12px; border:1px solid #E2E8F0; border-radius:6px; padding:10px 14px; }
      .slide-num { font-size:8pt; font-weight:700; color:#1E40AF; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px; }
      .quiz-q { border-left:3px solid #1E40AF; padding:8px 12px; margin-bottom:8px; background:#F8FAFC; }
      table { width:100%; border-collapse:collapse; margin-top:8px; }
      th { background:#1E3A8A; color:#fff; padding:7px; font-size:9pt; border:1px solid #1E3A8A; }
      td { padding:6px; border:1px solid #CBD5E1; height:28px; text-align:center; font-size:9pt; }
      tr:nth-child(even) td { background:#F8FAFC; }
      .cert { border:3px double #0F172A; padding:24px; text-align:center; margin:10px 0; }
      .cert-title { font-size:26pt; font-weight:900; letter-spacing:8px; margin-bottom:8px; }
      .cert-sub { font-size:10pt; color:#475569; margin-bottom:20px; }
      .cert-name { font-size:20pt; font-weight:900; border-bottom:2px solid #0F172A; display:inline-block; padding:0 30px 4px; margin:10px 0; }
      .cert-body { font-size:11pt; line-height:2.2; margin:14px 0; }
      .seal { float:right; width:70px; height:70px; border:2px solid #CBD5E1; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:8pt; color:#9CA3AF; text-align:center; }
      .footer { margin-top:14px; padding-top:10px; border-top:1px solid #E2E8F0; font-size:8pt; color:#94A3B8; text-align:center; }
      @media print { @page { size:A4; margin:0; } body { padding:10mm 15mm; } }
    </style>
  `;

  const meta = `
    <div class="meta">
      <div class="meta-row"><span class="meta-label">회사명</span><span>${company}</span></div>
      <div class="meta-row"><span class="meta-label">교육일자</span><span>${dateStr}</span></div>
      <div class="meta-row"><span class="meta-label">공사 종류</span><span>${form.constructionType}</span></div>
      <div class="meta-row"><span class="meta-label">위험요소</span><span>${form.hazardTypes}</span></div>
      <div class="meta-row"><span class="meta-label">근로자 유형</span><span>${WORKER_LABELS[form.workerType]}</span></div>
      <div class="meta-row"><span class="meta-label">교육 구분</span><span>${EDU_LABELS[form.educationType]}</span></div>
      <div class="meta-row"><span class="meta-label">교육 시간</span><span>${DURATION_LABELS[form.duration]}</span></div>
      <div class="meta-row"><span class="meta-label">법적 근거</span><span>${result.legalInfo.legalBasis}</span></div>
    </div>
  `;
  const footer = `<p class="footer">본 교육자료는 산업안전보건법 제29조 및 고용노동부 고시 기준에 따라 SafeDoc AI가 생성하였습니다. 현장 실정에 맞게 수정 후 사용하세요. | safedoc-ai.vercel.app</p>`;

  const wrap = (title: string, sub: string, body: string) =>
    `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">${css}<title>${title} - ${company}</title></head><body>
      <h1>${title}</h1><p class="subtitle">${sub}</p>${meta}${body}${footer}
      <script>window.onload=()=>window.print();</script>
    </body></html>`;

  if (tab === 'pptScript') {
    const slides = result.pptScript.split(/(?=={3,}\s*슬라이드)/).filter(Boolean);
    const body = slides.length > 1
      ? slides.map((s, i) => `<div class="slide"><div class="slide-num">SLIDE ${i + 1}</div><pre>${s.replace(/={3,}[^\n]*={3,}/g, '').trim()}</pre></div>`).join('')
      : `<pre>${result.pptScript}</pre>`;
    return wrap('안전교육 PPT 스크립트', `${EDU_LABELS[form.educationType]} · ${WORKER_LABELS[form.workerType]} · ${DURATION_LABELS[form.duration]}`, body);
  }
  if (tab === 'quiz') {
    const qs = result.quiz.split(/(?=Q\d+[.:])/).filter(Boolean);
    const body = qs.length > 1
      ? qs.map(q => `<div class="quiz-q"><pre>${q.trim()}</pre></div>`).join('')
      : `<pre>${result.quiz}</pre>`;
    return wrap('이해도 확인 퀴즈', `${EDU_LABELS[form.educationType]} · 10문항`, body);
  }
  if (tab === 'attendance') {
    return wrap('안전교육 출석부', `${company} · ${dateStr}`, `<pre>${result.attendance}</pre>`);
  }
  return wrap('교육 이수 확인서', `${company} · ${dateStr}`, `
    <div class="cert">
      <div class="cert-title">교육 이수 확인서</div>
      <div class="cert-sub">CERTIFICATE OF SAFETY EDUCATION COMPLETION</div>
      <pre style="text-align:left">${result.certificate}</pre>
      <div class="seal">직인</div>
    </div>
  `);
}

/* ─── 메인 컴포넌트 ─── */
export default function HomePage() {
  const [form, setForm] = useState<GenerateRequest>({
    constructionType: '',
    hazardTypes: '',
    workerCount: 10,
    duration: '1hr',
    workerType: 'field',
    educationType: 'regular',
  });
  const [selectedHazards, setSelectedHazards] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafetyEducationOutput | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<ResultTab>('pptScript');
  const [copied, setCopied] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [trainingDate, setTrainingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [credits, setCredits] = useState(FREE_CREDITS);
  const [showPaywall, setShowPaywall] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CREDITS_KEY);
    if (stored === null) {
      localStorage.setItem(CREDITS_KEY, String(FREE_CREDITS));
    } else {
      setCredits(parseInt(stored, 10));
    }
  }, []);

  const requiredHours = LEGAL_HOURS[form.workerType][form.educationType];

  const toggleHazard = (h: string) => {
    setSelectedHazards(prev => {
      const next = prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h];
      setForm(f => ({ ...f, hazardTypes: next.join(', ') }));
      return next;
    });
  };

  const handleGenerate = async () => {
    if (credits <= 0) { setShowPaywall(true); return; }
    if (!form.constructionType) { setError('공사 종류를 선택해주세요.'); return; }
    if (!form.hazardTypes) { setError('위험요소를 하나 이상 선택해주세요.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '오류가 발생했습니다.');
      setResult(json.data as SafetyEducationOutput);
      setActiveTab('pptScript');
      const nc = credits - 1;
      setCredits(nc);
      localStorage.setItem(CREDITS_KEY, String(nc));
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = (tab?: ResultTab) => {
    if (!result) return;
    const t = tab ?? activeTab;
    const html = generatePrintHTML(t, result, companyName, trainingDate, form);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { alert('팝업 차단을 해제해주세요.'); return; }
    win.document.write(html);
    win.document.close();
  };

  const handlePrintAll = () => {
    if (!result) return;
    (['attendance', 'certificate', 'pptScript', 'quiz'] as ResultTab[]).forEach((t, i) => {
      setTimeout(() => handlePrint(t), i * 500);
    });
  };

  /* ─── JSX ─── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* 결제 모달 */}
      {showPaywall && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">무료 체험 횟수 소진</h2>
              <p className="text-slate-500 text-sm mt-1">계속 사용하려면 플랜을 선택해주세요</p>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { name: '스타터', desc: '10회권', price: '29,000원', unit: '건당 2,900원', hot: false },
                { name: '프로',   desc: '월 무제한', price: '49,000원/월', unit: '가장 인기', hot: true },
                { name: '팀',    desc: '5계정 + 관리', price: '149,000원/월', unit: '기업용', hot: false },
              ].map(p => (
                <a
                  key={p.name}
                  href={`mailto:visionlab@seowonenc.co.kr?subject=SafeDoc AI ${p.name} 플랜 문의`}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    p.hot ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <p className={`font-semibold text-sm ${p.hot ? 'text-blue-800' : 'text-slate-800'}`}>{p.name} <span className="font-normal text-slate-400">· {p.desc}</span></p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">{p.price}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${p.hot ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>문의하기 →</span>
                  </div>
                </a>
              ))}
            </div>
            <button onClick={() => setShowPaywall(false)} className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors">
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 네비게이션 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-0 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">S</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base">SafeDoc AI</span>
              <span className="ml-2 text-xs text-slate-400 hidden sm:inline">건설 안전교육 자료 자동 생성</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full font-medium hidden sm:flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              산업안전보건법 제29조 기준
            </span>
            {credits > 0 ? (
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold">
                무료 체험 {credits}회 남음
              </span>
            ) : (
              <button
                onClick={() => setShowPaywall(true)}
                className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-amber-600 transition-colors"
              >
                크레딧 충전하기
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 히어로 배너 */}
      <div className="bg-gradient-to-b from-blue-700 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/50 border border-blue-500/50 rounded-full px-3 py-1 text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              고용노동부 고시 제2023-19호 기준 자동 반영
            </div>
            <h1 className="text-3xl font-black leading-tight mb-3">
              건설 현장 안전교육 자료<br />
              <span className="text-amber-300">2분 만에 법정 문서 완성</span>
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              PPT 스크립트 · 이해도 퀴즈 · 출석부 · 이수확인서를 한 번에 자동 생성.<br />
              법정 필수 항목 자동 포함 — 고용노동부 감사에 즉시 대응 가능합니다.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: '⚖️', text: '산업안전보건법 제29조' },
                { icon: '📄', text: 'PDF 즉시 출력' },
                { icon: '⚡', text: '생성 시간 2분 이내' },
                { icon: '✅', text: '법적 효력 있는 양식' },
              ].map(b => (
                <span key={b.text} className="inline-flex items-center gap-1.5 bg-blue-600/40 border border-blue-500/40 rounded-lg px-3 py-1.5 text-xs font-medium">
                  {b.icon} {b.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">

          {/* ── 왼쪽: 입력 폼 ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">교육 조건 설정</h2>
              <p className="text-slate-400 text-xs mt-0.5">6가지 항목을 선택하면 AI가 맞춤 자료를 생성합니다</p>
            </div>
            <div className="p-6 space-y-6">

              {/* 1. 근로자 유형 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2.5">
                  <span className="w-5 h-5 bg-blue-700 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                  근로자 유형
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {WORKER_TYPES.map(w => (
                    <button
                      key={w.value}
                      onClick={() => setForm({ ...form, workerType: w.value })}
                      className={`py-3 px-2 rounded-xl border text-center transition-all text-sm ${
                        form.workerType === w.value
                          ? 'bg-blue-50 border-blue-500 text-blue-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-semibold text-xs">{w.label}</p>
                      <p className={`text-xs mt-0.5 ${form.workerType === w.value ? 'text-blue-500' : 'text-slate-400'}`}>{w.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. 교육 구분 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2.5">
                  <span className="w-5 h-5 bg-blue-700 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                  교육 구분
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EDUCATION_TYPES.map(e => (
                    <button
                      key={e.value}
                      onClick={() => setForm({ ...form, educationType: e.value })}
                      className={`py-3 px-3 rounded-xl border text-left transition-all ${
                        form.educationType === e.value
                          ? 'bg-blue-50 border-blue-500 text-blue-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-semibold text-xs">{e.label}</p>
                      <p className={`text-xs mt-0.5 ${form.educationType === e.value ? 'text-blue-500' : 'text-slate-400'}`}>{e.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <span className="text-blue-600 text-xs">⚖️</span>
                  <span className="text-blue-700 text-xs font-semibold">법정 필요 시간: {requiredHours}시간 이상</span>
                  <span className="text-slate-400 text-xs ml-auto">산업안전보건법 제29조</span>
                </div>
              </div>

              {/* 3. 공사 종류 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2.5">
                  <span className="w-5 h-5 bg-blue-700 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
                  공사 종류
                </label>
                <select
                  value={form.constructionType}
                  onChange={e => setForm({ ...form, constructionType: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                >
                  <option value="">선택하세요</option>
                  {CONSTRUCTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* 4. 위험요소 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2.5">
                  <span className="w-5 h-5 bg-blue-700 text-white rounded-full text-xs flex items-center justify-center font-bold">4</span>
                  주요 위험요소
                  <span className="text-slate-400 font-normal text-xs">(복수 선택)</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {HAZARD_TYPES.map(h => (
                    <button
                      key={h}
                      onClick={() => toggleHazard(h)}
                      className={`text-left text-xs px-3 py-2.5 rounded-lg border transition-all ${
                        selectedHazards.includes(h)
                          ? 'bg-blue-50 border-blue-500 text-blue-800 font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {selectedHazards.includes(h) ? '✓ ' : ''}{h}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5+6. 인원 + 시간 */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2.5">
                    <span className="w-5 h-5 bg-blue-700 text-white rounded-full text-xs flex items-center justify-center font-bold">5</span>
                    교육 인원
                  </label>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs">인원 수</span>
                    <span className="text-blue-700 font-bold text-sm">{form.workerCount}명</span>
                  </div>
                  <input
                    type="range" min={1} max={100} value={form.workerCount}
                    onChange={e => setForm({ ...form, workerCount: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1명</span><span>100명</span>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2.5">
                    <span className="w-5 h-5 bg-blue-700 text-white rounded-full text-xs flex items-center justify-center font-bold">6</span>
                    교육 시간
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {(['30min', '1hr', '2hr'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setForm({ ...form, duration: d })}
                        className={`py-2 rounded-lg border text-xs font-semibold transition-all ${
                          form.duration === d
                            ? 'bg-blue-700 border-blue-700 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {d === '30min' ? '30분' : d === '1hr' ? '1시간' : '2시간'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <span className="text-red-500 text-sm mt-0.5">⚠</span>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-base transition-all bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-amber-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AI 생성 중... (약 20~30초)
                  </span>
                ) : credits > 0
                  ? '⚡ 안전교육 자료 생성하기 (무료 체험)'
                  : '크레딧 충전 후 생성하기 →'}
              </button>

              <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-blue-600 text-lg">🔒</span>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-700">법적 효력 보장</p>
                  <p className="text-xs text-slate-500">산업안전보건법 제29조 · 고용노동부 고시 제2023-19호 기준 필수 항목 자동 포함</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 오른쪽: 결과 ── */}
          <div ref={resultRef}>
            {result ? (
              <div className="space-y-4">
                {/* 완료 + 법정 기준 */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </span>
                      <span className="font-bold text-slate-900 text-sm">생성 완료</span>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full font-medium">법정 기준 적합</span>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-700 font-medium">{result.legalInfo.legalBasis}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      법정 필요 시간 <strong className="text-slate-700">{result.legalInfo.requiredHours}시간</strong> · 필수 교육항목 <strong className="text-slate-700">{result.legalInfo.mandatoryItems.length}개</strong> 반영 완료
                    </p>
                  </div>
                </div>

                {/* PDF 설정 */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="text-base">🖨️</span> PDF 출력 설정
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">회사명</label>
                      <input
                        type="text"
                        placeholder="(주)서원토건"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">교육일자</label>
                      <input
                        type="date"
                        value={trainingDate}
                        onChange={e => setTrainingDate(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePrint()}
                      className="py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-xs hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5"
                    >
                      🖨️ 현재 탭 PDF 저장
                    </button>
                    <button
                      onClick={handlePrintAll}
                      className="py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                    >
                      📦 전체 4종 한번에
                    </button>
                  </div>
                </div>

                {/* 탭 + 내용 */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex border-b border-slate-100">
                    {TABS.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 px-2 text-xs font-medium transition-all border-b-2 ${
                          activeTab === tab.key
                            ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <span className="block">{tab.icon}</span>
                        <span className="hidden sm:block">{tab.label}</span>
                      </button>
                    ))}
                    <button
                      onClick={handleCopy}
                      className="px-4 text-xs text-slate-400 hover:text-slate-600 border-l border-slate-100 transition-colors"
                    >
                      {copied ? '✓ 복사' : '복사'}
                    </button>
                  </div>
                  <div className="p-4 h-[360px] overflow-y-auto">
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-sans">
                      {result[activeTab]}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              /* 빈 상태 */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full min-h-[560px] flex flex-col items-center justify-center p-10">
                <div className="text-center max-w-xs mx-auto">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🏗️</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">왼쪽에서 조건을 설정하세요</h3>
                  <p className="text-slate-400 text-sm mb-8">6가지 항목 선택 후 생성 버튼을 누르면<br/>4종 법정 교육자료가 즉시 완성됩니다</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { icon: '📊', label: 'PPT 스크립트', desc: '슬라이드 10장' },
                      { icon: '📝', label: '퀴즈 10문항',  desc: '정답 자동 포함' },
                      { icon: '📋', label: '출석부',       desc: '법정 양식' },
                      { icon: '🏆', label: '이수확인서',   desc: '법적 효력' },
                    ].map(item => (
                      <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
                        <p className="text-lg mb-1">{item.icon}</p>
                        <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
                    <p className="text-xs font-semibold text-amber-700 mb-1">🖨️ PDF 즉시 출력 가능</p>
                    <p className="text-xs text-slate-500">회사명·날짜 입력 후 버튼 하나로 법정 양식 PDF 저장. 고용노동부 감사 대비 즉시 제출.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16">
          <h3 className="text-center text-xl font-bold text-slate-900 mb-2">이렇게 사용하세요</h3>
          <p className="text-center text-sm text-slate-500 mb-8">총 3단계, 2분이면 완성</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', icon: '⚙️', title: '조건 설정', desc: '근로자 유형, 교육 구분, 공사 종류, 위험요소 6가지 항목을 클릭으로 선택' },
              { step: '02', icon: '🤖', title: 'AI 자동 생성', desc: '고용노동부 고시 기준 법정 필수 항목을 포함한 맞춤 교육자료를 AI가 2분 이내 작성' },
              { step: '03', icon: '📄', title: 'PDF 저장·출력', desc: '회사명·날짜 입력 후 버튼 한 번으로 A4 법정 양식 PDF 저장. 즉시 프린트·제출 가능' },
            ].map(s => (
              <div key={s.step} className="bg-white border border-slate-200 rounded-2xl p-6 relative">
                <span className="absolute top-4 right-4 text-slate-100 font-black text-3xl">{s.step}</span>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-xl">{s.icon}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">{s.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 가격 */}
        <div className="mt-16 pb-16">
          <h3 className="text-center text-xl font-bold text-slate-900 mb-2">요금제</h3>
          <p className="text-center text-sm text-slate-500 mb-8">교육자료 1세트 = PPT 스크립트 + 퀴즈 + 출석부 + 이수확인서 + PDF 출력</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              {
                name: '스타터', badge: '10회권',
                price: '29,000',  unit: '원',
                sub: '건당 2,900원',
                features: ['교육자료 4종 자동 생성', 'PDF 즉시 출력', '법정 기준 자동 반영', '세금계산서 발행'],
                highlight: false, cta: '문의하기',
              },
              {
                name: '프로', badge: '인기',
                price: '49,000', unit: '원/월',
                sub: '월 무제한 사용',
                features: ['무제한 생성', 'PDF 즉시 출력', '생성 이력 30일 저장', '우선 이메일 지원'],
                highlight: true, cta: '시작하기',
              },
              {
                name: '팀', badge: '기업용',
                price: '149,000', unit: '원/월',
                sub: '5계정 공유',
                features: ['5계정 팀 공유', '회사 로고 삽입', '현장별 분류 관리', '전화·카카오 지원'],
                highlight: false, cta: '문의하기',
              },
            ].map(plan => (
              <div key={plan.name} className={`rounded-2xl p-6 border relative ${
                plan.highlight
                  ? 'bg-blue-700 border-blue-700 text-white shadow-lg shadow-blue-200'
                  : 'bg-white border-slate-200'
              }`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">가장 인기</span>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className={`font-bold text-sm ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${plan.highlight ? 'bg-blue-600 text-blue-100' : 'bg-slate-100 text-slate-500'}`}>{plan.badge}</span>
                </div>
                <div className="mb-1">
                  <span className={`text-3xl font-black ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>{plan.unit}</span>
                </div>
                <p className={`text-xs mb-5 ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>{plan.sub}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-xs ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-blue-600' : 'bg-blue-50'}`}>
                        <span className={`text-xs ${plan.highlight ? 'text-white' : 'text-blue-600'}`}>✓</span>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:visionlab@seowonenc.co.kr?subject=SafeDoc AI ${plan.name} 플랜 문의`}
                  className={`block w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-white text-blue-700 hover:bg-blue-50'
                      : 'bg-blue-700 text-white hover:bg-blue-800'
                  }`}
                >
                  {plan.cta} →
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">
            세금계산서 발행 가능 · 문의: visionlab@seowonenc.co.kr
          </p>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-700 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-black">S</span>
            </div>
            <span className="text-sm font-semibold text-slate-700">SafeDoc AI</span>
            <span className="text-xs text-slate-400">건설 현장 안전교육 자료 자동 생성</span>
          </div>
          <p className="text-xs text-slate-400">
            산업안전보건법 제29조 기준 · 고용노동부 고시 제2023-19호 준수 · © 2026 SafeDoc AI
          </p>
        </div>
      </footer>
    </div>
  );
}
