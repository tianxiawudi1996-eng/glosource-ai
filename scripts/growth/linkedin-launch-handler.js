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
const postIndexArg = process.argv.find(arg => arg.startsWith('--post-index='));
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
const RUN_TAG = `\n\nGloSource AI sourcing note ${TODAY}.`;

function withRunTag(text) {
  return `${text}${RUN_TAG}`;
}

const POSTS = [
  `Many buyers search "Korean supplier" and stop at the first marketplace listing.

That is risky.

Before sending an RFQ, I would check at least three signals:

1. Does the company appear to manufacture, export, or simply resell the product?
2. Do they show relevant certification or export-document evidence?
3. Are they visible across EC21, BuyKorea/KOTRA, tradeKorea, or a real company website?

GloSource AI helps buyers do this first-pass research faster.

It is not a supplier audit. It is a shortlist and RFQ preparation tool for buyers sourcing from Korea.

Create an account for 3 free searches per month:
https://glosourceai.com/en?utm_source=linkedin&utm_medium=organic&utm_campaign=2026-07-korean-supplier-intelligence&utm_content=linkedin-01

#Procurement #Sourcing #KoreanSuppliers`,

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
- public company and manufacturer-vs-trader signals
- certification evidence to verify for the relevant product category
- an English RFQ draft

Buyers still need to verify suppliers directly before ordering.

Create an account for 3 free searches per month:
https://glosourceai.com/en?utm_source=linkedin&utm_medium=organic&utm_campaign=2026-07-korean-supplier-intelligence&utm_content=linkedin-02

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

Create an account for 3 free searches per month:
https://glosourceai.com/en?utm_source=linkedin&utm_medium=organic&utm_campaign=2026-07-korean-supplier-intelligence&utm_content=linkedin-03

#Procurement #Sourcing #KoreanManufacturing`,
];
const requestedPostIndex = postIndexArg ? Number(postIndexArg.split('=')[1]) : null;
const SELECTED_POSTS = requestedPostIndex
  ? POSTS.slice(requestedPostIndex - 1, requestedPostIndex)
  : POSTS;

if (requestedPostIndex && SELECTED_POSTS.length === 0) {
  console.error(`Invalid --post-index=${requestedPostIndex}. Choose 1-${POSTS.length}.`);
  process.exit(1);
}

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
    ? `\n--- DRY RUN - ${SELECTED_POSTS.length} LinkedIn posts ---\n`
    : `\n--- LIVE - posting ${SELECTED_POSTS.length} LinkedIn posts via Buffer ---\n`);

  let failures = 0;
  const results = [];
  for (let i = 0; i < SELECTED_POSTS.length; i += 1) {
    try {
      const text = withRunTag(SELECTED_POSTS[i]);
      if (DRY_RUN) {
        console.log(`\n[DRY RUN] LinkedIn post ${i + 1}/${SELECTED_POSTS.length}\n${text}\n`);
        results.push({ index: i + 1, dryRun: true, status: 'previewed', text });
        continue;
      }
      const result = await postLinkedIn(text);
      results.push({ index: i + 1, ok: true, text, post: result.post });
      console.log(`Post ${i + 1}/${SELECTED_POSTS.length}:`, JSON.stringify(result));
      if (i < SELECTED_POSTS.length - 1) await sleep(3000);
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
      total: SELECTED_POSTS.length,
      failures,
      results,
    });
    console.log(`Report: ${reportPath}`);
  }

  if (failures > 0) process.exitCode = 1;
  console.log('\nDone.');
}

main();
