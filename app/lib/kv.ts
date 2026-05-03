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
const FREE_DAILY_LIMIT = 5;

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

// Returns true if the IP is allowed (under free limit), false if blocked.
// Development can run without Upstash; production must fail closed so the paywall
// cannot be bypassed when Redis is missing or temporarily unavailable.
export async function kvCheckFreeCredit(ip: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    const allowLocalFallback = process.env.NODE_ENV !== 'production';
    if (!allowLocalFallback) {
      console.warn('[KV] Redis is not configured; blocking anonymous free credit in production.');
    }
    return allowLocalFallback;
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `glosource:free:${ip}:${today}`;
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 86400); // TTL 24h
    }
    return count <= FREE_DAILY_LIMIT;
  } catch (e) {
    console.warn('[KV] free credit check failed; blocking anonymous request:', e instanceof Error ? e.message : String(e));
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
