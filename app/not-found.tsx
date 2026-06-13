import type { Metadata } from 'next';
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

export const metadata: Metadata = {
  title: 'Page Not Found - GloSource AI',
  description: 'The page you are looking for does not exist. Try the GloSource AI supplier search instead.',
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
            The page you tried to reach does not exist or has moved.
            Start from the Korean supplier search instead.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/en"
              className="bg-[#EA580C] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#DC4C00] transition-all"
            >
              Back to GloSource AI
            </Link>
            <Link
              href="/en/blog"
              className="border border-white/20 text-slate-200 px-6 py-3 rounded-lg hover:bg-white/5 transition-all"
            >
              Read sourcing guides
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-4">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-slate-600">
          GloSource AI - Korean supplier research tool
        </div>
      </footer>
    </div>
  );
}
