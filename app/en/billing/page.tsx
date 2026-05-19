import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { auth } from '@/auth';
import { db, payments, subscriptions } from '@/app/lib/db';
import BrandLogo from '@/app/components/BrandLogo';
import { CancelPolarButton } from './BillingActions';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$19',
    unit: '/mo',
    searches: '30 searches / month',
    envKey: 'NEXT_PUBLIC_POLAR_STARTER_LINK',
    features: ['3–5 supplier candidates per search', 'Trust score 0–100', 'English RFQ draft', 'MFDS / KC signals'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    unit: '/mo',
    searches: '60 searches / month',
    envKey: 'NEXT_PUBLIC_POLAR_PRO_LINK',
    highlight: true,
    features: ['All Starter features', 'HACCP / KS / ISO signals', 'Priority support', 'Full PDF report'],
  },
  {
    id: 'enterprise',
    name: 'Agency',
    price: '$149',
    unit: '/mo',
    searches: 'No monthly search cap',
    envKey: 'NEXT_PUBLIC_POLAR_AGENCY_LINK',
    features: ['High-volume team usage', '5-seat team access', 'Project history', 'Custom templates'],
  },
] as const;

function formatDate(date: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

function formatAmount(amount: number, currency: string): string {
  const c = currency.toUpperCase();
  if (c === 'USD') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
  if (c === 'KRW') return new Intl.NumberFormat('en-US').format(amount / 100) + ' KRW';
  return `${amount} ${c}`;
}

export default async function EnBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ polar?: string }>;
}) {
  const params = await searchParams;
  const showSuccess = params.polar === 'success';

  const session = await auth();
  if (!session?.user?.id) redirect('/en/login?callbackUrl=/en/billing');

  const userId = session.user.id;
  const [subscriptionRows, paymentRows] = await Promise.all([
    db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1),
    db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt)).limit(20),
  ]);

  const subscription = subscriptionRows[0];
  const currentPlan = subscription?.plan ?? session.user.plan ?? 'free';
  const hasActivePolarSub = subscription?.status === 'active' && Boolean(subscription.polarSubscriptionId);

  // plan name for display (starter→Starter, enterprise→Agency)
  const planDisplayName = currentPlan === 'enterprise' ? 'Agency'
    : currentPlan === 'starter' ? 'Starter'
    : currentPlan === 'pro' ? 'Pro'
    : 'Free';

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">

        {showSuccess && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-sm font-black text-emerald-800">🎉 Payment successful! Your plan is now active.</p>
            <p className="mt-1 text-xs text-emerald-700 leading-5">
              Your account has been upgraded. Start searching below — your new quota is ready.
            </p>
            <a href="/en#sourcing-tool" className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 transition-colors">
              Start sourcing →
            </a>
          </div>
        )}

        {/* Nav */}
        <div className="mb-8 flex items-center gap-3">
          <Link href="/en" aria-label="GloSource AI home">
            <BrandLogo compact />
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-bold text-slate-500">Plan &amp; Billing</span>
        </div>

        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#EA580C]">Subscription</p>
            <h1 className="mt-2 text-3xl font-black text-[#0D1B2A]">Plan &amp; Billing</h1>
            <p className="mt-2 text-sm text-slate-500">
              Current plan: <strong className="text-[#0D1B2A]">{planDisplayName}</strong>
              {subscription?.currentPeriodEnd ? ` · Renews ${formatDate(subscription.currentPeriodEnd)}` : ''}
              {subscription?.cancelAtPeriodEnd ? ' · Cancels at period end' : ''}
            </p>
          </div>
          {hasActivePolarSub && subscription ? (
            <CancelPolarButton subscriptionId={subscription.id} />
          ) : null}
        </header>

        {/* Plan cards */}
        <section className="grid gap-4 sm:grid-cols-3 mb-8">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const checkoutUrl = process.env[plan.envKey];
            return (
              <article key={plan.id}
                className={`rounded-2xl border bg-white p-6 shadow-sm flex flex-col ${
                  isCurrent ? 'border-[#EA580C] ring-1 ring-[#EA580C]/20' : 'border-slate-200'
                } ${'highlight' in plan && plan.highlight ? 'relative' : ''}`}>
                {'highlight' in plan && plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#EA580C] px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider whitespace-nowrap">
                    Most popular
                  </span>
                )}
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-black text-[#0D1B2A]">{plan.name}</h2>
                  {isCurrent && (
                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#EA580C]">Current</span>
                  )}
                </div>
                <p className="text-3xl font-black text-[#0D1B2A]">
                  {plan.price}<span className="text-sm font-bold text-slate-500">{plan.unit}</span>
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500 mb-4">{plan.searches}</p>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                      <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button disabled className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-black text-slate-400 cursor-not-allowed">
                    Current plan
                  </button>
                ) : checkoutUrl ? (
                  <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"
                    className="block w-full rounded-xl bg-[#0D1B2A] px-4 py-3 text-center text-sm font-black text-white hover:bg-slate-800 transition-colors">
                    Get {plan.name} &rarr;
                  </a>
                ) : (
                  <a href="mailto:glosourceai@gmail.com?subject=GloSource%20AI%20Plan%20Access"
                    className="block w-full rounded-xl bg-[#EA580C] px-4 py-3 text-center text-sm font-black text-white hover:bg-[#DC4C00] transition-colors">
                    Contact us
                  </a>
                )}
              </article>
            );
          })}
        </section>

        {/* Payment history */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-black text-[#0D1B2A]">Payment history</h2>
          </div>
          {/* Mobile */}
          <div className="md:hidden divide-y divide-slate-100">
            {paymentRows.length > 0 ? paymentRows.map(payment => (
              <div key={payment.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#0D1B2A]">{formatAmount(payment.amount, payment.currency)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(payment.approvedAt ?? payment.createdAt)}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${payment.status === 'done' ? 'bg-emerald-50 text-emerald-700' : payment.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                  {payment.status === 'done' ? 'Paid' : payment.status === 'failed' ? 'Failed' : payment.status === 'canceled' ? 'Refunded' : 'Pending'}
                </span>
              </div>
            )) : (
              <div className="px-5 py-10 text-center text-sm text-slate-500">No payment history yet.</div>
            )}
          </div>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentRows.length > 0 ? paymentRows.map(payment => (
                  <tr key={payment.id}>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(payment.approvedAt ?? payment.createdAt)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#0D1B2A]">{formatAmount(payment.amount, payment.currency)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${payment.status === 'done' ? 'bg-emerald-50 text-emerald-700' : payment.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        {payment.status === 'done' ? 'Paid' : payment.status === 'failed' ? 'Failed' : payment.status === 'canceled' ? 'Refunded' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-5 py-10 text-center text-sm text-slate-500">No payment history yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-slate-400">
          Questions about billing?{' '}
            <a href="mailto:glosourceai@gmail.com" className="font-semibold text-slate-600 hover:text-[#EA580C]">
            glosourceai@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
