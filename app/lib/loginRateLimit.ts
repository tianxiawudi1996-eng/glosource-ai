import { extractTrustedIp, kvRateLimit } from '@/app/lib/kv';
import { sha256Hex } from '@/app/lib/hash';

export const LOGIN_RATE_LIMIT_ATTEMPTS = 10;
export const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 10 * 60;

type RateLimiter = (key: string, limit: number, windowSeconds: number) => Promise<boolean>;

export function loginRateLimitKeys(email: string, ip: string): readonly [string, string] {
  const normalizedEmail = email.trim().toLowerCase();
  const emailHash = sha256Hex(normalizedEmail);
  return [
    `glosource:rl:login:email:${emailHash}`,
    `glosource:rl:login:ip:${ip}`,
  ];
}

export async function checkLoginRateLimit(
  email: string,
  headers: Headers,
  limiter: RateLimiter = kvRateLimit,
): Promise<boolean> {
  const keys = loginRateLimitKeys(email, extractTrustedIp(headers));
  const results = await Promise.all([
    limiter(keys[0], LOGIN_RATE_LIMIT_ATTEMPTS, LOGIN_RATE_LIMIT_WINDOW_SECONDS),
    limiter(keys[1], LOGIN_RATE_LIMIT_ATTEMPTS, LOGIN_RATE_LIMIT_WINDOW_SECONDS),
  ]);
  return results.every(Boolean);
}
