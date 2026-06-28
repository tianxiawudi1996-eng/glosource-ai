import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment received | GloSource AI',
  description: 'Your GloSource AI plan is being activated.',
  robots: { index: false, follow: false },
};

// Polar (EN) post-checkout landing. Must work WITHOUT a session — the Polar webhook
// provisions the account asynchronously and emails a set-password link, so a fresh
// buyer is not logged in yet when they land here.
export default function EnBillingSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <span className="text-5xl">🎉</span>
        <h1 className="mt-4 text-2xl font-black text-[#0D1B2A]">Payment received</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Thank you! Your GloSource AI plan is being activated. We&apos;ve emailed you a secure link to
          set your password and sign in — please check your inbox (and your spam folder, just in case).
        </p>
        <div className="mt-6 space-y-3">
          <Link href="/en/login" className="block w-full rounded-xl bg-[#EA580C] px-4 py-3.5 text-sm font-black text-white hover:bg-orange-600">
            Go to sign in →
          </Link>
          <Link href="/en" className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
            Back to GloSource AI
          </Link>
        </div>
        <p className="mt-5 text-xs text-slate-400">
          No email after a few minutes? Reach us at <a href="mailto:hello@glosourceai.com" className="underline hover:text-slate-600">hello@glosourceai.com</a> and we&apos;ll sort it out.
        </p>
      </section>
    </main>
  );
}
