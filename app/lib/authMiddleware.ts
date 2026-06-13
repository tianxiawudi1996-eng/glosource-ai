import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, usageLogs, PLAN_LIMITS, users } from '@/app/lib/db';
import { eq, and, gte, sql, inArray } from 'drizzle-orm';
import { extractTrustedIp } from './kv';
import { logAbuseSignal } from './abuse';

export type AuthResult =
  | { ok: true; userId: string | null; plan: keyof typeof PLAN_LIMITS }
  | { ok: false; response: NextResponse };

export type ActionType = 'source' | 'factory_direct' | 'wechat' | 'image_analyze';
const BILLABLE_ACTIONS: ActionType[] = ['source', 'factory_direct', 'wechat', 'image_analyze'];
const FREE_IP_MONTHLY_LIMIT = Number(process.env.FREE_IP_MONTHLY_LIMIT ?? 0);

function detectLang(request: NextRequest): 'en' | 'ko' {
  const url = request.nextUrl?.pathname ?? request.url ?? '';
  if (url.startsWith('/en')) return 'en';
  const accept = request.headers.get('accept-language') ?? '';
  return accept.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

export async function checkAuthAndQuota(
  request: NextRequest,
  action: ActionType,
): Promise<AuthResult> {
  const lang = detectLang(request);

  // Internal API key bypass (for admin automation / testing)
  // Restricted to allowlisted IPs when INTERNAL_API_ALLOWED_IPS is set.
  const internalKey = process.env.INTERNAL_API_KEY;
  if (internalKey && request.headers.get('x-api-key') === internalKey) {
    const allowedIps = (process.env.INTERNAL_API_ALLOWED_IPS ?? '')
      .split(',').map(s => s.trim()).filter(Boolean);
    if (allowedIps.length > 0) {
      const callerIp = extractTrustedIp(request.headers);
      if (!allowedIps.includes(callerIp)) {
        return {
          ok: false,
          response: NextResponse.json({ error: 'forbidden' }, { status: 403 }),
        };
      }
    }
    return { ok: true, userId: 'internal', plan: 'enterprise' };
  }

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
    if (session.user.email && adminEmails.map(e => e.toLowerCase()).includes(session.user.email.toLowerCase())) {
      return { ok: true, userId, plan };
    }

    if (plan !== 'enterprise' && BILLABLE_ACTIONS.includes(action)) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      if (plan === 'free') {
        const [user] = await db
          .select({ emailVerified: users.emailVerified })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!user?.emailVerified) {
          const message = lang === 'en'
            ? 'Please verify your email before using free monthly searches.'
            : '무료 월간 소싱을 사용하려면 이메일 인증을 먼저 완료해주세요.';
          return {
            ok: false,
            response: NextResponse.json({
              error: 'email_verification_required',
              message,
            }, { status: 403 }),
          };
        }

        const [{ count: ipFreeCount }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(usageLogs)
          .where(
            and(
              eq(usageLogs.ip, ip),
              gte(usageLogs.createdAt, startOfMonth),
              inArray(usageLogs.action, BILLABLE_ACTIONS),
            ),
          );

        if (FREE_IP_MONTHLY_LIMIT > 0 && Number(ipFreeCount) >= FREE_IP_MONTHLY_LIMIT) {
          const message = lang === 'en'
            ? 'Free search access from this network has reached its monthly limit. Upgrade to continue.'
            : '이 네트워크의 무료 소싱 월간 한도에 도달했습니다. 계속 이용하려면 플랜을 업그레이드해주세요.';
          logAbuseSignal({
            userId,
            event: 'quota_blocked',
            severity: 3,
            ip,
            email: session.user.email,
            metadata: { type: 'monthly_network', limit: FREE_IP_MONTHLY_LIMIT },
          }).catch(() => {});
          return {
            ok: false,
            response: NextResponse.json({
              error: 'network_free_quota_exceeded',
              type: 'monthly_network',
              plan,
              message,
            }, { status: 429 }),
          };
        }
      }

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            gte(usageLogs.createdAt, startOfMonth),
            inArray(usageLogs.action, BILLABLE_ACTIONS),
          ),
        );

      if (Number(count) >= limit) {
        const message = lang === 'en'
          ? `Monthly quota reached (${limit} searches). Upgrade your plan to continue.`
          : `이번 달 소싱 한도(${limit}회)를 모두 사용했습니다. 플랜을 업그레이드하면 더 많은 소싱을 이용할 수 있습니다.`;
        logAbuseSignal({
          userId,
          event: 'quota_blocked',
          severity: 2,
          ip,
          email: session.user.email,
          metadata: { type: 'monthly_user', plan, limit },
        }).catch(() => {});
        return {
          ok: false,
          response: NextResponse.json({
            error: 'quota_exceeded',
            type: 'monthly',
            plan,
            message,
          }, { status: 429 }),
        };
      }
    }

    return { ok: true, userId, plan };
  }

  // 비로그인 — IP 기반 무료 크레딧 (Redis)
  const { kvCheckFreeCredit } = await import('./kv');
  const allowed = await kvCheckFreeCredit(ip);
  if (!allowed) {
    const message = lang === 'en'
      ? 'Free trial limit reached (5 searches). Sign up to get 10 free searches per month.'
      : '무료 체험 5회를 모두 사용했습니다. 회원가입하면 월 10회 무료로 이용할 수 있습니다.';
    logAbuseSignal({
      event: 'quota_blocked',
      severity: 2,
      ip,
      metadata: { type: 'anonymous_daily' },
    }).catch(() => {});
    return {
      ok: false,
      response: NextResponse.json({
        error: 'quota_exceeded',
        type: 'anonymous',
        message,
      }, { status: 429 }),
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
