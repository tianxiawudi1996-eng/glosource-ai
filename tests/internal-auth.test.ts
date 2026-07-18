import assert from 'node:assert/strict';
import test from 'node:test';
import {
  evaluateInternalBypass,
  safeTokenEqual,
} from '../app/lib/internal-auth';

test('internal bypass requires both an exact key and a non-empty IP allowlist', () => {
  const base = { configuredKey: 'top-secret', callerIp: '203.0.113.10' };
  assert.equal(evaluateInternalBypass({ ...base, providedKey: null, allowedIps: '' }), 'absent');
  assert.equal(evaluateInternalBypass({ ...base, providedKey: 'top-secret', allowedIps: '' }), 'forbidden');
  assert.equal(evaluateInternalBypass({
    ...base,
    providedKey: 'top-secret',
    allowedIps: '203.0.113.10, 198.51.100.20',
  }), 'authorized');
});

test('internal bypass rejects wrong keys and non-allowlisted callers', () => {
  assert.equal(evaluateInternalBypass({
    configuredKey: 'top-secret',
    providedKey: 'wrong',
    allowedIps: '203.0.113.10',
    callerIp: '203.0.113.10',
  }), 'forbidden');
  assert.equal(evaluateInternalBypass({
    configuredKey: 'top-secret',
    providedKey: 'top-secret',
    allowedIps: '203.0.113.10',
    callerIp: '198.51.100.20',
  }), 'forbidden');
});

test('token comparison handles unequal lengths without direct string equality', () => {
  assert.equal(safeTokenEqual('same', 'same'), true);
  assert.equal(safeTokenEqual('short', 'a-much-longer-token'), false);
});
