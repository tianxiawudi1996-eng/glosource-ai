import { NextRequest, NextResponse } from 'next/server';
import { db, subscriptions, payments, users } from '@/app/lib/db';
import { eq } from 'drizzle-orm';
import { sendReceiptEmail } from '@/app/lib/email';

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

      const userId = (data.metadata as Record<string, string>)?.userId ?? '';
      await db.insert(payments).values({
        tossPaymentKey: paymentKey,
        tossOrderId: orderId,
        amount,
        method,
        status: status === 'DONE' ? 'done' : status === 'CANCELED' ? 'canceled' : 'failed',
        approvedAt: approvedAt ?? undefined,
        userId,
        subscriptionId: (data.metadata as Record<string, string>)?.subscriptionId ?? undefined,
      }).onConflictDoUpdate({
        target: payments.tossPaymentKey,
        set: {
          status: status === 'DONE' ? 'done' : 'failed',
          approvedAt: approvedAt ?? undefined,
        },
      });

      if (status === 'DONE' && userId) {
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user?.email) {
          const planName = (data.metadata as Record<string, string>)?.planName ?? 'Pro';
          sendReceiptEmail(user.email, user.name ?? '', planName, amount, approvedAt ?? new Date()).catch(() => {});
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
