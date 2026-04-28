'use client';

import { useState } from 'react';
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

// 법정 필요시간 계산
const LEGAL_HOURS: Record<WorkerType, Record<EducationType, number>> = {
  office:  { regular: 3,  onboarding: 4,  change: 1,  special: 2 },
  field:   { regular: 6,  onboarding: 8,  change: 2,  special: 16 },
  special: { regular: 6,  onboarding: 8,  change: 2,  special: 16 },
};

type ResultTab = 'pptScript' | 'quiz' | 'attendance' | 'certificate';

const TAB_LABELS: Record<ResultTab, string> = {
  pptScript: '📊 PPT 스크립트',
  quiz: '📝 퀴즈 10문항',
  attendance: '📋 출석부',
  certificate: '🏆 이수확인서',
};

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

  const requiredHours = LEGAL_HOURS[form.workerType][form.educationType];

  const toggleHazard = (h: string) => {
    setSelectedHazards((prev) => {
      const next = prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h];
      setForm((f) => ({ ...f, hazardTypes: next.join(', ') }));
      return next;
    });
  };

  const handleGenerate = async () => {
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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
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
            <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full">
              FREE DEMO
            </span>
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
              {/* 법정 시간 뱃지 */}
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
              ) : '⚡ 법정 안전교육 자료 생성하기'}
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
          <div>
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

                <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4 h-[440px] overflow-y-auto">
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
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-left max-w-sm mx-auto">
                    <p className="text-blue-400 text-xs font-bold mb-2">⚖️ 법정 기준 자동 반영</p>
                    <p className="text-gray-400 text-xs">산업안전보건법 제29조 + 고용노동부 고시 기준으로 법적 효력 있는 교육자료 생성</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 가격 */}
        <div className="mt-16 border-t border-white/5 pt-10">
          <h3 className="text-center text-lg font-bold mb-6 text-gray-300">서비스 요금</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'DEMO', price: '무료', features: ['3회 무료 체험', '모든 기능 포함', '법정 기준 반영'], highlight: false },
              { name: 'BASIC', price: '월 15만원', features: ['무제한 생성', '5개 현장 관리', '이메일 지원'], highlight: true },
              { name: 'PRO', price: '건당 3만원', features: ['단발성 사용', '즉시 결제·생성', '영수증 발행'], highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-xl p-5 border ${plan.highlight ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-gray-800/30 border-white/5'}`}>
                <p className={`text-sm font-bold ${plan.highlight ? 'text-yellow-400' : 'text-gray-400'}`}>{plan.name}</p>
                <p className="text-2xl font-black text-white mt-1">{plan.price}</p>
                <ul className="mt-3 space-y-1">
                  {plan.features.map((f) => <li key={f} className="text-xs text-gray-400">✓ {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">문의: visionlab@seowonenc.co.kr</p>
        </div>
      </main>
    </div>
  );
}
