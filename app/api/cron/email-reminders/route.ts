import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gt, lt, isNull } from 'drizzle-orm';
import { db, users } from '@/app/lib/db';
import { sendPolarResetReminderEmail } from '@/app/lib/email';
import { isCronAuthorized } from '@/app/lib/cron-auth';

// 48시간 리마인드 cron — 결제했지만 아직 비밀번호를 설정하지 않은 Polar 가입자에게
// 1회만 리마인드 메일을 보낸다. welcome_reminder_sent_at 으로 멱등 보장.
// vercel.json 의 crons 에 등록되어 매일 실행된다.
export async function GET(request: NextRequest) {
  // CRON_SECRET Bearer 검증 (social-post cron 과 동일 패턴)
  if (!isCronAuthorized(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const base = process.env.AUTH_URL ?? 'https://glosourceai.com';
  const now = Date.now();
  const cutoff48h = new Date(now - 48 * 60 * 60 * 1000);   // 가입 후 48시간 경과
  const cutoffCap = new Date(now - 14 * 24 * 60 * 60 * 1000); // 너무 오래된 계정 제외 (14일)

  try {
    // 대상: Polar 자동 생성 + 비밀번호 미설정 + 리마인드 미발송 + 가입 48h~14d 경과
    const candidates = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(and(
        eq(users.polarProvisioned, true),
        isNull(users.passwordSetAt),
        isNull(users.welcomeReminderSentAt),
        lt(users.createdAt, cutoff48h),
        gt(users.createdAt, cutoffCap),
      ))
      .limit(100);

    let sent = 0;
    let failed = 0;

    for (const user of candidates) {
      try {
        const ok = await sendPolarResetReminderEmail(user.email, user.name ?? user.email.split('@')[0], base);
        if (!ok) { failed++; continue; }
        // 발송 성공 후에만 기록 → 실패 시 다음 실행에서 재시도 (중복 발송 방지)
        await db.update(users)
          .set({ welcomeReminderSentAt: new Date() })
          .where(eq(users.id, user.id));
        sent++;
      } catch (err) {
        console.error('[email-reminders] failed for', user.email, err);
        failed++;
      }
    }

    return NextResponse.json({ success: true, candidates: candidates.length, sent, failed });
  } catch (error) {
    console.error('[email-reminders cron]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
