'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyContent() {
  const params = useSearchParams();
  const success = params.get('success');
  const error = params.get('error');

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-4xl">✅</div>
        <h1 className="text-2xl font-black text-[#0D1B2A]">이메일 인증 완료</h1>
        <p className="mt-2 text-sm text-slate-500">이메일이 성공적으로 인증되었습니다.</p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-[#EA580C] px-6 py-3 text-sm font-black text-white hover:bg-orange-600">
          소싱 시작하기 →
        </Link>
      </div>
    );
  }

  const errorMessages: Record<string, string> = {
    expired: '인증 링크가 만료되었습니다. 다시 로그인하면 인증 메일을 재발송 받을 수 있습니다.',
    invalid: '유효하지 않은 인증 링크입니다.',
    server: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  };

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-4xl">⚠️</div>
      <h1 className="text-2xl font-black text-[#0D1B2A]">인증 실패</h1>
      <p className="mt-2 text-sm text-slate-500">{errorMessages[error ?? ''] ?? '인증에 실패했습니다.'}</p>
      <Link href="/auth/login" className="mt-6 inline-block rounded-xl border border-slate-200 px-6 py-3 text-sm font-black text-[#0D1B2A] hover:bg-slate-50">
        로그인으로 돌아가기
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Suspense fallback={null}>
          <VerifyContent />
        </Suspense>
      </section>
    </main>
  );
}
