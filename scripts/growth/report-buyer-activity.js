/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const { root, writeJsonReport } = require('./_utils');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (match) env[match[1]] = match[2].replace(/^"(.*)"$/, '$1').trim();
  }
  return env;
}

(async () => {
  const env = { ...loadEnvLocal(), ...process.env };
  if (!env.DATABASE_URL) {
    console.error('DATABASE_URL is missing.');
    process.exit(1);
  }

  const sql = neon(env.DATABASE_URL);
  const [summary] = await sql`
    select
      (select count(*)::int from users) as users_total,
      (select count(*)::int from users where created_at >= now() - interval '24 hours') as users_24h,
      (select count(*)::int from users where created_at >= now() - interval '7 days') as users_7d,
      (select count(*)::int from usage_logs) as usage_logs_total,
      (select count(*)::int from usage_logs where created_at >= now() - interval '24 hours') as searches_24h,
      (select count(*)::int from usage_logs where created_at >= now() - interval '7 days') as searches_7d,
      (select count(*)::int from payments) as payments_total,
      (select count(*)::int from payments where created_at >= now() - interval '24 hours') as payments_24h,
      (select count(*)::int from subscriptions where status = 'active') as active_subscriptions
  `;

  const topProducts = await sql`
    select product, count(*)::int as searches
    from usage_logs
    where created_at >= now() - interval '7 days'
      and product is not null
      and product <> ''
    group by product
    order by searches desc
    limit 10
  `;

  const latestSearches = await sql`
    select product, supplier_count, status, created_at
    from usage_logs
    order by created_at desc
    limit 10
  `;

  const reportPath = writeJsonReport('buyer-activity', {
    status: 'pass',
    summary,
    topProducts,
    latestSearches,
  });

  console.log(`Buyer activity report: ${reportPath}`);
  console.log(JSON.stringify({ summary, topProducts, latestSearches }, null, 2));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
