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
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
const RUN_TIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).format(new Date());
const RUN_TAG = `\n\nSourcing note ${TODAY} ${RUN_TIME} KST.`;

function withRunTag(text, maxLen = 280) {
  const tagged = `${text}${RUN_TAG}`;
  if (tagged.length <= maxLen) return tagged;

  const withoutHashtags = text.replace(/\n\n#[\s\S]*$/, '');
  const compactTagged = `${withoutHashtags}${RUN_TAG}`;
  if (compactTagged.length <= maxLen) return compactTagged;

  return `${text.slice(0, maxLen - RUN_TAG.length - 1).trim()}${RUN_TAG}`;
}

const TWEETS = [
  `🇰🇷 Korean suppliers hard to find?

GloSource AI scans EC21 · BuyKorea (KOTRA) · tradeKorea simultaneously.
Trust scores + MFDS/HACCP/KC signals + English RFQ auto-generated.

5 free searches → glosource-ai.vercel.app/en

#AmazonFBA #KBeauty #Sourcing`,

  `FBA sellers sourcing K-beauty or K-food — this saves hours.

GloSource AI ranks Korean suppliers by trust signals & generates a ready-to-send English RFQ.

Free: glosource-ai.vercel.app/en

#FBA #KBeauty #KFood #ImportExport`,

  `Korean sourcing just got easier 🇰🇷
✅ EC21 · BuyKorea · tradeKorea
✅ Trust score 0–100
✅ MFDS/HACCP/KC signals
✅ English RFQ auto-generated

5 free searches → glosource-ai.vercel.app/en

#KBeauty #B2B #Ecommerce #Korea`,
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
      mode: 'addToQueue',
    },
  });
  const result = data?.createPost;
  if (!result?.post?.id) {
    throw new Error(result?.message || 'Buffer did not return a post id');
  }
  if (result.post.status === 'error') {
    throw new Error(`Buffer created an errored post (${result.post.id})`);
  }
  return result;
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

  let failures = 0;
  for (let i = 0; i < TWEETS.length; i++) {
    try {
      const text = withRunTag(TWEETS[i]);
      if (DRY_RUN) {
        console.log(`\n[DRY RUN] Tweet ${i + 1}/${TWEETS.length}\n${text}\n`);
        continue;
      }
      const result = await postTweet(text);
      console.log(`✓ Tweet ${i + 1}/${TWEETS.length}:`, JSON.stringify(result));
      if (i < TWEETS.length - 1) await sleep(3000);
    } catch (err) {
      failures += 1;
      console.error(`✗ Tweet ${i + 1}: ${err.message}`);
    }
  }
  if (failures > 0) process.exitCode = 1;
  console.log('\nDone.');
}

main();
