import type { Metadata } from 'next';
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';
import { auth } from '@/auth';
import AssistantExperience from './AssistantExperience';

export const metadata: Metadata = {
  title: 'AI Sourcing Assistant — Find Korean Companies | GloSource AI',
  description: 'Describe what you need in plain English. Find Korean companies, review official government registry signals, and prepare supplier outreach.',
  alternates: { canonical: '/en/assistant' },
};

export default async function AssistantPage() {
  const session = await auth();
  return (
    <main className="min-h-screen bg-slate-50 text-[#0D1B2A]">
      <nav className="border-b border-white/10 bg-[#0D1B2A]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/en" aria-label="GloSource AI home"><BrandLogo compact /></Link>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link href="/en#sourcing-tool" className="hidden text-slate-300 hover:text-white sm:block">Supplier Search</Link>
            <Link href="/en/billing" className="rounded-lg bg-[#EA580C] px-4 py-2 font-bold text-white hover:bg-[#DC4C00]">View plans</Link>
          </div>
        </div>
      </nav>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10 text-center sm:py-14">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#EA580C]">AI Sourcing Assistant</p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">Tell us what you need from Korea.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">Search Korean companies in natural language, review government-registry evidence, and turn a shortlist into supplier outreach.</p>
        </div>
      </section>
      {session?.user ? <AssistantExperience /> : (
        <section className="mx-auto max-w-2xl px-6 py-14 text-center">
          <div className="rounded-3xl border border-orange-200 bg-white p-8 shadow-sm sm:p-12">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#EA580C]">Free account required</p>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">Sign up to use the AI Sourcing Assistant</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">Your account includes 10 free searches per month and keeps government-verification results connected to your sourcing workspace.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/en/register" className="rounded-xl bg-[#EA580C] px-6 py-3 text-sm font-black text-white hover:bg-[#DC4C00]">Create free account</Link>
              <Link href="/en/login" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-black text-[#0D1B2A] hover:bg-slate-50">Sign in</Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
