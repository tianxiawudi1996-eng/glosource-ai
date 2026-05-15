'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type UpgradeButtonProps = {
  planId: string;
  planName: string;
  isCurrent: boolean;
};

export function UpgradeButton({ planId, planName, isCurrent }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (isCurrent) return;
    setLoading(true);

    try {
      const res = await fetch('/api/payments/toss/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (res.status === 401) {
        window.location.href = '/auth/login';
        return;
      }

      if (!res.ok) {
        const json = await res.json() as { error?: string };
        alert(json.error ?? '오류가 발생했습니다.');
        return;
      }

      const data = await res.json() as {
        orderId: string;
        amount: number;
        orderName: string;
        customerName: string;
        customerEmail: string;
      };

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        alert('결제 시스템 준비 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      const { loadTossPayments } = await import('@tosspayments/payment-sdk');
      const toss = await loadTossPayments(clientKey);
      await toss.requestPayment('카드', {
        orderId: data.orderId,
        orderName: data.orderName,
        amount: data.amount,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        successUrl: `${window.location.origin}/billing/success`,
        failUrl: `${window.location.origin}/billing/fail`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (!msg.includes('PAY_PROCESS_CANCELED')) {
        alert('결제 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isCurrent || loading}
      onClick={handleClick}
      className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-black transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
        isCurrent
          ? 'border border-slate-300 bg-white text-[#0D1B2A]'
          : 'bg-[#0D1B2A] text-white hover:bg-slate-800'
      }`}
    >
      {loading ? '처리 중...' : isCurrent ? '현재 플랜' : `${planName} 결제하기`}
    </button>
  );
}

export function CancelSubscriptionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const cancelSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        alert(json.error ?? '구독 취소 처리에 실패했습니다.');
        return;
      }
      setIsOpen(false);
      router.refresh();
    } catch {
      alert('구독 취소 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-xl border border-red-200 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-50"
      >
        구독 취소
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1B2A]/50 px-6">
          <section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#0D1B2A]">구독을 취소하시겠습니까?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              현재 기간 만료 후 자동 갱신이 중지됩니다. 남은 기간은 계속 이용 가능합니다.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-[#0D1B2A] hover:bg-slate-50"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={cancelSubscription}
                disabled={loading}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700"
              >
                {loading ? '처리 중...' : '취소 확인'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
