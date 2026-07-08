/**
 * JSON-LD structured data for GloSource AI (English landing).
 *
 * Adds Organization + WebSite + SoftwareApplication schemas so Google can
 * render rich snippets (sitelinks search box, knowledge panel, pricing).
 *
 * 5/26 자비스 자율 추가 — brand-consistency report 후속 (SEO 강화).
 * founder/sameAs는 app/lib/founder.ts 단일 소스에서 채운다. LinkedIn URL이
 * 확정되면 그 파일의 FOUNDER.linkedin만 채우면 sameAs와 founder에 함께 반영된다.
 */

import { FOUNDER, founderPersonSchema, founderSameAs } from '@/app/lib/founder';

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GloSource AI',
  alternateName: 'GloSource',
  url: 'https://glosourceai.com',
  logo: 'https://glosourceai.com/images/glosource-logo.png',
  email: 'hello@glosourceai.com',
  description:
    'AI-powered Korean supplier research tool that helps international buyers find K-beauty, K-food, K-fashion and other Korean manufacturer candidates from EC21, BuyKorea (KOTRA), and tradeKorea in under 90 seconds.',
  founder: founderPersonSchema(FOUNDER),
  sameAs: [
    'https://twitter.com/glosourceai',
    ...founderSameAs(FOUNDER),
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'hello@glosourceai.com',
    availableLanguage: ['English', 'Korean'],
  },
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'GloSource AI',
  url: 'https://glosourceai.com/en',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://glosourceai.com/en?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'GloSource AI',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Supplier Sourcing',
  operatingSystem: 'Web',
  description:
    'AI-ranked Korean supplier candidates with trust scores, MOQ/price comparison, certification signals (MFDS/KC/HACCP), and ready-to-send English RFQ.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '19',
      priceCurrency: 'USD',
      description: '30 searches / month · K-beauty · K-food · K-fashion',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '49',
      priceCurrency: 'USD',
      description: '60 searches / month · Korea + China sourcing',
    },
  ],
  aggregateRating: undefined, // TODO: add after 5+ verified user reviews
  publisher: {
    '@type': 'Organization',
    name: 'GloSource AI',
  },
};

export default function JsonLdGloSource() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_SCHEMA) }}
      />
    </>
  );
}
