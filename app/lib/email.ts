import { Resend } from 'resend';
import { welcomeEmail, receiptEmail, passwordResetEmail, verifyEmailTemplate } from '@/app/emails/templates';

const FROM = process.env.RESEND_EMAIL_FROM ?? 'noreply@glosource.ai';
const IS_PROD = process.env.NODE_ENV === 'production';

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Loud, once-per-process boot signal: a missing key in production must not fail
// silently — overseas signup verification / welcome emails would vanish without trace.
if (IS_PROD && !process.env.RESEND_API_KEY) {
  console.error(
    '[email] RESEND_API_KEY is not set — outbound email is DISABLED. ' +
    'Verification, welcome, password-reset, and receipt emails will NOT be delivered in production.',
  );
}

// In production a missing Resend client is an operational error, not a silent mock.
function emailUnavailable(kind: string, to: string): void {
  if (IS_PROD) {
    console.error(`[email] SKIPPED ${kind} → ${to}: RESEND_API_KEY missing in production. Email NOT delivered.`);
  } else {
    console.log(`[email-mock] ${kind} →`, to);
  }
}

// Send and surface failures. Resend returns errors in an { error } field rather
// than throwing, so the previous code ignored them — now they are logged loudly.
// Network/throw failures propagate to the caller as before.
async function deliver(
  resend: Resend,
  kind: string,
  payload: Parameters<Resend['emails']['send']>[0],
): Promise<void> {
  const { error } = await resend.emails.send(payload);
  if (error) {
    console.error(`[email] send failed (${kind}) → ${payload.to}:`, error);
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    emailUnavailable('welcome', to);
    return;
  }
  await deliver(resend, 'welcome', {
    from: FROM,
    to,
    subject: 'GloSource AI 가입을 환영합니다',
    html: welcomeEmail({ name }),
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    emailUnavailable('password-reset', to);
    return;
  }
  await deliver(resend, 'password-reset', {
    from: FROM,
    to,
    subject: '[GloSource AI] 비밀번호 재설정',
    html: passwordResetEmail({ link: resetLink }),
  });
}

export async function sendVerificationEmail(to: string, name: string, verifyLink: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    emailUnavailable('verify', to);
    return;
  }
  await deliver(resend, 'verify', {
    from: FROM,
    to,
    subject: '[GloSource AI] 이메일 인증',
    html: verifyEmailTemplate({ link: verifyLink, name }),
  });
}

// Polar 웰컴/리마인드 경로 전용 비밀번호 설정 링크 발급.
// 일반(사용자 요청) 리셋의 1시간 정책과 달리, 결제 직후 자동 생성 계정은
// 제때 클릭하지 못해 로그인 불가(DOA)가 되므로 7일 유효 토큰을 발급한다.
// 발급된 토큰은 검증부(/api/auth/reset-password/confirm)가 expires > now 만 보므로 일관 처리된다.
async function createPolarResetLink(baseUrl: string, to: string): Promise<string | null> {
  const { db, users, verificationTokens } = await import('@/app/lib/db');
  const { eq } = await import('drizzle-orm');

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, to)).limit(1);
  if (!user) return null;

  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const identifier = `pw-reset:${to}`;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days (Polar welcome flow)
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
  await db.insert(verificationTokens).values({ identifier, token, expires });

  // 토큰을 실제로 처리하는 영문 확인 페이지로 연결 (기존 /en/reset-password 는 토큰을 무시함)
  return `${baseUrl}/en/reset-password/confirm?token=${token}&email=${encodeURIComponent(to)}`;
}

export async function sendPolarWelcomeEmail(
  to: string,
  name: string,
  planName: string,
  baseUrl: string,
): Promise<void> {
  // Generate a 7-day password-reset token so the new user can set their password
  const resetLink = await createPolarResetLink(baseUrl, to);
  if (!resetLink) return;

  const resend = getResend();
  if (!resend) {
    emailUnavailable('polar-welcome', to);
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

  await deliver(resend, 'polar-welcome', {
    from: FROM,
    to,
    subject: `[GloSource AI] Your ${planName} plan is active — set your password`,
    html,
  });
}

// 48시간 리마인드: 결제 후 아직 비밀번호를 설정하지 않은 Polar 가입자에게 1회 발송.
// 신선한 7일 토큰을 재발급해 항상 동작하는 링크를 보낸다. 발송 성공 여부를 반환한다.
export async function sendPolarResetReminderEmail(
  to: string,
  name: string,
  baseUrl: string,
): Promise<boolean> {
  const resetLink = await createPolarResetLink(baseUrl, to);
  if (!resetLink) return false;

  const resend = getResend();
  if (!resend) {
    emailUnavailable('polar-reminder', to);
    // Dev mock counts as sent; in production a missing key is a real failure, so
    // report not-sent to avoid silently marking the reminder as delivered.
    return !IS_PROD;
  }

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:520px;margin:40px auto;color:#1e293b;padding:0 20px">
  <div style="background:#0D1B2A;border-radius:12px;padding:32px;margin-bottom:24px;text-align:center">
    <span style="background:#EA580C;color:#fff;font-weight:900;font-size:18px;padding:8px 16px;border-radius:8px">GloSource AI</span>
  </div>
  <h1 style="font-size:22px;font-weight:900;margin-bottom:8px">One step left: set your password</h1>
  <p style="color:#475569;margin-bottom:24px">Hi ${name}, your GloSource AI subscription is active, but you haven't set your password yet — so you can't sign in. It only takes a moment:</p>
  <a href="${resetLink}" style="display:inline-block;background:#EA580C;color:#fff;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:15px">Set my password →</a>
  <p style="color:#94a3b8;font-size:12px;margin-top:32px">This link expires in 7 days. If you've already set your password, you can ignore this email. Need help? Email hello@glosource.ai.</p>
</body>
</html>`;

  await deliver(resend, 'polar-reminder', {
    from: FROM,
    to,
    subject: '[GloSource AI] Reminder: set your password to access your subscription',
    html,
  });
  return true;
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
    emailUnavailable('receipt', to);
    return;
  }
  const dateStr = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(date);
  const amountStr = new Intl.NumberFormat('ko-KR').format(amount) + '원';
  await deliver(resend, 'receipt', {
    from: FROM,
    to,
    subject: '[GloSource AI] 결제 영수증',
    html: receiptEmail({ name, plan: planName, amount: amountStr, date: dateStr }),
  });
}
