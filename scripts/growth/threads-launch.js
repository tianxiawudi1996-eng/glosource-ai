/* eslint-disable @typescript-eslint/no-require-imports */
const fs   = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^\s*([^#][^=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
});

const API_KEY     = process.env.BUFFER_API_KEY;
const THREADS_ID  = process.env.BUFFER_CHANNEL_THREADS;
const DRY_RUN     = process.argv.includes('--dry-run');
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
const RUN_TAG = `\n\nSourcing note ${TODAY}.`;

function withRunTag(text) {
  return `${text}${RUN_TAG}`;
}

const POSTS = [
  `Finding Korean suppliers used to mean hours on EC21, BuyKorea, and tradeKorea — all separately.

GloSource AI searches all three at once, ranks by trust score, and writes your English RFQ automatically.

5 free searches 👉 glosource-ai.vercel.app/en

#KBeauty #Sourcing #B2B #AmazonFBA`,

  `If you import Korean products, you need MFDS / HACCP / KC certification checks before even contacting a supplier.

GloSource AI surfaces those signals automatically — plus MOQ, lead time estimates, and a ready-to-send RFQ.

Try free: glosource-ai.vercel.app/en

#KBeauty #KFood #ImportExport #Ecommerce`,

  `Korean supplier research in 90 seconds:
→ EC21 · BuyKorea (KOTRA) · tradeKorea searched simultaneously
→ AI trust score 0–100 per supplier
→ Certification signals detected (MFDS, HACCP, KC)
→ English RFQ pre-filled and ready to send

5 free searches → glosource-ai.vercel.app/en

#Korea #B2BSourcing #FBA #KBeauty`,
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

async function postThreads(text) {
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
      channelId: THREADS_ID,
      text,
      schedulingType: 'automatic',
      mode: 'shareNow',
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
  if (!DRY_RUN && (!API_KEY || !THREADS_ID)) {
    console.error('❌ BUFFER_API_KEY or BUFFER_CHANNEL_THREADS missing');
    process.exit(1);
  }

  console.log(DRY_RUN
    ? `\n--- DRY RUN — ${POSTS.length} Threads posts ---\n`
    : `\n--- LIVE — posting ${POSTS.length} Threads posts via Buffer ---\n`);

  let failures = 0;
  for (let i = 0; i < POSTS.length; i++) {
    try {
      const text = withRunTag(POSTS[i]);
      if (DRY_RUN) {
        console.log(`\n[DRY RUN] Post ${i + 1}/${POSTS.length}\n${text}\n`);
        continue;
      }
      const result = await postThreads(text);
      console.log(`✓ Post ${i + 1}/${POSTS.length}:`, JSON.stringify(result));
      if (i < POSTS.length - 1) await sleep(3000);
    } catch (err) {
      failures += 1;
      console.error(`✗ Post ${i + 1}: ${err.message}`);
    }
  }
  if (failures > 0) process.exitCode = 1;
  console.log('\nDone.');
}

main();
