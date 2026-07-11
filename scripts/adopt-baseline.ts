/**
 * Tell an existing database that the baseline migration is already applied — without running its
 * DDL, because the tables are already there.
 *
 * Why this exists: production was built partly by `drizzle-kit push` and partly by hand, so its
 * migration ledger had fallen behind (3 of 9 journalled migrations recorded). drizzle decides what
 * to run by comparing each migration's `when` against the LATEST recorded created_at, so the next
 * `db:migrate` would have re-run 0003-0008 and tried to CREATE tables that already exist. Worse,
 * several tables (kr_*, blog_posts, social_posts, search_history) had never been in a migration at
 * all, so the migration set could not rebuild the database from scratch either.
 *
 * The fix is a single baseline generated from schema.ts, plus this script to adopt the existing
 * database into it. It REFUSES to do that unless the live schema already matches the baseline —
 * otherwise it would be recording a lie, and a real pending change would be skipped forever.
 *
 *   npx tsx --env-file=.env.local scripts/adopt-baseline.ts [--apply]
 *
 * Safe by default: prints what it would do. Pass --apply to write the ledger row.
 * Idempotent: a database that already knows the baseline is left alone.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import { sql } from 'drizzle-orm';
import { db } from '../app/lib/db';

const FOLDER = 'drizzle/migrations';

interface Journal { entries: { idx: number; when: number; tag: string }[] }

function parseBaselineTables(text: string): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const m of text.matchAll(/CREATE TABLE "([a-z_]+)" \(([\s\S]*?)\n\);/g)) {
    const cols = new Set<string>();
    for (const line of m[2].split('\n')) {
      const c = /^\s*"([a-z_0-9]+)"\s+/.exec(line);
      if (c) cols.add(c[1]);
    }
    out.set(m[1], cols);
  }
  return out;
}

async function liveSchema(): Promise<Map<string, Set<string>>> {
  const res = await db.execute(sql`
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public'
  `);
  const out = new Map<string, Set<string>>();
  for (const r of (res.rows ?? []) as Record<string, string>[]) {
    if (!out.has(r.table_name)) out.set(r.table_name, new Set());
    out.get(r.table_name)!.add(r.column_name);
  }
  return out;
}

function diff(baseline: Map<string, Set<string>>, live: Map<string, Set<string>>): string[] {
  const problems: string[] = [];
  for (const [t, cols] of baseline) {
    const l = live.get(t);
    if (!l) { problems.push(`table "${t}" is in the baseline but not in this database`); continue; }
    for (const c of cols) if (!l.has(c)) problems.push(`"${t}"."${c}" is in the baseline but not in this database`);
  }
  for (const [t, cols] of live) {
    const b = baseline.get(t);
    if (!b) { problems.push(`table "${t}" exists here but is not in the baseline`); continue; }
    for (const c of cols) if (!b.has(c)) problems.push(`"${t}"."${c}" exists here but is not in the baseline`);
  }
  return problems;
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const journal = JSON.parse(fs.readFileSync(`${FOLDER}/meta/_journal.json`, 'utf8')) as Journal;
  if (journal.entries.length !== 1) {
    console.error(`expected exactly one baseline migration, found ${journal.entries.length} — this script only adopts a fresh baseline`);
    process.exit(1);
  }
  const entry = journal.entries[0];
  const text = fs.readFileSync(`${FOLDER}/${entry.tag}.sql`, 'utf8');
  const hash = crypto.createHash('sha256').update(text).digest('hex'); // same as drizzle's readMigrationFiles

  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS drizzle`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
    id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint
  )`);

  const already = await db.execute(sql`SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = ${hash} LIMIT 1`);
  if ((already.rows ?? []).length) {
    console.log(`already adopted: ${entry.tag} is recorded as applied. Nothing to do.`);
    process.exit(0);
  }

  const problems = diff(parseBaselineTables(text), await liveSchema());
  if (problems.length) {
    console.error('REFUSING to adopt — this database does not match the baseline, so recording it as applied would skip real work:\n');
    for (const p of problems) console.error(`  - ${p}`);
    console.error('\nReconcile the schema first (or generate a migration for the difference).');
    process.exit(1);
  }

  const [{ created_at: latest } = { created_at: null }] = (await db.execute(
    sql`SELECT created_at FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 1`,
  )).rows as { created_at: string | null }[];

  console.log(`baseline ${entry.tag} (when=${entry.when})`);
  console.log(`schema matches this database exactly — safe to record as applied`);
  console.log(`current ledger high-water mark: ${latest ?? 'none'}`);

  if (!apply) {
    console.log('\nDRY RUN — pass --apply to write the ledger row.');
    process.exit(0);
  }

  await db.execute(sql`
    INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${hash}, ${entry.when})
  `);
  console.log('\nadopted. `db:migrate` will now be a no-op against this database.');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
