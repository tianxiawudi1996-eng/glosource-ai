export function scheduleCancelAtPeriodEnd(now = new Date()) {
  return {
    cancelAtPeriodEnd: true as const,
    updatedAt: now,
  };
}

interface CancellableSubscription {
  status: string;
  polarSubscriptionId: string | null;
  cancelAtPeriodEnd: boolean;
}

export function decideTossCancellation(
  subscription: CancellableSubscription | undefined,
): 'not_found' | 'schedule' | 'already_scheduled' {
  if (!subscription || subscription.status !== 'active' || subscription.polarSubscriptionId) {
    return 'not_found';
  }
  return subscription.cancelAtPeriodEnd ? 'already_scheduled' : 'schedule';
}
