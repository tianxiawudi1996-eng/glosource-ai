import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, users, verificationTokens } from '@/app/lib/db';
import { sendVerificationEmail } from '@/app/lib/email';

// Resend the email-verification link for the currently logged-in user.
// NOTE: deliberately NOT under /api/auth/* — Auth.js intercepts POSTs there with CSRF and
// returns 400 before the handler runs. Session-gated (only the logged-in user can trigger it
// for their own email) — no enumeration.
export async function POST() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const [user] = await db
    .select({ name: users.name, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ success: true, alreadyVerified: true });
  }

  // Mirror the register route's verification-token flow.
  const verifyToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const identifier = `email-verify:${email}`;
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
  await db.insert(verificationTokens).values({ identifier, token: verifyToken, expires });

  const base = process.env.AUTH_URL ?? 'https://glosource-ai.vercel.app';
  const verifyLink = `${base}/api/auth/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;
  sendVerificationEmail(email, user.name ?? email.split('@')[0], verifyLink).catch(() => {});

  return NextResponse.json({ success: true });
}
