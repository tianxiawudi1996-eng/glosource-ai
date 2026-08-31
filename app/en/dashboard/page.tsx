import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, count, desc, eq, gte, isNotNull } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, subscriptions, usageLogs, searchHistory } from '@/app/lib/db';
import type { PlanTier } from '@/app/lib/db/schema';
import BrandLogo from '@/app/components/BrandLogo';
import { monthlySearchQuota } from '@/app/lib/product-contracts';

const regionLabel: Record<string, string> = {
  korea: '🇰🇷 Korea',
  china: '🇨🇳 China',
  any: '🌏 Any',
};

function formatDate(date: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

function usageWidthClass(percent: number): string {
  if (percent >= 95) return 'w-full';
  if (percent >= 75) return 'w-3/4';
  if (percent >= 50) return 'w-1/2';
  if (percent >= 25) return 'w-1/4';
  if (percent > 0) return 'w-1/6';
  return 'w-0';
}

export default async function EnDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/en/login?callbackUrl=/en/dashboard');

  const userId = session.user.id;
  const plan = (session.user.plans?.en ?? 'free') as PlanTier;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [monthlyUsageRows, subscriptionRows, historyRows] = await Promise.all([
    db.select({ value: count() }).from(usageLogs)
      .where(and(
        eq(usageLogs.userId, userId),
        eq(usageLogs.surface, 'en'),
        gte(usageLogs.createdAt, monthStart),
      )),
    db.select().from(subscriptions).where(and(
      eq(subscriptions.userId, userId),
      isNotNull(subscriptions.polarSubscriptionId),
    )).orderBy(desc(subscriptions.updatedAt)).limit(1),
    db.select().from(searchHistory).where(and(
      eq(searchHistory.userId, userId),
      eq(searchHistory.surface, 'en'),
    ))
      .orderBy(desc(searchHistory.createdAt)).limit(20),
  ]);

  const usageCount = monthlyUsageRows[0]?.value ?? 0;
  const limit = monthlySearchQuota('en', plan);
  const usagePercent = limit && limit > 0 ? Math.min(100, Math.round((usageCount / limit) * 100)) : 0;
  const subscription = subscriptionRows[0];

  const planLabel = plan === 'enterprise' ? 'Business' : plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/en" className="mb-3 inline-flex" aria-label="GloSource AI home">
              <BrandLogo compact />
            </Link>
            <p className="text-sm font-bold text-[#EA580C]">Dashboard</p>
            <h1 className="mt-1 text-2xl font-black text-[#0D1B2A]">
              Welcome back, {session.user.name ?? 'there'}
            </h1>
          </div>
          <span className="w-fit rounded-full border border-[#EA580C]/30 bg-orange-50 px-4 py-2 text-sm font-black text-[#EA580C]">
            {planLabel} plan
          </span>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Searches this month</p>
            <div className="mt-3 flex items-end gap-2">
              <strong className="text-4xl font-black text-[#0D1B2A]">{usageCount}</strong>
              <span className="pb-1 text-sm font-bold text-slate-500">/ {limit}</span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full bg-[#EA580C] transition-all ${usageWidthClass(usagePercent)}`} />
            </div>
            {plan === 'free' && (
              <p className="mt-3 text-xs text-slate-500">
                <Link href="/en/billing" className="text-[#EA580C] font-bold hover:underline">Upgrade for more searches →</Link>
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Subscription</p>
            <div className="mt-3 flex items-center gap-2">
              <strong className="text-2xl font-black text-[#0D1B2A]">
                {subscription?.status === 'active' ? 'Active' : plan === 'free' ? 'Free' : subscription?.status ?? 'Free'}
              </strong>
              {subscription?.cancelAtPeriodEnd && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Cancels at period end</span>
              )}
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {subscription?.currentPeriodEnd
                ? `Renews ${formatDate(subscription.currentPeriodEnd)}`
                : 'No active subscription'}
            </p>
            <Link href="/en/billing" className="mt-3 inline-block text-xs font-bold text-[#EA580C] hover:underline">
              Manage plan →
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0D1B2A]">Search history</h2>
              <p className="mt-1 text-sm text-slate-500">Your last 20 sourcing searches — including top AI-surfaced suppliers.</p>
            </div>
            <Link href="/en#sourcing-tool"
              className="min-h-[44px] flex items-center rounded-xl bg-[#EA580C] px-5 py-2.5 text-sm font-black text-white hover:bg-[#DC4C00] transition-colors">
              New search →
            </Link>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-slate-100">
            {historyRows.length > 0 ? historyRows.map(row => (
              <div key={row.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-[#0D1B2A] truncate">{row.product}</p>
                    {row.topSuppliers && (
                      <p className="text-xs text-slate-500 mt-1 truncate">{row.topSuppliers}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{formatDate(row.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {regionLabel[row.region] ?? row.region}
                    </span>
                    <span className="text-xs font-black text-[#EA580C] bg-orange-50 border border-orange-100 px-2 py-1 rounded-md">
                      {row.supplierCount} found
                    </span>
                  </div>
                </div>
                <Link
                  href={`/en?q=${encodeURIComponent(row.product)}#sourcing-tool`}
                  className="mt-2.5 inline-block text-xs font-bold text-[#EA580C] border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition-colors"
                >
                  Re-run →
                </Link>
              </div>
            )) : (
              <div className="px-5 py-10 text-center text-sm text-slate-500">No searches yet. Run your first search above.</div>
            )}
          </div>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Product searched</th>
                  <th className="px-5 py-3">Region</th>
                  <th className="px-5 py-3">Top suppliers (AI-surfaced)</th>
                  <th className="px-5 py-3 text-center">Found</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyRows.length > 0 ? historyRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#0D1B2A] max-w-[200px] truncate">{row.product}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">{regionLabel[row.region] ?? row.region}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 max-w-[240px] truncate">
                      {row.topSuppliers ?? <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-[#EA580C] text-center">{row.supplierCount}</td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/en?q=${encodeURIComponent(row.product)}#sourcing-tool`}
                        className="text-xs font-bold text-[#EA580C] border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition-colors whitespace-nowrap"
                      >
                        Re-run →
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                      No searches yet.{' '}
                      <Link href="/en#sourcing-tool" className="text-[#EA580C] font-bold hover:underline">
                        Run your first search →
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
