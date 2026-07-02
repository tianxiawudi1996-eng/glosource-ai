'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import BrandLogo from '@/app/components/BrandLogo';

const errorMessages: Record<string, string> = {
  CredentialsSignin: 'Incorrect email or password.',
  OAuthAccountNotLinked: 'This email is already registered with a different sign-in method.',
};

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const rawCallback = searchParams.get('callbackUrl') ?? '';
  // Only allow same-origin relative paths to prevent open redirect phishing
  const callbackUrl = rawCallback.startsWith('/') && !rawCallback.startsWith('//') ? rawCallback : '/en';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get('email') ?? '');
      const password = String(formData.get('password') ?? '');
      await signIn('credentials', { email, password, redirectTo: callbackUrl });
    } catch {
      setSubmitError('We could not sign you in. Check your connection and try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7 text-center">
          <Link href="/en" aria-label="GloSource AI home">
            <BrandLogo onDark={false} />
          </Link>
          <h1 className="mt-6 text-2xl font-black text-[#0D1B2A]">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Welcome back. Sign in to your account.</p>
        </div>

        {error || submitError ? (
          <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {submitError || errorMessages[error ?? ''] || 'An error occurred. Please try again.'}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">Email</span>
            <input name="email" type="email" required autoComplete="email" placeholder="name@company.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">Password</span>
            <input name="password" type="password" required autoComplete="current-password" placeholder="Password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]" />
          </label>
          <button type="submit" disabled={isSubmitting}
            className="w-full rounded-xl bg-[#0D1B2A] px-4 py-3.5 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="text-center">
            <Link href="/en/reset-password" className="text-xs text-slate-400 hover:text-slate-600">Forgot your password?</Link>
          </div>
        </form>

        {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true' && (
          <>
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-bold text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <button type="button" onClick={() => signIn('google', { redirectTo: callbackUrl })}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-[#0D1B2A] hover:bg-slate-50">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-xs font-black text-blue-600">G</span>
              Sign in with Google
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/en/register" className="font-black text-[#EA580C]">Sign up free</Link>
        </p>
      </section>
    </main>
  );
}

export default function EnLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
