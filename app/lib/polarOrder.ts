// Pure mapping from a Polar `order.*` webhook payload to a `payments` row.
// Kept dependency-free (no next/db imports) so it is unit-testable in isolation.
//
// Why this exists: Polar sends the real charged amount on `order.*` events
// (order.created / order.paid / order.updated / order.refunded), NOT on
// `subscription.*` events. The webhook previously tried to read amount/invoice
// off subscription events, so genuine payments never reached the payments table
// and /en/billing always showed "No payment history yet."

export type PolarPaymentStatus = 'pending' | 'done' | 'canceled' | 'failed';

export interface PolarOrderData {
  id: string;
  status?: string | null;
  paid?: boolean | null;
  // amount fields vary by Polar API version; total_amount is what the customer pays.
  amount?: number | null;
  total_amount?: number | null;
  currency?: string | null;
  customer_id?: string | null;
  product_id?: string | null;
  subscription_id?: string | null;
  customer?: { id?: string; email?: string; name?: string | null } | null;
}

export interface ResolvedOrderPayment {
  polarPaymentId: string;
  amount: number;
  currency: string;
  status: PolarPaymentStatus;
}

export function orderPaymentStatus(data: Pick<PolarOrderData, 'status' | 'paid'>): PolarPaymentStatus {
  const s = (data.status ?? '').toLowerCase();
  if (s === 'refunded' || s === 'partially_refunded') return 'canceled';
  if (data.paid === true || s === 'paid' || s === 'succeeded') return 'done';
  if (s === 'pending' || s === '') return 'pending';
  return 'failed';
}

// The charged total in minor units (cents), or null when the order carries no
// usable positive amount (e.g. a $0 trial line) — the caller then skips it.
export function orderPaymentAmount(data: Pick<PolarOrderData, 'amount' | 'total_amount'>): number | null {
  const raw = data.total_amount ?? data.amount;
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) return null;
  return Math.round(raw);
}

// Returns the payment-row fields for a Polar order event, or null when the
// order should not be recorded (no id, or no positive amount).
export function resolveOrderPayment(data: PolarOrderData): ResolvedOrderPayment | null {
  if (!data.id) return null;
  const amount = orderPaymentAmount(data);
  if (amount == null) return null;
  return {
    polarPaymentId: data.id,
    amount,
    currency: (data.currency ?? 'usd').toUpperCase(),
    status: orderPaymentStatus(data),
  };
}
