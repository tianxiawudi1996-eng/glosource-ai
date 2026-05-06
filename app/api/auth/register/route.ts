import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/app/lib/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/auth';
import { sendWelcomeEmail } from '@/app/lib/email';

function clean(v: unknown, max = 200): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = clean(body.email, 200).toLowerCase();
    const password = clean(body.password, 200);
    const name = clean(body.name, 80);

    if (!email || !password || !name) {
      return NextResponse.json({ error: '이름, 이메일, 비밀번호를 모두 입력해주세요.' }, { status: 400 });
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
    await db.insert(users).values({
      email,
      name,
      passwordHash,
    });

    sendWelcomeEmail(email, name).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '회원가입 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
