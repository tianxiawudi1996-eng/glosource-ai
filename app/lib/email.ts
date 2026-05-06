import { Resend } from 'resend';
import { welcomeEmail, receiptEmail } from '@/app/emails/templates';

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
