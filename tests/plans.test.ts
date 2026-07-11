import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PLANS,
  planById,
  planOffers,
  priceLabel,
  priceUnit,
  searchesLabel,
  type Plan,
} from '../app/lib/plans';

// The prices Polar actually charges. If a tier is repriced, this table and the
// Polar product must move together — that is the point of the assertion.
const CHARGED: Record<string, number | null> = {
  starter: 39,
  pro: 99,
  enterprise: 249,
  contact: null,
};

test('listed prices match what the checkout charges', () => {
  for (const plan of PLANS) {
    assert.equal(plan.priceUsd, CHARGED[plan.id], `${plan.id} price drifted from the checkout`);
  }
});

test('planById resolves every tier and rejects unknown ids', () => {
  assert.equal(planById('enterprise').name, 'Business');
  assert.equal(planById('starter').priceUsd, 39);
  // @ts-expect-error — guarding the runtime path a bad id would take.
  assert.throws(() => planById('agency'), /Unknown plan id/);
});

test('a quoted-on-request tier shows no price and no unit', () => {
  const contact = planById('contact');
  assert.equal(priceLabel(contact), 'Custom');
  assert.equal(priceUnit(contact), '');
  assert.equal(searchesLabel(contact), 'Unlimited volume');
});

test('priced tiers render their price, unit and quota', () => {
  const pro = planById('pro');
  assert.equal(priceLabel(pro), '$99');
  assert.equal(priceUnit(pro), '/mo');
  assert.equal(searchesLabel(pro), '100 searches / month');
});

test('structured-data offers quote the live prices, never the retired $19/$49', () => {
  const offers = planOffers();
  const prices = offers.map(o => o.price);

  assert.deepEqual(prices, ['39', '99', '249']);
  assert.ok(!prices.includes('19'), 'retired Starter price resurfaced in JSON-LD');
  assert.ok(!prices.includes('49'), 'retired Pro price resurfaced in JSON-LD');

  for (const offer of offers) {
    assert.equal(offer['@type'], 'Offer');
    assert.equal(offer.priceCurrency, 'USD');
    assert.match(String(offer.description), /searches \/ month/);
  }
});

test('offers omit tiers with no listed price', () => {
  const names = planOffers().map(o => o.name);
  assert.deepEqual(names, ['Starter', 'Pro', 'Business']);
  assert.ok(!names.includes('Enterprise'), 'contact tier must not emit a priced Offer');
});

test('offers are derived, so a repriced plan carries into the structured data', () => {
  const repriced: Plan[] = [{ ...planById('starter'), priceUsd: 59 }];
  assert.equal(planOffers(repriced)[0].price, '59');
});
