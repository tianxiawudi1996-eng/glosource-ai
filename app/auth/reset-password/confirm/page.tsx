'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';

function ConfirmContent() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setErrorMsg('비밀번호가 일치하지 않습니다.'); setStatus('error'); return; }
    if (password.length < 8) { setErrorMsg('비밀번호는 8자 이상이어야 합니다.'); setStatus('error'); return; }
    setStatus('submitting');
    try {
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setErrorMsg(json.error ?? '오류가 발생했습니다.'); setStatus('error'); return; }
      setStatus('done');
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다.'); setStatus('error');
    }
  }

  if (!token || !email) {
    return (
      <p className="text-center text-sm text-red-600 font-bold">
        유효하지 않은 링크입니다.{' '}
        <Link href="/auth/reset-password" className="underline">다시 요청하기</Link>
      </p>
    );
  }

  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-7 text-center">
        <Link href="/" className="text-xl font-black text-[#0D1B2A]">GloSource AI</Link>
        <h1 className="mt-6 text-2xl font-black text-[#0D1B2A]">새 비밀번호 설정</h1>
      </div>

      {status === 'done' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-5 text-center">
          <p className="text-sm font-bold text-green-700">비밀번호가 변경되었습니다.</p>
          <Link href="/auth/login" className="mt-4 inline-block rounded-xl bg-[#0D1B2A] px-6 py-3 text-sm font-black text-white">로그인하기</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{errorMsg}</p>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">새 비밀번호</span>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="8자 이상"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">비밀번호 확인</span>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="비밀번호 재입력"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]"
            />
          </label>
          <button type="submit" disabled={status === 'submitting'}
            className="w-full rounded-xl bg-[#EA580C] px-4 py-3.5 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {status === 'submitting' ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      )}
    </section>
  );
}

export default function ResetPasswordConfirmPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <Suspense fallback={null}>
        <ConfirmContent />
      </Suspense>
    </main>
  );
}
