import { createHash, randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  db,
  quotaReservations,
  usageLogs,
  users,
  type PlanTier,
} from '@/app/lib/db';
import { eq, sql, inArray } from 'drizzle-orm';
import { extractTrustedIp } from './kv';
import { logAbuseSignal } from './abuse';
import { evaluateInternalBypass } from './internal-auth';
import {
  PRODUCT_CONTRACTS,
  monthlySearchQuota,
  type ProductSurface,
} from './product-contracts';

export type AuthResult =
  | {
      ok: true;
      userId: string | null;
      plan: PlanTier;
      surface: ProductSurface;
      quotaReservation: QuotaReservation | null;
    }
  | { ok: false; response: NextResponse };

export type ActionType = 'source' | 'factory_direct' | 'wechat' | 'image_analyze' | 'chat';
// 'chat' is intentionally excluded — it is non-billable and never written to usage_logs.action.
const BILLABLE_ACTIONS: Exclude<ActionType, 'chat'>[] = ['source', 'factory_direct', 'wechat', 'image_analyze'];
const FREE_IP_MONTHLY_LIMIT = Number(process.env.FREE_IP_MONTHLY_LIMIT ?? 0);
// Longer than every billable route's declared maxDuration. A process crash can
// therefore recover after ten minutes without letting a live request lose its slot.
const QUOTA_RESERVATION_LEASE_MS = 10 * 60 * 1000;

type QuotaSubjectType = 'user' | 'free_network' | 'anonymous_ip';
type QuotaPeriodType = 'day' | 'month';

export interface QuotaReservationEntry {
  token: string;
  periodEnd: Date;
}

export interface QuotaReservation {
  entries: QuotaReservationEntry[];
}

interface QuotaUsageInput {
  userId: string | null;
  ip: string;
  surface: ProductSurface;
  action: Exclude<ActionType, 'chat'>;
  product?: string;
  supplierCount?: number;
  durationMs?: number;
  status?: number;
}

export function quotaPeriod(
  periodType: QuotaPeriodType,
  now = new Date(),
): { start: Date; end: Date } {
  if (periodType === 'day') {
    return {
      start: new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
      )),
      end: new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
      )),
    };
  }
  return {
    start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
    end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
  };
}

export async function reserveQuotaSlotWithRetry<T>(
  limit: number,
  attempt: () => Promise<T | null>,
): Promise<T | null> {
  if (!Number.isSafeInteger(limit) || limit <= 0) return null;

  for (let index = 0; index < limit; index += 1) {
    const reserved = await attempt();
    if (reserved !== null) return reserved;
  }
  return null;
}

function quotaSubjectKey(subjectType: QuotaSubjectType, value: string): string {
  return createHash('sha256')
    .update(`${subjectType}:${value}`, 'utf8')
    .digest('hex');
}

async function reserveQuotaBucket(input: {
  subjectType: QuotaSubjectType;
  subjectValue: string;
  usageUserId?: string;
  usageIp?: string;
  surface: ProductSurface;
  periodType: QuotaPeriodType;
  limit: number;
  now?: Date;
}): Promise<QuotaReservationEntry | null> {
  const now = input.now ?? new Date();
  const period = quotaPeriod(input.periodType, now);
  const token = randomUUID();
  const subjectKey = quotaSubjectKey(input.subjectType, input.subjectValue);
  const usageSubject = input.usageUserId
    ? sql`usage.user_id = ${input.usageUserId}`
    : input.subjectType === 'anonymous_ip'
      ? sql`usage.ip = ${input.usageIp ?? 'unknown'} AND usage.user_id IS NULL`
      : sql`usage.ip = ${input.usageIp ?? 'unknown'}`;

  return reserveQuotaSlotWithRetry(
    input.limit,
    async () => {
      const result = await db.execute(sql`
        WITH committed AS (
          SELECT count(*)::integer AS used
          FROM usage_logs AS usage
          WHERE ${usageSubject}
            AND (
              usage.surface = ${input.surface}
              OR (
                ${input.surface} = 'kr'
                AND usage.surface IS NULL
                AND usage.action IN ('factory_direct', 'wechat', 'image_analyze')
              )
            )
            AND usage.created_at >= ${period.start}
            AND usage.created_at < ${period.end}
            AND usage.action IN ('source', 'factory_direct', 'wechat', 'image_analyze')
        ), active AS (
          SELECT count(*)::integer AS reserved
          FROM quota_reservations AS reservation
          WHERE reservation.subject_type = ${input.subjectType}
            AND reservation.subject_key = ${subjectKey}
            AND reservation.surface = ${input.surface}
            AND reservation.period_start = ${period.start}
            AND reservation.expires_at > NOW()
        ), candidate AS (
          SELECT generated.candidate_slot AS slot
          FROM committed
          CROSS JOIN active
          CROSS JOIN LATERAL generate_series(
            1,
            ${input.limit}::integer
          ) AS generated(candidate_slot)
          WHERE committed.used + active.reserved < ${input.limit}::integer
            AND NOT EXISTS (
            SELECT 1
            FROM quota_reservations AS existing
            WHERE existing.subject_type = ${input.subjectType}
              AND existing.subject_key = ${subjectKey}
              AND existing.surface = ${input.surface}
              AND existing.period_start = ${period.start}
              AND existing.slot = generated.candidate_slot
              AND existing.expires_at > NOW()
          )
          ORDER BY generated.candidate_slot
          LIMIT 1
        )
        INSERT INTO quota_reservations (
          token,
          subject_type,
          subject_key,
          surface,
          period_start,
          period_end,
          slot,
          expires_at
        )
        SELECT
          ${token},
          ${input.subjectType},
          ${subjectKey},
          ${input.surface},
          ${period.start},
          ${period.end},
          candidate.slot,
          LEAST(
            NOW() + (${QUOTA_RESERVATION_LEASE_MS}::integer * INTERVAL '1 millisecond'),
            ${period.end}
          )
        FROM candidate
        ON CONFLICT (subject_type, subject_key, surface, period_start, slot)
        DO UPDATE SET
          token = EXCLUDED.token,
          period_end = EXCLUDED.period_end,
          expires_at = EXCLUDED.expires_at,
          created_at = NOW()
        WHERE quota_reservations.expires_at <= NOW()
        RETURNING token
      `);
      const rows = (result as { rows?: Array<{ token?: unknown }> }).rows ?? [];
      return rows.some((row) => row.token === token)
        ? { token, periodEnd: period.end }
        : null;
    },
  );
}

