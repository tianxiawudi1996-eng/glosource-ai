import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GloSource AI — Find Korean Manufacturers and Exporters',
  description:
    'AI-powered Korean supplier research for international buyers. Discover manufacturers and exporters across industries, review company signals, and draft English RFQs.',
  metadataBase: new URL('https://glosourceai.com'),
  alternates: {
    canonical: '/en',
    languages: {
      'en': '/en',
    },
  },
  openGraph: {
    title: 'GloSource AI — Find Korean Manufacturers and Exporters',
    description:
      'Discover Korean manufacturers and exporters with public-data company signals, source evidence, and English RFQ drafts.',
    url: 'https://glosourceai.com/en',
    siteName: 'GloSource AI',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GloSource AI — Find Korean Manufacturers and Exporters',
    description: 'Research Korean suppliers across industries with public-data company signals and English RFQ drafts.',
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
