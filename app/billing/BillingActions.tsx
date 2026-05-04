'use client';

import Link from 'next/link';
import { useState } from 'react';

type BillingActionsProps = {
  planName: string;
  isCurrent: boolean;
};

export function UpgradeButton({ planName, isCurrent }: BillingActionsProps) {
  return (
    <Link
      href="/api/contact"
      className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-black ${
        isCurrent
          ? 'border border-slate-300 bg-white text-[#0D1B2A] hover:bg-slate-50'
          : 'bg-[#0D1B2A] text-white hover:bg-slate-800'
      }`}
    >
      {isCurrent ? '현재 플랜' : `${planName} 문의하기`}
    </Link>
  );
}

export function CancelSubscriptionButton() {
  const [isOpen, setIsOpen] = useState(false);

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
              현재는 UI 확인 단계입니다. 실제 구독 취소 API는 추후 연결됩니다.
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
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700"
              >
                취소 확인
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
