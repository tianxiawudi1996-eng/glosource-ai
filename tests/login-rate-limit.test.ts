import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LOGIN_RATE_LIMIT_ATTEMPTS,
  LOGIN_RATE_LIMIT_WINDOW_SECONDS,
  checkLoginRateLimit,
  loginRateLimitKeys,
} from '../app/lib/loginRateLimit';

test('login rate-limit keys normalize and hash email while retaining the IP bucket', () => {
  const lower = loginRateLimitKeys(' buyer@example.com ', '203.0.113.10');
  const upper = loginRateLimitKeys('BUYER@EXAMPLE.COM', '203.0.113.10');

  assert.deepEqual(lower, upper);
  assert.equal(lower.length, 2);
  assert.match(lower[0], /^glosource:rl:login:email:[a-f0-9]{64}$/);
  assert.equal(lower[1], 'glosource:rl:login:ip:203.0.113.10');
  assert.equal(lower.join(' ').includes('buyer@example.com'), false);
});

test('login attempts must pass both email and IP buckets', async () => {
  const calls: Array<[string, number, number]> = [];
  const limiter = async (key: string, limit: number, windowSeconds: number) => {
    calls.push([key, limit, windowSeconds]);
    return !key.includes(':ip:');
  };

  const allowed = await checkLoginRateLimit(
    'buyer@example.com',
    new Headers({ 'x-vercel-forwarded-for': '203.0.113.10' }),
    limiter,
  );

  assert.equal(allowed, false);
  assert.equal(calls.length, 2);
  assert.ok(calls.every(([, limit]) => limit === LOGIN_RATE_LIMIT_ATTEMPTS));
  assert.ok(calls.every(([, , windowSeconds]) => windowSeconds === LOGIN_RATE_LIMIT_WINDOW_SECONDS));
});
