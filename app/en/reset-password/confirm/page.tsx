'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import BrandLogo from '@/app/components/BrandLogo';

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
    if (password !== confirm) { setErrorMsg('Passwords do not match.'); setStatus('error'); return; }
    if (password.length < 8) { setErrorMsg('Password must be at least 8 characters.'); setStatus('error'); return; }
    setStatus('submitting');
    try {
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setErrorMsg(json.error ?? 'An error occurred.'); setStatus('error'); return; }
      setStatus('done');
    } catch {
      setErrorMsg('A network error occurred. Please try again.'); setStatus('error');
    }
  }

  if (!token || !email) {
    return (
      <p className="text-center text-sm font-bold text-red-600">
        This link is invalid.{' '}
        <Link href="/en/reset-password" className="underline">Request a new one</Link>
      </p>
    );
  }

  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-7 text-center">
        <Link href="/en" aria-label="GloSource AI home">
          <BrandLogo onDark={false} />
        </Link>
        <h1 className="mt-6 text-2xl font-black text-[#0D1B2A]">Set your password</h1>
        <p className="mt-2 text-sm text-slate-500">Choose a password to finish activating your account.</p>
      </div>

      {status === 'done' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-5 text-center">
          <p className="text-sm font-bold text-green-700">Your password has been set.</p>
          <Link href="/en/login" className="mt-4 inline-block rounded-xl bg-[#0D1B2A] px-6 py-3 text-sm font-black text-white">Sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{errorMsg}</p>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">New password</span>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">Confirm password</span>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]"
            />
          </label>
          <button type="submit" disabled={status === 'submitting'}
            className="w-full rounded-xl bg-[#EA580C] px-4 py-3.5 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {status === 'submitting' ? 'Saving...' : 'Set password'}
          </button>
        </form>
      )}
    </section>
  );
}

export default function EnResetPasswordConfirmPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <Suspense fallback={null}>
        <ConfirmContent />
      </Suspense>
    </main>
  );
}
