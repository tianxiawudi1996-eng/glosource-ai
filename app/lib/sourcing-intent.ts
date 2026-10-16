/**
 * Carry product-selection intent through free account creation without
 * starting a supplier search or exposing the search API to guests.
 */
export function buildSourcingReturnUrl(product: string, quantity: string): string {
  const params = new URLSearchParams();
  if (product.trim()) params.set('q', product.trim().slice(0, 160));
  if (quantity.trim()) params.set('qty', quantity.trim().slice(0, 80));
  const query = params.toString();
  return `/en${query ? `?${query}` : ''}#sourcing-tool`;
}

/** Only allow English-site paths, never external or protocol-relative URLs. */
export function safeSourcingContinuation(input: string | null): string {
  if (!input || !/^\/en(?:\/|[?#]|$)/.test(input) || /[\\\u0000-\u001f]/.test(input)) {
    return '/en';
  }
  return input;
}
