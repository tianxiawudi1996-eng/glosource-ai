// GA4 (gtag) helpers. These no-op on the server and when GA is not configured, so
// call sites never need to guard. The measurement ID is read from
// NEXT_PUBLIC_GA_MEASUREMENT_ID at build time — unset means analytics is disabled.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params ?? {});
}

// Conversion funnel — standard GA4 event names so GA's built-in funnel/ecommerce
// reports light up without custom configuration.
export const trackSearch = (params?: EventParams): void => trackEvent('search', params);
export const trackSignup = (method = 'email'): void => trackEvent('sign_up', { method });
export const trackBeginCheckout = (plan: string): void => trackEvent('begin_checkout', { plan });
export const trackPurchase = (plan: string, value?: number, currency = 'USD'): void =>
  trackEvent('purchase', { plan, value, currency });
export const trackShortlistCta = (location: string): void =>
  trackEvent('shortlist_cta_click', { cta_location: location });
export const trackSampleReportRequest = (productCategory: string, source = 'en_landing'): void =>
  trackEvent('sample_report_request', { product_category: productCategory, source });
