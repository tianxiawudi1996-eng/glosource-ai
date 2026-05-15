'use client';

import { Analytics } from '@vercel/analytics/react';

// Vercel Analytics is cookieless and does not use fingerprinting.
// beforeSend strips query parameters to prevent accidental PII leakage
// (e.g., if a search keyword ever appears in the URL).
export function ConsentAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        try {
          const url = new URL(event.url);
          url.search = '';
          return { ...event, url: url.toString() };
        } catch {
          return event;
        }
      }}
    />
  );
}
