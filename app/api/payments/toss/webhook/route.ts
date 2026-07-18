import { NextRequest, NextResponse } from 'next/server';
import { db, subscriptions, payments, users } from '@/app/lib/db';
import { eq } from 'drizzle-orm';
import { sendReceiptEmail } from '@/app/lib/email';
import { completeTossPayment } from '@/app/lib/tossSubscription';
import {
  shouldApplyTossPaymentStatus,
  tossPaymentStatus,
  tossPlanByAmount,
} from '@/app/lib/tossPlans';

export const maxDuration = 10;

// Toss Payments 웹훅 서명 검증
async function verifyTossSignature(body: string, signature: string): Promise<boolean> {
  const secret = process.env.TOSS_WEBHOOK_SECRET;
  if (!secret) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const sig = Buffer.from(signature, 'base64');
  return crypto.subtle.verify('HMAC', key, sig, encoder.encode(body));
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('toss-payments-signature') ?? '';

  if (!await verifyTossSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = event.eventType as string;

  try {
    if (type === 'PAYMENT_STATUS_CHANGED') {
      const data = event.data as Record<string, unknown>;
      const status = data.status as string;
      const paymentKey = data.paymentKey as string;
      const orderId = data.orderId as string;
      const amount = data.totalAmount as number;
      const method = data.method as string;
      const approvedAt = data.approvedAt ? new Date(data.approvedAt as string) : null;

      // The pending order is the server-authoritative owner, amount, and plan.
      // Toss metadata comes from the client checkout request and must not decide
      // which user receives paid access.
      const [pendingPayment] = await db
        .select()
        .from(payments)
        .where(eq(payments.tossOrderId, orderId))
        .limit(1);

      if (!pendingPayment) {
        console.warn('[Toss Webhook] ignoring unknown order:', orderId);
        return NextResponse.json({ received: true });
      }

      // Account-deleted payment rows are retained for statutory records only.
      // A delayed/replayed webhook must never recreate access for an ownerless row.
      if (amount !== pendingPayment.amount) {
        console.error('[Toss Webhook] amount mismatch:', orderId, amount, pendingPayment.amount);
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      const resolvedStatus = tossPaymentStatus(status);
      if (!shouldApplyTossPaymentStatus(pendingPayment.status, resolvedStatus)) {
        return NextResponse.json({ received: true });
      }

      const completed = resolvedStatus === 'done';
      const completionTime = approvedAt ?? pendingPayment.approvedAt ?? new Date();
      let newlyCompleted = false;

      if (completed) {
        const userId = pendingPayment.userId;
        if (!userId) {
          await db
            .update(payments)
            .set({
              tossPaymentKey: paymentKey || undefined,
              method,
              status: resolvedStatus,
              approvedAt: completionTime,
            })
            .where(eq(payments.id, pendingPayment.id));
          console.warn('[Toss Webhook] recorded completion without restoring owner access:', orderId);
          return NextResponse.json({ received: true });
        }
        const resolvedPaymentKey = paymentKey || pendingPayment.tossPaymentKey;
        if (!resolvedPaymentKey) {
          return NextResponse.json({ error: 'Missing payment key' }, { status: 400 });
        }
        ({ newlyCompleted } = await completeTossPayment({
          paymentId: pendingPayment.id,
          paymentKey: resolvedPaymentKey,
          method,
          userId,
          orderId,
          amount: pendingPayment.amount,
          approvedAt: completionTime,
        }));
      } else {
        await db
          .update(payments)
          .set({
            tossPaymentKey: paymentKey || undefined,
            method,
            status: resolvedStatus,
            approvedAt: approvedAt ?? undefined,
          })
          .where(eq(payments.id, pendingPayment.id));
      }

      if (newlyCompleted) {
        const userId = pendingPayment.userId;
        if (!userId) return NextResponse.json({ received: true });
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user?.email) {
          const planName = tossPlanByAmount(pendingPayment.amount)?.name ?? 'Pro';
          sendReceiptEmail(user.email, user.name ?? '', planName, amount, completionTime).catch(() => {});
        }
      }
    }

    if (type === 'BILLING_STATUS_CHANGED') {
      const data = event.data as Record<string, unknown>;
      const billingKey = data.billingKey as string;
      const newStatus = data.status as string;

      const statusMap: Record<string, 'active' | 'canceled' | 'past_due'> = {
        ACTIVE: 'active',
        CANCELED: 'canceled',
        DELINQUENT: 'past_due',
      };

      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.tossBillingKey, billingKey))
        .limit(1);

      if (sub) {
        await db
          .update(subscriptions)
          .set({
            status: statusMap[newStatus] ?? 'past_due',
            updatedAt: new Date(),
            ...(newStatus === 'CANCELED' ? { canceledAt: new Date() } : {}),
          })
          .where(eq(subscriptions.id, sub.id));
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('[Toss Webhook]', e);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
