import { and, eq, isNull, ne } from 'drizzle-orm';
import { db, payments, subscriptions } from '@/app/lib/db';
import {
  nextTossPeriodEnd,
  tossPlanByAmount,
} from '@/app/lib/tossPlans';
import { tossSubscriptionIdForOrder } from '@/app/lib/tossIds';

interface ActivateTossSubscriptionInput {
  userId: string;
  orderId: string;
  amount: number;
  approvedAt: Date;
}

export async function activateTossSubscription({
  userId,
  orderId,
  amount,
  approvedAt,
}: ActivateTossSubscriptionInput): Promise<string> {
  const plan = tossPlanByAmount(amount);
  if (!plan) throw new Error(`Unsupported Toss payment amount: ${amount}`);

  const [sameOrder] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.tossOrderId, orderId))
    .limit(1);
  if (sameOrder) return sameOrder.id;

  const values = {
    plan: plan.id,
    status: 'active' as const,
    tossOrderId: orderId,
    currentPeriodStart: approvedAt,
    currentPeriodEnd: nextTossPeriodEnd(approvedAt, null),
    cancelAtPeriodEnd: false,
    canceledAt: null,
    updatedAt: approvedAt,
  };

  const [existingTossSubscription] = await db
    .select({
      id: subscriptions.id,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
    })
    .from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      isNull(subscriptions.polarSubscriptionId),
    ))
    .limit(1);

  if (existingTossSubscription) {
    await db
      .update(subscriptions)
      .set({
        ...values,
        currentPeriodEnd: nextTossPeriodEnd(
          approvedAt,
          existingTossSubscription.currentPeriodEnd,
        ),
      })
      .where(eq(subscriptions.id, existingTossSubscription.id));
    return existingTossSubscription.id;
  }

  const id = tossSubscriptionIdForOrder(orderId);
  await db
    .insert(subscriptions)
    .values({ id, userId, ...values })
    .onConflictDoNothing({ target: subscriptions.id });
  return id;
}

interface CompleteTossPaymentInput extends ActivateTossSubscriptionInput {
  paymentId: string;
  paymentKey: string;
  method?: string | null;
}

export async function completeTossPayment({
  paymentId,
  paymentKey,
  method,
  ...activation
}: CompleteTossPaymentInput): Promise<{ subscriptionId: string; newlyCompleted: boolean }> {
  const subscriptionId = await activateTossSubscription(activation);
  const completedRows = await db
    .update(payments)
    .set({
      status: 'done',
      tossPaymentKey: paymentKey,
      method: method ?? undefined,
      approvedAt: activation.approvedAt,
      subscriptionId,
    })
    .where(and(eq(payments.id, paymentId), ne(payments.status, 'done')))
    .returning({ id: payments.id });

  if (completedRows.length === 0) {
    await db
      .update(payments)
      .set({ subscriptionId })
      .where(and(eq(payments.id, paymentId), isNull(payments.subscriptionId)));
  }

  return { subscriptionId, newlyCompleted: completedRows.length > 0 };
}
