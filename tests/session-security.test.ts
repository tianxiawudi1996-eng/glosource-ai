import assert from 'node:assert/strict';
import test from 'node:test';
import { isPasswordSessionInvalidated } from '../app/lib/session-security';

test('password changes invalidate only sessions issued before the change', () => {
  const changedAt = new Date('2026-07-17T10:00:00.000Z');
  assert.equal(isPasswordSessionInvalidated(Date.parse('2026-07-17T09:59:59.000Z'), changedAt), true);
  assert.equal(isPasswordSessionInvalidated(Date.parse('2026-07-17T10:00:01.000Z'), changedAt), false);
  assert.equal(isPasswordSessionInvalidated(undefined, changedAt), true);
  assert.equal(isPasswordSessionInvalidated(Date.now(), null), false);
});
