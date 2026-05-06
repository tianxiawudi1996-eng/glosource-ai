import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, payments } from '@/app/lib/db';

const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  starter:    { amount: 190000, name: 'GloSource Starter' },
  pro:        { amount: 490000, name: 'GloSource Pro' },
  enterprise: { amount: 990000, name: 'GloSource Enterprise' },
};

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const body = await request.json() as { planId?: string };
  const planId = body.planId ?? '';
  const plan = PLAN_PRICES[planId];

  if (!plan) {
    return NextResponse.json({ error: '유효하지 않은 플랜입니다.' }, { status: 400 });
  }

  const userId = session.user.id;
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
    orderName: plan.name,
    customerName: session.user.name ?? '',
    customerEmail: session.user.email ?? '',
    metadata: { userId, planName: plan.name, planId },
  });
}
