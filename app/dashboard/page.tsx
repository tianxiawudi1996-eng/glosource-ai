import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, count, desc, eq, gte } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, PLAN_LIMITS, subscriptions, usageLogs } from '@/app/lib/db';
import type { PlanTier } from '@/app/lib/db/schema';

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

function usageWidthClass(percent: number): string {
  if (percent >= 95) return 'w-full';
  if (percent >= 75) return 'w-3/4';
  if (percent >= 66) return 'w-2/3';
  if (percent >= 50) return 'w-1/2';
  if (percent >= 33) return 'w-1/3';
  if (percent >= 25) return 'w-1/4';
  if (percent > 0) return 'w-1/6';
  return 'w-0';
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const userId = session.user.id;
  const plan = session.user.plan as PlanTier;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [monthlyUsageRows, subscriptionRows, recentLogs] = await Promise.all([
    db
      .select({ value: count() })
      .from(usageLogs)
      .where(and(eq(usageLogs.userId, userId), gte(usageLogs.createdAt, monthStart))),
    db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1),
    db
      .select()
      .from(usageLogs)
      .where(eq(usageLogs.userId, userId))
      .orderBy(desc(usageLogs.createdAt))
      .limit(5),
  ]);

  const usageCount = monthlyUsageRows[0]?.value ?? 0;
  const limit = PLAN_LIMITS[plan]?.monthly ?? PLAN_LIMITS.free.monthly;
  const usagePercent = limit > 0 ? Math.min(100, Math.round((usageCount / limit) * 100)) : 0;
  const subscription = subscriptionRows[0];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#EA580C]">GloSource AI Dashboard</p>
            <h1 className="mt-2 text-3xl font-black text-[#0D1B2A]">
              안녕하세요, {session.user.name ?? '사용자'}님
            </h1>
          </div>
          <span className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-[#0D1B2A] shadow-sm">
            {plan}
          </span>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">이번달 사용량</p>
            <div className="mt-3 flex items-end gap-2">
              <strong className="text-4xl font-black text-[#0D1B2A]">{usageCount}</strong>
              <span className="pb-1 text-sm font-bold text-slate-500">/ {limit}회</span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full bg-[#EA580C] ${usageWidthClass(usagePercent)}`} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">구독 상태</p>
            <div className="mt-3 flex items-center gap-2">
              <strong className="text-3xl font-black text-[#0D1B2A]">
                {subscription?.status ?? 'free'}
              </strong>
              {subscription?.cancelAtPeriodEnd ? (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                  해지 예정
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-slate-500">
              다음 갱신일: {formatDate(subscription?.currentPeriodEnd ?? null)}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0D1B2A]">최근 소싱 기록</h2>
              <p className="mt-1 text-sm text-slate-500">최근 사용 5건을 표시합니다.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/#sourcing-tool" className="rounded-xl bg-[#0D1B2A] px-4 py-3 text-sm font-black text-white hover:bg-slate-800">
                소싱 시작하기
              </Link>
              <Link href="/billing" className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-[#0D1B2A] hover:bg-slate-50">
                구독 관리
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                <tr>
                  <th className="px-5 py-3">날짜</th>
                  <th className="px-5 py-3">검색어</th>
                  <th className="px-5 py-3">채널</th>
                  <th className="px-5 py-3">결과수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(log.createdAt)}</td>
                      <td className="px-5 py-4 text-sm font-bold text-[#0D1B2A]">{log.product ?? '-'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{actionLabels[log.action]}</td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-600">{log.supplierCount ?? 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">
                      아직 소싱 기록이 없습니다.
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
