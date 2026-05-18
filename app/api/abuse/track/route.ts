import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { logAbuseSignal } from '@/app/lib/abuse';
import { extractTrustedIp } from '@/app/lib/kv';

const ALLOWED_EVENTS = new Set([
  'supplier_revealed',
  'supplier_url_clicked',
  'rfq_copied',
  'export_clicked',
]);

export async function POST(request: NextRequest) {
  let body: { event?: string; metadata?: Record<string, unknown> };
  try {
    body = await request.json() as { event?: string; metadata?: Record<string, unknown> };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.event || !ALLOWED_EVENTS.has(body.event)) {
    return NextResponse.json({ error: 'invalid_event' }, { status: 400 });
  }

  const session = await auth();
  const ip = extractTrustedIp(request.headers);

  await logAbuseSignal({
    userId: session?.user?.id,
    email: session?.user?.email,
    ip,
    event: body.event as 'supplier_revealed' | 'supplier_url_clicked' | 'rfq_copied' | 'export_clicked',
    severity: body.event === 'supplier_url_clicked' || body.event === 'export_clicked' ? 2 : 1,
    metadata: body.metadata,
  });

  return NextResponse.json({ success: true });
}
