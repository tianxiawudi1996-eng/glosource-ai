'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ANALYTICS_CONSENT_EVENT,
  type AnalyticsConsent,
  readAnalyticsConsent,
  writeAnalyticsConsent,
} from '@/app/lib/analyticsConsent';

const COPY = {
  ko: {
    text: 'GloSource AI는 사이트 이용 현황 분석을 위해 Google Analytics 쿠키를 사용합니다. 광고 쿠키는 사용하지 않습니다.',
    privacy: '개인정보처리방침',
    decline: '거부',
    accept: '동의',
  },
  en: {
    text: 'GloSource AI uses Google Analytics cookies to understand aggregate site usage. No advertising cookies.',
    privacy: 'Privacy Policy',
    decline: 'Decline',
    accept: 'Accept',
  },
};

export function CookieConsentBanner({ lang = 'ko' }: { lang?: 'ko' | 'en' }) {
  const [visible, setVisible] = useState(false);
  const t = COPY[lang];

  useEffect(() => {
    if (readAnalyticsConsent(window.localStorage) === null) setVisible(true);
  }, []);

  function respond(value: AnalyticsConsent) {
    if (writeAnalyticsConsent(window.localStorage, value)) {
      window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/10 bg-[#0D1B2A] px-4 py-4 text-white shadow-2xl sm:px-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs leading-relaxed text-slate-300">
          {t.text}{' '}
          <Link href="/privacy" className="underline hover:text-white">
            {t.privacy}
          </Link>
        </p>
        <div className="flex flex-shrink-0 gap-2">
          <button
            type="button"
            onClick={() => respond('denied')}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
          >
            {t.decline}
          </button>
          <button
            type="button"
            onClick={() => respond('granted')}
            className="rounded-lg bg-[#EA580C] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#DC4C00]"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
