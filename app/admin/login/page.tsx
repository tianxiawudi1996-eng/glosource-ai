'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function AdminLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth.js redirects back here with ?error=... on a failed credentials sign-in.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) setError('Incorrect email or password.');
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    // Use the redirect flow (same as the customer /en/login) — redirect:false does not
    // reliably establish the session for Credentials in Auth.js v5.
    await signIn('credentials', { email, password, redirectTo: '/admin' });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0D1B2A] px-6 py-10">
      <section className="w-full max-w-sm rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0D1B2A] px-3 py-1 text-[10px] font-black text-emerald-400">
            🛡 ADMIN
          </span>
          <h1 className="mt-4 text-2xl font-black text-[#0D1B2A]">GloSource Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Internal access only.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-bold text-slate-600">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-bold text-slate-600">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40" />
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={isSubmitting}
            className="w-full rounded-xl bg-[#EA580C] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-orange-600 disabled:opacity-40">
            {isSubmitting ? 'Signing in…' : 'Sign in to Admin'}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-slate-400">
          This portal is restricted to GloSource administrators.
        </p>
      </section>
    </main>
  );
}
