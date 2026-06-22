'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/app/lib/analytics';

export default function PricingViewTracker() {
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        trackEvent('pricing_view', { source: 'en_kbeauty_landing' });
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, []);

  return <div ref={markerRef} aria-hidden="true" className="h-px w-full" />;
}
