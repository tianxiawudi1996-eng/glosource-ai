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
      <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1a2f44] border border-[#EA580C]/30 rounded-2xl p-6 text-center">
        <p className="font-bold text-white text-sm">{msg}</p>
        <p className="text-slate-400 text-xs mt-1">오픈 알림 + 첫 달 무료 혜택을 이메일로 보내드릴게요.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1a2f44] border border-[#EA580C]/20 rounded-2xl p-6">
      <div className="mb-4">
        <p className="font-black text-white text-sm">유료 플랜 오픈 예정 — 지금 베타 신청하면 첫 달 무료</p>
        <p className="text-slate-400 text-xs mt-0.5">사업자 등록 후 Toss 결제 연동 예정. 사전 신청자 우선 혜택.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="이메일 주소 입력"
          required
          className="flex-1 px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#EA580C]"
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
