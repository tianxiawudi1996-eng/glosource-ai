import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="rounded-3xl border border-amber-200 bg-amber-50 p-8 sm:p-10">
          <p className="text-sm font-black uppercase tracking-widest text-amber-700">Korean Beta</p>
          <h1 className="mt-3 text-3xl font-black text-[#0D1B2A] sm:text-4xl">무료 베타 운영 중</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            한국 서비스는 사업자등록과 국내 유료 서비스 준비가 완료되기 전까지 결제를 받지 않습니다.
            현재는 무료 소싱 기능을 사용하고 의견을 남길 수 있습니다.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#sourcing-tool"
              className="rounded-xl bg-[#0D1B2A] px-5 py-3 text-center text-sm font-black text-white hover:bg-slate-800"
            >
              무료 소싱 계속하기
            </Link>
            <Link
              href="/#waitlist"
              className="rounded-xl border border-amber-300 bg-white px-5 py-3 text-center text-sm font-black text-amber-800 hover:bg-amber-100"
            >
              국내 유료 서비스 출시 알림 신청
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-[#EA580C]">현재 이용 범위</p>
            <h2 className="mt-2 text-xl font-black text-[#0D1B2A]">한국 서비스 무료 베타</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              비회원은 일일 무료 체험, 회원은 월간 무료 한도 안에서 해외 공급자 후보 탐색과 분석을 이용할 수 있습니다.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Global Service</p>
            <h2 className="mt-2 text-xl font-black text-[#0D1B2A]">해외 바이어용 서비스는 판매 중</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              해외 바이어가 한국 제조사와 K-제품을 찾는 영어 서비스는 Polar를 통해 지금 구매할 수 있습니다.
            </p>
            <Link href="/en#pricing" className="mt-4 inline-block text-sm font-black text-[#EA580C] hover:underline">
              영어 서비스 요금제 보기 →
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
}
