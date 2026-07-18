import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ANALYTICS_CONSENT_KEY,
  readAnalyticsConsent,
  writeAnalyticsConsent,
} from '../app/lib/analyticsConsent';
import {
  REFUND_POLICY,
  refundEligibilitySummary,
  refundPolicyPublicUrl,
} from '../app/lib/refundPolicy';

test('refund policy keeps the first-payment window and search threshold together', () => {
  assert.equal(REFUND_POLICY.firstPaymentWindowHours, 48);
  assert.equal(REFUND_POLICY.maxSearchesExclusive, 3);
  assert.match(refundEligibilitySummary(), /within 48 hours/);
  assert.match(refundEligibilitySummary(), /fewer than 3 searches/);
  assert.equal(refundPolicyPublicUrl(), 'https://glosourceai.com/terms#section-3-4');
});

test('analytics consent accepts only explicit stored choices', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };

  assert.equal(readAnalyticsConsent(storage), null);
  assert.equal(writeAnalyticsConsent(storage, 'denied'), true);
  assert.equal(values.get(ANALYTICS_CONSENT_KEY), 'denied');
  assert.equal(readAnalyticsConsent(storage), 'denied');
  values.set(ANALYTICS_CONSENT_KEY, 'unexpected');
  assert.equal(readAnalyticsConsent(storage), null);
});

test('analytics consent fails closed when browser storage is unavailable', () => {
  const blocked = {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
  };

  assert.equal(readAnalyticsConsent(blocked), 'unavailable');
  assert.equal(writeAnalyticsConsent(blocked, 'granted'), false);
});
