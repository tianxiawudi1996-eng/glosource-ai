import assert from 'node:assert/strict';
import test from 'node:test';
import { chatRateLimitKeys } from '../app/lib/chatRateLimit';

test('chat limits use independent user and IP buckets', () => {
  assert.deepEqual(chatRateLimitKeys('user-1', '203.0.113.8'), [
    'glosource:rl:chat:minute:user:user-1',
    'glosource:rl:chat:minute:ip:203.0.113.8',
    'glosource:rl:chat:day:user:user-1',
    'glosource:rl:chat:day:ip:203.0.113.8',
  ]);
});
