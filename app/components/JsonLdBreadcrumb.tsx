/**
 * BreadcrumbList JSON-LD — Google 리치 결과에 breadcrumb 표시.
 *
 * 사용법:
 *   <JsonLdBreadcrumb items={[
 *     { name: 'Home', url: 'https://glosourceai.com/en' },
 *     { name: 'About', url: 'https://glosourceai.com/en/about' },
 *   ]} />
 *
 * 5/27 자비스 자율 /loop iter 8.
 */

type BreadcrumbItem = {
  name: string;
  url: string;
};

export default function JsonLdBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
