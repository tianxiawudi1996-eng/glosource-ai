import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gt } from 'drizzle-orm';
import { db, users, verificationTokens } from '@/app/lib/db';
import { hashPassword } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { token?: unknown; email?: unknown; password?: unknown };
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!token || !email || !password) {
      return NextResponse.json({ error: '입력값이 올바르지 않습니다.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 });
    }

    const identifier = `pw-reset:${email}`;
    const now = new Date();

    const [record] = await db
      .select()
      .from(verificationTokens)
      .where(and(
        eq(verificationTokens.identifier, identifier),
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, now),
      ))
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: '링크가 만료되었거나 유효하지 않습니다.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await db.update(users).set({ passwordHash, updatedAt: now }).where(eq(users.email, email));
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}
