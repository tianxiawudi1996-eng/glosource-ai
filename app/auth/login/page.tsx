'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

const errorMessages: Record<string, string> = {
  CredentialsSignin: '이메일 또는 비밀번호가 올바르지 않습니다.',
  OAuthAccountNotLinked: '이미 다른 로그인 방식으로 가입된 이메일입니다.',
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    await signIn('credentials', { email, password, redirectTo: '/' });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7 text-center">
          <Link href="/" className="text-xl font-black text-[#0D1B2A]">
            GloSource AI
          </Link>
          <h1 className="mt-6 text-2xl font-black text-[#0D1B2A]">로그인</h1>
          <p className="mt-2 text-sm text-slate-500">이메일과 비밀번호로 접속합니다.</p>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessages[error] ?? '로그인 중 오류가 발생했습니다.'}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
              placeholder="비밀번호"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#0D1B2A] px-4 py-3.5 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-bold text-slate-400">또는</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={() => signIn('google', { redirectTo: '/' })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-[#0D1B2A] hover:bg-slate-50"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-xs font-black text-blue-600">
            G
          </span>
          Google로 로그인
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          계정이 없으신가요?{' '}
          <Link href="/auth/register" className="font-black text-[#EA580C]">
            회원가입
          </Link>
        </p>
      </section>
    </main>
  );
}
