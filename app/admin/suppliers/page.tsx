'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

type Supplier = {
  id: string;
  name: string;
  nameEn: string | null;
  platform: string;
  url: string | null;
  category: string;
  moqMin: number | null;
  leadTimeDays: number | null;
  certifications: string | null;
  trustScore: number | null;
  notes: string | null;
  active: boolean;
  verifiedAt: string;
};

const PLATFORMS = ['EC21', 'BuyKorea', 'tradeKorea', 'Direct', 'NAVER', 'Other'];
const CATEGORIES = ['K-Beauty', 'K-Food', 'K-Fashion', 'Electronics', 'Industrial', 'Healthcare', 'Other'];
const CERTS = ['MFDS', 'HACCP', 'KC', 'KS', 'ISO', 'KOSHER', 'HALAL'];

const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]';
const labelCls = 'block text-xs font-bold text-slate-600 mb-1';

export default function SuppliersAdminPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);

  async function loadSuppliers() {
    const res = await fetch('/api/admin/suppliers');
    if (res.ok) {
      const data = await res.json() as { suppliers: Supplier[] };
      setSuppliers(data.suppliers.filter(s => s.active));
    }
    setLoading(false);
  }

  useEffect(() => { void loadSuppliers(); }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get('name') ?? '').trim(),
      nameEn: String(fd.get('nameEn') ?? '').trim() || undefined,
      platform: String(fd.get('platform') ?? ''),
      url: String(fd.get('url') ?? '').trim() || undefined,
      category: String(fd.get('category') ?? ''),
      moqMin: fd.get('moqMin') ? Number(fd.get('moqMin')) : undefined,
      leadTimeDays: fd.get('leadTimeDays') ? Number(fd.get('leadTimeDays')) : undefined,
      certifications: selectedCerts.join(',') || undefined,
      trustScore: fd.get('trustScore') ? Number(fd.get('trustScore')) : undefined,
      notes: String(fd.get('notes') ?? '').trim() || undefined,
    };
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json() as { error?: string };
        setError(j.error ?? '등록 실패');
      } else {
        setSuccess('공급자 등록 완료!');
        setSelectedCerts([]);
        (e.target as HTMLFormElement).reset();
        void loadSuppliers();
      }
    } catch { setError('오류 발생'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 비활성화?`)) return;
    await fetch(`/api/admin/suppliers?id=${id}`, { method: 'DELETE' });
    void loadSuppliers();
  }

  const toggleCert = (cert: string) =>
    setSelectedCerts(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin" className="text-sm font-bold text-[#EA580C] hover:underline">← Admin</Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-2xl font-black text-[#0D1B2A]">검증 공급자 DB</h1>
          <span className="ml-auto text-sm font-bold text-slate-500">{suppliers.length}개 등록</span>
        </div>

        {/* 등록 폼 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
          <h2 className="text-lg font-black text-[#0D1B2A] mb-5">새 공급자 등록</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>회사명 (KO) *</label>
                <input name="name" required className={inputCls} placeholder="한국화장품주식회사" />
              </div>
              <div>
                <label className={labelCls}>회사명 (EN)</label>
                <input name="nameEn" className={inputCls} placeholder="Korea Cosmetics Co., Ltd" />
              </div>
              <div>
                <label className={labelCls}>플랫폼 *</label>
                <select name="platform" required className={inputCls}>
                  <option value="">선택</option>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>카테고리 *</label>
                <select name="category" required className={inputCls}>
                  <option value="">선택</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>URL</label>
                <input name="url" type="url" className={inputCls} placeholder="https://..." />
              </div>
              <div>
                <label className={labelCls}>MOQ (최소)</label>
                <input name="moqMin" type="number" min="1" className={inputCls} placeholder="500" />
              </div>
              <div>
                <label className={labelCls}>리드타임 (일)</label>
                <input name="leadTimeDays" type="number" min="1" max="365" className={inputCls} placeholder="21" />
              </div>
              <div>
                <label className={labelCls}>신뢰도 점수 (0-100)</label>
                <input name="trustScore" type="number" min="0" max="100" className={inputCls} placeholder="85" />
              </div>
              <div>
                <label className={labelCls}>인증</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CERTS.map(cert => (
                    <button key={cert} type="button" onClick={() => toggleCert(cert)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        selectedCerts.includes(cert)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}>
                      {cert}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>메모</label>
                <textarea name="notes" rows={2} className={inputCls} placeholder="직접 컨택 완료, 샘플 수령 등" />
              </div>
            </div>
            {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            {success && <p className="text-sm font-bold text-emerald-600">{success}</p>}
            <button type="submit" disabled={submitting}
              className="bg-[#0D1B2A] text-white font-black text-sm px-6 py-3 rounded-xl hover:bg-slate-800 disabled:opacity-60">
              {submitting ? '등록 중...' : '공급자 등록'}
            </button>
          </form>
        </section>

        {/* 목록 */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-black text-[#0D1B2A]">등록된 검증 공급자</h2>
          </div>
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">로딩 중...</div>
          ) : suppliers.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">등록된 공급자가 없습니다.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {suppliers.map(s => (
                <div key={s.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-sm text-[#0D1B2A]">{s.name}</p>
                      {s.nameEn && <p className="text-xs text-slate-400">{s.nameEn}</p>}
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{s.platform}</span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s.category}</span>
                      {s.trustScore != null && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.trustScore >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          신뢰도 {s.trustScore}
                        </span>
                      )}
                    </div>
                    {s.certifications && (
                      <p className="text-xs text-slate-500 mt-1">인증: {s.certifications}</p>
                    )}
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#EA580C] hover:underline mt-0.5 block truncate">{s.url}</a>
                    )}
                  </div>
                  <button onClick={() => void handleDelete(s.id, s.name)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 shrink-0 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50">
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
