import { Redis } from '@upstash/redis';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  source: 'ai' | '1688' | 'wechat';
  query: Record<string, string>;
  status: number;
  supplierCount: number;
  raw: unknown;
}

export interface ContactLead {
  id: string;
  timestamp: string;
  plan: string;
  name: string;
  company: string;
  contact: string;
  message: string;
  ip: string;
  userAgent: string;
}

const HISTORY_KEY = 'glosource:history';
const LEADS_KEY = 'glosource:leads';
const MAX_ENTRIES = 200;
const MAX_LEADS = 500;
const FREE_DAILY_LIMIT = 5; // Anonymous successful sourcing searches per day. Signup gets monthly quota.

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function kvSaveHistory(entry: HistoryEntry): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.lpush(HISTORY_KEY, entry);
    await redis.ltrim(HISTORY_KEY, 0, MAX_ENTRIES - 1);
  } catch (e) {
    console.warn('[KV] save failed:', e instanceof Error ? e.message : String(e));
  }
}

export async function kvGetHistory(): Promise<HistoryEntry[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const items = await redis.lrange<HistoryEntry>(HISTORY_KEY, 0, MAX_ENTRIES - 1);
    return items;
  } catch {
    return [];
  }
}

export async function kvClearHistory(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(HISTORY_KEY);
  } catch (e) {
    console.warn('[KV] clear failed:', e instanceof Error ? e.message : String(e));
  }
}

export function isKvConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function extractTrustedIp(
  headers: Headers,
  env: Readonly<Record<string, string | undefined>> = process.env,
): string {
  // Vercel injects x-vercel-forwarded-for at the edge, so prefer it over
  // client-controlled forwarding headers.
  if (env.VERCEL === '1') {
    const vercelIp = headers.get('x-vercel-forwarded-for');
    if (vercelIp) return vercelIp.split(',')[0]?.trim() || 'unknown';
  }

  if (env.TRUST_PROXY_HEADERS === 'true') {
    const xff = headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0]?.trim() || 'unknown';

    const realIp = headers.get('x-real-ip');
    if (realIp) return realIp.trim() || 'unknown';
  }

  return 'unknown';
}

function freeCreditKey(ip: string): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `glosource:free:${ip}:${today}`;
}

// Returns true if the IP is still under the anonymous free limit. This does not
// consume credit; failed validation, model timeouts, and parse failures should
// not burn a user's trial search.
export async function kvCheckFreeCredit(ip: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    const allowLocalFallback = process.env.NODE_ENV !== 'production';
    if (!allowLocalFallback) {
      console.warn('[KV] Redis is not configured; blocking anonymous free credit in production.');
    }
    return allowLocalFallback;
  }

  try {
    const count = await redis.get<number>(freeCreditKey(ip));
    return Number(count ?? 0) < FREE_DAILY_LIMIT;
  } catch (e) {
    console.warn('[KV] free credit check failed; blocking anonymous request:', e instanceof Error ? e.message : String(e));
    return false;
  }
}

// Consume credit only after a successful anonymous sourcing result.
export async function kvConsumeFreeCredit(ip: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const key = freeCreditKey(ip);
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 86400); // TTL 24h
    }
  } catch (e) {
    console.warn('[KV] free credit consume failed:', e instanceof Error ? e.message : String(e));
  }
}

// Fixed-window rate limit backed by Redis so the count is shared across all
// serverless instances (an in-memory Map resets on every cold start, making the
// limit nearly useless). Returns true when the request is allowed.
// Unconfigured Redis: allow in dev, block in production. Redis error: block.
export async function kvRateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    return process.env.NODE_ENV !== 'production';
  }
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSec);
    }
    return count <= limit;
  } catch (e) {
    console.warn('[KV] rate limit check failed; blocking request:', e instanceof Error ? e.message : String(e));
    return false;
  }
}

export async function kvSaveLead(entry: ContactLead): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    const allowLocalFallback = process.env.NODE_ENV !== 'production';
    if (!allowLocalFallback) {
      console.warn('[KV] Redis is not configured; contact lead cannot be persisted in production.');
    }
    return allowLocalFallback;
  }
  try {
    await redis.lpush(LEADS_KEY, entry);
    await redis.ltrim(LEADS_KEY, 0, MAX_LEADS - 1);
    return true;
  } catch (e) {
    console.warn('[KV] lead save failed:', e instanceof Error ? e.message : String(e));
    return false;
  }
}
