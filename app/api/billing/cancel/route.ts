import { NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, subscriptions } from '@/app/lib/db';
import { logAbuseSignal } from '@/app/lib/abuse';
import {
  decideTossCancellation,
  scheduleCancelAtPeriodEnd,
} from '@/app/lib/subscriptionLifecycle';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(and(
      eq(subscriptions.userId, session.user.id),
      eq(subscriptions.status, 'active'),
      isNull(subscriptions.polarSubscriptionId),
    ))
    .limit(1);

  const decision = decideTossCancellation(subscription);
  if (decision === 'not_found') {
    return NextResponse.json({ error: '활성 구독이 없습니다.' }, { status: 404 });
  }

  if (decision === 'already_scheduled') {
    return NextResponse.json({ success: true });
  }

  await db
    .update(subscriptions)
    .set(scheduleCancelAtPeriodEnd())
    .where(eq(subscriptions.id, subscription.id));

  logAbuseSignal({
    userId: session.user.id,
    event: 'subscription_canceled',
    severity: 4,
    email: session.user.email,
    metadata: { provider: 'toss', subscriptionId: subscription.id, plan: subscription.plan },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
