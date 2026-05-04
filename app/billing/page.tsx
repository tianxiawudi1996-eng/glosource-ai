import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, payments, subscriptions } from '@/app/lib/db';
import { CancelSubscriptionButton, UpgradeButton } from './BillingActions';

const planCards = [
  { id: 'starter', name: 'Starter', price: '190,000원/월', usage: '소싱 30회/월' },
  { id: 'pro', name: 'Pro', price: '490,000원/월', usage: '소싱 60회/월' },
  { id: 'enterprise', name: 'Enterprise', price: '990,000원/월', usage: '무제한' },
] as const;

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(date);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const userId = session.user.id;
  const [subscriptionRows, paymentRows] = await Promise.all([
    db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1),
    db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt))
      .limit(20),
  ]);

  const subscription = subscriptionRows[0];
  const currentPlan = subscription?.plan ?? session.user.plan;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#EA580C]">Billing</p>
            <h1 className="mt-2 text-3xl font-black text-[#0D1B2A]">구독 관리</h1>
            <p className="mt-2 text-sm text-slate-500">
              현재 상태: {subscription?.status ?? 'free'} · 다음 갱신일: {formatDate(subscription?.currentPeriodEnd ?? null)}
            </p>
          </div>
          <CancelSubscriptionButton />
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          {planCards.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <article
                key={plan.id}
                className={`rounded-2xl border bg-white p-6 shadow-sm ${
                  isCurrent ? 'border-[#EA580C]' : 'border-slate-200'
                }`}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-[#0D1B2A]">{plan.name}</h2>
                  {isCurrent ? (
                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#EA580C]">
                      현재 플랜
                    </span>
                  ) : null}
                </div>
                <p className="text-3xl font-black text-[#0D1B2A]">{plan.price}</p>
                <p className="mt-2 text-sm font-bold text-slate-500">{plan.usage}</p>
                <div className="mt-6">
                  <UpgradeButton planName={plan.name} isCurrent={isCurrent} />
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-black text-[#0D1B2A]">결제 내역</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                <tr>
                  <th className="px-5 py-3">날짜</th>
                  <th className="px-5 py-3">금액</th>
                  <th className="px-5 py-3">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentRows.length > 0 ? (
                  paymentRows.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(payment.approvedAt ?? payment.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#0D1B2A]">{formatCurrency(payment.amount)}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-sm text-slate-500">
                      결제 내역이 없습니다.
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
