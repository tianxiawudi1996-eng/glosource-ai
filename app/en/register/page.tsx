'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import BrandLogo from '@/app/components/BrandLogo';
import { trackSignup } from '@/app/lib/analytics';

type RegisterResponse = { error?: string; success?: boolean };

export default function EnRegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tosConsent, setTosConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [ageConsent, setAgeConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const allConsents = tosConsent && dataConsent && gdprConsent && ageConsent;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    if (!allConsents) {
      setError('Please accept the required agreements to continue.');
      return;
    }
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
      trackSignup('email');
      // Sign in without an immediate redirect so we can show the "verify your email" notice.
      await signIn('credentials', { email, password, redirect: false });
      setRegisteredEmail(email);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-6 pb-28 sm:px-6 lg:grid lg:place-items-center lg:py-10">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden bg-[#0D1B2A] px-8 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link href="/en" aria-label="GloSource AI home">
              <BrandLogo compact />
            </Link>
            <div className="mt-10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Free buyer account</p>
              <h1 className="mt-3 text-3xl font-black leading-tight">Start Korean supplier research with a cleaner first shortlist.</h1>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Create an account to save your search history, verify your email, and unlock 3 free supplier-candidate searches per month.
              </p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <p className="font-bold text-white">Included after signup</p>
            <p>Source links, risk signals, MOQ context, and English RFQ drafts for Korean supplier-candidate research.</p>
          </div>
        </aside>

        <div className="p-5 sm:p-8 lg:p-10">
          <div className="mb-7 text-center lg:text-left">
            <Link href="/en" aria-label="GloSource AI home" className="inline-flex lg:hidden">
              <BrandLogo onDark={false} />
            </Link>
            <h1 className="mt-6 text-2xl font-black text-[#0D1B2A] lg:mt-0">Create account</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Get 3 free searches per month after email verification. No credit card required.</p>
          </div>

          {registeredEmail ? (
            <div className="text-center" role="status" aria-live="polite">
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-5">
                <p className="text-base font-black text-emerald-800">Account created!</p>
                <p className="mt-2 text-sm leading-relaxed text-emerald-700">
                  We&apos;ve sent a verification link to <strong>{registeredEmail}</strong>. Open it to confirm your email and unlock your 3 free monthly searches.
                </p>
                <p className="mt-2 text-xs text-emerald-600">Can&apos;t find it? Check your spam folder, or email hello@glosourceai.com.</p>
              </div>
              <Link href="/en" className="block w-full rounded-xl bg-[#0D1B2A] px-4 py-3.5 text-sm font-black text-white hover:bg-slate-800">
                Continue to GloSource →
              </Link>
            </div>
          ) : (
            <>
              {error ? (
                <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">{error}</p>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>

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
                      <a href="mailto:hello@glosourceai.com" className="underline">hello@glosourceai.com</a>.
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

                <button type="submit" disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#0D1B2A] px-4 py-3.5 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? 'Creating account…' : 'Create free account'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/en/login" className="font-black text-[#EA580C]">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
