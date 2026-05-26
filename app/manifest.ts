import type { MetadataRoute } from 'next';

/**
 * PWA Web App Manifest — Add to Home Screen + iOS Safari·Android Chrome 호환.
 *
 * 5/27 자비스 자율 /loop iter 14 추가.
 * Next.js App Router가 자동으로 /manifest.webmanifest 라우트 생성.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GloSource AI — Korean Supplier Research',
    short_name: 'GloSource AI',
    description:
      'AI-powered Korean supplier research tool. Find K-beauty, K-food, K-fashion manufacturer candidates from EC21, BuyKorea (KOTRA), and tradeKorea in under 90 seconds.',
    start_url: '/en',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0A1520',
    theme_color: '#0D1B2A',
    lang: 'en-US',
    dir: 'ltr',
    categories: ['business', 'productivity', 'shopping'],
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
