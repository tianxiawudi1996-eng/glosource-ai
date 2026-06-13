/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { writeJsonReport } = require('./_utils');

const envPath = path.join(__dirname, '../../.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^\s*([^#][^=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
});

const API_KEY = process.env.BUFFER_API_KEY;
const LINKEDIN_ID = process.env.BUFFER_CHANNEL_LINKEDIN;
const DRY_RUN = process.argv.includes('--dry-run');
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
const RUN_TAG = `\n\nGloSource AI sourcing note ${TODAY}.`;

function withRunTag(text) {
  return `${text}${RUN_TAG}`;
}

const POSTS = [
  `Most buyers search "Korean cosmetics supplier" and stop at the first marketplace listing.

That is risky.

For K-beauty OEM, I would check at least three signals before sending an RFQ:

1. Does the supplier clearly mention OEM or ODM?
2. Do they show MFDS, GMP, ISO, or export documentation signals?
3. Are they visible across EC21, BuyKorea/KOTRA, tradeKorea, or a real company website?

GloSource AI helps buyers do this first-pass research faster.

It is not a supplier audit. It is a shortlist and RFQ preparation tool for buyers sourcing from Korea.

Try 5 free searches:
https://glosource-ai.vercel.app/en

#KBeauty #Sourcing #KoreanSuppliers`,

  `Korean supplier research usually starts with too many tabs:

EC21.
BuyKorea/KOTRA.
tradeKorea.
Company websites.
Certification checks.
RFQ writing.

The hard part is not finding one listing.
The hard part is comparing the signals quickly enough to decide who deserves your first email.

GloSource AI searches Korean supplier sources and prepares:

- supplier candidates
- AI-detected trust signals
- certification mentions such as MFDS, HACCP, KC
- an English RFQ draft

Buyers still need to verify suppliers directly before ordering.

Free search:
https://glosource-ai.vercel.app/en

#B2B #ImportExport #AmazonFBA`,

  `If you source from Korea, your first RFQ should not be vague.

A useful RFQ to a Korean manufacturer should include:

- exact product category
- target MOQ
- destination country
- packaging needs
- required certificates
- sample request
- expected timeline

GloSource AI generates a supplier-specific English RFQ draft after the supplier shortlist.

The goal is simple:
less tab-switching, better first outreach.

Try it here:
https://glosource-ai.vercel.app/en

#Procurement #Sourcing #KoreanManufacturing`,
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

async function postLinkedIn(text) {
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
      channelId: LINKEDIN_ID,
      text,
      schedulingType: 'automatic',
      mode: 'shareNow',
    },
  });
  const result = data?.createPost;
  if (!result?.post?.id) throw new Error(result?.message || 'Buffer did not return a post id');
  if (result.post.status === 'error') throw new Error(`Buffer created an errored post (${result.post.id})`);
  return result;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!DRY_RUN && (!API_KEY || !LINKEDIN_ID)) {
    console.error('BUFFER_API_KEY or BUFFER_CHANNEL_LINKEDIN missing.');
    console.error('Connect LinkedIn to Buffer, then add BUFFER_CHANNEL_LINKEDIN to .env.local.');
    process.exit(1);
  }

  console.log(DRY_RUN
    ? `\n--- DRY RUN - ${POSTS.length} LinkedIn posts ---\n`
    : `\n--- LIVE - posting ${POSTS.length} LinkedIn posts via Buffer ---\n`);

  let failures = 0;
  const results = [];
  for (let i = 0; i < POSTS.length; i += 1) {
    try {
      const text = withRunTag(POSTS[i]);
      if (DRY_RUN) {
        console.log(`\n[DRY RUN] LinkedIn post ${i + 1}/${POSTS.length}\n${text}\n`);
        results.push({ index: i + 1, dryRun: true, status: 'previewed', text });
        continue;
      }
      const result = await postLinkedIn(text);
      results.push({ index: i + 1, ok: true, text, post: result.post });
      console.log(`Post ${i + 1}/${POSTS.length}:`, JSON.stringify(result));
      if (i < POSTS.length - 1) await sleep(3000);
    } catch (err) {
      failures += 1;
      results.push({ index: i + 1, ok: false, error: err.message });
      console.error(`Post ${i + 1} failed: ${err.message}`);
    }
  }

  if (!DRY_RUN) {
    const reportPath = writeJsonReport('buffer-linkedin-launch', {
      channel: 'linkedin',
      status: failures > 0 ? 'partial_or_failed' : 'pass',
      mode: 'shareNow',
      total: POSTS.length,
      failures,
      results,
    });
    console.log(`Report: ${reportPath}`);
  }

  if (failures > 0) process.exitCode = 1;
  console.log('\nDone.');
}

main();
