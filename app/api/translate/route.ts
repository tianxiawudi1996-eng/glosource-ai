import { NextRequest, NextResponse } from 'next/server';
import { extractTrustedIp, kvRateLimit } from '../../lib/kv';

export const maxDuration = 30;

type TargetLang = 'ko' | 'zh' | 'en';

const LANG_LABEL: Record<TargetLang, string> = {
  ko: 'Korean',
  zh: 'Simplified Chinese (Mandarin)',
  en: 'English',
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Translation unavailable' }, { status: 503 });

  const ip = extractTrustedIp(request.headers);
  // Redis-backed limit: 20 translation calls/min per IP. Shared across serverless
  // instances, unlike the previous in-memory Map which reset on every cold start.
  const allowed = await kvRateLimit(`glosource:rl:translate:${ip}`, 20, 60);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  let body: { text?: unknown; targetLang?: unknown };
  try {
    body = await request.json() as { text?: unknown; targetLang?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const targetLang = body.targetLang as TargetLang;

  if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 });
  if (!['ko', 'zh', 'en'].includes(targetLang)) {
    return NextResponse.json({ error: 'targetLang must be ko, zh, or en' }, { status: 400 });
  }
  if (text.length > 8000) {
    return NextResponse.json({ error: 'Text too long (max 8000 chars)' }, { status: 400 });
  }

  const langLabel = LANG_LABEL[targetLang];
  const prompt = `Translate the following business email into ${langLabel}.
This is a B2B sourcing inquiry (RFQ) sent to a supplier.

Rules:
- Preserve all placeholders like [Your Name], [Company], [Product Name], numbers, units, and formatting
- Keep it professional and formal (business tone)
- Do not add explanations — output only the translated text

Email to translate:
${text}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    if (!translated) throw new Error('Empty translation response');
    return NextResponse.json({ translated });
  } catch (err) {
    console.error('[translate]', err);
    return NextResponse.json({ error: 'Translation failed. Please try again.' }, { status: 500 });
  }
}
