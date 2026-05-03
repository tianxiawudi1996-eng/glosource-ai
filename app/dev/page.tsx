'use client';

import { useState, useEffect } from 'react';

const SESSION_KEY = 'glosource_dev_key';
const HISTORY_KEY = 'glosource_search_history';

type SourceMode = 'ai' | '1688' | 'wechat';

interface Supplier {
  rank?: number;
  name?: string;
  platform?: string;
  country?: string;
  url?: string;
  trustScore?: number;
  trustEvidence?: string[];
  redFlags?: string[];
  estimatedPrice?: string;
  moq?: string;
  summary?: string;
  verificationStatus?: string;
  productStage?: string;
  leadTimeDays?: string;
  hscode?: string;
  exportToKoreaExperience?: boolean;
  productMatch?: string;
  [key: string]: unknown;
}

interface ApiResult {
  timestamp: string;
  source: SourceMode;
  query: Record<string, string>;
  status: number;
  raw: unknown;
  suppliers?: Supplier[];
  groundingUsed?: boolean;
  error?: string;
}

export default function DevPage() {
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');

  const [source, setSource] = useState<SourceMode>('ai');
  const [product, setProduct] = useState('스마트글래스 AR헤드셋');
  const [quantity, setQuantity] = useState('100개');
  const [budget, setBudget] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApiResult[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [tab, setTab] = useState<'history' | 'test'>('history');

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      setPwInput(saved);
      setAuthed(true);
      loadHistory(saved);
    }
    // loadHistory is stable for mount — key is always passed explicitly here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseItems = (items: ApiResult[]): ApiResult[] =>
    items.map(item => {
      const data = (item.raw as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
      return {
        ...item,
        suppliers: (data?.suppliers ?? (item.raw as Record<string, unknown>)?.suppliers) as Supplier[] | undefined,
        groundingUsed: data?.groundingUsed as boolean | undefined,
        error: (item.raw as Record<string, unknown>)?.error as string | undefined,
      };
    });

  const loadHistory = async (key?: string) => {
    const devKey = key ?? pwInput;
    // 1) Try server-side KV history first
    try {
      const res = await fetch('/api/history', {
        headers: { 'x-dev-key': devKey },
      });
      if (res.ok) {
        const json = await res.json() as { success: boolean; data: ApiResult[]; source: string };
        if (json.success && json.data.length > 0) {
          const parsed = parseItems(json.data);
          setResults(parsed);
          if (parsed.length > 0) setExpandedIdx(0);
          return;
        }
      }
    } catch { /* KV not configured — fall through */ }

    // 2) Fallback: localStorage
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const items = JSON.parse(raw) as ApiResult[];
      const parsed = parseItems(items);
      setResults(parsed);
      if (parsed.length > 0) setExpandedIdx(0);
    } catch { /* ignore */ }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/history', {
        headers: { 'x-dev-key': pwInput },
      });
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, pwInput);
        setAuthed(true);
        loadHistory(pwInput);
      } else {
        setPwError('비밀번호가 틀렸습니다.');
      }
    } catch {
      setPwError('서버 연결 실패');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  const runQuery = async () => {
    setLoading(true);
    const timestamp = new Date().toISOString();
    let body: Record<string, string> = {};
    let path = '';

    if (source === 'wechat') {
      path = '/api/source/wechat';
      body = { keyword: product };
    } else if (source === '1688') {
      path = '/api/source/factory-direct';
      body = { productDescription: product, quantity, budget };
    } else {
      path = '/api/source';
      body = { productDescription: product, quantity, budget, countryPreference: 'china', orderFrequency: 'one_time' };
    }

    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let raw: unknown;
      try { raw = JSON.parse(text); } catch { raw = text; }

      const parsed = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};
      const data = (parsed as { data?: Record<string, unknown> }).data ?? {};

      const entry: ApiResult = {
        timestamp,
        source,
        query: body,
        status: res.status,
        raw,
        suppliers: (data as { suppliers?: Supplier[] }).suppliers ?? (parsed as { suppliers?: Supplier[] }).suppliers,
        groundingUsed: (data as { groundingUsed?: boolean }).groundingUsed,
        error: (parsed as { error?: string }).error,
      };

      setResults(prev => [entry, ...prev]);
      setExpandedIdx(0);
      setTab('history');
    } catch (e) {
      const entry: ApiResult = {
        timestamp,
        source,
        query: body,
        status: 0,
        raw: null,
        error: e instanceof Error ? e.message : String(e),
      };
      setResults(prev => [entry, ...prev]);
      setExpandedIdx(0);
      setTab('history');
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm shadow-xl">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🔐</div>
            <h1 className="text-white text-xl font-bold">Dev Console</h1>
            <p className="text-gray-400 text-sm mt-1">GloSource AI — 개발자 전용</p>
          </div>
          <input
            type="password"
            value={pwInput}
            onChange={e => { setPwInput(e.target.value); setPwError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호 입력"
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-blue-500"
          />
          {pwError && <p className="text-red-400 text-xs mb-3">{pwError}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            입장
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">🛠️</span>
          <span className="font-bold text-white">GloSource Dev Console</span>
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">DEVELOPER ONLY</span>
        </div>
        <div className="flex items-center gap-4">
          {results.length > 0 && (
            <button
              onClick={async () => {
                localStorage.removeItem(HISTORY_KEY);
                await fetch('/api/history', { method: 'DELETE', headers: { 'x-dev-key': pwInput } }).catch(() => {});
                setResults([]);
              }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              기록 삭제
            </button>
          )}
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-white transition-colors">
            로그아웃
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 sticky top-6">
            {/* Tab */}
            <div className="grid grid-cols-2 gap-1 mb-4">
              <button
                onClick={() => setTab('history')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                📋 검색 기록 {results.length > 0 && `(${results.length})`}
              </button>
              <button
                onClick={() => setTab('test')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === 'test' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                ▶ 새 테스트
              </button>
            </div>

            {tab === 'history' && (
              <div className="text-center py-4">
                <p className="text-xs text-gray-400">메인 페이지 검색 기록이<br/>자동으로 여기에 쌓입니다.</p>
                <button onClick={() => loadHistory()} className="mt-3 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                  🔄 새로고침
                </button>
              </div>
            )}

            {tab === 'test' && (
              <>
            <h2 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wide">API 테스트</h2>

            {/* Source */}
            <label className="text-xs text-gray-400 mb-1 block">소싱 채널</label>
            <div className="grid grid-cols-3 gap-1 mb-4">
              {(['ai', '1688', 'wechat'] as SourceMode[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    source === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {s === 'ai' ? '🌐 AI' : s === '1688' ? '🏭 1688' : '💬 WeChat'}
                </button>
              ))}
            </div>

            {/* Product */}
            <label className="text-xs text-gray-400 mb-1 block">제품명</label>
            <input
              value={product}
              onChange={e => setProduct(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-blue-500"
            />

            {source !== 'wechat' && (
              <>
                <label className="text-xs text-gray-400 mb-1 block">수량</label>
                <input
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-blue-500"
                />
                <label className="text-xs text-gray-400 mb-1 block">예산 (선택)</label>
                <input
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="예: USD 5,000"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white mb-4 focus:outline-none focus:border-blue-500"
                />
              </>
            )}

            <button
              onClick={runQuery}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 분석 중...</>
                : '▶ API 호출'}
            </button>

            {/* History count */}
            {results.length > 0 && (
              <p className="text-xs text-gray-500 text-center mt-3">{results.length}개 결과 기록됨</p>
            )}
              </>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          {results.length === 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">📡</div>
              <p className="text-gray-400 text-sm">API를 호출하면 결과가 여기에 표시됩니다.</p>
            </div>
          )}

          {results.map((r, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
              {/* Result Header */}
              <button
                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${r.error ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span className="text-sm font-semibold">{r.query.productDescription || r.query.keyword}</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{r.source.toUpperCase()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${r.status >= 200 && r.status < 300 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    HTTP {r.status || 'ERR'}
                  </span>
                  {r.groundingUsed && <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">🔍 Grounding ON</span>}
                </div>
                <span className="text-xs text-gray-500">{new Date(r.timestamp).toLocaleTimeString('ko-KR')}</span>
              </button>

              {expandedIdx === idx && (
                <div className="border-t border-gray-700 px-5 py-4 space-y-4">
                  {/* Error */}
                  {r.error && (
                    <div className="bg-red-950 border border-red-700 rounded-lg p-3">
                      <p className="text-red-300 text-sm font-mono">{r.error}</p>
                    </div>
                  )}

                  {/* Suppliers Table */}
                  {r.suppliers && r.suppliers.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                        공급자 {r.suppliers.length}개
                      </h3>
                      <div className="space-y-3">
                        {r.suppliers.map((s, si) => (
                          <div key={si} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className="text-xs text-gray-500 mr-2">#{s.rank ?? si + 1}</span>
                                <span className="font-semibold text-white text-sm">{s.name}</span>
                                <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">{s.platform}</span>
                              </div>
                              <div className={`text-xs font-bold px-2 py-1 rounded ${
                                (s.trustScore ?? 0) >= 80 ? 'bg-green-900 text-green-300' :
                                (s.trustScore ?? 0) >= 60 ? 'bg-yellow-900 text-yellow-300' :
                                'bg-red-900 text-red-300'
                              }`}>
                                신뢰 {s.trustScore ?? '?'}
                              </div>
                            </div>

                            {/* URL — 핵심 */}
                            <div className="mb-2">
                              <span className="text-xs text-gray-500">URL: </span>
                              {s.url ? (
                                <a
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300 underline break-all"
                                >
                                  {s.url}
                                </a>
                              ) : (
                                <span className="text-xs text-red-400">미확인 (URL 없음)</span>
                              )}
                              {s.verificationStatus && (
                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                                  s.verificationStatus === 'grounding_confirmed'
                                    ? 'bg-green-900 text-green-300'
                                    : 'bg-yellow-900 text-yellow-300'
                                }`}>
                                  {s.verificationStatus === 'grounding_confirmed' ? '✓ 검증됨' : '⚠ 추정'}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400">
                              {s.estimatedPrice && <span>💰 {s.estimatedPrice}</span>}
                              {s.moq && <span>📦 MOQ: {s.moq}</span>}
                              {s.leadTimeDays && <span>⏱ 리드타임: {s.leadTimeDays}</span>}
                              {s.hscode && <span>🏷 HS: {s.hscode}</span>}
                              {s.productStage && <span>🔧 {s.productStage}</span>}
                              {s.exportToKoreaExperience !== undefined && (
                                <span>{s.exportToKoreaExperience ? '✅ 한국 수출 경험' : '❌ 한국 수출 無'}</span>
                              )}
                            </div>

                            {s.summary && (
                              <p className="mt-2 text-xs text-gray-300 border-t border-gray-700 pt-2">{s.summary}</p>
                            )}

                            {s.redFlags && s.redFlags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {s.redFlags.map((f, fi) => (
                                  <span key={fi} className="text-xs bg-red-950 text-red-300 px-1.5 py-0.5 rounded">⚠ {f}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw JSON */}
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors select-none">
                      Raw JSON 보기
                    </summary>
                    <pre className="mt-2 bg-gray-950 rounded-lg p-3 text-xs text-green-400 overflow-auto max-h-96 font-mono">
                      {JSON.stringify(r.raw, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
