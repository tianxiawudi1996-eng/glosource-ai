import { NextRequest, NextResponse } from 'next/server';
import { and, eq, isNotNull, lt, ne, or } from 'drizzle-orm';
import {
  abuseEvents,
  abuseIdentities,
  db,
  payments,
  searchHistory,
  usageLogs,
  waitlist,
} from '@/app/lib/db';
import { retentionCutoffs } from '@/app/lib/data-retention';
import { isCronAuthorized } from '@/app/lib/cron-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function affectedRows(result: { rowCount: number | null }): number {
  return result.rowCount ?? 0;
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoffs = retentionCutoffs();

  try {
    const [usage, deletedSearches, deletedPayments, abuse, expiredWaitlistIps] = await Promise.all([
      (async () => {
        const deleted = await db.delete(usageLogs)
          .where(lt(usageLogs.createdAt, cutoffs.usage));
        const expiredIps = await db.update(usageLogs)
          .set({ ip: null })
          .where(and(
            lt(usageLogs.createdAt, cutoffs.ip),
            isNotNull(usageLogs.ip),
          ));
        return { deleted, expiredIps };
      })(),
      db.delete(searchHistory).where(lt(searchHistory.createdAt, cutoffs.search)),
      db.delete(payments).where(lt(payments.createdAt, cutoffs.payment)),
      (async () => {
        const deleted = await db.delete(abuseEvents)
          .where(lt(abuseEvents.createdAt, cutoffs.usage));
        const expiredIps = await db.update(abuseEvents)
          .set({ ip: null })
          .where(and(
            lt(abuseEvents.createdAt, cutoffs.ip),
            isNotNull(abuseEvents.ip),
          ));
        const deletedIdentities = await db.delete(abuseIdentities)
          .where(or(
            and(
              eq(abuseIdentities.identityType, 'ip'),
              lt(abuseIdentities.lastSeenAt, cutoffs.ip),
            ),
            and(
              ne(abuseIdentities.identityType, 'ip'),
              lt(abuseIdentities.lastSeenAt, cutoffs.usage),
            ),
          ));
        return { deleted, expiredIps, deletedIdentities };
      })(),
      db.update(waitlist)
        .set({ ip: null })
        .where(and(
          lt(waitlist.createdAt, cutoffs.ip),
          isNotNull(waitlist.ip),
        )),
    ]);

    return NextResponse.json({
      success: true,
      affected: {
        deletedUsage: affectedRows(usage.deleted),
        deletedSearches: affectedRows(deletedSearches),
        deletedPayments: affectedRows(deletedPayments),
        deletedAbuseEvents: affectedRows(abuse.deleted),
        expiredUsageIps: affectedRows(usage.expiredIps),
        expiredAbuseIps: affectedRows(abuse.expiredIps),
        deletedAbuseIdentities: affectedRows(abuse.deletedIdentities),
        expiredWaitlistIps: affectedRows(expiredWaitlistIps),
      },
    });
  } catch (error) {
    console.error('[privacy-retention cron]', error);
    return NextResponse.json({ error: 'Privacy retention job failed' }, { status: 500 });
  }
}
