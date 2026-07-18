import { sha256Hex } from '@/app/lib/hash';

export function tossSubscriptionIdForOrder(orderId: string): string {
  return `toss-${sha256Hex(orderId).slice(0, 40)}`;
}
