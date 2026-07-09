import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';

// KO homepage ('/') — thin server wrapper so it can declare its own canonical +
// bidirectional hreflang alternates. Title/description/OG are inherited from the
// Korean root-layout metadata; the interactive sourcing tool lives in
// HomePageClient ('use client').
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://glosourceai.com/',
    languages: {
      'ko-KR': 'https://glosourceai.com/',
      'en-US': 'https://glosourceai.com/en',
      'x-default': 'https://glosourceai.com/en',
    },
  },
};

export default function Page() {
  return <HomePageClient />;
}
