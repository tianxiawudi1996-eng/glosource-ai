'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import BrandLogo from '@/app/components/BrandLogo';

type RegisterResponse = { error?: string; success?: boolean };

export default function EnRegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tosConsent, setTosConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [ageConsent, setAgeConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, tosConsent, dataConsent, gdprConsent, ageConsent, marketingConsent }),
      });
      const result = (await response.json()) as RegisterResponse;
      if (!response.ok) {
        // translate common Korean errors to English
        const msg = result.error ?? '';
        const translated = msg.includes('이미 가입') ? 'This email is already registered.'
          : msg.includes('이름, 이메일') ? 'Name, email, and password are all required.'
          : msg.includes('약관') ? 'Please accept the required terms to continue.'
          : msg.includes('유효한 이메일') ? 'Please enter a valid email address.'
          : msg.includes('8자') ? 'Password must be at least 8 characters.'
          : 'An error occurred. Please try again.';
        setError(translated);
        return;
      }
      await signIn('credentials', { email, password, redirectTo: '/en' });
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const allConsents = tosConsent && dataConsent && gdprConsent && ageConsent;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7 text-center">
          <Link href="/en" aria-label="GloSource AI home">
            <BrandLogo onDark={false} />
          </Link>
          <h1 className="mt-6 text-2xl font-black text-[#0D1B2A]">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">Get 10 free searches per month after email verification. No credit card required.</p>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">Full name</span>
            <input name="name" required autoComplete="name" placeholder="Your name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">Email</span>
            <input name="email" type="email" required autoComplete="email" placeholder="name@company.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">Password</span>
            <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="8+ characters"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">Confirm password</span>
            <input name="passwordConfirm" type="password" required minLength={8} autoComplete="new-password" placeholder="Re-enter password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A]" />
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={tosConsent} onChange={e => setTosConsent(e.target.checked)}
                className="mt-0.5 accent-[#0D1B2A] flex-shrink-0" />
              <span className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-[#0D1B2A]">[Required]</strong>{' '}
                I agree to the{' '}
                <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#0D1B2A] font-semibold underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0D1B2A] font-semibold underline">Privacy Policy</Link>.
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={dataConsent} onChange={e => setDataConsent(e.target.checked)}
                className="mt-0.5 accent-[#0D1B2A] flex-shrink-0" />
              <span className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-[#0D1B2A]">[Required]</strong>{' '}
                I consent to the collection and use of my name and email for account management and service delivery.
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={gdprConsent} onChange={e => setGdprConsent(e.target.checked)}
                className="mt-0.5 accent-[#0D1B2A] flex-shrink-0" />
              <span className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-[#0D1B2A]">[Required]</strong>{' '}
                I understand that my data will be processed in accordance with GDPR and applicable data protection laws. I may request deletion at any time by emailing{' '}
                <a href="mailto:hello@glosource.ai" className="underline">hello@glosource.ai</a>.
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={ageConsent} onChange={e => setAgeConsent(e.target.checked)}
                className="mt-0.5 accent-[#0D1B2A] flex-shrink-0" />
              <span className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-[#0D1B2A]">[Required]</strong>{' '}
                I confirm that I am at least 14 years old.
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)}
                className="mt-0.5 accent-[#0D1B2A] flex-shrink-0" />
              <span className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-500">[Optional]</strong>{' '}
                Send me product updates, sourcing tips, and launch emails. I can unsubscribe at any time.
              </span>
            </label>
          </div>

          <button type="submit" disabled={isSubmitting || !allConsents}
            className="w-full rounded-xl bg-[#0D1B2A] px-4 py-3.5 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Creating account...' : 'Create free account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/en/login" className="font-black text-[#EA580C]">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
