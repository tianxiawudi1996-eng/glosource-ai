'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';

type RegisterResponse = {
  error?: string;
  success?: boolean;
};

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tosConsent, setTosConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    if (password !== passwordConfirm) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const result = (await response.json()) as RegisterResponse;

      if (!response.ok) {
        setError(result.error ?? '회원가입 중 오류가 발생했습니다.');
        return;
      }

      await signIn('credentials', { email, password, redirectTo: '/' });
    } catch {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7 text-center">
          <Link href="/" className="text-xl font-black text-[#0D1B2A]">
            GloSource AI
          </Link>
          <h1 className="mt-6 text-2xl font-black text-[#0D1B2A]">회원가입</h1>
          <p className="mt-2 text-sm text-slate-500">무료 계정을 만들고 소싱을 시작합니다.</p>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">이름</span>
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="홍길동"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">이메일</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@company.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">비밀번호</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="8자 이상"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">비밀번호 확인</span>
            <input
              name="passwordConfirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="비밀번호 재입력"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]"
            />
          </label>

          {/* 약관 동의 (약관규제법 제3조 + 개인정보보호법 제22조) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={tosConsent}
                onChange={e => setTosConsent(e.target.checked)}
                className="mt-0.5 accent-[#0D1B2A] flex-shrink-0"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-[#0D1B2A]">[필수]</strong>{' '}
                <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#0D1B2A] font-semibold underline hover:text-slate-700">이용약관</Link>
                {' '}및{' '}
                <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0D1B2A] font-semibold underline hover:text-slate-700">개인정보처리방침</Link>
                에 동의합니다.
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={dataConsent}
                onChange={e => setDataConsent(e.target.checked)}
                className="mt-0.5 accent-[#0D1B2A] flex-shrink-0"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-[#0D1B2A]">[필수]</strong>{' '}
                개인정보(이름, 이메일) 수집·이용에 동의합니다.{' '}
                <span className="text-slate-400">구독 관리, 서비스 제공 목적으로만 사용됩니다.</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !tosConsent || !dataConsent}
            className="w-full rounded-xl bg-[#0D1B2A] px-4 py-3.5 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? '가입 처리 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="font-black text-[#EA580C]">
            로그인
          </Link>
        </p>
      </section>
    </main>
  );
}
