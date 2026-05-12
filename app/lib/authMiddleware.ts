import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, usageLogs, PLAN_LIMITS } from '@/app/lib/db';
import { eq, and, gte, sql } from 'drizzle-orm';
import { extractTrustedIp } from './kv';

export type AuthResult =
  | { ok: true; userId: string | null; plan: keyof typeof PLAN_LIMITS }
  | { ok: false; response: NextResponse };

export type ActionType = 'source' | 'factory_direct' | 'wechat' | 'image_analyze';

export async function checkAuthAndQuota(
  request: NextRequest,
  action: ActionType,
): Promise<AuthResult> {
  void action;
  const session = await auth();
  const ip = extractTrustedIp(request.headers);

  // 로그인 유저
  if (session?.user?.id) {
    const userId = session.user.id;
    const plan = (session.user.plan ?? 'free') as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan].monthly;

    // 어드민은 쿼터 제한 없음 (테스트/운영 목적)
    const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? '')
      .split(',').map(e => e.trim()).filter(Boolean);
    if (session.user.email && adminEmails.includes(session.user.email)) {
      return { ok: true, userId, plan };
    }

    if (plan !== 'enterprise') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            gte(usageLogs.createdAt, startOfMonth),
          ),
        );

      if (Number(count) >= limit) {
        return {
          ok: false,
          response: NextResponse.json({
            error: 'quota_exceeded',
            type: 'monthly',
            plan,
            message: `이번 달 소싱 한도(${limit}회)를 모두 사용했습니다. 플랜을 업그레이드하면 더 많은 소싱을 이용할 수 있습니다.`,
          }, { status: 401 }),
        };
      }
    }

    return { ok: true, userId, plan };
  }

  // 비로그인 — IP 기반 무료 크레딧 (Redis)
  const { kvCheckFreeCredit } = await import('./kv');
  const allowed = await kvCheckFreeCredit(ip);
  if (!allowed) {
    return {
      ok: false,
      response: NextResponse.json({
        error: 'quota_exceeded',
        type: 'anonymous',
        message: '무료 체험 2회를 모두 사용했습니다. 회원가입하면 월 10회 무료로 이용할 수 있습니다.',
      }, { status: 401 }),
    };
  }

  return { ok: true, userId: null, plan: 'free' };
}

export async function logUsage(
  userId: string | null,
  ip: string,
  action: ActionType,
  product?: string,
  supplierCount?: number,
  durationMs?: number,
  status = 200,
): Promise<void> {
  try {
    await db.insert(usageLogs).values({
      userId,
      ip,
      action,
      product,
      supplierCount,
      durationMs,
      status,
    });
  } catch (e) {
    console.warn('[usageLog] insert failed:', e);
  }
}
