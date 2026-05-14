import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GloSource AI — Match Chinese Suppliers in 60 Seconds',
  description:
    'AI-powered global sourcing assistant. Compare 1688 · Alibaba · Baidu Aicaigou · WeChat candidates, get supplier risk scores, and auto-generate RFQ emails — in 60 seconds.',
  metadataBase: new URL('https://glosource-ai.vercel.app'),
  alternates: {
    canonical: '/en',
    languages: {
      'ko': '/',
      'en': '/en',
    },
  },
  openGraph: {
    title: 'GloSource AI — Match Chinese Suppliers in 60 Seconds',
    description:
      'AI sourcing assistant for global buyers. Find 3–5 verified supplier candidates from 1688, Alibaba, and WeChat with risk scores and RFQ drafts.',
    url: 'https://glosource-ai.vercel.app/en',
    siteName: 'GloSource AI',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://glosource-ai.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GloSource AI — AI-powered supplier sourcing in 60 seconds',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GloSource AI — Match Chinese Suppliers in 60 Seconds',
    description: 'Compare 1688 · Alibaba · WeChat suppliers with AI risk scoring and auto-generated RFQ emails.',
    images: ['https://glosource-ai.vercel.app/og-image.png'],
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
