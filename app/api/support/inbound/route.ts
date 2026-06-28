import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
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
    const key = secret.startsWith('whsec_') ? Buffer.from(secret.slice(6), 'base64') : Buffer.from(secret, 'utf-8');
    const expected = crypto.createHmac('sha256', key).update(`${id}.${ts}.${rawBody}`).digest('base64');
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

  const type = String(payload.type ?? '');
  if (type && type !== 'email.received') {
    return NextResponse.json({ ok: true, skipped: `ignored_event:${type}` });
  }

  const data = (payload.data ?? {}) as Record<string, unknown>;
  const emailId = String(data.email_id ?? data.id ?? '');
  let from = parseFrom(data.from);
  const subject = String((data.subject as string) ?? '').trim();
  if (!emailId) {
    return NextResponse.json({ ok: true, skipped: 'no_email_id' });
  }

  // Resend inbound webhooks carry metadata only — fetch the body via the Receiving API.
  // Requires a read-capable key (the send-only key cannot read received emails).
  const readKey = process.env.RESEND_FULL_API_KEY ?? process.env.RESEND_API_KEY;
  let message = '';
  try {
    const resend = new Resend(readKey);
    const { data: full, error } = await resend.emails.receiving.get(emailId);
    if (error || !full) {
      console.error('[support/inbound] receiving.get error', error);
      return NextResponse.json({ ok: false, error: 'fetch_failed' });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const f = full as any;
    message = String(f.text ?? (f.html ? htmlToText(String(f.html)) : '') ?? '').trim();
    if (!from.email && f.from) from = parseFrom(f.from);
  } catch (e) {
    console.error('[support/inbound] fetch body failed', e);
    return NextResponse.json({ ok: false, error: 'fetch_exception' });
  }

  if (!from.email || !message) {
    return NextResponse.json({ ok: true, skipped: 'no_email_or_body' });
  }

  try {
    const result = await processSupportMessage({ name: from.name, email: from.email, message, subject, source: 'email' });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error('[support/inbound]', e);
    return NextResponse.json({ ok: false, error: 'processing_failed' });
  }
}
