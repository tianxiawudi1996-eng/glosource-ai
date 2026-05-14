import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, payments, subscriptions } from '@/app/lib/db';
import { sendReceiptEmail } from '@/app/lib/email';

interface Props {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
}

export default async function BillingSuccessPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const params = await searchParams;
  const { paymentKey, orderId } = params;

  if (!paymentKey || !orderId) {
    redirect('/billing');
  }

  // [C-2] orderId가 현재 로그인 유저 소유인지 검증
  const [pendingPayment] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.tossOrderId, orderId), eq(payments.userId, session.user.id)))
    .limit(1);

  if (!pendingPayment) {
    redirect('/billing/fail?code=INVALID_ORDER&message=유효하지 않은 주문입니다.');
  }

  // [C-5] 이미 확정된 결제 재처리 방지
  if (pendingPayment.status === 'done') {
    const planMap: Record<number, string> = { 190000: 'starter', 490000: 'pro', 990000: 'enterprise' };
    const existingPlan = planMap[pendingPayment.amount] ?? 'starter';
    const planLabels: Record<string, string> = { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' };
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-2xl font-black text-[#0D1B2A]">이미 처리된 결제</h1>
          <p className="mt-2 text-sm text-slate-500">{planLabels[existingPlan] ?? 'Pro'} 플랜이 이미 활성화되어 있습니다.</p>
          <a href="/dashboard" className="mt-6 block w-full rounded-xl bg-[#EA580C] px-4 py-3.5 text-center text-sm font-black text-white hover:bg-orange-600">대시보드 보기</a>
        </section>
      </main>
    );
  }

  // [C-1] amount는 URL 파라미터 대신 DB 레코드에서 읽음
  const amountNum = pendingPayment.amount;
  const secretKey = process.env.TOSS_SECRET_KEY ?? '';

  let confirmed = false;
  let planId = 'pro';

  try {
    if (secretKey) {
      const credentials = Buffer.from(`${secretKey}:`).toString('base64');
      const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentKey, orderId, amount: amountNum }),
      });

      if (res.ok) {
        confirmed = true;
      }
    } else {
      confirmed = true; // dev mode without Toss key
    }

    if (confirmed) {
      await db
        .update(payments)
        .set({ status: 'done', tossPaymentKey: paymentKey, approvedAt: new Date() })
        .where(and(eq(payments.tossOrderId, orderId), eq(payments.userId, session.user.id)));

      const planMap: Record<number, string> = { 190000: 'starter', 490000: 'pro', 990000: 'enterprise' };
      planId = planMap[amountNum] ?? 'starter';

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const existingSubscriptions = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(eq(subscriptions.userId, session.user.id))
        .limit(1);

      if (existingSubscriptions[0]) {
        await db
          .update(subscriptions)
          .set({
            plan: planId as 'starter' | 'pro' | 'enterprise',
            status: 'active',
            tossOrderId: orderId,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            updatedAt: now,
          })
          .where(eq(subscriptions.id, existingSubscriptions[0].id));
      } else {
        await db.insert(subscriptions).values({
          userId: session.user.id,
          plan: planId as 'starter' | 'pro' | 'enterprise',
          status: 'active',
          tossOrderId: orderId,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        });
      }

      const planNames: Record<string, string> = { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' };
      if (session.user.email) {
        sendReceiptEmail(
          session.user.email,
          session.user.name ?? '',
          planNames[planId] ?? 'Pro',
          amountNum,
          now,
        ).catch(() => {});
      }
    }
  } catch (e) {
    console.error('[billing/success]', e);
    redirect('/billing/fail?code=SUBSCRIPTION_ACTIVATION_FAILED&message=구독 활성화에 실패했습니다.');
  }

  if (!confirmed) {
    redirect('/billing/fail?code=CONFIRM_FAILED&message=결제 승인에 실패했습니다.');
  }

  const planLabels: Record<string, string> = { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <div className="mb-6">
          <span className="text-5xl">🎉</span>
          <h1 className="mt-4 text-2xl font-black text-[#0D1B2A]">결제 완료</h1>
          <p className="mt-2 text-sm text-slate-500">
            {planLabels[planId] ?? 'Pro'} 플랜이 활성화되었습니다.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-left space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500">플랜</span>
            <span className="font-bold text-[#0D1B2A]">{planLabels[planId] ?? 'Pro'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">결제 금액</span>
            <span className="font-bold text-[#0D1B2A]">{amountNum.toLocaleString('ko-KR')}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">결제일</span>
            <span className="font-bold text-[#0D1B2A]">{new Date().toLocaleDateString('ko-KR')}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full rounded-xl bg-[#EA580C] px-4 py-3.5 text-center text-sm font-black text-white hover:bg-orange-600"
          >
            소싱 시작하기 →
          </Link>
          <Link
            href="/dashboard"
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            대시보드 보기
          </Link>
        </div>
      </section>
    </main>
  );
}
