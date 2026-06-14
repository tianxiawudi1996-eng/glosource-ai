'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { trackEvent } from '@/app/lib/analytics';

// NEXT_PUBLIC_* is inlined at BUILD time. Changing the value in Vercel only takes
// effect on a fresh build — a redeploy that reuses the build cache keeps the old
// (often empty) value, so disable build cache when updating this.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// The App Router does not fire page_view on client-side navigation, so track it
// manually on every path/query change. GA4 auto-parses utm_* params from the URL,
// which gives per-channel inflow attribution for ad campaigns.
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID) return;
    const query = searchParams.toString();
    trackEvent('page_view', {
      page_path: query ? `${pathname}?${query}` : pathname,
      page_location: window.location.href,
    });
  }, [pathname, searchParams]);

  return null;
}

// GA4 loader. Renders nothing when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset, so the
// app runs analytics-free until the env var is configured (e.g. in Vercel).
export function GoogleAnalytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true, send_page_view: false });`}
      </Script>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
    </>
  );
}
