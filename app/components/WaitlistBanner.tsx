'use client';
import { useState } from 'react';

export default function WaitlistBanner() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'landing_banner' }),
      });
      const data = await res.json() as { success?: boolean; message?: string; error?: string };
      if (data.success) {
        setStatus('done');
        setMsg(data.message ?? '베타 신청 완료!');
      } else {
        setStatus('error');
        setMsg(data.error ?? '오류가 발생했습니다.');
      }
    } catch {
      setStatus('error');
      setMsg('네트워크 오류. 다시 시도해주세요.');
    }
  }

  if (status === 'done') {
    return (
      <div id="waitlist" className="scroll-mt-24 bg-gradient-to-r from-[#0D1B2A] to-[#1a2f44] border border-[#EA580C]/30 rounded-2xl p-6 text-center">
        <p className="font-bold text-white text-sm">{msg}</p>
        <p className="text-slate-400 text-xs mt-1">정식 출시 일정과 베타 우선 안내를 이메일로 보내드립니다.</p>
      </div>
    );
  }

  return (
    <div id="waitlist" className="scroll-mt-24 bg-gradient-to-r from-[#0D1B2A] to-[#1a2f44] border border-[#EA580C]/20 rounded-2xl p-6">
      <div className="mb-4">
        <p className="font-black text-white text-sm">한국 서비스 무료 베타 — 정식 출시 알림 신청</p>
        <p className="text-slate-400 text-xs mt-0.5">사업자등록과 국내 유료 서비스 준비가 끝나면 신청자에게 먼저 안내합니다.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="이메일 주소 입력"
          required
          className="min-w-0 flex-1 px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#EA580C]"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 rounded-lg bg-[#EA580C] text-white text-sm font-bold hover:bg-[#c2410c] disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {status === 'loading' ? '...' : '베타 신청'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-red-400 text-xs mt-2">{msg}</p>
      )}
    </div>
  );
}
