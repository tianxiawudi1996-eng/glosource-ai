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

  const tossReady = Boolean(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* Toss 미연동 안내 배너 */}
        {!tossReady && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-black text-amber-800">🚧 결제 시스템 연동 준비 중</p>
            <p className="mt-1 text-xs text-amber-700 leading-5">
              현재 베타 운영 중으로 결제 시스템을 준비하고 있습니다.<br />
              사전 신청하시면 오픈 즉시 알림 + <strong>첫 달 무료</strong> 혜택을 드립니다.
            </p>
            <a
              href="/#waitlist"
              className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 text-xs font-black text-white hover:bg-amber-700 transition-colors"
            >
              베타 사전 신청 →
            </a>
          </div>
        )}

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

        <section className="grid gap-4 sm:grid-cols-3">
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
                  <UpgradeButton planId={plan.id} planName={plan.name} isCurrent={isCurrent} />
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-black text-[#0D1B2A]">결제 내역</h2>
          </div>
          {/* 모바일 카드 뷰 */}
          <div className="md:hidden divide-y divide-slate-100">
            {paymentRows.length > 0 ? (
              paymentRows.map((payment) => (
                <div key={payment.id} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#0D1B2A]">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(payment.approvedAt ?? payment.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${payment.status === 'done' ? 'bg-emerald-50 text-emerald-700' : payment.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {payment.status === 'done' ? '완료' : payment.status === 'failed' ? '실패' : payment.status === 'canceled' ? '취소' : '처리중'}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-500">결제 내역이 없습니다.</div>
            )}
          </div>
          {/* 데스크톱 테이블 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
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
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${payment.status === 'done' ? 'bg-emerald-50 text-emerald-700' : payment.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                          {payment.status === 'done' ? '완료' : payment.status === 'failed' ? '실패' : payment.status === 'canceled' ? '취소' : '처리중'}
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
