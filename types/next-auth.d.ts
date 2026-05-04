import type { DefaultSession } from 'next-auth';
import type { PlanTier } from '@/app/lib/db/schema';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      plan: PlanTier | 'free';
      subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | null;
    };
  }
}
