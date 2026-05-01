import { NextRequest } from 'next/server';

export type PlanTier = 'starter' | 'pro' | 'team';

function getValidKeys(): string[] {
  const raw = process.env.VALID_LICENSE_KEYS;
  if (!raw) return [];
  return raw.split(',').map((k) => k.trim()).filter(Boolean);
}

export function isValidLicenseKey(key: string | null): boolean {
  if (!key) return false;
  const validKeys = getValidKeys();
  if (validKeys.length === 0) {
    // No env var configured → deny all keyed requests
    console.warn('[licenseAuth] VALID_LICENSE_KEYS is not set. All license keys are invalid.');
    return false;
  }
  return validKeys.includes(key);
}

export function extractLicenseKey(request: NextRequest): string | null {
  return request.headers.get('X-License-Key');
}

export function getPlanTier(key: string): PlanTier {
  const upper = key.toUpperCase();
  if (upper.startsWith('TEAM_')) return 'team';
  if (upper.startsWith('PRO_')) return 'pro';
  return 'starter';
}
