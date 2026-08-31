import { NextResponse } from 'next/server';
import { checkAuthAndQuota } from './authMiddleware';
import { extractTrustedIp, kvRateLimit } from './kv';
import { chatRateLimitKeys } from './chatRateLimit';
import { POST as handleChatPost, maxDuration } from '../api/chat/handler';

export { maxDuration };

export async function POST(request) {
  const auth = await checkAuthAndQuota(request, 'chat', 'en');
  if (!auth.ok) return auth.response;
  const ip = extractTrustedIp(request.headers);
  const perMinute = Math.max(1, Number(process.env.CHAT_RATE_LIMIT_PER_MINUTE ?? 10));
  const perDay = Math.max(perMinute, Number(process.env.CHAT_RATE_LIMIT_PER_DAY ?? 100));
  const [minuteUserKey, minuteIpKey, dailyUserKey, dailyIpKey] = chatRateLimitKeys(auth.userId, ip);
  const limits = await Promise.all([
    kvRateLimit(minuteUserKey, perMinute, 60),
    kvRateLimit(minuteIpKey, perMinute, 60),
    kvRateLimit(dailyUserKey, perDay, 86_400),
    kvRateLimit(dailyIpKey, perDay, 86_400),
  ]);
  if (limits.some(allowed => !allowed)) {
    return NextResponse.json({ error: 'rate_limited', reply: 'Chat usage limit reached. Please try again later.' }, { status: 429 });
  }
  return handleChatPost(request);
}
