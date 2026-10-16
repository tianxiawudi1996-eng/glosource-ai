import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSourcingReturnUrl, safeSourcingContinuation } from '../app/lib/sourcing-intent';

test('anonymous category selection persists product and quantity through signup', () => {
  const url = buildSourcingReturnUrl('Korean collagen serum OEM', '1,000 units');
  const parsed = new URL(url, 'https://glosourceai.com');
  assert.equal(parsed.pathname, '/en');
  assert.equal(parsed.searchParams.get('q'), 'Korean collagen serum OEM');
  assert.equal(parsed.searchParams.get('qty'), '1,000 units');
  assert.equal(parsed.hash, '#sourcing-tool');
});

test('search-intent URLs do not imply an API request and support an empty selection', () => {
  assert.equal(buildSourcingReturnUrl('', ''), '/en#sourcing-tool');
  assert.equal(buildSourcingReturnUrl('  K-beauty OEM  ', '  500 pcs  '),
    '/en?q=K-beauty+OEM&qty=500+pcs#sourcing-tool');
});

test('search intent length is bounded to avoid excessive registration URLs', () => {
  const url = buildSourcingReturnUrl('a'.repeat(1000), 'b'.repeat(1000));
  const parsed = new URL(url, 'https://glosourceai.com');
  assert.equal(parsed.searchParams.get('q')?.length, 160);
  assert.equal(parsed.searchParams.get('qty')?.length, 80);
});

test('registration only returns to a safe English-site path', () => {
  const selected = buildSourcingReturnUrl('Korean toner', '100');
  assert.equal(safeSourcingContinuation(selected), selected);
  assert.equal(safeSourcingContinuation('/en/blog'), '/en/blog');
  assert.equal(safeSourcingContinuation(null), '/en');
  for (const unsafe of [
    'https://attacker.example/collect',
    '//attacker.example',
    '/\\attacker.example',
    '/en.evil.example',
    '/english',
    '/en\\attacker',
    '/en\nLocation: https://attacker.example',
  ]) {
    assert.equal(safeSourcingContinuation(unsafe), '/en', unsafe);
  }
});
