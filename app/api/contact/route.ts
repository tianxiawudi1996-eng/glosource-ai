import { NextRequest, NextResponse } from 'next/server';
import { kvSaveLead, extractTrustedIp } from '../../lib/kv';

export const maxDuration = 10;

async function checkContactRateLimit(ip: string): Promise<boolean> {
  try {
    const { Redis } = await import('@upstash/redis');
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return true;
    const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
    const key = `contact:rate:${ip}:${new Date().toISOString().slice(0, 13)}`; // per hour
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 3600);
    return count <= 5;
  } catch {
    return true;
  }
}

interface ContactRequest {
  plan?: string;
  name?: string;
  company?: string;
  contact?: string;
  message?: string;
}

function clean(value: unknown, max = 500): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: NextRequest) {
  const ip = extractTrustedIp(request.headers);

  // Validate body BEFORE consuming rate limit quota (invalid requests must not count)
  let body: ContactRequest;
  try {
    body = await request.json() as ContactRequest;
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }
  const name = clean(body.name, 80);
  const company = clean(body.company, 120);
  const contact = clean(body.contact, 160);
  const message = clean(body.message, 1200);
  const plan = clean(body.plan, 40) || '상담 문의';

  if (!name || !contact) {
    return NextResponse.json({ error: '이름과 연락처를 입력해주세요.' }, { status: 400 });
  }

  const allowed = await checkContactRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: '잠시 후 다시 시도해주세요. (1시간 5회 제한)' }, { status: 429 });
  }

  try {
    const userAgent = request.headers.get('user-agent') ?? '';
    const saved = await kvSaveLead({
      id: `${Date.now()}-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      plan,
      name,
      company,
      contact,
      message,
      ip,
      userAgent,
    });

    if (!saved) {
      return NextResponse.json(
        { error: '문의 저장소가 아직 설정되지 않았습니다. 잠시 후 다시 시도해주세요.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '문의 접수 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
