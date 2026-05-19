import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, users, subscriptions, payments } from '@/app/lib/db';
import { hashPassword } from '@/auth';
import { sendPolarWelcomeEmail } from '@/app/lib/email';
import { logAbuseSignal } from '@/app/lib/abuse';

// Polar plan_id env var → internal plan tier
function resolvePlan(productId: string): 'starter' | 'pro' | 'enterprise' | null {
  if (productId === (process.env.POLAR_STARTER_PRODUCT_ID ?? '')) return 'starter';
  if (productId === (process.env.POLAR_PRO_PRODUCT_ID ?? '')) return 'pro';
  if (productId === (process.env.POLAR_AGENCY_PRODUCT_ID ?? '')) return 'enterprise';
  return null;
}

// Svix-style webhook signature verification used by Polar.sh
async function verifyPolarSignature(request: NextRequest, body: string): Promise<boolean> {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const msgId = request.headers.get('webhook-id') ?? '';
  const msgTimestamp = request.headers.get('webhook-timestamp') ?? '';
  const msgSignature = request.headers.get('webhook-signature') ?? '';

  if (!msgId || !msgTimestamp || !msgSignature) return false;

  // Reject requests older than 5 minutes
  const ts = parseInt(msgTimestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const signedContent = `${msgId}.${msgTimestamp}.${body}`;
  const secretBytes = Buffer.from(secret.startsWith('whsec_') ? secret.slice(6) : secret, 'base64');

  const key = await crypto.subtle.importKey(
    'raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedContent));
  const computed = `v1,${Buffer.from(sig).toString('base64')}`;

  return msgSignature.split(' ').some(s => s === computed);
}

interface PolarCustomer {
  id: string;
  email: string;
  name?: string | null;
}

interface PolarSubscriptionEvent {
  type: string;
  data: {
    id: string;
    status: string;
    customer_id: string;
    product_id: string;
    current_period_start?: string | null;
    current_period_end?: string | null;
    cancel_at_period_end?: boolean;
    canceled_at?: string | null;
    customer: PolarCustomer;
    // amount fields vary by event
    amount?: number | null;
    currency?: string | null;
    invoice?: { id: string } | null;
  };
}

async function findOrCreateUser(
  email: string,
  name: string | null | undefined,
): Promise<{ id: string; isNew: boolean }> {
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return { id: existing.id, isNew: false };

  // New user — create with a random temp password; they'll set it via password-reset link
  const tempPassword = crypto.randomUUID();
  const passwordHash = await hashPassword(tempPassword);
  const displayName = name ?? email.split('@')[0];
  await db.insert(users).values({ email, name: displayName, passwordHash });

  const [created] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  return { id: created.id, isNew: true };
}

async function upsertSubscription(
  userId: string,
  eventData: PolarSubscriptionEvent['data'],
  plan: 'starter' | 'pro' | 'enterprise',
): Promise<string> {
  const status = eventData.status === 'active' ? 'active'
    : eventData.status === 'canceled' ? 'canceled'
    : eventData.status === 'past_due' ? 'past_due'
    : 'trialing';

  const periodStart = eventData.current_period_start ? new Date(eventData.current_period_start) : null;
  const periodEnd = eventData.current_period_end ? new Date(eventData.current_period_end) : null;
  const canceledAt = eventData.canceled_at ? new Date(eventData.canceled_at) : null;

  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.polarSubscriptionId, eventData.id))
    .limit(1);

  if (existing) {
    await db.update(subscriptions).set({
      plan,
      status,
      polarProductId: eventData.product_id,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: eventData.cancel_at_period_end ?? false,
      canceledAt,
      updatedAt: new Date(),
    }).where(eq(subscriptions.id, existing.id));
    return existing.id;
  }

  const newId = crypto.randomUUID();
  await db.insert(subscriptions).values({
    id: newId,
    userId,
    plan,
    status,
    polarSubscriptionId: eventData.id,
    polarCustomerId: eventData.customer_id,
    polarProductId: eventData.product_id,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: eventData.cancel_at_period_end ?? false,
    canceledAt,
  });
  return newId;
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  const verified = await verifyPolarSignature(request, body);
  if (!verified) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  let event: PolarSubscriptionEvent;
  try {
    event = JSON.parse(body) as PolarSubscriptionEvent;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { type, data } = event;

  // Only process subscription lifecycle events
  if (!type.startsWith('subscription.')) {
    return NextResponse.json({ received: true });
  }

  const plan = resolvePlan(data.product_id);
  if (!plan) {
    console.warn('[polar-webhook] unknown product_id:', data.product_id);
    return NextResponse.json({ received: true });
  }

  const { email, name } = data.customer;

  try {
    const { id: userId, isNew } = await findOrCreateUser(email, name);
    const subId = await upsertSubscription(userId, data, plan);

    if (type === 'subscription.created' || type === 'subscription.active') {
      logAbuseSignal({
        userId,
        event: 'subscription_created',
        severity: 1,
        email,
        identityType: 'polar_customer',
        identityValue: data.customer_id,
        metadata: { plan, polarSubscriptionId: data.id, type },
      }).catch(() => {});
    }

    if (type === 'subscription.canceled' || data.status === 'canceled') {
      logAbuseSignal({
        userId,
        event: 'subscription_canceled',
        severity: 4,
        email,
        identityType: 'polar_customer',
        identityValue: data.customer_id,
        metadata: { plan, polarSubscriptionId: data.id, type },
      }).catch(() => {});
    }

    // Record payment for invoice events
    if (type === 'subscription.created' || type === 'subscription.active') {
      if (data.invoice?.id && data.amount != null) {
        const existing = await db
          .select({ id: payments.id })
          .from(payments)
          .where(eq(payments.polarPaymentId, data.invoice.id))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(payments).values({
            userId,
            subscriptionId: subId,
            polarPaymentId: data.invoice.id,
            amount: data.amount,
            currency: (data.currency ?? 'usd').toUpperCase(),
            status: 'done',
            approvedAt: new Date(),
          });
          logAbuseSignal({
            userId,
            event: 'payment_done',
            severity: 1,
            email,
            identityType: 'polar_customer',
            identityValue: data.customer_id,
            metadata: { amount: data.amount, currency: data.currency, invoiceId: data.invoice.id },
          }).catch(() => {});
        }
      }

      // Send welcome + set-password email for brand-new accounts
      if (isNew) {
        const base = process.env.AUTH_URL ?? 'https://glosource-ai.vercel.app';
        const planLabels: Record<string, string> = { starter: 'Starter', pro: 'Pro', enterprise: 'Agency' };
        sendPolarWelcomeEmail(email, name ?? email.split('@')[0], planLabels[plan] ?? plan, base).catch(() => {});
      }
    }

    console.info('[polar-webhook] processed', type, 'for', email, 'plan:', plan);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[polar-webhook] error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
