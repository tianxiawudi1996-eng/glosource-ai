import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { getTableConfig } from 'drizzle-orm/pg-core';
import * as schema from '../app/lib/db/schema';

// The migration set silently stopped describing the database: tables were added to schema.ts and
// pushed straight to production, migration files were written without journal entries, and the
// ledger fell behind. Nobody noticed, because nothing ever compared the three. `db:migrate` would
// have failed the first time anyone ran it — on a fresh environment, in CI, or for a new teammate.
// These checks compare them on every test run, offline.

const FOLDER = 'drizzle/migrations';

interface Journal { entries: { idx: number; when: number; tag: string }[] }

const journal: Journal = JSON.parse(fs.readFileSync(`${FOLDER}/meta/_journal.json`, 'utf8'));

function schemaTables(): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const v of Object.values(schema)) {
    try {
      const cfg = getTableConfig(v as never);
      out.set(cfg.name, new Set(cfg.columns.map(c => c.name)));
    } catch { /* not a table export */ }
  }
  return out;
}

function snapshotTables(): Map<string, Set<string>> {
  const last = journal.entries[journal.entries.length - 1];
  const snap = JSON.parse(fs.readFileSync(`${FOLDER}/meta/${String(last.idx).padStart(4, '0')}_snapshot.json`, 'utf8'));
  const out = new Map<string, Set<string>>();
  for (const t of Object.values(snap.tables) as { name: string; columns: Record<string, unknown> }[]) {
    out.set(t.name, new Set(Object.keys(t.columns)));
  }
  return out;
}

test('every migration file is journalled, and every journal entry has its file', () => {
  // Orphan .sql files were the first symptom: 0001_add_waitlist.sql and 0006_age_marketing_consent.sql
  // sat in the folder without journal entries, so drizzle never ran them and nobody could tell.
  const files = fs.readdirSync(FOLDER).filter(f => f.endsWith('.sql')).sort();
  const tags = journal.entries.map(e => `${e.tag}.sql`).sort();
  assert.deepEqual(files, tags, 'the migration folder and the journal disagree about which migrations exist');
});

test('the migration snapshot describes exactly the tables schema.ts defines', () => {
  // This is the check that was missing. kr_cosmetics_firms, blog_posts, social_posts and
  // search_history lived in schema.ts and in production but in no migration at all, so the
  // migration set could not rebuild the database.
  const code = schemaTables();
  const snap = snapshotTables();

  const missing = [...code.keys()].filter(t => !snap.has(t));
  const extra = [...snap.keys()].filter(t => !code.has(t));
  assert.deepEqual(missing, [], `in schema.ts but in no migration — run \`npm run db:generate\`: ${missing.join(', ')}`);
  assert.deepEqual(extra, [], `in the migrations but not in schema.ts: ${extra.join(', ')}`);
});

test('the migration snapshot describes exactly the columns schema.ts defines', () => {
  const code = schemaTables();
  const snap = snapshotTables();
  for (const [table, cols] of code) {
    const s = snap.get(table);
    if (!s) continue; // reported by the table test
    const missing = [...cols].filter(c => !s.has(c));
    const extra = [...s].filter(c => !cols.has(c));
    assert.deepEqual(missing, [], `${table}: in schema.ts but in no migration — run \`npm run db:generate\`: ${missing.join(', ')}`);
    assert.deepEqual(extra, [], `${table}: in the migrations but not in schema.ts: ${extra.join(', ')}`);
  }
});

test('usage-log quota and history hot paths have composite indexes', () => {
  const config = getTableConfig(schema.usageLogs);
  const names = new Set(config.indexes.map(index => index.config.name));
  const ip = config.columns.find(column => column.name === 'ip');
  assert.equal(ip?.notNull, false, 'expired usage-log IPs must be removable with NULL');
  assert.equal(names.has('usage_logs_user_created_at_idx'), true);
  assert.equal(names.has('usage_logs_ip_created_at_idx'), true);
  assert.equal(names.has('usage_logs_created_at_idx'), true);
});

test('privacy-retention scans have created-at indexes', () => {
  const tables = [
    [schema.payments, 'payments_created_at_idx'],
    [schema.searchHistory, 'search_history_created_at_idx'],
    [schema.abuseEvents, 'abuse_events_created_at_idx'],
    [schema.waitlist, 'waitlist_created_at_idx'],
    [schema.abuseIdentities, 'abuse_identities_last_seen_at_idx'],
  ] as const;

  for (const [table, expected] of tables) {
    const names = new Set(getTableConfig(table).indexes.map(index => index.config.name));
    assert.equal(names.has(expected), true, `${expected} is required by the daily retention job`);
  }
});

