export const ANALYTICS_CONSENT_KEY = 'gs_analytics_consent';
export const ANALYTICS_CONSENT_EVENT = 'gs-consent-changed';

export type AnalyticsConsent = 'granted' | 'denied';

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

export function readAnalyticsConsent(storage: ReadableStorage): AnalyticsConsent | 'unavailable' | null {
  try {
    const value = storage.getItem(ANALYTICS_CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return 'unavailable';
  }
}

export function writeAnalyticsConsent(storage: WritableStorage, value: AnalyticsConsent): boolean {
  try {
    storage.setItem(ANALYTICS_CONSENT_KEY, value);
    return true;
  } catch {
    return false;
  }
}
