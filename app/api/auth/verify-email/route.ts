import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gt } from 'drizzle-orm';
import { db, users, verificationTokens } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email')?.toLowerCase() ?? '';

  if (!token || !email) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=invalid', request.url));
  }

  try {
    const identifier = `email-verify:${email}`;
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
      return NextResponse.redirect(new URL('/auth/verify-email?error=expired', request.url));
    }

    await db.update(users).set({ emailVerified: now }).where(eq(users.email, email));
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));

    return NextResponse.redirect(new URL('/auth/verify-email?success=1', request.url));
  } catch {
    return NextResponse.redirect(new URL('/auth/verify-email?error=server', request.url));
  }
}
