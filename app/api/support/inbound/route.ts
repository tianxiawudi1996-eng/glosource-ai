import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { processSupportMessage } from '@/app/lib/support/agent';

export const maxDuration = 30;

// Svix / StandardWebhooks signature verification (Resend signs webhooks this way).
function verifySignature(rawBody: string, headers: Headers): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return false; // fail closed until configured
  const id = headers.get('svix-id') ?? headers.get('webhook-id') ?? '';
  const ts = headers.get('svix-timestamp') ?? headers.get('webhook-timestamp') ?? '';
  const sigHeader = headers.get('svix-signature') ?? headers.get('webhook-signature') ?? '';
  if (!id || !ts || !sigHeader) return false;
  try {
    const key = secret.startsWith('whsec_')
      ? Buffer.from(secret.slice(6), 'base64')
      : Buffer.from(secret, 'utf-8');
    const signed = `${id}.${ts}.${rawBody}`;
    const expected = crypto.createHmac('sha256', key).update(signed).digest('base64');
    // header is space-separated "v1,<b64sig>" entries
    return sigHeader.split(' ').some((part) => {
      const sig = part.includes(',') ? part.split(',')[1] : part;
      if (!sig || sig.length !== expected.length) return false;
      try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)); } catch { return false; }
    });
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseFrom(from: any): { email: string; name?: string } {
  if (!from) return { email: '' };
  if (typeof from === 'object') {
    return { email: String(from.email ?? from.address ?? '').trim(), name: from.name ? String(from.name) : undefined };
  }
  const s = String(from);
  const m = s.match(/<([^>]+)>/);
  if (m) return { email: m[1].trim(), name: s.replace(/<[^>]+>/, '').replace(/"/g, '').trim() || undefined };
  return { email: s.trim() };
}

function htmlToText(html: string): string {
  return html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  if (!verifySignature(rawBody, req.headers)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'bad_json' }, { status: 400 }); }

  // Resend inbound payloads wrap the email under `data` (event type e.g. email.received / inbound.*).
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const { email, name } = parseFrom(data.from);
  const subject = String((data.subject as string) ?? '').trim();
  const text = (data.text as string) ?? (data.html ? htmlToText(String(data.html)) : '');
  const message = String(text || '').trim();

  if (!email || !message) {
    // Not an inbound email we can act on (other event type, or empty) — ack so Resend stops retrying.
    return NextResponse.json({ ok: true, skipped: 'no_email_or_body' });
  }

  try {
    const result = await processSupportMessage({ name, email, message, subject, source: 'email' });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error('[support/inbound]', e);
    // Return 200 to avoid infinite Resend retries; the failure is logged.
    return NextResponse.json({ ok: false, error: 'processing_failed' });
  }
}
