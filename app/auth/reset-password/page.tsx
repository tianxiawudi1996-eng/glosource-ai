'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setErrorMsg(json.error ?? '오류가 발생했습니다.'); setStatus('error'); return; }
      setStatus('done');
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다.'); setStatus('error');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7 text-center">
          <Link href="/" className="text-xl font-black text-[#0D1B2A]">GloSource AI</Link>
          <h1 className="mt-6 text-2xl font-black text-[#0D1B2A]">비밀번호 재설정</h1>
          <p className="mt-2 text-sm text-slate-500">가입한 이메일로 재설정 링크를 보내드립니다.</p>
        </div>

        {status === 'done' ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-5 text-center">
            <p className="text-sm font-bold text-green-700">이메일을 확인해주세요.</p>
            <p className="mt-1 text-xs text-green-600">재설정 링크가 발송되었습니다. 링크는 1시간 유효합니다.</p>
            <Link href="/auth/login" className="mt-4 inline-block text-sm font-black text-[#0D1B2A] underline">로그인으로 돌아가기</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'error' && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{errorMsg}</p>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">이메일</span>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]"
              />
            </label>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-xl bg-[#0D1B2A] px-4 py-3.5 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {status === 'submitting' ? '전송 중...' : '재설정 링크 받기'}
            </button>
            <p className="text-center text-sm text-slate-500">
              <Link href="/auth/login" className="font-black text-[#EA580C]">로그인으로 돌아가기</Link>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
