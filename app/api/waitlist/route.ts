import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { waitlist } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import { extractTrustedIp } from '@/app/lib/kv';

// Locale-aware responses: English for the EN/K-beauty funnel, Korean for the KR landing.
const MSG = {
  en: {
    invalid: 'Please enter a valid email address.',
    duplicate: "You're already on the list.",
    success: 'Request received.',
    error: 'Something went wrong. Please try again.',
  },
  ko: {
    invalid: '올바른 이메일을 입력해주세요.',
    duplicate: '이미 등록된 이메일입니다.',
    success: '베타 신청 완료! 오픈 시 가장 먼저 알려드릴게요.',
    error: '잠시 후 다시 시도해주세요.',
  },
} as const;

const isEnSource = (source: string) => /kbeauty|sample_report|_en|_us|_global|_intl/i.test(source);

export async function POST(request: NextRequest) {
  let source = 'landing';
  try {
    const body = await request.json() as { email: string; source?: string };
    const email = body.email;
    source = body.source ?? 'landing';
    const t = isEnSource(source) ? MSG.en : MSG.ko;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: t.invalid }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const ip = extractTrustedIp(request.headers);

    const existing = await db.select().from(waitlist).where(eq(waitlist.email, normalized)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ success: true, message: t.duplicate });
    }

    await db.insert(waitlist).values({ email: normalized, source, ip: ip ?? null });

    return NextResponse.json({ success: true, message: t.success });
  } catch (error) {
    console.error('[waitlist]', error);
    return NextResponse.json({ error: (isEnSource(source) ? MSG.en : MSG.ko).error }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Admin-only: require ADMIN_PUBLISH_SECRET header
  const secret = request.headers.get('x-admin-secret');
  if (!secret || secret !== process.env.ADMIN_PUBLISH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const list = await db.select({
      email: waitlist.email,
      source: waitlist.source,
      createdAt: waitlist.createdAt,
    }).from(waitlist).orderBy(waitlist.createdAt);
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
