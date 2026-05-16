import type { MetadataRoute } from 'next';
import { BLOG_POSTS } from './lib/blog-posts';

const BASE = 'https://glosource-ai.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${BASE}/en/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/en`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/en/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    ...blogEntries,
    { url: `${BASE}/en/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/en/case-studies`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
