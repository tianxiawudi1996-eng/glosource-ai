import Link from 'next/link';
import { redirect } from 'next/navigation';
import { count, desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { abuseEvents, abuseIdentities, db, users } from '@/app/lib/db';

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function compact(value: string | null | undefined, max = 80): string {
  if (!value) return '-';
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

export default async function AbuseAdminPage() {
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? '').split(',').map(e => e.trim()).filter(Boolean);
  if (!session?.user?.email || !adminEmails.includes(session.user.email)) redirect('/');

  const [identityCountRows, eventCountRows, topIdentities, recentEvents] = await Promise.all([
    db.select({ value: count() }).from(abuseIdentities),
    db.select({ value: count() }).from(abuseEvents),
    db
      .select({
        id: abuseIdentities.id,
        identityType: abuseIdentities.identityType,
        riskScore: abuseIdentities.riskScore,
        eventCount: abuseIdentities.eventCount,
        userCount: abuseIdentities.userCount,
        firstSeenAt: abuseIdentities.firstSeenAt,
        lastSeenAt: abuseIdentities.lastSeenAt,
      })
      .from(abuseIdentities)
      .orderBy(desc(abuseIdentities.riskScore), desc(abuseIdentities.lastSeenAt))
      .limit(25),
    db
      .select({
        id: abuseEvents.id,
        event: abuseEvents.event,
        severity: abuseEvents.severity,
        ip: abuseEvents.ip,
        emailDomain: abuseEvents.emailDomain,
        metadata: abuseEvents.metadata,
        createdAt: abuseEvents.createdAt,
        userEmail: users.email,
      })
      .from(abuseEvents)
      .leftJoin(users, eq(abuseEvents.userId, users.id))
      .orderBy(desc(abuseEvents.createdAt))
      .limit(50),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin" className="text-sm font-bold text-[#EA580C] hover:underline">← Admin</Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-2xl font-black text-[#0D1B2A]">Abuse Signals</h1>
        </div>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-500">Tracked identity clusters</p>
            <p className="mt-2 text-3xl font-black text-[#0D1B2A]">{identityCountRows[0]?.value ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-500">Recorded abuse events</p>
            <p className="mt-2 text-3xl font-black text-[#0D1B2A]">{eventCountRows[0]?.value ?? 0}</p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-black text-[#0D1B2A]">Top Risk Identity Clusters</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                <tr>
                  <th className="px-5 py-3">type</th>
                  <th className="px-5 py-3">cluster</th>
                  <th className="px-5 py-3">risk</th>
                  <th className="px-5 py-3">events</th>
                  <th className="px-5 py-3">users</th>
                  <th className="px-5 py-3">first seen</th>
                  <th className="px-5 py-3">last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topIdentities.map(identity => (
                  <tr key={identity.id}>
                    <td className="px-5 py-4 text-sm font-bold text-[#0D1B2A]">{identity.identityType}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">{compact(identity.id, 48)}</td>
                    <td className="px-5 py-4 text-sm font-black text-red-600">{identity.riskScore}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{identity.eventCount}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{identity.userCount}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(identity.firstSeenAt)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(identity.lastSeenAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-black text-[#0D1B2A]">Recent Events</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                <tr>
                  <th className="px-5 py-3">time</th>
                  <th className="px-5 py-3">event</th>
                  <th className="px-5 py-3">severity</th>
                  <th className="px-5 py-3">user</th>
                  <th className="px-5 py-3">domain</th>
                  <th className="px-5 py-3">ip</th>
                  <th className="px-5 py-3">metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEvents.map(event => (
                  <tr key={event.id}>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(event.createdAt)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#0D1B2A]">{event.event}</td>
                    <td className="px-5 py-4 text-sm font-black text-red-600">{event.severity}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">{event.userEmail ?? '-'}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">{event.emailDomain ?? '-'}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">{event.ip ?? '-'}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">{compact(event.metadata, 160)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
