import { sql } from 'drizzle-orm';
import { abuseEvents, abuseIdentities, db } from '@/app/lib/db';
import { sha256Hex } from '@/app/lib/hash';

type AbuseEvent =
  | 'signup_created'
  | 'signup_rate_limited'
  | 'email_verified'
  | 'free_search_used'
  | 'quota_blocked'
  | 'duplicate_query_cluster'
  | 'market_risk_flagged'
  | 'supplier_revealed'
  | 'supplier_url_clicked'
  | 'rfq_copied'
  | 'export_clicked'
  | 'subscription_created'
  | 'subscription_canceled'
  | 'payment_done';

type IdentityType = 'ip' | 'email_domain' | 'email_local' | 'polar_customer' | 'toss_customer';

interface AbuseSignalInput {
  userId?: string | null;
  event: AbuseEvent;
  severity?: number;
  ip?: string | null;
  email?: string | null;
  identityType?: IdentityType;
  identityValue?: string | null;
  metadata?: Record<string, unknown>;
}

function normalizeEmail(email?: string | null): { domain: string | null; local: string | null } {
  if (!email) return { domain: null, local: null };
  const [local, domain] = email.trim().toLowerCase().split('@');
  return { local: local || null, domain: domain || null };
}

function resolveIdentity(input: AbuseSignalInput): { type: IdentityType; value: string } | null {
  if (input.identityType && input.identityValue) {
    return { type: input.identityType, value: input.identityValue.trim().toLowerCase() };
  }
  if (input.ip) return { type: 'ip', value: input.ip.trim() };

  const email = normalizeEmail(input.email);
  if (email.domain) return { type: 'email_domain', value: email.domain };

  return null;
}

export async function logAbuseSignal(input: AbuseSignalInput): Promise<void> {
  try {
    const identity = resolveIdentity(input);
    const email = normalizeEmail(input.email);
    let identityId: string | null = null;

    if (identity) {
      const identityHash = sha256Hex(`${identity.type}:${identity.value}`);
      identityId = `${identity.type}:${identityHash}`;
      const now = new Date();
      const severity = input.severity ?? 1;

      await db.insert(abuseIdentities).values({
        id: identityId,
        identityType: identity.type,
        identityHash,
        riskScore: severity,
        eventCount: 1,
        userCount: input.userId ? 1 : 0,
        firstSeenAt: now,
        lastSeenAt: now,
      }).onConflictDoUpdate({
        target: abuseIdentities.id,
        set: {
          riskScore: sql`${abuseIdentities.riskScore} + ${severity}`,
          eventCount: sql`${abuseIdentities.eventCount} + 1`,
          userCount: input.userId
            ? sql`${abuseIdentities.userCount} + 1`
            : sql`${abuseIdentities.userCount}`,
          lastSeenAt: now,
        },
      });
    }

    await db.insert(abuseEvents).values({
      userId: input.userId ?? null,
      identityId,
      event: input.event,
      severity: input.severity ?? 1,
      emailDomain: email.domain,
      ip: input.ip ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata).slice(0, 4000) : null,
    });
  } catch (error) {
    console.warn('[abuse] signal log failed:', error instanceof Error ? error.message : String(error));
  }
}
