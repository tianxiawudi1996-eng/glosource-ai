import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gte } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, payments } from '@/app/lib/db';
import { isTossCheckoutConfigured, tossPlanById } from '@/app/lib/tossPlans';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  if (!isTossCheckoutConfigured(process.env)) {
    return NextResponse.json({ error: '결제 시스템 준비 중입니다.' }, { status: 503 });
  }

  const body = await request.json() as { planId?: string };
  const planId = body.planId ?? '';
  const plan = tossPlanById(planId);

  if (!plan) {
    return NextResponse.json({ error: '유효하지 않은 플랜입니다.' }, { status: 400 });
  }

  const userId = session.user.id;

  // [H-4] 최근 1분 내 pending 주문 5개 초과 시 차단 (스팸 방지)
  const oneMinuteAgo = new Date(Date.now() - 60_000);
  const [{ count }] = await db
    .select({ count: db.$count(payments) })
    .from(payments)
    .where(and(eq(payments.userId, userId), eq(payments.status, 'pending'), gte(payments.createdAt, oneMinuteAgo)));

  if (Number(count) >= 5) {
    return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 429 });
  }

  const orderId = `ORDER-${userId.slice(0, 8)}-${Date.now()}`;

  await db.insert(payments).values({
    userId,
    tossOrderId: orderId,
    amount: plan.amount,
    currency: 'KRW',
    status: 'pending',
  });

  return NextResponse.json({
    orderId,
    amount: plan.amount,
    orderName: `GloSource ${plan.name}`,
    customerName: session.user.name ?? '',
    customerEmail: session.user.email ?? '',
  });
}
