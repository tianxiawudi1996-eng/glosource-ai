// Normalize a Korean company name for registry cross-matching.
// Cross-language (EN<->KO) matching is intentionally out of scope.
export function normFirmName(name: string | null | undefined): string {
  return String(name || '')
    .toLowerCase()
    .replace(/주식회사|㈜|\(주\)|co\.?\s*,?\s*ltd\.?|company\s*limited|limited|inc\.?|corp(oration)?\.?|ltd\.?/g, '')
    .replace(/[\s().,\-_'"·`/]/g, '')
    .trim();
}
