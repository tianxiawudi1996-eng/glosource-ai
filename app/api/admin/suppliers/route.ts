import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db, verifiedSuppliers } from '@/app/lib/db';

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

// GET — 전체 목록
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const rows = await db.select().from(verifiedSuppliers).orderBy(verifiedSuppliers.createdAt);
  return NextResponse.json({ suppliers: rows });
}

// POST — 새 공급자 등록
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json() as {
    name: string;
    nameEn?: string;
    platform: string;
    url?: string;
    category: string;
    moqMin?: number;
    leadTimeDays?: number;
    certifications?: string;
    trustScore?: number;
    notes?: string;
  };

  if (!body.name || !body.platform || !body.category) {
    return NextResponse.json({ error: 'name, platform, category are required' }, { status: 400 });
  }

  const [created] = await db.insert(verifiedSuppliers).values({
    name: body.name.trim(),
    nameEn: body.nameEn?.trim() ?? null,
    platform: body.platform,
    url: body.url?.trim() ?? null,
    category: body.category,
    moqMin: body.moqMin ?? null,
    leadTimeDays: body.leadTimeDays ?? null,
    certifications: body.certifications?.trim() ?? null,
    trustScore: body.trustScore ?? null,
    notes: body.notes?.trim() ?? null,
    addedBy: session?.user?.email ?? null,
  }).returning();

  return NextResponse.json({ supplier: created }, { status: 201 });
}

// DELETE — 공급자 삭제 (soft: active=false)
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await db.update(verifiedSuppliers).set({ active: false, updatedAt: new Date() }).where(eq(verifiedSuppliers.id, id));
  return NextResponse.json({ success: true });
}
