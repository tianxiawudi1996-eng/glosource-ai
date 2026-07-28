import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, usageLogs, users, type PlanTier } from '@/app/lib/db';
import { eq, and, gte, sql, inArray } from 'drizzle-orm';
import { extractTrustedIp, kvCheckFreeCredit } from './kv';
import { logAbuseSignal } from './abuse';
import { evaluateInternalBypass } from './internal-auth';
import {
  PRODUCT_CONTRACTS,
  monthlySearchQuota,
  type ProductSurface,
} from './product-contracts';

export type AuthResult =
  | { ok: true; userId: string | null; plan: PlanTier; surface: ProductSurface }
  | { ok: false; response: NextResponse };

export type ActionType = 'source' | 'factory_direct' | 'wechat' | 'image_analyze' | 'chat';
// 'chat' is intentionally excluded — it is non-billable and never written to usage_logs.action.
const BILLABLE_ACTIONS: Exclude<ActionType, 'chat'>[] = ['source', 'factory_direct', 'wechat', 'image_analyze'];
const FREE_IP_MONTHLY_LIMIT = Number(process.env.FREE_IP_MONTHLY_LIMIT ?? 0);

export async function checkAuthAndQuota(
  request: NextRequest,
  action: ActionType,
  surface: ProductSurface,
): Promise<AuthResult> {
  const lang = surface;

  // Internal automation is enabled only when both a key and a caller IP allowlist match.
  const internalDecision = evaluateInternalBypass({
    configuredKey: process.env.INTERNAL_API_KEY,
    providedKey: request.headers.get('x-api-key'),
    allowedIps: process.env.INTERNAL_API_ALLOWED_IPS,
    callerIp: extractTrustedIp(request.headers),
  });
  if (internalDecision === 'forbidden') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'forbidden' }, { status: 403 }),
    };
  }
  if (internalDecision === 'authorized') {
    return { ok: true, userId: 'internal', plan: 'enterprise', surface };
  }

  const session = await auth();
  const ip = extractTrustedIp(request.headers);

  // 로그인 유저
  if (session?.user?.id) {
    const userId = session.user.id;
    const plan = (session.user.plans?.[surface] ?? 'free') as PlanTier;
    const limit = monthlySearchQuota(surface, plan);

    // 어드민은 쿼터 제한 없음 (테스트/운영 목적)
    const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? '')
      .split(',').map(e => e.trim()).filter(Boolean);
    if (session.user.email && adminEmails.map(e => e.toLowerCase()).includes(session.user.email.toLowerCase())) {
      return { ok: true, userId, plan, surface };
    }

    if (limit !== null && action !== 'chat' && BILLABLE_ACTIONS.includes(action)) {
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
              eq(usageLogs.surface, surface),
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
            eq(usageLogs.surface, surface),
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

    return { ok: true, userId, plan, surface };
  }

  if (surface === 'kr' && action !== 'chat' && BILLABLE_ACTIONS.includes(action)) {
    const anonymousLimit = PRODUCT_CONTRACTS.kr.free.anonymousSearchesPerDay;
    if (await kvCheckFreeCredit(ip, surface, anonymousLimit)) {
      return { ok: true, userId: null, plan: 'free', surface };
    }

    return {
      ok: false,
      response: NextResponse.json({
        error: 'quota_exceeded',
        type: 'anonymous_daily',
        plan: 'free',
        message: `비로그인 무료 체험 ${anonymousLimit}회를 모두 사용했습니다. 로그인하거나 플랜을 업그레이드해주세요.`,
      }, { status: 429 }),
    };
  }

  const message = lang === 'en'
    ? 'Create a free account or sign in to use GloSource AI.'
    : 'GloSource AI를 사용하려면 무료 회원가입 또는 로그인이 필요합니다.';
  return {
    ok: false,
    response: NextResponse.json({
      error: 'authentication_required',
      type: 'anonymous',
      message,
    }, { status: 401 }),
  };
}

export async function logUsage(
  userId: string | null,
  ip: string,
  surface: ProductSurface,
  action: Exclude<ActionType, 'chat'>,
  product?: string,
  supplierCount?: number,
  durationMs?: number,
  status = 200,
): Promise<void> {
  try {
    await db.insert(usageLogs).values({
      userId,
      ip,
      surface,
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
