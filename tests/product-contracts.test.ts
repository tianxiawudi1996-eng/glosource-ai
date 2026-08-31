import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PRODUCT_CONTRACTS,
  monthlySearchQuota,
  resolveSurfacePlans,
} from '../app/lib/product-contracts';
import { freeCreditKey } from '../app/lib/kv';

test('the two services keep opposite sourcing directions and separate routes', () => {
  assert.equal(PRODUCT_CONTRACTS.kr.basePath, '/');
  assert.equal(PRODUCT_CONTRACTS.kr.sourcingDirection, 'korea_to_overseas');
  assert.equal(PRODUCT_CONTRACTS.en.basePath, '/en');
  assert.equal(PRODUCT_CONTRACTS.en.sourcingDirection, 'overseas_to_korea');
  assert.equal(PRODUCT_CONTRACTS.kr.commercialStatus, 'beta_waitlist');
  assert.equal(PRODUCT_CONTRACTS.en.commercialStatus, 'live_commercial');
});

test('Korean and global free access are deliberately different', () => {
  assert.equal(PRODUCT_CONTRACTS.kr.free.anonymousSearchesPerDay, 5);
  assert.equal(PRODUCT_CONTRACTS.kr.free.accountSearchesPerMonth, 5);
  assert.equal(PRODUCT_CONTRACTS.kr.free.resultPreviewCount, 1);

  assert.equal(PRODUCT_CONTRACTS.en.free.anonymousSearchesPerDay, 0);
  assert.equal(PRODUCT_CONTRACTS.en.free.accountSearchesPerMonth, 3);
  assert.equal(PRODUCT_CONTRACTS.en.free.resultPreviewCount, 1);
});

test('monthly quotas follow the service checkout catalog', () => {
  assert.equal(monthlySearchQuota('kr', 'free'), 5);
  assert.equal(monthlySearchQuota('kr', 'starter'), 30);
  assert.equal(monthlySearchQuota('kr', 'pro'), 60);
  assert.equal(monthlySearchQuota('kr', 'enterprise'), null);

  assert.equal(monthlySearchQuota('en', 'free'), 3);
  assert.equal(monthlySearchQuota('en', 'starter'), 40);
  assert.equal(monthlySearchQuota('en', 'pro'), 100);
  assert.equal(monthlySearchQuota('en', 'enterprise'), 300);
});

test('anonymous credit buckets cannot leak between the two services', () => {
  assert.notEqual(freeCreditKey('203.0.113.10', 'kr'), freeCreditKey('203.0.113.10', 'en'));
});

test('Toss and Polar subscriptions only unlock their matching service', () => {
  assert.deepEqual(resolveSurfacePlans([
    { plan: 'pro', polarSubscriptionId: null },
  ]), { kr: 'pro', en: 'free' });

  assert.deepEqual(resolveSurfacePlans([
    { plan: 'starter', polarSubscriptionId: 'polar-sub-1' },
  ]), { kr: 'free', en: 'starter' });

  assert.deepEqual(resolveSurfacePlans([
    { plan: 'enterprise', polarSubscriptionId: null },
    { plan: 'pro', polarSubscriptionId: 'polar-sub-2' },
  ]), { kr: 'enterprise', en: 'pro' });
});
