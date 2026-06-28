import type { MetadataRoute } from 'next';
import { BLOG_POSTS } from './lib/blog-posts';

const BASE = 'https://glosourceai.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${BASE}/en/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    { url: `${BASE}/en`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/en/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    ...blogEntries,
    { url: `${BASE}/en/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/en/case-studies`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/en/support`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/en/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/en/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    // /en/billing 제거 — robots.ts에서 /billing disallow (로그인 후만 의미, 인덱싱 X)
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
