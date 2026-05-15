import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, subscriptions } from '@/app/lib/db';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1);

  if (!subscription || subscription.status !== 'active') {
    return NextResponse.json({ error: '활성 구독이 없습니다.' }, { status: 404 });
  }

  await db
    .update(subscriptions)
    .set({
      cancelAtPeriodEnd: true,
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));

  return NextResponse.json({ success: true });
}
