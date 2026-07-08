import assert from 'node:assert/strict';
import test from 'node:test';
import { orderPaymentAmount, orderPaymentStatus, resolveOrderPayment } from '../app/lib/polarOrder';

test('order status maps paid, refunded, pending and unknown', () => {
  assert.equal(orderPaymentStatus({ status: 'paid' }), 'done');
  assert.equal(orderPaymentStatus({ status: 'succeeded' }), 'done');
  assert.equal(orderPaymentStatus({ paid: true, status: 'pending' }), 'done');
  assert.equal(orderPaymentStatus({ status: 'refunded' }), 'canceled');
  assert.equal(orderPaymentStatus({ status: 'partially_refunded' }), 'canceled');
  assert.equal(orderPaymentStatus({ status: 'pending' }), 'pending');
  assert.equal(orderPaymentStatus({}), 'pending');
  assert.equal(orderPaymentStatus({ status: 'something_else' }), 'failed');
});

test('order amount prefers total_amount and rejects zero/missing', () => {
  assert.equal(orderPaymentAmount({ amount: 1900 }), 1900);
  assert.equal(orderPaymentAmount({ amount: 1900, total_amount: 2090 }), 2090);
  // total_amount is present and takes precedence; an explicit 0 total means nothing was charged.
  assert.equal(orderPaymentAmount({ total_amount: 0, amount: 1900 }), null);
  assert.equal(orderPaymentAmount({}), null);
  assert.equal(orderPaymentAmount({ amount: 0 }), null);
  assert.equal(orderPaymentAmount({ amount: -50 }), null);
});

test('resolveOrderPayment builds a payment row for a paid order', () => {
  assert.deepEqual(
    resolveOrderPayment({ id: 'ord_1', status: 'paid', amount: 1900, currency: 'usd', customer: { email: 'b@example.com' } }),
    { polarPaymentId: 'ord_1', amount: 1900, currency: 'USD', status: 'done' },
  );
});

test('resolveOrderPayment skips orders with no id or no positive amount', () => {
  assert.equal(resolveOrderPayment({ id: '', status: 'paid', amount: 1900 } as never), null);
  assert.equal(resolveOrderPayment({ id: 'ord_2', status: 'paid' }), null);
  assert.equal(resolveOrderPayment({ id: 'ord_3', status: 'paid', amount: 0 }), null);
});
