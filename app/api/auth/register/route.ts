import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, users, verificationTokens } from '@/app/lib/db';
import { hashPassword } from '@/auth';
import { sendWelcomeEmail, sendVerificationEmail } from '@/app/lib/email';
import { extractTrustedIp } from '@/app/lib/kv';
import { logAbuseSignal } from '@/app/lib/abuse';

function clean(v: unknown, max = 200): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

// [H-2] IP당 5회/분 레이트 리밋
async function checkRegisterRateLimit(ip: string): Promise<boolean> {
  try {
    const { Redis } = await import('@upstash/redis');
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return true;
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    const key = `register:rate:${ip}:${new Date().toISOString().slice(0, 16)}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60);
    return count <= 5;
  } catch {
    return true;
  }
}

export async function POST(request: NextRequest) {
  const ip = extractTrustedIp(request.headers);
  const allowed = await checkRegisterRateLimit(ip);
  if (!allowed) {
    logAbuseSignal({
      event: 'signup_rate_limited',
      severity: 5,
      ip,
      metadata: { route: '/api/auth/register' },
    }).catch(() => {});
    return NextResponse.json({ error: '잠시 후 다시 시도해주세요. (1분 5회 제한)' }, { status: 429 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const email = clean(body.email, 200).toLowerCase();
    const password = clean(body.password, 200);
    const name = clean(body.name, 80);
    const tosConsent = body.tosConsent === true;
    const dataConsent = body.dataConsent === true;
    const gdprConsent = body.gdprConsent === true;
    const ageConsent = body.ageConsent === true;
    const marketingConsent = body.marketingConsent === true;

    if (!email || !password || !name) {
      return NextResponse.json({ error: '이름, 이메일, 비밀번호를 모두 입력해주세요.' }, { status: 400 });
    }
    if (!tosConsent || !dataConsent || !gdprConsent || !ageConsent) {
      return NextResponse.json({ error: '필수 약관 및 개인정보 수집·이용 동의가 필요합니다.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '유효한 이메일 주소를 입력해주세요.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date();
    const [createdUser] = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
        tosConsentAt: now,
        dataConsentAt: now,
        gdprConsentAt: now,
        ageConfirmedAt: now,
        ...(marketingConsent ? { marketingConsentAt: now } : {}),
      })
      .returning({ id: users.id });

    logAbuseSignal({
      userId: createdUser?.id,
      event: 'signup_created',
      severity: 1,
      ip,
      email,
      metadata: { source: 'credentials' },
    }).catch(() => {});

    sendWelcomeEmail(email, name).catch(() => {});

    // 이메일 인증 토큰 생성 및 발송
    const verifyToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const verifyIdentifier = `email-verify:${email}`;
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, verifyIdentifier));
    await db.insert(verificationTokens).values({ identifier: verifyIdentifier, token: verifyToken, expires: verifyExpires });
    const base = process.env.AUTH_URL ?? 'https://glosourceai.com';
    const verifyLink = `${base}/api/auth/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;
    sendVerificationEmail(email, name, verifyLink).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '회원가입 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
