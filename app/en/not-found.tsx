import type { Metadata } from 'next';
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

export const metadata: Metadata = {
  title: 'Page Not Found — GloSource AI',
  description: "The page you're looking for doesn't exist. Try the GloSource AI Korean supplier search instead.",
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://glosource-ai.vercel.app/en' },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A1520] text-white flex flex-col">
      <nav className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/en" aria-label="GloSource AI home">
            <BrandLogo compact />
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-7xl font-bold tracking-tight text-[#EA580C]">404</p>
          <h1 className="mt-6 text-2xl font-bold">Page not found</h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            The page you tried to reach doesn&apos;t exist or has moved.
            Find Korean suppliers with the GloSource AI search instead.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/en"
              className="bg-[#EA580C] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#DC4C00] transition-all"
            >
              ← Back to GloSource AI
            </Link>
            <Link
              href="/en/blog"
              className="border border-white/20 text-slate-200 px-6 py-3 rounded-lg hover:bg-white/5 transition-all"
            >
              Read the sourcing guides
            </Link>
          </div>
          <p className="mt-10 text-xs text-slate-600">
            Looking for something specific? Email{' '}
            <a href="mailto:glosourceai@gmail.com" className="underline hover:text-slate-400">
              glosourceai@gmail.com
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-white/5 py-4">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-slate-600">
          GloSource AI — Korean supplier research tool
        </div>
      </footer>
    </div>
  );
}
