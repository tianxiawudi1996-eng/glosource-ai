/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const { root } = require('./_utils');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (!match) continue;
    env[match[1]] = match[2].replace(/^"(.*)"$/, '$1').trim();
  }
  return env;
}

(async () => {
  const env = loadEnvLocal();
  const databaseUrl = process.env.DATABASE_URL || env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing');

  const sql = neon(databaseUrl);
  await sql`alter table users add column if not exists polar_provisioned boolean not null default false`;
  await sql`alter table users add column if not exists password_set_at timestamp`;
  await sql`alter table users add column if not exists welcome_reminder_sent_at timestamp`;

  const columns = await sql`
    select column_name
    from information_schema.columns
    where table_name = 'users'
      and column_name in ('polar_provisioned', 'password_set_at', 'welcome_reminder_sent_at')
    order by column_name
  `;

  console.log(`Polar password tracking columns present: ${columns.map(row => row.column_name).join(', ')}`);
})().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
