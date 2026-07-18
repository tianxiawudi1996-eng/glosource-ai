import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { db, payments, subscriptions, users, waitlist } from '@/app/lib/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/auth';

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const body = await request.json() as { name?: string; currentPassword?: string; newPassword?: string };
  const userId = session.user.id;

  if (body.name !== undefined) {
    const name = body.name.trim().slice(0, 80);
    if (!name) return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 });
    await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, userId));
    return NextResponse.json({ success: true, field: 'name' });
  }

  if (body.currentPassword !== undefined && body.newPassword !== undefined) {
    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: '새 비밀번호는 8자 이상이어야 합니다.' }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user?.passwordHash) {
      return NextResponse.json({ error: '비밀번호 변경이 지원되지 않는 계정입니다.' }, { status: 400 });
    }

    // bcrypt.compare 사용 (hashPassword는 새 salt 생성 → 절대 일치 안 함)
    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 });
    }

    const newHash = await hashPassword(body.newPassword);
    const changedAt = new Date();
    await db.update(users).set({
      passwordHash: newHash,
      passwordSetAt: changedAt,
      updatedAt: changedAt,
    }).where(eq(users.id, userId));
    return NextResponse.json({ success: true, field: 'password' });
  }

  return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  void request;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const [account] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!account) {
      return NextResponse.json({ error: '계정을 찾을 수 없습니다.' }, { status: 404 });
    }

    // Scrub billing ownership first. On an unmigrated schema these NULL writes fail,
    // preventing the old CASCADE constraints from deleting statutory payment records.
    await Promise.all([
      db.update(payments)
        .set({ userId: null, subscriptionId: null })
        .where(eq(payments.userId, userId)),
      db.update(subscriptions)
        .set({
          userId: null,
          tossBillingKey: null,
          tossCustomerKey: null,
          tossOrderId: null,
          polarCustomerId: null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId)),
    ]);
    await db.delete(waitlist).where(eq(waitlist.email, account.email));
    // User-owned search, usage, and abuse rows use ON DELETE CASCADE. That closes
    // the race where a concurrent request inserts a final log during deletion.
    await db.delete(users).where(eq(users.id, userId));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '계정 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
