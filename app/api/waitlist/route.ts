import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { waitlist } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import { extractTrustedIp } from '@/app/lib/kv';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email: string; source?: string };
    const { email, source = 'landing' } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '올바른 이메일을 입력해주세요.' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const ip = extractTrustedIp(request.headers);

    // 중복 체크
    const existing = await db.select().from(waitlist).where(eq(waitlist.email, normalized)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ success: true, message: '이미 등록된 이메일입니다.' });
    }

    await db.insert(waitlist).values({
      email: normalized,
      source,
      ip: ip ?? null,
    });

    return NextResponse.json({ success: true, message: '베타 신청 완료! 오픈 시 가장 먼저 알려드릴게요.' });
  } catch (error) {
    console.error('[waitlist]', error);
    return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}

export async function GET() {
  // 어드민 전용: 웨이트리스트 목록 (인증은 admin 페이지에서 처리)
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
