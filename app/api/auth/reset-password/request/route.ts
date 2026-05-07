import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, users, verificationTokens } from '@/app/lib/db';
import { sendPasswordResetEmail } from '@/app/lib/email';
import { extractTrustedIp } from '@/app/lib/kv';

async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const { Redis } = await import('@upstash/redis');
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return true;
    const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
    const key = `pw-reset:rate:${ip}:${new Date().toISOString().slice(0, 13)}`; // per hour
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 3600);
    return count <= 3;
  } catch {
    return true;
  }
}

export async function POST(request: NextRequest) {
  const ip = extractTrustedIp(request.headers);
  if (!await checkRateLimit(ip)) {
    return NextResponse.json({ error: '잠시 후 다시 시도해주세요. (1시간 3회 제한)' }, { status: 429 });
  }

  try {
    const body = await request.json() as { email?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '유효한 이메일을 입력해주세요.' }, { status: 400 });
    }

    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

    if (user) {
      const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
      const identifier = `pw-reset:${email}`;
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

      await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
      await db.insert(verificationTokens).values({ identifier, token, expires });

      const base = process.env.AUTH_URL ?? 'https://glosource-ai.vercel.app';
      const link = `${base}/auth/reset-password/confirm?token=${token}&email=${encodeURIComponent(email)}`;
      sendPasswordResetEmail(email, link).catch(() => {});
    }

    // 항상 성공 응답 (이메일 존재 여부 노출 방지)
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}
