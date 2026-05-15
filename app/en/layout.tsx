import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GloSource AI — Source Korean Suppliers with AI',
  description:
    'AI-powered sourcing assistant for international buyers. Find Korean manufacturers for K-beauty, K-food, K-fashion, electronics, and more with supplier risk scores and RFQ drafts.',
  metadataBase: new URL('https://glosource-ai.vercel.app'),
  alternates: {
    canonical: '/en',
    languages: {
      'ko': '/',
      'en': '/en',
    },
  },
  openGraph: {
    title: 'GloSource AI — Source Korean Suppliers with AI',
    description:
      'Find Korean supplier candidates from EC21, BuyKorea, KOTRA, tradeKorea, and direct factory search with AI trust scoring and RFQ drafts.',
    url: 'https://glosource-ai.vercel.app/en',
    siteName: 'GloSource AI',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GloSource AI — Source Korean Suppliers with AI',
    description: 'Source K-beauty, K-food, K-fashion, electronics, and more from Korean suppliers with AI risk scoring and RFQ drafts.',
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.lang='en';document.getElementById('root-json-ld')?.remove();",
        }}
      />
      {children}
    </>
  );
}
