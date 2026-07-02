/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * GloSource AI — Discord Webhook Launch Script
 *
 * 사전 설정:
 *   각 Discord 서버 → 채널 설정 → Integrations → Webhooks → New Webhook → Copy URL
 *   .env.local 에 아래 키 입력:
 *     DISCORD_WEBHOOK_FBA=https://discord.com/api/webhooks/...
 *     DISCORD_WEBHOOK_ECOMMERCE=https://discord.com/api/webhooks/...
 *     DISCORD_WEBHOOK_DROPSHIP=https://discord.com/api/webhooks/...
 *     DISCORD_WEBHOOK_OWN=https://discord.com/api/webhooks/...
 *
 * 실행:
 *   node scripts/growth/discord-launch.js            # 실제 발송
 *   node scripts/growth/discord-launch.js --dry-run  # 내용 확인만
 */

const fs   = require('fs');
const path = require('path');

// .env.local 수동 파싱
const envPath = path.join(__dirname, '../../.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^\s*([^#][^=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
});

const DRY_RUN = process.argv.includes('--dry-run');

const WEBHOOKS = [
  { name: 'FBA Masterminds #sourcing',   url: process.env.DISCORD_WEBHOOK_FBA },
  { name: 'Ecommerce Empire #resources', url: process.env.DISCORD_WEBHOOK_ECOMMERCE },
  { name: 'Dropship Breakthru #tools',   url: process.env.DISCORD_WEBHOOK_DROPSHIP },
  { name: 'GloSource Own Server',        url: process.env.DISCORD_WEBHOOK_OWN },
].filter(w => w.url);

const EMBED = {
  username: 'GloSource AI',
  embeds: [
    {
      title: '🇰🇷 Find Korean Suppliers in 60 Seconds',
      description: `Scans **EC21 · BuyKorea (KOTRA gov) · tradeKorea** simultaneously — AI ranks supplier candidates by trust score and generates a pre-filled English RFQ.

**Per supplier result:**
✅ Trust score 0–100 with Listing Quality breakdown
✅ MFDS / HACCP / KC / KS certification signals
✅ Est. MOQ, unit price & lead time
✅ AEO customs-certified companies highlighted
✅ Ready-to-send English RFQ draft

**5 free anonymous searches. Free account: 10 searches/month after email verification.**`,
      url: 'https://glosourceai.com/en',
      color: 0xEA580C,
      fields: [
        { name: 'Best for', value: 'K-beauty OEM · K-food bulk · Electronics · Private label cosmetics', inline: false },
        { name: 'Free',     value: '5 anonymous · 10/month after signup', inline: true },
        { name: 'Paid',     value: 'From $19/mo — 30 searches',           inline: true },
      ],
      footer: { text: 'Feedback welcome — DM or reply' },
      timestamp: new Date().toISOString(),
    },
  ],
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!DRY_RUN && WEBHOOKS.length === 0) {
    console.error('\n❌  No Discord webhooks set in .env.local\n    DISCORD_WEBHOOK_FBA / ECOMMERCE / DROPSHIP / OWN\n');
    process.exit(1);
  }

  console.log(DRY_RUN ? '\n--- DRY RUN ---' : `\n--- LIVE — posting to ${WEBHOOKS.length} channel(s) ---`);

  const targets = DRY_RUN && WEBHOOKS.length === 0
    ? [{ name: 'Sample Discord channel', url: 'dry-run' }]
    : WEBHOOKS;

  for (const wh of targets) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] → ${wh.name}`);
      continue;
    }
    try {
      const res = await fetch(wh.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(EMBED),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log(`✓ ${wh.name}`);
      await sleep(2_000);
    } catch (err) {
      console.error(`✗ ${wh.name}: ${err.message}`);
    }
  }
  console.log('\nDone.');
}

main();
