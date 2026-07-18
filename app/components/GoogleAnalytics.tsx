'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trackEvent } from '@/app/lib/analytics';
import {
  ANALYTICS_CONSENT_EVENT,
  readAnalyticsConsent,
} from '@/app/lib/analyticsConsent';

// NEXT_PUBLIC_* is inlined at BUILD time. Changing the value in Vercel only takes
// effect on a fresh build — a redeploy that reuses the build cache keeps the old
// (often empty) value, so disable build cache when updating this.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// The App Router does not fire page_view on client-side navigation, so track it
// manually on every path change. Query-only changes are deliberately ignored so
// they cannot emit duplicate page views or expose search terms to GA.
function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_ID) return;
    trackEvent('page_view', {
      page_path: pathname,
      page_location: `${window.location.origin}${pathname}`,
    });
  }, [pathname]);

  return null;
}

// GA4 loader. Renders nothing when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset, or until
// the visitor accepts analytics cookies via CookieConsentBanner.
export function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      const granted = readAnalyticsConsent(window.localStorage) === 'granted';
      setConsented(granted);
      if (!granted) setReady(false);
    };
    syncConsent();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, syncConsent);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, syncConsent);
  }, []);

  if (!GA_ID || !consented) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive" onReady={() => setReady(true)}>
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true, send_page_view: false });`}
      </Script>
      {ready && <PageviewTracker />}
    </>
  );
}
