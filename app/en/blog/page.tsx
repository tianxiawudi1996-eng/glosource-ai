import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPostsMerged } from '@/app/lib/blog-posts-server';
import BrandLogo from '@/app/components/BrandLogo';
import JsonLdBreadcrumb from '@/app/components/JsonLdBreadcrumb';

export const metadata: Metadata = {
  title: 'Korean Supplier Sourcing Blog — GloSource AI',
  description: 'Guides and tips for international buyers sourcing from Korea: finding manufacturers, understanding certifications, writing RFQs, and navigating Korean B2B platforms.',
  openGraph: {
    title: 'Korean Supplier Sourcing Blog — GloSource AI',
    description: 'Guides for K-sourcing — MFDS/KC/HACCP certifications, RFQ templates, EC21 vs BuyKorea, K-beauty FBA.',
    url: 'https://glosourceai.com/en/blog',
    siteName: 'GloSource AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Korean Supplier Sourcing Blog',
    description: 'Guides for K-sourcing — certifications, RFQ, B2B platforms, FBA.',
    creator: '@glosourceai',
  },
  keywords: [
    'Korean sourcing blog',
    'Korea B2B guide',
    'MFDS certification',
    'KC certification',
    'HACCP Korean food',
    'RFQ writing tips',
    'EC21 vs BuyKorea',
    'Korean manufacturer guide',
    'K-beauty sourcing guide',
    'Amazon FBA from Korea',
  ],
  alternates: {
    canonical: 'https://glosourceai.com/en/blog',
    languages: {
      'en-US': 'https://glosourceai.com/en/blog',
      'x-default': 'https://glosourceai.com/en/blog',
    },
  },
};

export default async function EnBlogIndex() {
  const posts = await getAllPostsMerged();
  return (
    <div className="min-h-screen bg-white">
      <JsonLdBreadcrumb
        items={[
          { name: 'Home', url: 'https://glosourceai.com/en' },
          { name: 'Blog', url: 'https://glosourceai.com/en/blog' },
        ]}
      />
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/en" aria-label="GloSource AI home">
            <BrandLogo compact />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/en" className="text-xs font-semibold text-slate-300 hover:text-white">← Back to sourcing tool</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-12">
          <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Resources</p>
          <h1 className="text-3xl font-black text-[#0D1B2A] mb-4">Korean Supplier Sourcing Blog</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
            Practical guides for international buyers sourcing from Korea — manufacturer directories, certifications, RFQ templates, and platform comparisons.
          </p>
        </header>

        <div className="space-y-8">
          {posts.length === 0 && (
            <p className="text-sm text-slate-400 py-8 text-center">No articles yet — check back soon.</p>
          )}
          {posts.map(post => (
            <article key={post.slug} className="border-b border-slate-100 pb-8 last:border-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-[#EA580C] bg-orange-50 border border-orange-100 rounded-full px-2.5 py-1">{post.category}</span>
                <span className="text-xs text-slate-400">{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs text-slate-400">{post.readingTimeMin} min read</span>
              </div>
              <h2 className="text-xl font-black text-[#0D1B2A] mb-2 leading-tight">
                <Link href={`/en/blog/${post.slug}`} className="hover:text-[#EA580C] transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{post.description}</p>
              <Link href={`/en/blog/${post.slug}`} className="text-sm font-bold text-[#EA580C] hover:text-[#DC4C00] transition-colors">
                Read article →
              </Link>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-100 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/en" aria-label="GloSource AI home">
            <BrandLogo compact />
          </Link>
          <Link href="/en" className="text-xs font-bold text-[#EA580C] hover:text-[#DC4C00]">Explore Korean suppliers — create a free account →</Link>
        </div>
      </footer>
    </div>
  );
}
