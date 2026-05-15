import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, count, desc, eq, gte } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, PLAN_LIMITS, subscriptions, usageLogs } from '@/app/lib/db';
import type { PlanTier } from '@/app/lib/db/schema';

const actionLabels: Record<string, string> = {
  source: 'AI Search',
  factory_direct: 'Factory Direct',
  wechat: 'WeChat',
  image_analyze: 'Image Analysis',
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
  const plan = (session.user.plan ?? 'free') as PlanTier;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [monthlyUsageRows, subscriptionRows, recentLogs] = await Promise.all([
    db.select({ value: count() }).from(usageLogs)
      .where(and(eq(usageLogs.userId, userId), gte(usageLogs.createdAt, monthStart))),
    db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1),
    db.select().from(usageLogs).where(eq(usageLogs.userId, userId))
      .orderBy(desc(usageLogs.createdAt)).limit(5),
  ]);

  const usageCount = monthlyUsageRows[0]?.value ?? 0;
  const limit = PLAN_LIMITS[plan]?.monthly ?? PLAN_LIMITS.free.monthly;
  const usagePercent = limit > 0 ? Math.min(100, Math.round((usageCount / limit) * 100)) : 0;
  const subscription = subscriptionRows[0];

  const planLabel = plan === 'enterprise' ? 'Agency' : plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/en" className="inline-flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#EA580C] rounded-md flex items-center justify-center">
                <span className="text-white font-black text-[10px]">G</span>
              </div>
              <span className="font-black text-[#0D1B2A] text-sm">GloSource AI</span>
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
              <span className="pb-1 text-sm font-bold text-slate-500">/ {limit === 999 ? '∞' : limit}</span>
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
              <h2 className="text-lg font-black text-[#0D1B2A]">Recent searches</h2>
              <p className="mt-1 text-sm text-slate-500">Your last 5 sourcing searches.</p>
            </div>
            <Link href="/en#sourcing-tool"
              className="min-h-[44px] flex items-center rounded-xl bg-[#EA580C] px-5 py-2.5 text-sm font-black text-white hover:bg-[#DC4C00] transition-colors">
              New search →
            </Link>
          </div>
          {/* Mobile */}
          <div className="md:hidden divide-y divide-slate-100">
            {recentLogs.length > 0 ? recentLogs.map(log => (
              <div key={log.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#0D1B2A] truncate">{log.product ?? '–'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(log.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    {actionLabels[log.action] ?? log.action}
                  </span>
                  <span className="text-xs font-black text-[#EA580C] bg-orange-50 border border-orange-100 px-2 py-1 rounded-md min-w-[32px] text-center">
                    {log.supplierCount ?? 0}
                  </span>
                </div>
              </div>
            )) : (
              <div className="px-5 py-10 text-center text-sm text-slate-500">No searches yet.</div>
            )}
          </div>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Product searched</th>
                  <th className="px-5 py-3">Channel</th>
                  <th className="px-5 py-3">Results</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLogs.length > 0 ? recentLogs.map(log => (
                  <tr key={log.id}>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(log.createdAt)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#0D1B2A]">{log.product ?? '–'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{actionLabels[log.action] ?? log.action}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-600">{log.supplierCount ?? 0}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">No searches yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
