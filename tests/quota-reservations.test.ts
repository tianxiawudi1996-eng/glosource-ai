import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { quotaReservations } from '../app/lib/db/schema';

const authSource = fs.readFileSync('app/lib/authMiddleware.ts', 'utf8');
const historySource = fs.readFileSync('app/api/history/me/route.ts', 'utf8');
const productization = fs.readFileSync('docs/operations/PRODUCTIZATION.md', 'utf8');

test('quota slots are unique per subject, surface, period, and slot', () => {
  const config = getTableConfig(quotaReservations);
  const unique = config.indexes.find(index =>
    index.config.name === 'quota_reservations_bucket_slot_uidx');
  assert.ok(unique?.config.unique);
  assert.deepEqual(
    unique.config.columns.map(column =>
      typeof column === 'object' && 'name' in column ? column.name : null),
    ['subject_type', 'subject_key', 'surface', 'period_start', 'slot'],
  );
});

test('quota admission counts committed usage and reserves in one atomic statement', () => {
  assert.match(authSource, /WITH committed AS \([\s\S]*?INSERT INTO quota_reservations/);
  assert.match(authSource, /usage\.surface = \$\{input\.surface\}/);
  assert.match(
    authSource,
    /\$\{input\.surface\} = 'kr'[\s\S]*?usage\.surface IS NULL[\s\S]*?usage\.action IN \('factory_direct', 'wechat', 'image_analyze'\)/,
  );
  assert.doesNotMatch(
    authSource,
    /usage\.surface = \$\{input\.surface\}\s+OR usage\.surface IS NULL/,
  );
  assert.match(authSource, /usage\.created_at >= \$\{period\.start\}/);
  assert.match(authSource, /usage\.created_at < \$\{period\.end\}/);
  assert.match(
    authSource,
    /input\.subjectType === 'anonymous_ip'[\s\S]*?usage\.user_id IS NULL/,
  );
  assert.match(
    authSource,
    /active AS \([\s\S]*?count\(\*\)::integer AS reserved[\s\S]*?reservation\.expires_at > NOW\(\)/,
  );
  assert.match(
    authSource,
    /generate_series\(\s*1,\s*\$\{input\.limit\}::integer/,
  );
  assert.match(
    authSource,
    /committed\.used \+ active\.reserved < \$\{input\.limit\}::integer/,
  );
  assert.doesNotMatch(authSource, /committed\.used \+ 1/);
  assert.match(
    authSource,
    /ON CONFLICT \(subject_type, subject_key, surface, period_start, slot\)/,
  );
  assert.match(authSource, /WHERE quota_reservations\.expires_at <= NOW\(\)/);
  assert.match(
    authSource,
    /NOW\(\) \+ \(\$\{QUOTA_RESERVATION_LEASE_MS\}::integer \* INTERVAL '1 millisecond'\)/,
  );
  assert.doesNotMatch(authSource, /\.transaction\s*\(/);
  assert.doesNotMatch(authSource, /advisory[_ ]lock/i);
});

test('reservation retry admits no more concurrent callers than available slots', async () => {
  process.env.DATABASE_URL ??= 'postgres' + 'ql://ci:ci@127.0.0.1:5432/ci';
  const imported = await import('../app/lib/authMiddleware');
  const quotaModule = ('default' in imported
    ? imported.default
    : imported) as typeof import('../app/lib/authMiddleware');
  const limit = 3;
  const occupied = new Set<number>();

  const reserve = () => quotaModule.reserveQuotaSlotWithRetry(limit, async () => {
    for (let slot = 1; slot <= limit; slot += 1) {
      if (!occupied.has(slot)) {
        occupied.add(slot);
        return slot;
      }
    }
    return null;
  });

  const admitted = (await Promise.all(Array.from({ length: 20 }, reserve)))
    .filter((slot): slot is number => slot !== null);
  assert.deepEqual(admitted.sort(), [1, 2, 3]);
  assert.equal(occupied.size, limit);
});

test('out-of-order finalization cannot reopen capacity while work remains active', () => {
  const limit = 2;
  let committed = 0;
  const active = new Set<number>();
  const reserve = (): number | null => {
    if (committed + active.size >= limit) return null;
    for (let slot = 1; slot <= limit; slot += 1) {
      if (!active.has(slot)) {
        active.add(slot);
        return slot;
      }
    }
    return null;
  };
  const finalize = (slot: number): void => {
    assert.equal(active.delete(slot), true);
    committed += 1;
  };

  const requestA = reserve();
  const requestB = reserve();
  assert.equal(requestA, 1);
  assert.equal(requestB, 2);

  finalize(requestB);
  assert.equal(committed, 1);
  assert.deepEqual([...active], [1]);
  assert.equal(reserve(), null, 'request C must remain blocked while A is active');

  finalize(requestA);
  assert.equal(committed, limit);
  assert.equal(reserve(), null);
});

test('quota periods use exact UTC boundaries', async () => {
  process.env.DATABASE_URL ??= 'postgres' + 'ql://ci:ci@127.0.0.1:5432/ci';
  const imported = await import('../app/lib/authMiddleware');
  const quotaModule = ('default' in imported
    ? imported.default
    : imported) as typeof import('../app/lib/authMiddleware');
  const now = new Date('2026-08-18T23:59:59.999Z');

  assert.deepEqual(quotaModule.quotaPeriod('day', now), {
    start: new Date('2026-08-18T00:00:00.000Z'),
    end: new Date('2026-08-19T00:00:00.000Z'),
  });
  assert.deepEqual(quotaModule.quotaPeriod('month', now), {
    start: new Date('2026-08-01T00:00:00.000Z'),
    end: new Date('2026-09-01T00:00:00.000Z'),
  });
});

test('successful routes finalize reservations and all early exits release them', () => {
  const routes = [
    'app/api/source/handler.ts',
    'app/api/source/factory-direct/route.ts',
    'app/api/source/wechat/route.ts',
    'app/api/source/image-analyze/handler.ts',
  ];
  for (const route of routes) {
    const source = fs.readFileSync(route, 'utf8');
    assert.match(source, /finalizeQuotaUsage\(/, `${route} must durably finalize usage`);
    assert.match(
      source,
      /finally\s*\{[\s\S]*?releaseQuotaReservation\(quotaReservation\)/,
      `${route} must release observable pre-result failures`,
    );
    assert.doesNotMatch(source, /kvConsumeFreeCredit/);
  }
});

test('the crash-recovery lease exceeds every billable route duration', () => {
  const leaseMatch = authSource.match(
    /QUOTA_RESERVATION_LEASE_MS\s*=\s*(\d+)\s*\*\s*(\d+)\s*\*\s*(\d+)/,
  );
  assert.ok(leaseMatch);
  const leaseMs = Number(leaseMatch[1]) * Number(leaseMatch[2]) * Number(leaseMatch[3]);
  const routes = [
    'app/api/source/handler.ts',
    'app/api/source/factory-direct/route.ts',
    'app/api/source/wechat/route.ts',
    'app/api/source/image-analyze/handler.ts',
  ];
  for (const route of routes) {
    const source = fs.readFileSync(route, 'utf8');
    const duration = source.match(/export const maxDuration\s*=\s*(\d+)/);
    assert.ok(duration, `${route} must declare a bounded maxDuration`);
    assert.ok(
      Number(duration[1]) * 1000 < leaseMs,
      `${route} can outlive the quota reservation lease`,
    );
  }
});

test('legacy rows never count in both surfaces or inherit into EN', () => {
  type Surface = 'kr' | 'en';
  type Action = 'source' | 'factory_direct' | 'wechat' | 'image_analyze';
  const krOnlyLegacyActions = new Set<Action>([
    'factory_direct',
    'wechat',
    'image_analyze',
  ]);
  const counts = (
    rowSurface: Surface | null,
    action: Action,
    bucket: Surface,
  ): boolean => rowSurface === bucket
    || (rowSurface === null && bucket === 'kr' && krOnlyLegacyActions.has(action));

  for (const action of krOnlyLegacyActions) {
    assert.equal(counts(null, action, 'kr'), true);
    assert.equal(counts(null, action, 'en'), false);
  }
  assert.equal(counts(null, 'source', 'kr'), false);
  assert.equal(counts(null, 'source', 'en'), false);
  assert.equal(counts('kr', 'source', 'kr'), true);
  assert.equal(counts('kr', 'source', 'en'), false);
  assert.equal(counts('en', 'source', 'kr'), false);
  assert.equal(counts('en', 'source', 'en'), true);

  assert.match(authSource, /usage\.surface = \$\{input\.surface\}/);
  assert.match(
    authSource,
    /\$\{input\.surface\} = 'kr'[\s\S]*?usage\.surface IS NULL[\s\S]*?usage\.action IN \('factory_direct', 'wechat', 'image_analyze'\)/,
  );
  assert.doesNotMatch(authSource, /UPDATE usage_logs/i);
  assert.match(historySource, /eq\(usageLogs\.surface, 'kr'\)/);
  assert.match(productization, /legacy `source` action is ambiguous/);
  assert.match(productization, /temporarily counts in neither bucket/);

  const krDashboard = fs.readFileSync('app/dashboard/page.tsx', 'utf8');
  const enDashboard = fs.readFileSync('app/en/dashboard/page.tsx', 'utf8');
  assert.match(krDashboard, /eq\(usageLogs\.surface, 'kr'\)/);
  assert.match(enDashboard, /eq\(usageLogs\.surface, 'en'\)/);
});

test('the forward quota migration is retry-safe and leaves prior migrations untouched', () => {
  const sql = fs.readFileSync(
    'drizzle/migrations/0005_handy_iron_fist.sql',
    'utf8',
  );
  assert.match(sql, /CREATE TABLE IF NOT EXISTS "quota_reservations"/);
  assert.match(
    sql,
    /CREATE UNIQUE INDEX IF NOT EXISTS "quota_reservations_bucket_slot_uidx"/,
  );
  assert.match(
    sql,
    /\("subject_type","subject_key","surface","period_start","slot"\)/,
  );
});
