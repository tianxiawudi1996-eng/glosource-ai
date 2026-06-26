/**
 * JSON-LD structured data for GloSource AI (English landing).
 *
 * Adds Organization + WebSite + SoftwareApplication schemas so Google can
 * render rich snippets (sitelinks search box, knowledge panel, pricing).
 *
 * 5/26 자비스 자율 추가 — brand-consistency report 후속 (SEO 강화).
 * 차장님 LinkedIn 페이지 확정 후 sameAs[]에 추가.
 */

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GloSource AI',
  alternateName: 'GloSource',
  url: 'https://glosource-ai.vercel.app',
  logo: 'https://glosource-ai.vercel.app/images/glosource-logo.png',
  email: 'hello@glosource.ai',
  description:
    'AI-powered Korean supplier research tool that helps international buyers find K-beauty, K-food, K-fashion and other Korean manufacturer candidates from EC21, BuyKorea (KOTRA), and tradeKorea in under 90 seconds.',
  sameAs: [
    'https://twitter.com/glosourceai',
    // TODO: confirm GloSource AI LinkedIn page URL — add when ready
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'hello@glosource.ai',
    availableLanguage: ['English', 'Korean'],
  },
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'GloSource AI',
  url: 'https://glosource-ai.vercel.app/en',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://glosource-ai.vercel.app/en?q={search_term_string}',
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
