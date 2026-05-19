/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * GloSource AI — Reddit Launch Script
 *
 * 사전 설정:
 *   1. https://www.reddit.com/prefs/apps → "create another app"
 *      - type: script  /  redirect uri: http://localhost:8080
 *   2. .env.local 에 아래 4개 키 입력
 *      REDDIT_CLIENT_ID=...
 *      REDDIT_CLIENT_SECRET=...
 *      REDDIT_USERNAME=...
 *      REDDIT_PASSWORD=...
 *
 * 실행:
 *   node scripts/growth/reddit-launch.js            # 실제 포스팅
 *   node scripts/growth/reddit-launch.js --dry-run  # 내용 확인만
 */

const fs   = require('fs');
const path = require('path');

// .env.local 수동 파싱 (dotenv 불필요)
const envPath = path.join(__dirname, '../../.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^\s*([^#][^=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
});

const CLIENT_ID     = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const USERNAME      = process.env.REDDIT_USERNAME;
const PASSWORD      = process.env.REDDIT_PASSWORD;
const USER_AGENT    = `GloSourceLaunchBot/1.0 by u/${USERNAME}`;

const DRY_RUN = process.argv.includes('--dry-run');

const POSTS = [
  {
    subreddit: 'FulfillmentByAmazon',
    title: "I built a tool that finds Korean suppliers (K-beauty, K-food, electronics) in 60 seconds — free to try",
    text: `Been sourcing Korean products for a while and the pain point is always the same: you know K-beauty or K-food is hot, but finding a **real manufacturer** (not a reseller) who actually exports is a nightmare.

Google gives you distributors. Alibaba barely has Korean suppliers. EC21/BuyKorea work but you spend hours filtering through dead listings.

So I built **GloSource AI** — you type a product, it scans EC21 · BuyKorea (KOTRA-operated, government-backed) · tradeKorea simultaneously, ranks suppliers by trust score, and generates a pre-filled English RFQ you can send immediately.

**What it shows per supplier:**
- Trust score 0–100 with Trade Readiness breakdown
- MFDS / HACCP / KC / KS certification signals
- Est. MOQ, unit price, lead time
- AEO customs-certified companies flagged separately

5 free anonymous searches, no credit card. Free account gets 10 searches/month after email verification: **glosource-ai.vercel.app/en**

Would love brutal feedback from people who actually source from Korea.`,
  },
  {
    subreddit: 'ecommerce',
    title: "Free tool to find Korean suppliers for K-beauty, K-food, electronics OEM — AI-ranked with trust scores",
    text: `Quick share — spent months building a sourcing tool specifically for Korean manufacturers after wasting too much time on EC21 with no real results.

**GloSource AI**: describe your product → AI scans EC21, BuyKorea (KOTRA gov-operated), tradeKorea → returns ranked supplier candidates with:

- Certification signals (MFDS, HACCP, KC, KS, ISO)
- Estimated MOQ & unit price
- Pre-filled English RFQ draft ready to send
- AEO customs-certified companies highlighted

Best for: K-beauty OEM, Korean food wholesale, private label cosmetics, electronics (KC-certified).

**Free search:** glosource-ai.vercel.app/en

Happy to answer questions about Korean sourcing in general too.`,
  },
  {
    subreddit: 'dropship',
    title: "Korean supplier finder — K-beauty, K-food, electronics. AI trust scores + RFQ draft. Free to try.",
    text: `If you're trying to source from Korea and hitting walls on Alibaba (barely any Korean suppliers) or spending hours on EC21 with no results — I made something that might help.

**GloSource AI** scans EC21 · BuyKorea (KOTRA) · tradeKorea and returns ranked supplier candidates with trust scores, certification signals (MFDS, HACCP, KC), and a ready-to-send English RFQ.

5 free anonymous searches: glosource-ai.vercel.app/en

Feedback welcome.`,
  },
];

async function getAccessToken() {
  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: new URLSearchParams({ grant_type: 'password', username: USERNAME, password: PASSWORD }).toString(),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Auth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function submitPost(token, { subreddit, title, text }) {
  if (DRY_RUN) {
    console.log(`\n[DRY RUN] r/${subreddit}`);
    console.log(`Title: ${title}`);
    console.log(`Body (first 200 chars): ${text.slice(0, 200)}...\n`);
    return '[dry-run]';
  }
  const res = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: new URLSearchParams({ api_type: 'json', kind: 'self', sr: subreddit, title, text, resubmit: 'true' }).toString(),
  });
  const data = await res.json();
  const errors = data?.json?.errors;
  if (errors?.length) throw new Error(JSON.stringify(errors));
  return data?.json?.data?.url ?? '(no url)';
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!DRY_RUN && (!CLIENT_ID || !CLIENT_SECRET || !USERNAME || !PASSWORD)) {
    console.error('\n❌  Reddit credentials missing in .env.local:\n   REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD\n   👉  https://www.reddit.com/prefs/apps\n');
    process.exit(1);
  }

  console.log(DRY_RUN ? '\n--- DRY RUN ---' : `\n--- LIVE — posting as u/${USERNAME} ---`);
  const token = DRY_RUN ? 'dry' : await getAccessToken();
  if (!DRY_RUN) console.log('✓ Auth OK\n');

  for (const post of POSTS) {
    try {
      const url = await submitPost(token, post);
      console.log(`✓ r/${post.subreddit} → ${url}`);
      if (!DRY_RUN) await sleep(10_000); // Reddit rate limit
    } catch (err) {
      console.error(`✗ r/${post.subreddit}: ${err.message}`);
    }
  }
  console.log('\nDone.');
}

main();
