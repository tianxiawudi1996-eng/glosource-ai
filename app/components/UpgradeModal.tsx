'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { TOSS_PLANS } from '@/app/lib/tossPlans';

interface UpgradeModalProps {
  onClose: () => void;
}

// This Korean modal follows the KRW/Toss catalog, not the EN/USD Polar plans.
const PLAN_QUOTA_SUMMARY = TOSS_PLANS
  .map(plan => `${plan.name}: ${plan.searchesLabel}`)
  .join(' · ');

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <span className="text-3xl">🔒</span>
          <h2 className="mt-3 text-xl font-black text-[#0D1B2A]">
            {isLoggedIn ? '이용 한도 초과' : '무료 체험 소진'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLoggedIn
              ? '이번 달 소싱 횟수를 모두 사용했습니다.'
              : '비로그인 무료 크레딧이 소진되었습니다.'}
          </p>
        </div>

        <div className="space-y-3">
          {!isLoggedIn && (
            <Link
              href="/auth/login"
              className="block w-full rounded-xl bg-[#EA580C] px-4 py-3.5 text-center text-sm font-black text-white hover:bg-orange-600"
              onClick={onClose}
            >
              로그인하고 월 10회 무료 시작 →
            </Link>
          )}

          <Link
            href="/billing"
            className="block w-full rounded-xl bg-[#0D1B2A] px-4 py-3.5 text-center text-sm font-black text-white hover:bg-slate-800"
            onClick={onClose}
          >
            {isLoggedIn ? '플랜 업그레이드 →' : '요금제 보기'}
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          {PLAN_QUOTA_SUMMARY}
        </p>
      </div>
    </div>
  );
}
