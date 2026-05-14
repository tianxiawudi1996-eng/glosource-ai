import type { MetadataRoute } from 'next';

const BASE = 'https://glosource-ai.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/en`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];
}