test('account-owned logs cascade while billing references survive without an owner', () => {
  const expected = [
    [schema.usageLogs, 'usage_logs_user_id_users_id_fk', 'cascade'],
    [schema.abuseEvents, 'abuse_events_user_id_users_id_fk', 'cascade'],
    [schema.subscriptions, 'subscriptions_user_id_users_id_fk', 'set null'],
  ] as const;

  for (const [table, name, action] of expected) {
    const config = getTableConfig(table);
    const foreignKey = config.foreignKeys.find(candidate => candidate.getName() === name);
    assert.equal(foreignKey?.onDelete, action);
  }

  const subscriptionUser = getTableConfig(schema.subscriptions).columns.find(column => column.name === 'user_id');
  assert.equal(subscriptionUser?.notNull, false);
});

test('production retention indexes are transaction-safe and retry safely', () => {
  const retentionIndexes = new Set([
    'abuse_events_created_at_idx',
    'abuse_identities_last_seen_at_idx',
    'payments_created_at_idx',
    'search_history_created_at_idx',
    'usage_logs_user_created_at_idx',
    'usage_logs_ip_created_at_idx',
    'usage_logs_created_at_idx',
    'waitlist_created_at_idx',
  ]);
  const sql = fs.readdirSync(FOLDER)
    .filter(file => file.endsWith('.sql'))
    .map(file => fs.readFileSync(`${FOLDER}/${file}`, 'utf8'))
    .join('\n');
  const indexStatements = sql.split(/\r?\n/).filter(line =>
    line.startsWith('CREATE INDEX')
    && [...retentionIndexes].some(name => line.includes(`"${name}"`)),
  );
  assert.equal(indexStatements.length, retentionIndexes.size);
  for (const statement of indexStatements) {
    assert.match(statement, /^CREATE INDEX IF NOT EXISTS /);
    assert.doesNotMatch(
      statement,
      /\bCONCURRENTLY\b/,
      'Drizzle runs PostgreSQL migrations in a transaction, where CREATE INDEX CONCURRENTLY is forbidden',
    );
  }
});

test('the Drizzle config loads Next environment files before migration', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')) as {
    scripts?: Record<string, string>;
  };
  const command = pkg.scripts?.['db:migrate'] ?? '';
  const config = fs.readFileSync('drizzle.config.ts', 'utf8');

  assert.equal(command, 'drizzle-kit migrate');
  assert.match(config, /import \{ loadEnvConfig \} from '@next\/env';/);
  assert.match(config, /loadEnvConfig\(process\.cwd\(\)\);/);
});

test('the surface migration can be retried after a partial deployment', () => {
  const sql = fs.readFileSync(`${FOLDER}/0003_red_surge.sql`, 'utf8');
  assert.match(sql, /ADD COLUMN IF NOT EXISTS "surface" text/);
});

test('payment records survive account and subscription deletion without retaining a user link', () => {
  const config = getTableConfig(schema.payments);
  const userId = config.columns.find(column => column.name === 'user_id');
  assert.equal(userId?.notNull, false, 'payments.user_id must be nullable so the user FK can be set null');

  const actions = new Map(config.foreignKeys.map(foreignKey => [foreignKey.getName(), foreignKey.onDelete]));
  assert.equal(actions.get('payments_user_id_users_id_fk'), 'set null');
  assert.equal(actions.get('payments_subscription_id_subscriptions_id_fk'), 'set null');
});

test('OpenDART registry migration stores authoritative business-number mappings retry safely', () => {
  const config = getTableConfig(schema.krDartFirms);
  const columns = new Map(config.columns.map(column => [column.name, column]));
  const indexes = new Set(config.indexes.map(index => index.config.name));
  assert.equal(columns.get('bizrno')?.notNull, true);
  assert.equal(indexes.has('kr_dart_firms_name_norm_idx'), true);
  assert.equal(indexes.has('kr_dart_firms_bizrno_idx'), true);

  const source = getTableConfig(schema.verifiedSuppliers).columns
    .find(column => column.name === 'bizrno_source');
  assert.ok(source?.enumValues?.includes('opendart-registry'));

  const sql = fs.readFileSync(`${FOLDER}/0002_hot_chronomancer.sql`, 'utf8');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS "kr_dart_firms"/);
  assert.match(sql, /CREATE INDEX IF NOT EXISTS "kr_dart_firms_name_norm_idx"/);
  assert.match(sql, /CREATE INDEX IF NOT EXISTS "kr_dart_firms_bizrno_idx"/);
});
