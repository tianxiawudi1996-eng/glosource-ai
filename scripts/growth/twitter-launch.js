/* eslint-disable @typescript-eslint/no-require-imports */
const fs   = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^\s*([^#][^=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
});

const API_KEY    = process.env.BUFFER_API_KEY;
const TWITTER_ID = process.env.BUFFER_CHANNEL_TWITTER;
const DRY_RUN = process.argv.includes('--dry-run');

const TWEETS = [
  `🇰🇷 Korean suppliers hard to find — Alibaba barely covers them, EC21 takes forever.

GloSource AI:
→ Scans EC21 · BuyKorea (KOTRA) · tradeKorea
→ Trust scores + MFDS/HACCP/KC signals
→ English RFQ auto-generated

5 free searches. 10/month after free signup:
glosource-ai.vercel.app/en

#AmazonFBA #KBeauty #Sourcing`,

  `Amazon FBA sellers — if you source K-beauty or K-food, this saves hours.

GloSource AI scans Korean B2B marketplaces simultaneously and returns ranked suppliers with certification signals + ready-to-send RFQ.

Free search: glosource-ai.vercel.app/en

#FBA #KBeauty #KFood #ImportExport`,

  `Korean supplier sourcing just got easier 🇰🇷

GloSource AI:
✅ EC21 · BuyKorea (KOTRA) · tradeKorea
✅ Trust score 0-100
✅ MFDS / HACCP / KC cert signals
✅ English RFQ auto-generated

5 free searches. 10/month after signup → glosource-ai.vercel.app/en

#KBeauty #Ecommerce #B2B #Korea`,
];

const GQL = 'https://api.buffer.com';

async function gql(query, variables = {}) {
  const res = await fetch(GQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (data.errors) throw new Error(JSON.stringify(data.errors));
  return data.data;
}

async function postTweet(text) {
  // Buffer GraphQL — createPost mutation
  const mutation = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
            status
          }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;
  const data = await gql(mutation, {
    input: {
      channelId: TWITTER_ID,
      text,
      schedulingType: 'automatic',
      mode: 'shareNow',
    },
  });
  return data?.createPost;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!DRY_RUN && (!API_KEY || !TWITTER_ID)) {
    console.error('❌ BUFFER_API_KEY or BUFFER_CHANNEL_TWITTER missing');
    process.exit(1);
  }

  console.log(DRY_RUN
    ? `\n--- DRY RUN — ${TWEETS.length} tweets ---\n`
    : `\n--- LIVE — posting ${TWEETS.length} tweets via Buffer GraphQL ---\n`);

  for (let i = 0; i < TWEETS.length; i++) {
    try {
      if (DRY_RUN) {
        console.log(`\n[DRY RUN] Tweet ${i + 1}/${TWEETS.length}\n${TWEETS[i]}\n`);
        continue;
      }
      const result = await postTweet(TWEETS[i]);
      console.log(`✓ Tweet ${i + 1}/${TWEETS.length}:`, JSON.stringify(result));
      if (i < TWEETS.length - 1) await sleep(3000);
    } catch (err) {
      console.error(`✗ Tweet ${i + 1}: ${err.message}`);
    }
  }
  console.log('\nDone.');
}

main();
