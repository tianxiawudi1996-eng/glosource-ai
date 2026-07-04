/* eslint-disable @typescript-eslint/no-require-imports */
const fs   = require('fs');
const path = require('path');
const { writeJsonReport } = require('./_utils');

const envPath = path.join(__dirname, '../../.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^\s*([^#][^=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
});

const API_KEY     = process.env.BUFFER_API_KEY;
const THREADS_ID  = process.env.BUFFER_CHANNEL_THREADS;
const DRY_RUN     = process.argv.includes('--dry-run');
const postIndexArg = process.argv.find(arg => arg.startsWith('--post-index='));
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
const RUN_TAG = `\n\nSourcing note ${TODAY}.`;

function withRunTag(text) {
  return `${text}${RUN_TAG}`;
}

const POSTS = [
  `Finding Korean suppliers often means too many directories, tabs, and unanswered questions.

GloSource AI turns that first research pass into a focused shortlist with source links, company signals, MOQ context, and an English RFQ draft.

Try 5 searches free → https://glosourceai.com/en?utm_source=threads&utm_medium=organic&utm_campaign=2026-07-korean-supplier-intelligence&utm_content=threads-01

#Sourcing #B2B #KoreanSuppliers`,

  `A certification mention is not proof.

When researching Korean suppliers, check the source, certificate number, scope, expiry, company identity, and whether you are speaking to the manufacturer or a trader.

GloSource AI helps organize that first pass: https://glosourceai.com/en?utm_source=threads&utm_medium=organic&utm_campaign=2026-07-korean-supplier-intelligence&utm_content=threads-02

#Procurement #ImportExport`,

  `Before contacting a Korean supplier, prepare five things: product spec, quantity, target market, required evidence, and delivery destination.

GloSource AI uses that brief to build supplier candidates and a reviewable English RFQ.

Research tool—not an audit → https://glosourceai.com/en?utm_source=threads&utm_medium=organic&utm_campaign=2026-07-korean-supplier-intelligence&utm_content=threads-03

#Korea #B2BSourcing`,
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
    ? `\n--- DRY RUN — ${SELECTED_POSTS.length} Threads posts ---\n`
    : `\n--- LIVE — posting ${SELECTED_POSTS.length} Threads posts via Buffer ---\n`);

  let failures = 0;
  const results = [];
  for (let i = 0; i < SELECTED_POSTS.length; i++) {
    try {
      const text = withRunTag(SELECTED_POSTS[i]);
      if (DRY_RUN) {
        console.log(`\n[DRY RUN] Post ${i + 1}/${SELECTED_POSTS.length}\n${text}\n`);
        results.push({ index: i + 1, dryRun: true, status: 'previewed', text });
        continue;
      }
      const result = await postThreads(text);
      results.push({ index: i + 1, ok: true, text, post: result.post });
      console.log(`✓ Post ${i + 1}/${SELECTED_POSTS.length}:`, JSON.stringify(result));
      if (i < SELECTED_POSTS.length - 1) await sleep(3000);
    } catch (err) {
      failures += 1;
      results.push({ index: i + 1, ok: false, error: err.message });
      console.error(`✗ Post ${i + 1}: ${err.message}`);
    }
  }
  if (!DRY_RUN) {
    const reportPath = writeJsonReport('buffer-threads-launch', {
      channel: 'threads',
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
