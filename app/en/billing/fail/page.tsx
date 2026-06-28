import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment not completed | GloSource AI',
  description: 'Your payment did not go through.',
  robots: { index: false, follow: false },
};

// Polar (EN) failed/cancelled checkout landing. No session required.
export default function EnBillingFailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <span className="text-5xl">⚠️</span>
        <h1 className="mt-4 text-2xl font-black text-[#0D1B2A]">Payment not completed</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your payment didn&apos;t go through, so you haven&apos;t been charged. You can try again or pick a different plan.
        </p>
        <div className="mt-6 space-y-3">
          <Link href="/en/billing" className="block w-full rounded-xl bg-[#EA580C] px-4 py-3.5 text-sm font-black text-white hover:bg-orange-600">
            View plans &amp; try again →
          </Link>
          <Link href="/en" className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
            Back to GloSource AI
          </Link>
        </div>
        <p className="mt-5 text-xs text-slate-400">
          Need help? <a href="mailto:hello@glosourceai.com" className="underline hover:text-slate-600">hello@glosourceai.com</a>
        </p>
      </section>
    </main>
  );
}