export async function releaseQuotaReservation(
  reservation: QuotaReservation | null,
): Promise<void> {
  if (!reservation || reservation.entries.length === 0) return;
  try {
    await db.delete(quotaReservations).where(inArray(
      quotaReservations.token,
      reservation.entries.map((entry) => entry.token),
    ));
  } catch (error) {
    console.warn(
      '[quota] reservation release failed; lease recovery remains active:',
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function preserveQuotaReservation(
  reservation: QuotaReservation,
): Promise<void> {
  for (const entry of reservation.entries) {
    const preserved = await db.update(quotaReservations)
      .set({ expiresAt: entry.periodEnd })
      .where(eq(quotaReservations.token, entry.token))
      .returning({ token: quotaReservations.token });
    if (!preserved.some((row) => row.token === entry.token)) {
      throw new Error('Quota reservation could not be preserved.');
    }
  }
}

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
    return {
      ok: true,
      userId: 'internal',
      plan: 'enterprise',
      surface,
      quotaReservation: null,
    };
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
      return { ok: true, userId, plan, surface, quotaReservation: null };
    }

    if (limit !== null && action !== 'chat' && BILLABLE_ACTIONS.includes(action)) {
      const reservations: QuotaReservationEntry[] = [];

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

        if (FREE_IP_MONTHLY_LIMIT > 0) {
          try {
            const networkReservation = await reserveQuotaBucket({
              subjectType: 'free_network',
              subjectValue: ip,
              usageIp: ip,
              surface,
              periodType: 'month',
              limit: FREE_IP_MONTHLY_LIMIT,
            });
            if (!networkReservation) {
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
            reservations.push(networkReservation);
          } catch (error) {
            console.warn('[quota] network reservation failed:', error);
            return {
              ok: false,
              response: NextResponse.json({
                error: 'quota_service_unavailable',
                message: lang === 'en'
                  ? 'Search quota could not be verified. Please try again shortly.'
                  : '검색 한도를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
              }, { status: 503 }),
            };
          }
        }
      }

      let userReservation: QuotaReservationEntry | null;
      try {
        userReservation = await reserveQuotaBucket({
          subjectType: 'user',
          subjectValue: userId,
          usageUserId: userId,
          surface,
          periodType: 'month',
          limit,
        });
      } catch (error) {
        await releaseQuotaReservation({ entries: reservations });
        console.warn('[quota] user reservation failed:', error);
        return {
          ok: false,
          response: NextResponse.json({
            error: 'quota_service_unavailable',
            message: lang === 'en'
              ? 'Search quota could not be verified. Please try again shortly.'
              : '검색 한도를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
          }, { status: 503 }),
        };
      }

      if (!userReservation) {
        await releaseQuotaReservation({ entries: reservations });
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
      reservations.push(userReservation);
      return {
        ok: true,
        userId,
        plan,
        surface,
        quotaReservation: { entries: reservations },
      };
    }

    return { ok: true, userId, plan, surface, quotaReservation: null };
  }

  if (surface === 'kr' && action !== 'chat' && BILLABLE_ACTIONS.includes(action)) {
    const anonymousLimit = PRODUCT_CONTRACTS.kr.free.anonymousSearchesPerDay;
    try {
      const reservation = await reserveQuotaBucket({
        subjectType: 'anonymous_ip',
        subjectValue: ip,
        usageIp: ip,
        surface,
        periodType: 'day',
        limit: anonymousLimit,
      });
      if (reservation) {
        return {
          ok: true,
          userId: null,
          plan: 'free',
          surface,
          quotaReservation: { entries: [reservation] },
        };
      }
    } catch (error) {
      console.warn('[quota] anonymous reservation failed:', error);
      return {
        ok: false,
        response: NextResponse.json({
          error: 'quota_service_unavailable',
          message: '무료 검색 한도를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
        }, { status: 503 }),
      };
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
): Promise<boolean> {
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
    return true;
  } catch (e) {
    console.warn('[usageLog] insert failed:', e);
    return false;
  }
}

export async function finalizeQuotaUsage(
  reservation: QuotaReservation | null,
  usage: QuotaUsageInput,
): Promise<void> {
  const logged = await logUsage(
    usage.userId,
    usage.ip,
    usage.surface,
    usage.action,
    usage.product,
    usage.supplierCount,
    usage.durationMs,
    usage.status,
  );

  if (!reservation) return;
  if (logged) {
    // The durable usage row now owns the quota. A failed delete is safe because
    // the short reservation lease expires automatically and only under-allocates.
    await releaseQuotaReservation(reservation);
    return;
  }

  // Preserve the consumed slot until the period boundary if analytics storage
  // failed. If this also fails, the caller must not return a successful result.
  await preserveQuotaReservation(reservation);
}
