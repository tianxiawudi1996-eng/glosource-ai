import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, payments } from '@/app/lib/db';
import { sendReceiptEmail } from '@/app/lib/email';
import { logAbuseSignal } from '@/app/lib/abuse';
import { PurchaseTracker } from '@/app/components/FunnelTracking';
import { completeTossPayment } from '@/app/lib/tossSubscription';
import {
  isKoreanCommercializationEnabled,
  tossPlanByAmount,
} from '@/app/lib/tossPlans';

interface Props {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
}

export default async function BillingSuccessPage({ searchParams }: Props) {
  if (!isKoreanCommercializationEnabled(process.env)) {
    redirect('/billing');
  }

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
    const existingPlan = tossPlanByAmount(pendingPayment.amount);
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-2xl font-black text-[#0D1B2A]">이미 처리된 결제</h1>
          <p className="mt-2 text-sm text-slate-500">{existingPlan?.name ?? 'Pro'} 플랜이 이미 활성화되어 있습니다.</p>
          <a href="/dashboard" className="mt-6 block w-full rounded-xl bg-[#EA580C] px-4 py-3.5 text-center text-sm font-black text-white hover:bg-orange-600">대시보드 보기</a>
        </section>
      </main>
    );
  }

  // [C-1] amount는 URL 파라미터 대신 DB 레코드에서 읽음
  const amountNum = pendingPayment.amount;
  const plan = tossPlanByAmount(amountNum);
  if (!plan) {
    redirect('/billing/fail?code=INVALID_PLAN&message=유효하지 않은 플랜 금액입니다.');
  }
  const secretKey = process.env.TOSS_SECRET_KEY ?? '';

  let confirmed = false;
  const planId = plan.id;

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
    } else if (process.env.NODE_ENV !== 'production') {
      confirmed = true; // dev mode without Toss key
    }

    if (confirmed) {
      const approvedAt = new Date();
      const { newlyCompleted } = await completeTossPayment({
        paymentId: pendingPayment.id,
        paymentKey,
        userId: session.user.id,
        orderId,
        amount: amountNum,
        approvedAt,
      });

      if (newlyCompleted && session.user.email) {
        sendReceiptEmail(
          session.user.email,
          session.user.name ?? '',
          plan.name,
          amountNum,
          approvedAt,
        ).catch(() => {});
      }
      if (newlyCompleted) {
        logAbuseSignal({
          userId: session.user.id,
          event: 'payment_done',
          severity: 1,
          email: session.user.email,
          metadata: { provider: 'toss', orderId, plan: planId, amount: amountNum },
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.error('[billing/success]', e);
    redirect('/billing/fail?code=SUBSCRIPTION_ACTIVATION_FAILED&message=구독 활성화에 실패했습니다.');
  }

  if (!confirmed) {
    redirect('/billing/fail?code=CONFIRM_FAILED&message=결제 승인에 실패했습니다.');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <PurchaseTracker plan={planId} value={amountNum} currency="KRW" />
        <div className="mb-6">
          <span className="text-5xl">🎉</span>
          <h1 className="mt-4 text-2xl font-black text-[#0D1B2A]">결제 완료</h1>
          <p className="mt-2 text-sm text-slate-500">
            {plan.name} 플랜이 활성화되었습니다.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-left space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500">플랜</span>
            <span className="font-bold text-[#0D1B2A]">{plan.name}</span>
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
