import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, usageLogs } from '@/app/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const rows = await db
    .select({
      product: usageLogs.product,
      action: usageLogs.action,
      supplierCount: usageLogs.supplierCount,
      createdAt: usageLogs.createdAt,
    })
    .from(usageLogs)
    .where(eq(usageLogs.userId, session.user.id))
    .orderBy(desc(usageLogs.createdAt))
    .limit(50);

  return NextResponse.json({ success: true, data: rows });
}
