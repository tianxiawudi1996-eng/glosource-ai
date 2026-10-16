import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllPosts } from '@/app/lib/blog-posts';
import { getPostMerged } from '@/app/lib/blog-posts-server';
import BrandLogo from '@/app/components/BrandLogo';
import JsonLdBreadcrumb from '@/app/components/JsonLdBreadcrumb';

// DB posts rendered dynamically on first hit (not pre-generated)
export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostMerged(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://glosourceai.com/en/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description, type: 'article', publishedTime: post.publishedAt, url: `https://glosourceai.com/en/blog/${post.slug}` },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostMerged(slug);
  if (!post) notFound();

  // BlogPosting JSON-LD — Google 리치 결과 (article cards, news 리스팅)
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'GloSource AI',
      url: 'https://glosourceai.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'GloSource AI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://glosourceai.com/images/glosource-logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://glosourceai.com/en/blog/${post.slug}`,
    },
    articleSection: post.category,
    timeRequired: `PT${post.readingTimeMin}M`,
    inLanguage: 'en-US',
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Home', url: 'https://glosourceai.com/en' },
          { name: 'Blog', url: 'https://glosourceai.com/en/blog' },
          { name: post.title, url: `https://glosourceai.com/en/blog/${post.slug}` },
        ]}
      />
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/en" aria-label="GloSource AI home">
            <BrandLogo compact />
          </Link>
          <Link href="/en/blog" className="text-xs font-semibold text-slate-300 hover:text-white">← All articles</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[11px] font-bold text-[#EA580C] bg-orange-50 border border-orange-100 rounded-full px-2.5 py-1">{post.category}</span>
          <span className="text-xs text-slate-400">{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-400">{post.readingTimeMin} min read</span>
        </div>

        <h1 className="text-3xl font-black text-[#0D1B2A] mb-6 leading-tight">{post.title}</h1>
        <p className="text-slate-500 text-sm leading-relaxed border-l-4 border-[#EA580C] pl-4 mb-10">{post.description}</p>

        <div
          className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-[#0D1B2A] prose-a:text-[#EA580C] prose-strong:text-[#0D1B2A] prose-li:text-slate-600 prose-p:text-slate-600 prose-p:leading-relaxed prose-table:text-sm"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-[#0D1B2A] p-8 text-center">
          <p className="text-xs font-bold text-[#EA580C] uppercase tracking-widest mb-3">Ready to source?</p>
          <h2 className="text-xl font-black text-white mb-3">Build your Korean supplier shortlist</h2>
          <p className="text-slate-300 text-sm mb-6">Verified free accounts receive 10 searches per month. Email verification required. No credit card needed.</p>
          <Link
            href="/en#sourcing-tool"
            className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#DC4C00] text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
          >
            Try GloSource AI free →
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-100 mt-8">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/en" aria-label="GloSource AI home">
            <BrandLogo compact />
          </Link>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link href="/en/blog" className="hover:text-slate-700">Blog</Link>
            <Link href="/terms" className="hover:text-slate-700">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
