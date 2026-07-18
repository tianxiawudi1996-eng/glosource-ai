import { createHash, timingSafeEqual } from 'node:crypto';

export type InternalBypassDecision = 'absent' | 'authorized' | 'forbidden';

interface InternalBypassInput {
  configuredKey?: string;
  providedKey: string | null;
  allowedIps?: string;
  callerIp: string;
}

export function safeTokenEqual(left: string, right: string): boolean {
  const leftDigest = createHash('sha256').update(left, 'utf8').digest();
  const rightDigest = createHash('sha256').update(right, 'utf8').digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

export function evaluateInternalBypass(input: InternalBypassInput): InternalBypassDecision {
  if (input.providedKey == null) return 'absent';
  if (!input.configuredKey || !safeTokenEqual(input.providedKey, input.configuredKey)) return 'forbidden';

  const allowedIps = (input.allowedIps ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (allowedIps.length === 0 || !allowedIps.includes(input.callerIp)) return 'forbidden';
  return 'authorized';
}
