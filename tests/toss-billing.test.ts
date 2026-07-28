import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {
  tossPaymentStatus,
  shouldApplyTossPaymentStatus,
  tossPeriodEnd,
  isTossCheckoutConfigured,
  isKoreanCommercializationEnabled,
  tossPlanByAmount,
  tossPlanById,
} from '../app/lib/tossPlans';
import { tossSubscriptionIdForOrder } from '../app/lib/tossIds';
import {
  decideTossCancellation,
  scheduleCancelAtPeriodEnd,
} from '../app/lib/subscriptionLifecycle';

test('Toss plan ids and charged amounts resolve from one source', () => {
  assert.equal(tossPlanById('starter')?.amount, 190_000);
  assert.equal(tossPlanByAmount(490_000)?.id, 'pro');
  assert.equal(tossPlanByAmount(990_000)?.id, 'enterprise');
  assert.equal(tossPlanByAmount(123)?.id, undefined);
});

test('Toss payment statuses preserve cancellations', () => {
  assert.equal(tossPaymentStatus('DONE'), 'done');
  assert.equal(tossPaymentStatus('CANCELED'), 'canceled');
  assert.equal(tossPaymentStatus('ABORTED'), 'failed');
});

test('retained ownerless payment rows record status without granting access', () => {
  const source = fs.readFileSync('app/api/payments/toss/webhook/route.ts', 'utf8');
  const guard = source.indexOf('if (!userId)');
  const retainedStatus = source.indexOf('status: resolvedStatus', guard);
  const retainedReturn = source.indexOf('return NextResponse.json({ received: true })', guard);
  const completion = source.indexOf('({ newlyCompleted } = await completeTossPayment');
  assert.ok(guard >= 0 && retainedStatus > guard && retainedReturn > retainedStatus);
  assert.ok(completion > retainedReturn);
});

test('Toss payment status transitions ignore stale events after terminal states', () => {
  assert.equal(shouldApplyTossPaymentStatus('done', 'pending'), false);
  assert.equal(shouldApplyTossPaymentStatus('done', 'failed'), false);
  assert.equal(shouldApplyTossPaymentStatus('done', 'canceled'), true);
  assert.equal(shouldApplyTossPaymentStatus('canceled', 'done'), false);
  assert.equal(shouldApplyTossPaymentStatus('canceled', 'failed'), false);
  assert.equal(shouldApplyTossPaymentStatus('pending', 'done'), true);
});

test('monthly Toss access clamps end-of-month anniversaries', () => {
  assert.equal(tossPeriodEnd(new Date('2026-01-31T12:00:00.000Z')).toISOString(), '2026-02-28T12:00:00.000Z');
  assert.equal(tossPeriodEnd(new Date('2024-01-31T12:00:00.000Z')).toISOString(), '2024-02-29T12:00:00.000Z');
});

test('scheduling cancellation leaves active status and access dates untouched', () => {
  const now = new Date('2026-07-15T00:00:00.000Z');
  const patch = scheduleCancelAtPeriodEnd(now);

  assert.deepEqual(patch, { cancelAtPeriodEnd: true, updatedAt: now });
  assert.equal('status' in patch, false);
  assert.equal('canceledAt' in patch, false);
  assert.equal('currentPeriodEnd' in patch, false);
});

test('Toss cancellation decisions track missing, Polar, first, and repeat requests', () => {
  assert.equal(decideTossCancellation(undefined), 'not_found');
  assert.equal(decideTossCancellation({
    status: 'active',
    polarSubscriptionId: 'polar-subscription',
    cancelAtPeriodEnd: false,
  }), 'not_found');
  assert.equal(decideTossCancellation({
    status: 'active',
    polarSubscriptionId: null,
    cancelAtPeriodEnd: false,
  }), 'schedule');
  assert.equal(decideTossCancellation({
    status: 'active',
    polarSubscriptionId: null,
    cancelAtPeriodEnd: true,
  }), 'already_scheduled');
});

test('Toss checkout is exposed only when every server and client credential exists', () => {
  assert.equal(isTossCheckoutConfigured({
    NEXT_PUBLIC_TOSS_CLIENT_KEY: 'client',
    TOSS_SECRET_KEY: 'secret',
    TOSS_WEBHOOK_SECRET: 'webhook',
  }), true);
  assert.equal(isTossCheckoutConfigured({ NEXT_PUBLIC_TOSS_CLIENT_KEY: 'client' }), false);
  assert.equal(isTossCheckoutConfigured({
    NEXT_PUBLIC_TOSS_CLIENT_KEY: 'client',
    TOSS_SECRET_KEY: 'secret',
  }), false);
});

test('Korean checkout stays closed until legal launch is explicitly enabled', () => {
  const credentials = {
    NEXT_PUBLIC_TOSS_CLIENT_KEY: 'client',
    TOSS_SECRET_KEY: 'secret',
    TOSS_WEBHOOK_SECRET: 'webhook',
  };

  assert.equal(isKoreanCommercializationEnabled(credentials), false);
  assert.equal(isKoreanCommercializationEnabled({
    ...credentials,
    KR_COMMERCIALIZATION_ENABLED: 'false',
  }), false);
  assert.equal(isKoreanCommercializationEnabled({
    ...credentials,
    KR_COMMERCIALIZATION_ENABLED: 'true',
  }), true);
});

test('the Korean payment API enforces the legal commercialization gate', () => {
  const source = fs.readFileSync('app/api/payments/toss/initiate/route.ts', 'utf8');
  const successPage = fs.readFileSync('app/billing/success/page.tsx', 'utf8');
  const webhook = fs.readFileSync('app/api/payments/toss/webhook/route.ts', 'utf8');

  assert.match(source, /isKoreanCommercializationEnabled/);
  assert.match(source, /국내 유료 서비스는 아직 출시 전입니다/);
  assert.match(successPage, /isKoreanCommercializationEnabled/);
  assert.match(webhook, /isKoreanCommercializationEnabled/);
  assert.match(webhook, /commercialization_disabled/);
});

test('the same Toss order always targets the same internal subscription id', () => {
  const first = tossSubscriptionIdForOrder('ORDER-user-123');
  assert.equal(first, tossSubscriptionIdForOrder('ORDER-user-123'));
  assert.notEqual(first, tossSubscriptionIdForOrder('ORDER-user-456'));
  assert.match(first, /^toss-[a-f0-9]{40}$/);
});
