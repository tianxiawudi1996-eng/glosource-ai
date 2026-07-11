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
