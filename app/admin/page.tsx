import { redirect } from 'next/navigation';
import { count, desc, eq, gte, sql } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, payments, subscriptions, usageLogs, users } from '@/app/lib/db';

const actionLabels: Record<string, string> = {
  source: '통합 검색',
  factory_direct: '공장 직거래',
  wechat: 'WeChat',
  image_analyze: '이미지 분석',
};

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(date);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

export default async function AdminPage() {
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? '').split(',').map(e => e.trim()).filter(Boolean);
  if (!session?.user?.email || !adminEmails.includes(session.user.email)) redirect('/');

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    totalUsersRows,
    paidSubscribersRows,
    monthlyUsageRows,
    monthlyPaymentRows,
    recentUsers,
    recentPayments,
    channelUsage,
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(subscriptions).where(eq(subscriptions.status, 'active')),
    db.select({ value: count() }).from(usageLogs).where(gte(usageLogs.createdAt, monthStart)),
    db
      .select({ value: sql<number>`coalesce(sum(${payments.amount}), 0)` })
      .from(payments)
      .where(sql`${payments.status} = 'done' and ${payments.createdAt} >= ${monthStart}`),
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10),
    db
      .select({
        id: payments.id,
        userId: payments.userId,
        amount: payments.amount,
        status: payments.status,
        approvedAt: payments.approvedAt,
      })
      .from(payments)
      .orderBy(desc(payments.createdAt))
      .limit(10),
    db
      .select({ action: usageLogs.action, value: count() })
      .from(usageLogs)
      .groupBy(usageLogs.action),
  ]);

  const metrics = [
    ['전체 가입자 수', String(totalUsersRows[0]?.value ?? 0)],
    ['유료 구독자 수', String(paidSubscribersRows[0]?.value ?? 0)],
    ['이번달 총 API 사용 횟수', String(monthlyUsageRows[0]?.value ?? 0)],
    ['이번달 결제 총액', formatCurrency(Number(monthlyPaymentRows[0]?.value ?? 0))],
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-[#0D1B2A] px-6 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold text-[#EA580C]">Admin Only</p>
          <h1 className="mt-2 text-3xl font-black">관리자 패널</h1>
          <p className="mt-2 text-sm text-slate-300">가입자, 결제, 사용량 지표를 확인합니다.</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-[#0D1B2A]">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-black text-[#0D1B2A]">최근 가입자</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                <tr>
                  <th className="px-5 py-3">email</th>
                  <th className="px-5 py-3">name</th>
                  <th className="px-5 py-3">createdAt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4 text-sm font-bold text-[#0D1B2A]">{user.email}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{user.name ?? '-'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-black text-[#0D1B2A]">최근 결제 내역</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                <tr>
                  <th className="px-5 py-3">userId</th>
                  <th className="px-5 py-3">amount</th>
                  <th className="px-5 py-3">status</th>
                  <th className="px-5 py-3">approvedAt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-5 py-4 text-sm font-bold text-[#0D1B2A]">{payment.userId}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatCurrency(payment.amount)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{payment.status}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(payment.approvedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-[#0D1B2A]">채널별 사용 통계</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {channelUsage.map((item) => (
              <div key={item.action} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-500">{actionLabels[item.action]}</p>
                <p className="mt-2 text-2xl font-black text-[#0D1B2A]">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
