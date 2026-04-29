'use client';

import { useState, useEffect, useRef } from 'react';
import type { GenerateRequest, SafetyEducationOutput, WorkerType, EducationType } from './api/generate/route';

/* ══════════════════════════════════════════════
   SVG 아이콘 컴포넌트 (이모지 완전 대체)
══════════════════════════════════════════════ */
const Icon = {
  Shield: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22C12 22 4 18 4 12V5.5L12 2.5L20 5.5V12C20 18 12 22 12 22Z"/>
      <polyline points="9,12 11,14 15,10"/>
    </svg>
  ),
  FileText: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  ),
  Clock: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  ),
  Download: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"/>
      <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Check: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  CheckCircle: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"/>
      <polyline points="22,4 12,14.01 9,11.01"/>
    </svg>
  ),
  HardHat: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18H22"/><path d="M2 14C2 14 3.5 8 12 8C20.5 8 22 14 22 14"/>
      <path d="M12 2V8"/><path d="M5 14V18"/><path d="M19 14V18"/>
    </svg>
  ),
  Users: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
  Scale: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Printer: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6,9 6,2 18,2 18,9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  ),
  Layers: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 2,7 12,12 22,7 12,2"/>
      <polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/>
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
  BarChart: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  Award: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"/>
      <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
    </svg>
  ),
  List: ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
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
const CONSTRUCTION_TYPES = [
  '철근콘크리트 공사', '조적·미장 공사', '도장 공사', '가설 공사',
  '토공사·굴착', '철골 공사', '전기·설비 공사', '인테리어·마감 공사',
];
const HAZARD_TYPES = [
  '고소작업 (추락)', '중장비 협착', '전기 감전', '밀폐공간',
  '화재·폭발', '낙하·비래', '질식·유해가스', '근골격계 부담',
];
const WORKER_TYPES: { value: WorkerType; label: string; legal: string }[] = [
  { value: 'office',  label: '사무직',          legal: '분기 3시간' },
  { value: 'field',   label: '현장 근로자',      legal: '분기 6시간' },
  { value: 'special', label: '특별위험작업',     legal: '특별교육 16시간' },
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
const WORKER_LABELS: Record<WorkerType, string> = { office: '사무직', field: '현장 근로자', special: '특별위험작업 근로자' };
const EDU_LABELS: Record<EducationType, string> = { regular: '정기교육', onboarding: '채용 시 교육', change: '작업 변경 시 교육', special: '특별교육' };
const DURATION_LABELS: Record<string, string> = { '30min': '30분', '1hr': '1시간', '2hr': '2시간' };

type ResultTab = 'pptScript' | 'quiz' | 'attendance' | 'certificate';
const TABS: { key: ResultTab; label: string }[] = [
  { key: 'pptScript',   label: 'PPT 스크립트' },
  { key: 'quiz',        label: '퀴즈 10문항' },
  { key: 'attendance',  label: '출석부' },
  { key: 'certificate', label: '이수확인서' },
];

const FREE_CREDITS = 1;
const CREDITS_KEY = 'safedoc_credits_v3';

/* ══════════════════════════════════════════════
   PDF 생성
══════════════════════════════════════════════ */
function generatePrintHTML(tab: ResultTab, result: SafetyEducationOutput, company: string, date: string, form: GenerateRequest): string {
  const co = company || '(회사명 미입력)';
  const dt = new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const css = `<style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Noto Sans KR','맑은 고딕',sans-serif;padding:15mm 20mm;color:#0F172A;font-size:10pt;line-height:1.65}
    h1{font-size:18pt;font-weight:900;text-align:center;padding-bottom:8px;border-bottom:2px solid #0F172A;margin-bottom:12px}
    .sub{text-align:center;color:#475569;font-size:9.5pt;margin-bottom:12px}
    .meta{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:10px 14px;margin-bottom:14px;display:grid;grid-template-columns:1fr 1fr;gap:3px 20px}
    .mr{font-size:9pt;display:flex;gap:8px}.ml{font-weight:700;min-width:70px;color:#374151}
    pre{font-family:'Noto Sans KR','맑은 고딕',sans-serif;white-space:pre-wrap;font-size:9.5pt;line-height:1.75}
    .slide{margin-bottom:12px;border:1px solid #E2E8F0;border-radius:6px;padding:10px 14px}
    .sn{font-size:8pt;font-weight:700;color:#1E40AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
    .qq{border-left:3px solid #1E40AF;padding:8px 12px;margin-bottom:8px;background:#F8FAFC}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th{background:#1E3A8A;color:#fff;padding:7px;font-size:9pt;border:1px solid #1E3A8A}
    td{padding:6px;border:1px solid #CBD5E1;height:28px;text-align:center;font-size:9pt}
    tr:nth-child(even)td{background:#F8FAFC}
    .cert{border:3px double #0F172A;padding:24px;text-align:center;margin:10px 0}
    .ct{font-size:24pt;font-weight:900;letter-spacing:8px;margin-bottom:8px}
    .cs{font-size:9.5pt;color:#475569;margin-bottom:16px}
    .seal{float:right;width:68px;height:68px;border:2px solid #CBD5E1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8pt;color:#9CA3AF;text-align:center}
    .foot{margin-top:12px;padding-top:8px;border-top:1px solid #E2E8F0;font-size:7.5pt;color:#94A3B8;text-align:center}
    @media print{@page{size:A4;margin:0}body{padding:10mm 15mm}}
  </style>`;
  const meta = `<div class="meta">
    <div class="mr"><span class="ml">회사명</span><span>${co}</span></div>
    <div class="mr"><span class="ml">교육일자</span><span>${dt}</span></div>
    <div class="mr"><span class="ml">공사 종류</span><span>${form.constructionType}</span></div>
    <div class="mr"><span class="ml">위험요소</span><span>${form.hazardTypes}</span></div>
    <div class="mr"><span class="ml">근로자 유형</span><span>${WORKER_LABELS[form.workerType]}</span></div>
    <div class="mr"><span class="ml">교육 구분</span><span>${EDU_LABELS[form.educationType]}</span></div>
    <div class="mr"><span class="ml">교육 시간</span><span>${DURATION_LABELS[form.duration]}</span></div>
    <div class="mr"><span class="ml">법적 근거</span><span>${result.legalInfo.legalBasis}</span></div>
  </div>`;
  const foot = `<p class="foot">본 교육자료는 산업안전보건법 제29조 및 고용노동부 고시 기준에 따라 SafeDoc AI가 생성하였습니다. 현장 실정에 맞게 수정 후 사용하십시오. | safedoc-ai.vercel.app</p>`;
  const wrap = (t: string, s: string, b: string) =>
    `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">${css}<title>${t} — ${co}</title></head><body>
    <h1>${t}</h1><p class="sub">${s}</p>${meta}${b}${foot}
    <script>window.onload=()=>window.print();</script></body></html>`;
  if (tab === 'pptScript') {
    const slides = result.pptScript.split(/(?=={3,}\s*슬라이드)/).filter(Boolean);
    const body = slides.length > 1
      ? slides.map((s,i)=>`<div class="slide"><div class="sn">SLIDE ${i+1}</div><pre>${s.replace(/={3,}[^\n]*={3,}/g,'').trim()}</pre></div>`).join('')
      : `<pre>${result.pptScript}</pre>`;
    return wrap('안전교육 PPT 스크립트', `${EDU_LABELS[form.educationType]} · ${WORKER_LABELS[form.workerType]} · ${DURATION_LABELS[form.duration]}`, body);
  }
  if (tab === 'quiz') {
    const qs = result.quiz.split(/(?=Q\d+[.:])/).filter(Boolean);
    const body = qs.length>1 ? qs.map(q=>`<div class="qq"><pre>${q.trim()}</pre></div>`).join('') : `<pre>${result.quiz}</pre>`;
    return wrap('이해도 확인 퀴즈', `${EDU_LABELS[form.educationType]} · 10문항`, body);
  }
  if (tab === 'attendance') return wrap('안전교육 출석부', `${co} · ${dt}`, `<pre>${result.attendance}</pre>`);
  return wrap('교육 이수 확인서', `${co} · ${dt}`, `<div class="cert"><div class="ct">교육 이수 확인서</div><div class="cs">CERTIFICATE OF SAFETY EDUCATION COMPLETION</div><pre style="text-align:left">${result.certificate}</pre><div class="seal">직인</div></div>`);
}

/* ══════════════════════════════════════════════
   메인 컴포넌트
══════════════════════════════════════════════ */
export default function HomePage() {
  const [form, setForm] = useState<GenerateRequest>({ constructionType:'', hazardTypes:'', workerCount:10, duration:'1hr', workerType:'field', educationType:'regular' });
  const [selectedHazards, setSelectedHazards] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafetyEducationOutput|null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<ResultTab>('pptScript');
  const [copied, setCopied] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [trainingDate, setTrainingDate] = useState(()=>new Date().toISOString().split('T')[0]);
  const [credits, setCredits] = useState(FREE_CREDITS);
  const [showPaywall, setShowPaywall] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const toolRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const s = localStorage.getItem(CREDITS_KEY);
    if(s===null) localStorage.setItem(CREDITS_KEY,String(FREE_CREDITS));
    else setCredits(parseInt(s,10));
  },[]);

  const requiredHours = LEGAL_HOURS[form.workerType][form.educationType];

  const toggleHazard = (h:string)=>{
    setSelectedHazards(prev=>{
      const next = prev.includes(h) ? prev.filter(x=>x!==h) : [...prev,h];
      setForm(f=>({...f, hazardTypes:next.join(', ')}));
      return next;
    });
  };

  const handleGenerate = async ()=>{
    if(credits<=0){setShowPaywall(true);return;}
    if(!form.constructionType){setError('공사 종류를 선택해주세요.');return;}
    if(!form.hazardTypes){setError('위험요소를 하나 이상 선택해주세요.');return;}
    setLoading(true);setError('');setResult(null);
    try{
      const res = await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const json = await res.json();
      if(!res.ok) throw new Error(json.error||'오류가 발생했습니다.');
      setResult(json.data as SafetyEducationOutput);
      setActiveTab('pptScript');
      const nc=credits-1; setCredits(nc); localStorage.setItem(CREDITS_KEY,String(nc));
      setTimeout(()=>resultRef.current?.scrollIntoView({behavior:'smooth'}),100);
    }catch(e){setError(e instanceof Error ? e.message : '알 수 없는 오류');}
    finally{setLoading(false);}
  };

  const handleCopy = async ()=>{
    if(!result)return;
    await navigator.clipboard.writeText(result[activeTab]);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  const handlePrint = (tab?:ResultTab)=>{
    if(!result)return;
    const html = generatePrintHTML(tab??activeTab,result,companyName,trainingDate,form);
    const win = window.open('','_blank','width=900,height=700');
    if(!win){alert('팝업 차단을 해제해주세요.');return;}
    win.document.write(html);win.document.close();
  };

  const handlePrintAll = ()=>{
    if(!result)return;
    (['attendance','certificate','pptScript','quiz'] as ResultTab[]).forEach((t,i)=>setTimeout(()=>handlePrint(t),i*500));
  };

  return (
    <div className="min-h-screen bg-white" style={{fontFamily:"'Pretendard','Inter','Apple SD Gothic Neo','Malgun Gothic',sans-serif"}}>

      {/* ── 결제 모달 ── */}
      {showPaywall&&(
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <div className="mb-6">
              <div className="w-12 h-12 bg-[#0D1B2A] rounded-xl flex items-center justify-center mb-4">
                <Icon.Zap className="w-6 h-6 text-white"/>
              </div>
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-1">무료 체험 횟수 소진</h2>
              <p className="text-slate-500 text-sm">법정 안전교육 자료 자동 생성을 계속 이용하려면 플랜을 선택하세요.</p>
            </div>
            <div className="space-y-2 mb-6">
              {[
                {name:'스타터',detail:'10회권',price:'29,000원',per:'건당 2,900원',hot:false},
                {name:'프로',detail:'월 무제한',price:'49,000원/월',per:'가장 인기 · 무제한 사용',hot:true},
                {name:'팀',detail:'5계정 공유',price:'149,000원/월',per:'기업용 · 현장별 관리',hot:false},
              ].map(p=>(
                <a key={p.name} href={`mailto:visionlab@seowonenc.co.kr?subject=SafeDoc AI ${p.name} 플랜 문의`}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${p.hot?'border-[#1E40AF] bg-blue-50':'border-slate-200 hover:border-slate-300'}`}>
                  <div>
                    <p className={`font-semibold text-sm ${p.hot?'text-[#1E40AF]':'text-[#0D1B2A]'}`}>{p.name} <span className="font-normal text-slate-400 text-xs">· {p.detail}</span></p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.per}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <p className="font-bold text-[#0D1B2A] text-sm">{p.price}</p>
                    <Icon.ChevronRight className="w-4 h-4 text-slate-300"/>
                  </div>
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mb-4">세금계산서 발행 가능 · visionlab@seowonenc.co.kr</p>
            <button onClick={()=>setShowPaywall(false)} className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors border border-slate-200 rounded-xl">닫기</button>
          </div>
        </div>
      )}

      {/* ── 네비게이션 ── */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0D1B2A] rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon.Shield className="w-4 h-4 text-white"/>
            </div>
            <div>
              <span className="font-bold text-[#0D1B2A] tracking-tight">SafeDoc AI</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2">건설 안전교육 자료 자동화</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <Icon.Scale className="w-3 h-3"/>
              <span>산업안전보건법 제29조 기준</span>
            </div>
            {credits>0
              ? <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full">무료 체험 {credits}회 남음</span>
              : <button onClick={()=>setShowPaywall(true)} className="text-xs font-semibold bg-[#EA580C] text-white px-3 py-1.5 rounded-full hover:bg-[#DC4C00] transition-colors">크레딧 충전</button>
            }
          </div>
        </div>
      </nav>

      {/* ── 히어로 ── */}
      <section className="bg-[#0D1B2A] text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-3 py-1 text-xs text-slate-300 mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>
              고용노동부 고시 제2023-19호 기준 자동 반영
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-[1.15] tracking-tight mb-5">
              법정 안전교육 자료,<br/>
              <span className="text-[#EA580C]">이제 2분이면 완성됩니다.</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              산업안전보건법 제29조 필수 항목이 자동으로 반영됩니다.<br/>
              PPT 스크립트부터 이수확인서까지, 한 번의 클릭으로 법정 문서 4종을 완성하세요.
            </p>
            <div className="flex flex-wrap gap-3 mb-12">
              {[
                {icon:<Icon.Shield className="w-3.5 h-3.5"/>, text:'산업안전보건법 제29조 준수'},
                {icon:<Icon.Download className="w-3.5 h-3.5"/>, text:'PDF 즉시 출력'},
                {icon:<Icon.Clock className="w-3.5 h-3.5"/>, text:'평균 생성 시간 2분'},
                {icon:<Icon.Award className="w-3.5 h-3.5"/>, text:'법적 효력 있는 양식'},
              ].map(b=>(
                <span key={b.text} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                  {b.icon}{b.text}
                </span>
              ))}
            </div>
            {/* 수치 지표 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-8">
              {[
                {num:'4종', label:'법정 문서 동시 완성'},
                {num:'120초', label:'평균 생성 소요 시간'},
                {num:'29조', label:'산업안전보건법 기준'},
                {num:'100%', label:'고용노동부 고시 준수'},
              ].map(s=>(
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
      <section ref={toolRef} className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">

            {/* 입력 폼 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Icon.Settings className="w-4 h-4 text-slate-500"/>
                </div>
                <div>
                  <p className="font-bold text-[#0D1B2A] text-sm">교육 조건 설정</p>
                  <p className="text-xs text-slate-400">6가지 항목 입력 후 생성 버튼 클릭</p>
                </div>
              </div>
              <div className="p-6 space-y-6">

                {/* ① 근로자 유형 */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">1</span>
                    근로자 유형
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {WORKER_TYPES.map(w=>(
                      <button key={w.value} onClick={()=>setForm({...form,workerType:w.value})}
                        className={`py-3 px-3 rounded-xl border text-center transition-all ${form.workerType===w.value?'bg-[#0D1B2A] border-[#0D1B2A] text-white':'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <p className="text-xs font-semibold">{w.label}</p>
                        <p className={`text-xs mt-0.5 ${form.workerType===w.value?'text-slate-300':'text-slate-400'}`}>{w.legal}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ② 교육 구분 */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">2</span>
                    교육 구분
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {EDUCATION_TYPES.map(e=>(
                      <button key={e.value} onClick={()=>setForm({...form,educationType:e.value})}
                        className={`py-3 px-3 rounded-xl border text-left transition-all ${form.educationType===e.value?'bg-[#0D1B2A] border-[#0D1B2A] text-white':'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <p className="text-xs font-semibold">{e.label}</p>
                        <p className={`text-xs mt-0.5 ${form.educationType===e.value?'text-slate-300':'text-slate-400'}`}>{e.desc}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <Icon.Scale className="w-3.5 h-3.5 text-blue-600 flex-shrink-0"/>
                    <span className="text-xs font-semibold text-blue-700">법정 필요 시간: {requiredHours}시간 이상</span>
                    <span className="text-xs text-slate-400 ml-auto">산업안전보건법 제29조</span>
                  </div>
                </div>

                {/* ③ 공사 종류 */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">3</span>
                    공사 종류
                  </label>
                  <div className="relative">
                    <select value={form.constructionType} onChange={e=>setForm({...form,constructionType:e.target.value})}
                      className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 focus:border-[#0D1B2A] focus:ring-2 focus:ring-slate-100 focus:outline-none pr-10">
                      <option value="">공사 종류 선택</option>
                      {CONSTRUCTION_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                    <Icon.ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none"/>
                  </div>
                </div>

                {/* ④ 위험요소 */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">4</span>
                    주요 위험요소
                    <span className="font-normal normal-case text-slate-400">복수 선택</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {HAZARD_TYPES.map(h=>(
                      <button key={h} onClick={()=>toggleHazard(h)}
                        className={`flex items-center gap-2 text-left text-xs px-3 py-2.5 rounded-lg border transition-all ${selectedHazards.includes(h)?'bg-[#0D1B2A] border-[#0D1B2A] text-white':'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${selectedHazards.includes(h)?'bg-white/20 border-white/40':'border-slate-300'}`}>
                          {selectedHazards.includes(h)&&<Icon.Check className="w-3 h-3 text-white"/>}
                        </div>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ⑤⑥ 인원 + 시간 */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">5</span>
                      교육 인원
                    </label>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">인원 수</span>
                      <span className="text-sm font-bold text-[#0D1B2A]">{form.workerCount}명</span>
                    </div>
                    <input type="range" min={1} max={100} value={form.workerCount}
                      onChange={e=>setForm({...form,workerCount:Number(e.target.value)})}
                      className="w-full accent-[#0D1B2A]"/>
                    <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1명</span><span>100명</span></div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-black">6</span>
                      교육 시간
                    </label>
                    <div className="flex flex-col gap-1.5">
                      {(['30min','1hr','2hr'] as const).map(d=>(
                        <button key={d} onClick={()=>setForm({...form,duration:d})}
                          className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${form.duration===d?'bg-[#0D1B2A] border-[#0D1B2A] text-white':'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          {d==='30min'?'30분':d==='1hr'?'1시간':'2시간'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error&&(
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <Icon.AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0"/>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button onClick={handleGenerate} disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all bg-[#EA580C] text-white hover:bg-[#DC4C00] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>AI 생성 중... (약 20~30초)</>
                    : credits>0
                      ? <><Icon.Zap className="w-4 h-4"/>안전교육 자료 생성하기 (무료 체험)</>
                      : <><Icon.Zap className="w-4 h-4"/>크레딧 충전 후 생성하기</>
                  }
                </button>

                <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <Icon.Shield className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-0.5">법적 효력 보장</p>
                    <p className="text-xs text-slate-400 leading-relaxed">산업안전보건법 제29조 · 고용노동부 고시 제2023-19호 기준 법정 필수 항목 자동 포함. 현장 실정에 맞게 수정 후 사용하세요.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 결과 패널 */}
            <div ref={resultRef}>
              {result ? (
                <div className="space-y-4">
                  {/* 완료 상태 */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Icon.Check className="w-3.5 h-3.5 text-white"/>
                        </div>
                        <span className="font-bold text-[#0D1B2A] text-sm">생성 완료</span>
                      </div>
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        <Icon.CheckCircle className="w-3 h-3"/>법정 기준 적합
                      </span>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <p className="text-xs font-medium text-blue-700">{result.legalInfo.legalBasis}</p>
                      <p className="text-xs text-slate-500 mt-1">법정 필요 시간 <strong className="text-slate-700">{result.legalInfo.requiredHours}시간</strong> · 필수 교육항목 <strong className="text-slate-700">{result.legalInfo.mandatoryItems.length}개</strong> 자동 반영</p>
                    </div>
                  </div>

                  {/* PDF 설정 */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon.Printer className="w-4 h-4 text-slate-500"/>
                      <p className="text-sm font-bold text-[#0D1B2A]">PDF 출력 설정</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">회사명</label>
                        <input type="text" placeholder="(주)서원토건" value={companyName} onChange={e=>setCompanyName(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:border-[#0D1B2A] focus:ring-2 focus:ring-slate-100 focus:outline-none"/>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">교육일자</label>
                        <input type="date" value={trainingDate} onChange={e=>setTrainingDate(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:border-[#0D1B2A] focus:ring-2 focus:ring-slate-100 focus:outline-none"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={()=>handlePrint()}
                        className="py-2.5 rounded-xl bg-[#EA580C] text-white font-semibold text-xs hover:bg-[#DC4C00] transition-colors flex items-center justify-center gap-1.5">
                        <Icon.Download className="w-3.5 h-3.5"/>현재 탭 PDF 저장
                      </button>
                      <button onClick={handlePrintAll}
                        className="py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5">
                        <Icon.Layers className="w-3.5 h-3.5"/>전체 4종 저장
                      </button>
                    </div>
                  </div>

                  {/* 탭 + 문서 미리보기 */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-100">
                      {TABS.map(tab=>(
                        <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
                          className={`flex-1 py-3 px-1 text-xs font-medium transition-all border-b-2 ${activeTab===tab.key?'border-[#0D1B2A] text-[#0D1B2A] bg-slate-50/50':'border-transparent text-slate-400 hover:text-slate-600'}`}>
                          {tab.label}
                        </button>
                      ))}
                      <button onClick={handleCopy}
                        className="px-4 border-l border-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
                        <Icon.Copy className="w-3.5 h-3.5"/>
                        <span className="text-xs">{copied?'완료':'복사'}</span>
                      </button>
                    </div>
                    <div className="p-5 h-[360px] overflow-y-auto">
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed" style={{fontFamily:"'Pretendard','Malgun Gothic',sans-serif"}}>
                        {result[activeTab]}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                /* 빈 상태 */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full min-h-[580px] flex items-center justify-center">
                  <div className="text-center max-w-sm px-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon.HardHat className="w-8 h-8 text-slate-400"/>
                    </div>
                    <h3 className="font-bold text-[#0D1B2A] text-lg mb-2">조건을 설정하고 생성하세요</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                      6가지 항목 선택 후 생성 버튼을 누르면<br/>법정 교육자료 4종이 즉시 완성됩니다
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {[
                        {icon:<Icon.BarChart className="w-4 h-4"/>, label:'PPT 스크립트', desc:'슬라이드 10장'},
                        {icon:<Icon.List className="w-4 h-4"/>,    label:'퀴즈 10문항',  desc:'정답 자동 포함'},
                        {icon:<Icon.Users className="w-4 h-4"/>,   label:'출석부',        desc:'법정 양식'},
                        {icon:<Icon.Award className="w-4 h-4"/>,   label:'이수확인서',    desc:'법적 효력'},
                      ].map(item=>(
                        <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
                          <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center mb-2 text-slate-500">{item.icon}</div>
                          <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon.Download className="w-3.5 h-3.5 text-amber-600"/>
                        <p className="text-xs font-semibold text-amber-700">PDF 즉시 출력 가능</p>
                      </div>
                      <p className="text-xs text-slate-500">회사명과 교육일자 입력 후 클릭 한 번으로 법정 양식 PDF 저장. 고용노동부 감사 즉시 대응.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">사용 방법</p>
            <h2 className="text-2xl font-black text-[#0D1B2A]">3단계, 2분이면 완성됩니다</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {step:'01',icon:<Icon.Settings className="w-6 h-6"/>,title:'조건 설정',desc:'근로자 유형, 교육 구분, 공사 종류, 위험요소 등 6가지 항목을 클릭으로 선택합니다.'},
              {step:'02',icon:<Icon.Zap className="w-6 h-6"/>,title:'AI 자동 생성',desc:'고용노동부 고시 기준 법정 필수 항목이 포함된 맞춤 교육자료를 AI가 120초 이내에 완성합니다.'},
              {step:'03',icon:<Icon.Printer className="w-6 h-6"/>,title:'PDF 저장·출력',desc:'회사명과 날짜 입력 후 버튼 하나로 A4 법정 양식 PDF를 저장합니다. 즉시 인쇄·제출 가능합니다.'},
            ].map((s,i)=>(
              <div key={s.step} className="relative">
                {i<2&&<div className="hidden md:block absolute top-8 left-full w-8 h-px bg-slate-300 -translate-x-4 z-10"/>}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-[#0D1B2A] rounded-2xl flex items-center justify-center text-white">
                      {s.icon}
                    </div>
                  </div>
                  <div className="pt-1">
                    <p className="text-xs font-bold text-slate-400 mb-1">STEP {s.step}</p>
                    <h3 className="font-bold text-[#0D1B2A] mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 가격 ── */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">요금제</p>
            <h2 className="text-2xl font-black text-[#0D1B2A] mb-3">규모에 맞는 플랜을 선택하세요</h2>
            <p className="text-sm text-slate-500">1세트 = PPT 스크립트 + 퀴즈 + 출석부 + 이수확인서 + PDF 출력</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name:'스타터', tag:'소규모 현장',
                price:'29,000', unit:'원 / 10회',
                per:'건당 2,900원',
                features:['교육자료 4종 자동 생성','PDF 즉시 출력','법정 기준 자동 반영','세금계산서 발행'],
                highlight:false,
              },{
                name:'프로', tag:'가장 인기',
                price:'49,000', unit:'원 / 월',
                per:'월 무제한 사용',
                features:['무제한 생성','PDF 즉시 출력','30일 생성 이력','우선 이메일 지원','세금계산서 발행'],
                highlight:true,
              },{
                name:'팀', tag:'기업용',
                price:'149,000', unit:'원 / 월',
                per:'5계정 팀 공유',
                features:['5계정 공유 사용','회사 로고 PDF 삽입','현장별 분류 관리','전화·카카오 지원','세금계산서 발행'],
                highlight:false,
              },
            ].map(plan=>(
              <div key={plan.name} className={`rounded-2xl border p-6 flex flex-col relative ${plan.highlight?'bg-[#0D1B2A] border-[#0D1B2A]':'bg-white border-slate-200'}`}>
                {plan.highlight&&(
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#EA580C] text-white text-xs font-bold px-3 py-1 rounded-full">가장 인기</span>
                )}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-bold ${plan.highlight?'text-white':'text-[#0D1B2A]'}`}>{plan.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${plan.highlight?'bg-white/10 text-slate-300':'bg-slate-100 text-slate-500'}`}>{plan.tag}</span>
                  </div>
                  <div className="flex items-end gap-1 mb-0.5">
                    <span className={`text-3xl font-black ${plan.highlight?'text-white':'text-[#0D1B2A]'}`}>{plan.price}</span>
                    <span className={`text-sm mb-1 ${plan.highlight?'text-slate-300':'text-slate-400'}`}>{plan.unit}</span>
                  </div>
                  <p className={`text-xs ${plan.highlight?'text-slate-400':'text-slate-400'}`}>{plan.per}</p>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(f=>(
                    <li key={f} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight?'bg-white/10':'bg-slate-100'}`}>
                        <Icon.Check className={`w-2.5 h-2.5 ${plan.highlight?'text-white':'text-[#0D1B2A]'}`}/>
                      </div>
                      <span className={`text-xs ${plan.highlight?'text-slate-300':'text-slate-500'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={`mailto:visionlab@seowonenc.co.kr?subject=SafeDoc AI ${plan.name} 플랜 문의`}
                  className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.highlight?'bg-white text-[#0D1B2A] hover:bg-slate-100':'bg-[#0D1B2A] text-white hover:bg-slate-800'}`}>
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
                  <Icon.Shield className="w-4 h-4 text-white"/>
                </div>
                <span className="font-bold text-white">SafeDoc AI</span>
              </div>
              <p className="text-xs text-slate-400 max-w-xs">건설 현장 법정 안전교육 자료 자동화 서비스. 산업안전보건법 제29조 · 고용노동부 고시 제2023-19호 기준.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">© 2026 SafeDoc AI. All rights reserved.</p>
              <p className="text-xs text-slate-500 mt-1">visionlab@seowonenc.co.kr</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
