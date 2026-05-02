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

const HISTORY_KEY = 'glosource:history';
const MAX_ENTRIES = 200;

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
