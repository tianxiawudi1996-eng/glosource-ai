import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, subscriptions } from '@/app/lib/db';
import { logAbuseSignal } from '@/app/lib/abuse';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { subscriptionId?: string };
  try {
    body = await request.json() as { subscriptionId?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { subscriptionId } = body;
  if (!subscriptionId) {
    return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
  }

  // Ownership check — user can only cancel their own subscription
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.userId, session.user.id)))
    .limit(1);

  if (!sub) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  if (!sub.polarSubscriptionId) {
    return NextResponse.json({ error: 'This subscription is not managed by Polar. Please contact support.' }, { status: 400 });
  }

  if (sub.cancelAtPeriodEnd) {
    return NextResponse.json({ error: 'Subscription is already scheduled for cancellation.' }, { status: 400 });
  }

  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('[cancel-polar] POLAR_ACCESS_TOKEN not set');
    return NextResponse.json({
      error: 'Cancellation is temporarily unavailable. Please email hello@glosource.ai for help.',
    }, { status: 503 });
  }

  try {
    const res = await fetch(`https://api.polar.sh/v1/subscriptions/${sub.polarSubscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancel_at_period_end: true }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[cancel-polar] Polar API error:', res.status, err);
      return NextResponse.json({
        error: 'Polar cancellation failed. Please email hello@glosource.ai so we can cancel it manually.',
      }, { status: 502 });
    }
  } catch (e) {
    console.error('[cancel-polar] Polar API call failed:', e);
    return NextResponse.json({
      error: 'Polar cancellation failed. Please email hello@glosource.ai so we can cancel it manually.',
    }, { status: 502 });
  }

  // Only mark locally after Polar accepts the cancellation request.
  await db.update(subscriptions)
    .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
    .where(eq(subscriptions.id, sub.id));

  logAbuseSignal({
    userId: session.user.id,
    event: 'subscription_canceled',
    severity: 3,
    email: session.user.email,
    identityType: 'polar_customer',
    identityValue: sub.polarCustomerId,
    metadata: { provider: 'polar', subscriptionId: sub.id, plan: sub.plan },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
