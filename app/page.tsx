'use client';

import { useState, useEffect, useRef } from 'react';
import type { GenerateRequest, SafetyEducationOutput, WorkerType, EducationType } from './api/generate/route';

const CONSTRUCTION_TYPES = [
  '철근콘크리트 공사', '조적·미장 공사', '도장 공사', '가설 공사',
  '토공사·굴착', '철골 공사', '전기·설비 공사', '인테리어·마감 공사',
];

const HAZARD_TYPES = [
  '고소작업(추락)', '중장비 협착', '전기 감전', '밀폐공간',
  '화재·폭발', '낙하·비래', '질식·유해가스', '근골격계 부담',
];

const WORKER_TYPES: { value: WorkerType; label: string; sub: string }[] = [
  { value: 'office',  label: '사무직',          sub: '정기 분기 3시간' },
  { value: 'field',   label: '현장 근로자',      sub: '정기 분기 6시간' },
  { value: 'special', label: '특별위험작업',     sub: '특별교육 16시간' },
];

const EDUCATION_TYPES: { value: EducationType; label: string; desc: string }[] = [
  { value: 'regular',    label: '정기교육',          desc: '분기별 의무' },
  { value: 'onboarding', label: '채용 시 교육',       desc: '신규 채용 시' },
  { value: 'change',     label: '작업 변경 시 교육',  desc: '공종 변경 시' },
  { value: 'special',    label: '특별교육',           desc: '위험작업 전' },
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

const TAB_LABELS: Record<ResultTab, string> = {
  pptScript: '📊 PPT 스크립트',
  quiz: '📝 퀴즈 10문항',
  attendance: '📋 출석부',
  certificate: '🏆 이수확인서',
};

const FREE_CREDITS = 1;
const CREDITS_KEY = 'safedoc_credits_v2';

function generatePrintHTML(
  tab: ResultTab,
  result: SafetyEducationOutput,
  companyName: string,
  trainingDate: string,
  form: GenerateRequest
): string {
  const company = companyName || '(주)귀사명 입력';
  const dateStr = new Date(trainingDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const workerLabel = WORKER_LABELS[form.workerType];
  const eduLabel = EDU_LABELS[form.educationType];
  const durationLabel = DURATION_LABELS[form.duration];

  const baseStyle = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Noto Sans KR', '맑은 고딕', sans-serif; padding: 15mm 20mm; color: #1a1a1a; font-size: 10pt; line-height: 1.6; }
      h1 { font-size: 18pt; font-weight: 900; text-align: center; margin-bottom: 6px; }
      h2 { font-size: 13pt; font-weight: 700; margin: 14px 0 6px; border-left: 4px solid #1a1a1a; padding-left: 8px; }
      h3 { font-size: 11pt; font-weight: 700; margin: 10px 0 4px; }
      .subtitle { text-align: center; color: #555; font-size: 10pt; margin-bottom: 16px; }
      .info-box { background: #f8f8f8; border: 1px solid #ddd; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
      .info-row { display: flex; gap: 6px; font-size: 9.5pt; }
      .info-label { font-weight: 700; min-width: 80px; }
      .divider { border: none; border-top: 2px solid #1a1a1a; margin: 10px 0; }
      .thin-divider { border: none; border-top: 1px solid #ccc; margin: 8px 0; }
      pre { font-family: 'Noto Sans KR', '맑은 고딕', sans-serif; white-space: pre-wrap; font-size: 9.5pt; line-height: 1.7; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9pt; }
      th { background: #2c2c2c; color: #fff; padding: 7px 5px; text-align: center; font-weight: 700; border: 1px solid #1a1a1a; }
      td { padding: 6px 5px; text-align: center; border: 1px solid #ccc; height: 28px; }
      tr:nth-child(even) td { background: #f9f9f9; }
      .cert-box { border: 3px double #1a1a1a; padding: 20px; text-align: center; margin: 10px 0; }
      .cert-title { font-size: 28pt; font-weight: 900; letter-spacing: 6px; margin-bottom: 6px; }
      .cert-sub { font-size: 11pt; color: #444; margin-bottom: 16px; }
      .cert-name { font-size: 22pt; font-weight: 900; border-bottom: 2px solid #000; display: inline-block; padding: 0 30px 4px; margin: 10px 0; }
      .cert-body { font-size: 11pt; line-height: 2; margin: 12px 0; }
      .seal-box { margin-top: 20px; display: flex; justify-content: flex-end; }
      .seal { border: 2px solid #ccc; border-radius: 50%; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: #999; text-align: center; }
      .legal-note { font-size: 8pt; color: #888; margin-top: 12px; text-align: center; border-top: 1px solid #eee; padding-top: 8px; }
      .slide-block { margin-bottom: 14px; border: 1px solid #e0e0e0; border-radius: 6px; padding: 10px 14px; }
      .slide-num { font-size: 8pt; font-weight: 700; color: #666; letter-spacing: 1px; text-transform: uppercase; }
      .quiz-block { margin-bottom: 10px; padding: 8px 12px; border-left: 3px solid #1a1a1a; background: #fafafa; }
      @media print {
        body { padding: 10mm 15mm; }
        @page { size: A4 portrait; margin: 0; }
      }
    </style>
  `;

  const headerInfo = `
    <div class="info-box">
      <div class="info-grid">
        <div class="info-row"><span class="info-label">회사명</span><span>${company}</span></div>
        <div class="info-row"><span class="info-label">교육일자</span><span>${dateStr}</span></div>
        <div class="info-row"><span class="info-label">공사 종류</span><span>${form.constructionType}</span></div>
        <div class="info-row"><span class="info-label">위험요소</span><span>${form.hazardTypes}</span></div>
        <div class="info-row"><span class="info-label">근로자 유형</span><span>${workerLabel}</span></div>
        <div class="info-row"><span class="info-label">교육 구분</span><span>${eduLabel}</span></div>
        <div class="info-row"><span class="info-label">교육 시간</span><span>${durationLabel}</span></div>
        <div class="info-row"><span class="info-label">법적 근거</span><span>${result.legalInfo.legalBasis}</span></div>
      </div>
    </div>
  `;

  const legalNote = `<p class="legal-note">본 교육자료는 산업안전보건법 제29조 및 고용노동부 고시 기준에 따라 AI로 생성되었습니다. 현장 실정에 맞게 수정 후 사용하시기 바랍니다. | SafeDoc AI (safedoc-ai.vercel.app)</p>`;

  if (tab === 'pptScript') {
    const slides = result.pptScript.split(/(?=={3,}\s*슬라이드)/).filter(Boolean);
    const slideBlocks = slides.length > 1
      ? slides.map((s, i) => `<div class="slide-block"><div class="slide-num">슬라이드 ${i + 1}</div><pre>${s.replace(/={3,}[^\n]*={3,}/g, '').trim()}</pre></div>`).join('')
      : `<pre>${result.pptScript}</pre>`;

    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">${baseStyle}<title>PPT 스크립트 - ${company}</title></head><body>
      <h1>안전교육 PPT 스크립트</h1>
      <p class="subtitle">${eduLabel} · ${workerLabel} · ${durationLabel}</p>
      <hr class="divider">
      ${headerInfo}
      ${slideBlocks}
      ${legalNote}
      <script>window.onload = () => window.print();</script>
    </body></html>`;
  }

  if (tab === 'quiz') {
    const questions = result.quiz.split(/(?=Q\d+[.:])/).filter(Boolean);
    const qBlocks = questions.length > 1
      ? questions.map(q => `<div class="quiz-block"><pre>${q.trim()}</pre></div>`).join('')
      : `<pre>${result.quiz}</pre>`;

    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">${baseStyle}<title>이해도 퀴즈 - ${company}</title></head><body>
      <h1>안전교육 이해도 확인 퀴즈</h1>
      <p class="subtitle">${eduLabel} · ${workerLabel} · 10문항</p>
      <hr class="divider">
      ${headerInfo}
      ${qBlocks}
      ${legalNote}
      <script>window.onload = () => window.print();</script>
    </body></html>`;
  }

  if (tab === 'attendance') {
    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">${baseStyle}<title>교육 출석부 - ${company}</title></head><body>
      <h1>안전교육 출석부</h1>
      <p class="subtitle">${company} · ${dateStr}</p>
      <hr class="divider">
      ${headerInfo}
      <pre>${result.attendance}</pre>
      ${legalNote}
      <script>window.onload = () => window.print();</script>
    </body></html>`;
  }

  // certificate
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">${baseStyle}<title>교육 이수 확인서 - ${company}</title></head><body>
    <div class="cert-box">
      <div class="cert-title">교육 이수 확인서</div>
      <div class="cert-sub">CERTIFICATE OF SAFETY EDUCATION COMPLETION</div>
      <hr class="thin-divider">
      <pre style="text-align:left; margin-top:12px;">${result.certificate}</pre>
      <div class="seal-box"><div class="seal">직인<br/>란</div></div>
    </div>
    ${legalNote}
    <script>window.onload = () => window.print();</script>
  </body></html>`;
}

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
    setSelectedHazards((prev) => {
      const next = prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h];
      setForm((f) => ({ ...f, hazardTypes: next.join(', ') }));
      return next;
    });
  };

  const handleGenerate = async () => {
    if (credits <= 0) {
      setShowPaywall(true);
      return;
    }
    if (!form.constructionType) { setError('공사 종류를 선택해주세요.'); return; }
    if (!form.hazardTypes) { setError('위험요소를 하나 이상 선택해주세요.'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '오류가 발생했습니다.');
      setResult(json.data as SafetyEducationOutput);
      setActiveTab('pptScript');
      const newCredits = credits - 1;
      setCredits(newCredits);
      localStorage.setItem(CREDITS_KEY, String(newCredits));
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

  const handlePrintPDF = () => {
    if (!result) return;
    const html = generatePrintHTML(activeTab, result, companyName, trainingDate, form);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { alert('팝업 차단을 해제해주세요.'); return; }
    win.document.write(html);
    win.document.close();
  };

  const handlePrintAll = () => {
    if (!result) return;
    const tabs: ResultTab[] = ['attendance', 'certificate', 'pptScript', 'quiz'];
    tabs.forEach((tab, i) => {
      setTimeout(() => {
        const html = generatePrintHTML(tab, result, companyName, trainingDate, form);
        const win = window.open('', '_blank', 'width=900,height=700');
        if (win) { win.document.write(html); win.document.close(); }
      }, i * 400);
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* 결제 모달 */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(212,175,55,0.2)]">
            <div className="text-center mb-6">
              <p className="text-4xl mb-3">⚡</p>
              <h2 className="text-2xl font-black text-white">무료 체험 소진</h2>
              <p className="text-gray-400 text-sm mt-2">계속 사용하려면 크레딧을 충전해주세요</p>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { name: '스타터', count: '10회', price: '29,000원', unit: '건당 2,900원', highlight: false },
                { name: '프로', count: '무제한', price: '월 49,000원', unit: '가장 인기', highlight: true },
                { name: '팀', count: '무제한 + 5계정', price: '월 149,000원', unit: '팀 관리 기능', highlight: false },
              ].map(plan => (
                <div key={plan.name} className={`rounded-xl p-4 border flex items-center justify-between ${plan.highlight ? 'bg-yellow-500/15 border-yellow-500/40' : 'bg-gray-800 border-white/10'}`}>
                  <div>
                    <p className={`font-bold text-sm ${plan.highlight ? 'text-yellow-300' : 'text-white'}`}>{plan.name} · {plan.count}</p>
                    <p className="text-xs text-gray-400">{plan.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-white">{plan.price}</p>
                    <a
                      href={`mailto:visionlab@seowonenc.co.kr?subject=SafeDoc AI ${plan.name} 플랜 문의&body=안녕하세요, ${plan.name} 플랜 결제를 원합니다.`}
                      className={`text-xs px-3 py-1 rounded-full mt-1 inline-block ${plan.highlight ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700 text-gray-300'}`}
                    >
                      {plan.highlight ? '바로 시작' : '문의하기'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPaywall(false)}
              className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm"
            >
              닫기
            </button>
            <p className="text-center text-xs text-gray-600 mt-3">visionlab@seowonenc.co.kr · 평일 9-18시 응대</p>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-yellow-400">⚡ SafeDoc AI</h1>
            <p className="text-xs text-gray-500">건설 현장 안전교육 자료 자동 생성</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full hidden sm:block">
              산업안전보건법 제29조 기준
            </span>
            {credits > 0 ? (
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-bold">
                무료 {credits}회 남음
              </span>
            ) : (
              <button
                onClick={() => setShowPaywall(true)}
                className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full font-bold hover:bg-yellow-500/30 transition-all"
              >
                ⚡ 크레딧 충전
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 입력 폼 */}
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold mb-1">안전교육 자료 생성</h2>
              <p className="text-gray-400 text-sm">고용노동부 고시 기준 법정 교육 내용 자동 반영</p>
            </div>

            {/* 근로자 유형 */}
            <div>
              <label className="block text-sm font-semibold text-yellow-400 mb-2">1. 근로자 유형</label>
              <div className="grid grid-cols-3 gap-2">
                {WORKER_TYPES.map((w) => (
                  <button
                    key={w.value}
                    onClick={() => setForm({ ...form, workerType: w.value })}
                    className={`py-3 px-2 rounded-lg border text-center transition-all ${
                      form.workerType === w.value
                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                        : 'bg-gray-800 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <p className="text-sm font-semibold">{w.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{w.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 교육 구분 */}
            <div>
              <label className="block text-sm font-semibold text-yellow-400 mb-2">2. 교육 구분</label>
              <div className="grid grid-cols-2 gap-2">
                {EDUCATION_TYPES.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => setForm({ ...form, educationType: e.value })}
                    className={`py-3 px-3 rounded-lg border text-left transition-all ${
                      form.educationType === e.value
                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                        : 'bg-gray-800 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <p className="text-sm font-semibold">{e.label}</p>
                    <p className="text-xs text-gray-500">{e.desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                <span className="text-blue-400 text-xs">⚖️</span>
                <span className="text-blue-300 text-xs font-semibold">
                  법정 필요 시간: {requiredHours}시간 이상
                </span>
                <span className="text-gray-500 text-xs ml-auto">산업안전보건법 제29조</span>
              </div>
            </div>

            {/* 공사 종류 */}
            <div>
              <label className="block text-sm font-semibold text-yellow-400 mb-2">3. 공사 종류</label>
              <select
                value={form.constructionType}
                onChange={(e) => setForm({ ...form, constructionType: e.target.value })}
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500/50 focus:outline-none"
              >
                <option value="">선택하세요</option>
                {CONSTRUCTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* 위험요소 */}
            <div>
              <label className="block text-sm font-semibold text-yellow-400 mb-2">4. 주요 위험요소 (복수 선택)</label>
              <div className="grid grid-cols-2 gap-2">
                {HAZARD_TYPES.map((h) => (
                  <button
                    key={h}
                    onClick={() => toggleHazard(h)}
                    className={`text-left text-sm px-3 py-2 rounded-lg border transition-all ${
                      selectedHazards.includes(h)
                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                        : 'bg-gray-800 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* 인원 + 시간 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-yellow-400 mb-2">
                  5. 교육 인원: <span className="text-white">{form.workerCount}명</span>
                </label>
                <input
                  type="range" min={1} max={100} value={form.workerCount}
                  onChange={(e) => setForm({ ...form, workerCount: Number(e.target.value) })}
                  className="w-full accent-yellow-400"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1명</span><span>100명</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-yellow-400 mb-2">6. 교육 시간</label>
                <div className="flex flex-col gap-1.5">
                  {(['30min', '1hr', '2hr'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setForm({ ...form, duration: d })}
                      className={`py-2 rounded-lg border text-sm font-semibold transition-all ${
                        form.duration === d
                          ? 'bg-yellow-500 border-yellow-500 text-black'
                          : 'bg-gray-800 border-white/10 text-gray-400 hover:border-yellow-500/30'
                      }`}
                    >
                      {d === '30min' ? '30분' : d === '1hr' ? '1시간' : '2시간'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                ⚠️ {error}
              </p>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-gradient-to-r from-yellow-600 to-yellow-400 text-black hover:from-yellow-500 hover:to-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  AI 생성 중... (약 20~30초)
                </span>
              ) : credits > 0 ? '⚡ 법정 안전교육 자료 생성하기 (무료)' : '⚡ 크레딧 충전 후 생성하기'}
            </button>

            <div className="bg-gray-800/50 border border-white/5 rounded-xl p-4 text-xs text-gray-500 space-y-1">
              <p className="text-blue-400 font-semibold">⚖️ 법적 효력 보장</p>
              <p>✅ 산업안전보건법 제29조 법정 교육 내용 자동 반영</p>
              <p>✅ 고용노동부 고시 제2023-19호 기준 준수</p>
              <p>✅ 교육 이수 확인서 법정 양식으로 자동 생성</p>
              <p className="text-gray-600">⚠️ 현장 실정에 맞게 수정 후 사용하세요.</p>
            </div>
          </div>

          {/* 오른쪽: 결과 */}
          <div ref={resultRef}>
            {result ? (
              <div className="space-y-4">
                {/* 법정 준수 뱃지 */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 font-bold text-sm">⚖️ 법정 기준 준수 확인</span>
                    <span className="ml-auto text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">✓ 적합</span>
                  </div>
                  <p className="text-xs text-gray-400">{result.legalInfo.legalBasis}</p>
                  <p className="text-xs text-blue-300 mt-1">
                    법정 필요 시간: <strong>{result.legalInfo.requiredHours}시간</strong> · 필수 항목 {result.legalInfo.mandatoryItems.length}개 반영
                  </p>
                </div>

                {/* PDF 설정 */}
                <div className="bg-gray-800/60 border border-white/10 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-white">📄 PDF 출력 설정</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">회사명</label>
                      <input
                        type="text"
                        placeholder="(주)서원토건"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-gray-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">교육일자</label>
                      <input
                        type="date"
                        value={trainingDate}
                        onChange={(e) => setTrainingDate(e.target.value)}
                        className="w-full bg-gray-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handlePrintPDF}
                      className="py-2.5 rounded-lg bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-all flex items-center justify-center gap-1.5"
                    >
                      🖨️ 현재 탭 PDF 저장
                    </button>
                    <button
                      onClick={handlePrintAll}
                      className="py-2.5 rounded-lg bg-gray-700 border border-yellow-500/30 text-yellow-300 font-bold text-sm hover:bg-gray-600 transition-all flex items-center justify-center gap-1.5"
                    >
                      📦 전체 4종 저장
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-green-400">✅ 생성 완료!</h3>
                  <button
                    onClick={handleCopy}
                    className="text-sm border border-white/10 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-all"
                  >
                    {copied ? '✅ 복사됨' : '📋 복사'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(TAB_LABELS) as ResultTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs py-2 px-3 rounded-lg border transition-all ${
                        activeTab === tab
                          ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                          : 'bg-gray-800 border-white/10 text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {TAB_LABELS[tab]}
                    </button>
                  ))}
                </div>

                <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4 h-[380px] overflow-y-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
                    {result[activeTab]}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-6 py-10">
                  <div className="text-6xl">🏗️</div>
                  <div>
                    <p className="text-white font-semibold text-lg">왼쪽에서 조건 입력 후</p>
                    <p className="text-gray-400">생성 버튼을 눌러주세요</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-left max-w-sm mx-auto">
                    {[
                      { icon: '📊', label: 'PPT 스크립트', desc: '법정 항목 반영' },
                      { icon: '📝', label: '퀴즈 10문항', desc: '정답 자동 포함' },
                      { icon: '📋', label: '출석부', desc: '법정 양식' },
                      { icon: '🏆', label: '이수 확인서', desc: '법적 효력' },
                    ].map((item) => (
                      <div key={item.label} className="bg-gray-800/50 border border-white/5 rounded-xl p-3">
                        <p className="text-lg">{item.icon}</p>
                        <p className="text-sm font-semibold text-white mt-1">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-left max-w-sm mx-auto">
                    <p className="text-yellow-400 text-xs font-bold mb-1">🖨️ PDF 즉시 출력 가능</p>
                    <p className="text-gray-400 text-xs">회사명·날짜 입력 후 버튼 한 번으로 법정 양식 PDF 저장. 고용노동부 감사 대비 즉시 제출 가능.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 가격 */}
        <div className="mt-16 border-t border-white/5 pt-10">
          <h3 className="text-center text-lg font-bold mb-2 text-gray-300">서비스 요금</h3>
          <p className="text-center text-xs text-gray-500 mb-8">교육자료 1세트 = PPT스크립트 + 퀴즈 + 출석부 + 이수확인서 + PDF 다운로드</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              {
                name: '스타터', badge: '10회권',
                price: '29,000원', unit: '건당 2,900원',
                features: ['교육자료 4종 생성', 'PDF 즉시 출력', '법정 기준 자동 반영'],
                highlight: false, cta: '문의하기',
              },
              {
                name: '프로', badge: '가장 인기',
                price: '49,000원', unit: '/월 무제한',
                features: ['무제한 생성', 'PDF 즉시 출력', '생성 이력 저장', '우선 지원'],
                highlight: true, cta: '바로 시작',
              },
              {
                name: '팀', badge: '기업용',
                price: '149,000원', unit: '/월',
                features: ['5계정 공유', '회사 로고 삽입', '현장별 관리', '전화 지원'],
                highlight: false, cta: '문의하기',
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-xl p-5 border ${plan.highlight ? 'bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_20px_rgba(212,175,55,0.15)]' : 'bg-gray-800/30 border-white/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-bold ${plan.highlight ? 'text-yellow-400' : 'text-gray-400'}`}>{plan.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${plan.highlight ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-700 text-gray-400'}`}>{plan.badge}</span>
                </div>
                <p className="text-2xl font-black text-white">{plan.price}</p>
                <p className="text-xs text-gray-500 mb-3">{plan.unit}</p>
                <ul className="space-y-1 mb-4">
                  {plan.features.map((f) => <li key={f} className="text-xs text-gray-400">✓ {f}</li>)}
                </ul>
                <a
                  href={`mailto:visionlab@seowonenc.co.kr?subject=SafeDoc AI ${plan.name} 플랜 문의`}
                  className={`block w-full text-center py-2.5 rounded-lg font-bold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                      : 'border border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">문의: visionlab@seowonenc.co.kr · 세금계산서 발행 가능</p>
        </div>
      </main>
    </div>
  );
}
