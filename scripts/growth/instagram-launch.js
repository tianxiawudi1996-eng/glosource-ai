/* eslint-disable @typescript-eslint/no-require-imports */
const fs   = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^\s*([^#][^=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
});

const API_KEY      = process.env.BUFFER_API_KEY;
const INSTAGRAM_ID = process.env.BUFFER_CHANNEL_INSTAGRAM;
const DRY_RUN      = process.argv.includes('--dry-run');

// Instagram: shorter captions, emoji-heavy, hashtag-dense
const POSTS = [
  `🇰🇷 Source Korean suppliers in 90 seconds

GloSource AI scans EC21 · BuyKorea · tradeKorea simultaneously — trust scores, cert signals (MFDS, HACCP, KC), and a ready-to-send English RFQ.

5 free searches at the link in bio 👆

#KBeauty #KFood #KFashion #Sourcing #B2B #AmazonFBA #ImportExport #KoreanSuppliers #Ecommerce`,

  `Stop spending hours on Korean supplier research 🔍

✅ EC21 · BuyKorea (KOTRA) · tradeKorea
✅ AI trust score per supplier
✅ MFDS / HACCP / KC cert detection
✅ English RFQ auto-generated

Free at glosource-ai.vercel.app/en

#Sourcing #KBeauty #FBA #B2BSourcing #Korea #Wholesale #Manufacturing`,

  `Korean manufacturer hunting just got a lot easier 🏭🇰🇷

GloSource AI ranks suppliers by real trust signals — not just listing position — and writes your outreach email for you.

Link in bio for 5 free searches.

#KoreanManufacturers #OEM #KBeauty #ImportBusiness #Sourcing #B2B #Ecommerce #SmallBusiness`,
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

async function postInstagram(text) {
  const mutation = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post { id status }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;
  const data = await gql(mutation, {
    input: {
      channelId: INSTAGRAM_ID,
      text,
      schedulingType: 'automatic',
      mode: 'shareNow',
    },
  });
  return data?.createPost;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!DRY_RUN && (!API_KEY || !INSTAGRAM_ID)) {
    console.error('❌ BUFFER_API_KEY or BUFFER_CHANNEL_INSTAGRAM missing');
    process.exit(1);
  }

  console.log(DRY_RUN
    ? `\n--- DRY RUN — ${POSTS.length} Instagram posts ---\n`
    : `\n--- LIVE — posting ${POSTS.length} Instagram posts via Buffer ---\n`);

  for (let i = 0; i < POSTS.length; i++) {
    try {
      if (DRY_RUN) {
        console.log(`\n[DRY RUN] Post ${i + 1}/${POSTS.length}\n${POSTS[i]}\n`);
        continue;
      }
      const result = await postInstagram(POSTS[i]);
      console.log(`✓ Post ${i + 1}/${POSTS.length}:`, JSON.stringify(result));
      if (i < POSTS.length - 1) await sleep(3000);
    } catch (err) {
      console.error(`✗ Post ${i + 1}: ${err.message}`);
    }
  }
  console.log('\nDone.');
}

main();
