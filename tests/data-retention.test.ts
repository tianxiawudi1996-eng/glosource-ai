import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {
  retentionCutoffs,
} from '../app/lib/data-retention';
import { isCronAuthorized } from '../app/lib/cron-auth';

test('retention cutoffs use the policy calendar periods', () => {
  const now = new Date('2026-07-17T12:00:00.000Z');

  assert.deepEqual(retentionCutoffs(now), {
    ip: new Date('2026-04-18T12:00:00.000Z'),
    usage: new Date('2026-01-17T12:00:00.000Z'),
    search: new Date('2025-07-17T12:00:00.000Z'),
    payment: new Date('2021-07-17T12:00:00.000Z'),
  });
});

test('cron authorization fails closed when the secret is absent or mismatched', () => {
  assert.equal(isCronAuthorized('Bearer secret', undefined), false);
  assert.equal(isCronAuthorized(null, 'secret'), false);
  assert.equal(isCronAuthorized('Bearer wrong', 'secret'), false);
  assert.equal(isCronAuthorized('Bearer secret', 'secret'), true);
});

test('abuse identities expire on the IP and general-usage policy cutoffs', () => {
  const source = fs.readFileSync('app/api/cron/privacy-retention/route.ts', 'utf8');

  assert.match(
    source,
    /eq\(abuseIdentities\.identityType, 'ip'\),\s*lt\(abuseIdentities\.lastSeenAt, cutoffs\.ip\)/,
  );
  assert.match(
    source,
    /ne\(abuseIdentities\.identityType, 'ip'\),\s*lt\(abuseIdentities\.lastSeenAt, cutoffs\.usage\)/,
  );
});
