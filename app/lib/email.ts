import { Resend } from 'resend';
import { welcomeEmail, receiptEmail, passwordResetEmail, verifyEmailTemplate } from '@/app/emails/templates';

const FROM = process.env.RESEND_EMAIL_FROM ?? 'noreply@glosource.ai';

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log('[email-mock] welcome →', to, name);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'GloSource AI 가입을 환영합니다',
    html: welcomeEmail({ name }),
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log('[email-mock] password-reset →', to, resetLink);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to,
    subject: '[GloSource AI] 비밀번호 재설정',
    html: passwordResetEmail({ link: resetLink }),
  });
}

export async function sendVerificationEmail(to: string, name: string, verifyLink: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log('[email-mock] verify →', to, verifyLink);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to,
    subject: '[GloSource AI] 이메일 인증',
    html: verifyEmailTemplate({ link: verifyLink, name }),
  });
}

export async function sendPolarWelcomeEmail(
  to: string,
  name: string,
  planName: string,
  baseUrl: string,
): Promise<void> {
  // Generate a password-reset token so the new user can set their password
  const { db, users, verificationTokens } = await import('@/app/lib/db');
  const { eq } = await import('drizzle-orm');

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, to)).limit(1);
  if (!user) return;

  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const identifier = `password-reset:${to}`;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
  await db.insert(verificationTokens).values({ identifier, token, expires });

  const resetLink = `${baseUrl}/api/auth/password?token=${token}&email=${encodeURIComponent(to)}`;

  const resend = getResend();
  if (!resend) {
    console.log('[email-mock] polar-welcome →', to, planName, resetLink);
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:520px;margin:40px auto;color:#1e293b;padding:0 20px">
  <div style="background:#0D1B2A;border-radius:12px;padding:32px;margin-bottom:24px;text-align:center">
    <span style="background:#EA580C;color:#fff;font-weight:900;font-size:18px;padding:8px 16px;border-radius:8px">GloSource AI</span>
  </div>
  <h1 style="font-size:22px;font-weight:900;margin-bottom:8px">Your ${planName} plan is active!</h1>
  <p style="color:#475569;margin-bottom:24px">Hi ${name}, welcome to GloSource AI. Your account has been created and your <strong>${planName}</strong> subscription is ready.</p>
  <p style="color:#475569;margin-bottom:24px">To start searching, set your password first:</p>
  <a href="${resetLink}" style="display:inline-block;background:#EA580C;color:#fff;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:15px">Set my password →</a>
  <p style="color:#94a3b8;font-size:12px;margin-top:32px">This link expires in 7 days. If you didn't subscribe to GloSource AI, you can safely ignore this email.</p>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `[GloSource AI] Your ${planName} plan is active — set your password`,
    html,
  });
}

export async function sendReceiptEmail(
  to: string,
  name: string,
  planName: string,
  amount: number,
  date: Date,
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log('[email-mock] receipt →', to, planName, amount);
    return;
  }
  const dateStr = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(date);
  const amountStr = new Intl.NumberFormat('ko-KR').format(amount) + '원';
  await resend.emails.send({
    from: FROM,
    to,
    subject: '[GloSource AI] 결제 영수증',
    html: receiptEmail({ name, plan: planName, amount: amountStr, date: dateStr }),
  });
}
