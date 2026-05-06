import Link from 'next/link';

interface Props {
  searchParams: Promise<{ code?: string; message?: string }>;
}

export default async function BillingFailPage({ searchParams }: Props) {
  const params = await searchParams;
  const message = params.message ?? '결제가 취소되었습니다.';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <div className="mb-6">
          <span className="text-5xl">😔</span>
          <h1 className="mt-4 text-2xl font-black text-[#0D1B2A]">결제 실패</h1>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/billing"
            className="block w-full rounded-xl bg-[#0D1B2A] px-4 py-3.5 text-center text-sm font-black text-white hover:bg-slate-800"
          >
            다시 시도하기
          </Link>
          <Link
            href="/"
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}
