/* eslint-disable @typescript-eslint/no-require-imports */
//
// Outreach reply handler (inbound side of the growth funnel).
//
// Two modes, both safe — nothing is ever SENT, only Gmail drafts are created:
//   node scripts/growth/handle-outreach-replies.js            (fetch)
//     -> finds new lead replies in outreach threads, writes:
//          reports/growth/outreach-replies-YYYY-MM-DD.json   (full audit)
//          data/growth/outreach-reply-queue-YYYY-MM-DD.json  (items needing a reply, with a template draftBody)
//   node scripts/growth/handle-outreach-replies.js --create-drafts [queueFile]
//     -> creates an in-thread Gmail DRAFT for every queue item whose draftBody is non-empty.
//        Drafts sit in Gmail for a human to review and send. Add --dry-run to skip the POST.
//
// Authentication uses a Gmail API OAuth refresh token (NOT the claude.ai MCP, which is
// unavailable in headless/cron runs). Required env (in .env.local or process.env):
//   GMAIL_OAUTH_CLIENT_ID, GMAIL_OAUTH_CLIENT_SECRET, GMAIL_OAUTH_REFRESH_TOKEN
//   GMAIL_ACCOUNT     (the outreach sender address, e.g. tianxiawudi1996@gmail.com)
// Optional:
//   OUTREACH_QUERY    (Gmail search; default: label:GloSource/Outreach newer_than:30d)
//   GMAIL_SENDER_NAME (From display name; default: GloSource AI)
//
// See docs/growth/outreach-reply-automation.md for the one-time token setup.

const https = require('https');
const fs = require('fs');
const path = require('path');
const { root, reportDir, ensureDir, today, loadEnvLocal } = require('./_utils');

const env = { ...loadEnvLocal(), ...process.env };
const args = process.argv.slice(2);
const MODE_CREATE_DRAFTS = args.includes('--create-drafts');
const DRY_RUN = args.includes('--dry-run');

const ACCOUNT = (env.GMAIL_ACCOUNT || '').toLowerCase();
const SENDER_NAME = env.GMAIL_SENDER_NAME || 'GloSource AI';
const OUTREACH_QUERY = env.OUTREACH_QUERY || 'label:GloSource/Outreach newer_than:30d';
const dataDir = path.join(root, 'data', 'growth');

function requireEnv() {
  const missing = ['GMAIL_OAUTH_CLIENT_ID', 'GMAIL_OAUTH_CLIENT_SECRET', 'GMAIL_OAUTH_REFRESH_TOKEN', 'GMAIL_ACCOUNT']
    .filter(key => !env[key]);
  if (missing.length) {
    console.error(`Missing required env: ${missing.join(', ')}.`);
    console.error('See docs/growth/outreach-reply-automation.md for the one-time Gmail OAuth setup.');
    process.exit(1);
  }
}

// ---- low-level HTTP ----------------------------------------------------------

function httpRequest({ method, url, headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method, headers, timeout: 20000 }, res => {
      let buf = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { buf += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, text: buf }));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getAccessToken() {
  const form = new URLSearchParams({
    client_id: env.GMAIL_OAUTH_CLIENT_ID,
    client_secret: env.GMAIL_OAUTH_CLIENT_SECRET,
    refresh_token: env.GMAIL_OAUTH_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  }).toString();
  const res = await httpRequest({
    method: 'POST',
    url: 'https://oauth2.googleapis.com/token',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(form) },
    body: form,
  });
  if (res.status !== 200) {
    throw new Error(`Token refresh failed (${res.status}): ${res.text.slice(0, 300)}`);
  }
  return JSON.parse(res.text).access_token;
}

async function gmail(token, apiPath, { method = 'GET', body } = {}) {
  const headers = { Authorization: `Bearer ${token}` };
  if (body) headers['Content-Type'] = 'application/json';
  const res = await httpRequest({
    method,
    url: `https://gmail.googleapis.com/gmail/v1/users/me${apiPath}`,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Gmail API ${method} ${apiPath} failed (${res.status}): ${res.text.slice(0, 300)}`);
  }
  return res.text ? JSON.parse(res.text) : {};
}

// ---- MIME / encoding helpers -------------------------------------------------

function b64urlDecode(data) {
  if (!data) return '';
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function b64urlEncode(str) {
  return Buffer.from(str, 'utf8').toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function headerValue(message, name) {
  const headers = (message.payload && message.payload.headers) || [];
  const found = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return found ? found.value : '';
}

function extractPlainBody(payload) {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body && payload.body.data) {
    return b64urlDecode(payload.body.data);
  }
  let htmlFallback = '';
  for (const part of payload.parts || []) {
    const nested = extractPlainBody(part);
    if (part.mimeType === 'text/plain' && nested) return nested;
    if (part.mimeType === 'text/html' && part.body && part.body.data && !htmlFallback) {
      htmlFallback = b64urlDecode(part.body.data).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    if (nested && !htmlFallback) htmlFallback = nested;
  }
  return htmlFallback;
}

function parseAddress(value) {
  const match = value.match(/<([^>]+)>/);
  const email = (match ? match[1] : value).trim().toLowerCase();
  const name = value.replace(/<[^>]+>/, '').replace(/"/g, '').trim();
  return { email, name: name || email.split('@')[0] };
}

// ---- classification (heuristic first pass; the agent refines) ----------------

function classify(text) {
  const t = (text || '').toLowerCase();
  if (/\b(unsubscribe|remove me|opt[\s-]?out|stop emailing|do not contact|take me off)\b/.test(t)) {
    return { label: 'unsubscribe', suggestedAction: 'Confirm removal politely. No pitch. Do not follow up again.' };
  }
  if (/(out of office|auto[\s-]?reply|automatic reply|on (vacation|holiday|leave)|away from my|will be back|currently away)/.test(t)) {
    return { label: 'auto_reply', suggestedAction: 'Skip — automated bounce/OOO. Re-check after their return date.' };
  }
  if (/\b(not interested|no thanks|no thank you|we are all set|already (have|work with)|not (a|the right) (fit|time)|no budget)\b/.test(t)) {
    return { label: 'objection', suggestedAction: 'Brief, low-pressure reply. Leave the door open; no hard sell.' };
  }
  if (/\b(interested|sounds good|tell me more|send (me )?(the |a )?(sample|shortlist|info)|pricing|how much|free trial|let'?s (talk|chat|schedule)|book a|set up a call|demo|yes,? please|sure,?)\b/.test(t)) {
    return { label: 'interested', suggestedAction: 'Move forward. Offer the free sample shortlist and ask for one product category.' };
  }
  if (t.includes('?')) {
    return { label: 'question', suggestedAction: 'Answer the question directly, then offer the free sample shortlist.' };
  }
  return { label: 'needs_review', suggestedAction: 'Human/agent should read and decide. Generic acknowledgment template provided.' };
}

function templateDraft(label, firstName) {
  const hi = `Hi ${firstName},\n\n`;
  const sig = `\n\nBest,\n${SENDER_NAME}\nhttps://glosourceai.com/en`;
  switch (label) {
    case 'unsubscribe':
      return `${hi}Understood — I've removed you and you won't hear from me again. Thanks for letting me know, and all the best with your sourcing.${sig}`;
    case 'objection':
      return `${hi}Totally understand, and thanks for the honest reply. I'll leave it there — if your sourcing needs ever change, GloSource is a free first-pass research shortcut whenever you want it.${sig}`;
    case 'interested':
    case 'question':
      return `${hi}Thanks for getting back to me — happy to help.\n\n[Personalize: answer their specific question / reference their reply here.]\n\nIf useful, I can prepare a free sample shortlist for one product category you're currently exploring — Korean supplier candidates with trust/certification signals (MFDS, HACCP, KC, ISO) and a ready-to-send English RFQ draft. Just tell me the category and I'll send it over. No cost, no commitment — it's a research shortcut before your team verifies suppliers directly.${sig}`;
    case 'auto_reply':
      return ''; // no draft for OOO/auto-replies
    default:
      return `${hi}Thanks for the reply — appreciate it. [Personalize based on their message.]\n\nIf helpful, I can put together a free sample shortlist for one product category you're currently exploring, so you can see what GloSource surfaces before any commitment. Happy to send it whenever you like.${sig}`;
  }
}

// ---- fetch mode --------------------------------------------------------------

async function fetchReplies() {
  const token = await getAccessToken();
  const list = await gmail(token, `/threads?q=${encodeURIComponent(OUTREACH_QUERY)}&maxResults=50`);
  const threads = list.threads || [];
  console.log(`Outreach query "${OUTREACH_QUERY}" matched ${threads.length} thread(s).`);

  const replies = [];
  const queue = [];
  const skipped = [];

  for (const t of threads) {
    const thread = await gmail(token, `/threads/${t.id}?format=full`);
    const messages = (thread.messages || []).slice().sort(
      (a, b) => Number(a.internalDate || 0) - Number(b.internalDate || 0));
    if (!messages.length) continue;

    const weParticipated = messages.some(m => parseAddress(headerValue(m, 'From')).email === ACCOUNT);
    if (!weParticipated) { skipped.push({ threadId: t.id, reason: 'we never sent in this thread' }); continue; }

    const hasDraft = messages.some(m => (m.labelIds || []).includes('DRAFT'));
    if (hasDraft) { skipped.push({ threadId: t.id, reason: 'draft already exists' }); continue; }

    const last = messages[messages.length - 1];
    const lastFrom = parseAddress(headerValue(last, 'From'));
    if (lastFrom.email === ACCOUNT) { skipped.push({ threadId: t.id, reason: 'last message is ours (already replied)' }); continue; }

    const body = extractPlainBody(last.payload).trim();
    const subject = headerValue(last, 'Subject');
    const cls = classify(`${subject}\n${body}`);
    const messageId = headerValue(last, 'Message-ID') || headerValue(last, 'Message-Id');
    const references = headerValue(last, 'References');

    const record = {
      threadId: t.id,
      messageId,
      from: lastFrom.email,
      fromName: lastFrom.name,
      subject,
      date: headerValue(last, 'Date'),
      snippet: (last.snippet || '').slice(0, 280),
      body: body.slice(0, 4000),
      classification: cls.label,
      suggestedAction: cls.suggestedAction,
    };
    replies.push(record);

    const draftBody = templateDraft(cls.label, lastFrom.name.split(/\s+/)[0]);
    queue.push({
      threadId: t.id,
      to: lastFrom.email,
      subject: subject.replace(/^(re:\s*)+/i, '').length ? `Re: ${subject.replace(/^(re:\s*)+/i, '')}` : 'Re: GloSource AI',
      inReplyTo: messageId,
      references: [references, messageId].filter(Boolean).join(' '),
      classification: cls.label,
      source: 'template',
      draftBody,
    });
  }

  const auditPath = path.join(reportDir, `outreach-replies-${today()}.json`);
  ensureDir(reportDir);
  fs.writeFileSync(auditPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    account: ACCOUNT,
    query: OUTREACH_QUERY,
    threadsMatched: threads.length,
    repliesFound: replies.length,
    replies,
    skipped,
  }, null, 2));

  ensureDir(dataDir);
  const queuePath = path.join(dataDir, `outreach-reply-queue-${today()}.json`);
  fs.writeFileSync(queuePath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    note: 'Agent: replace each draftBody with a personalized reply, then run --create-drafts. Items with empty draftBody (e.g. auto_reply) are skipped.',
    items: queue,
  }, null, 2));

  console.log(`Found ${replies.length} reply/replies needing attention. Skipped ${skipped.length}.`);
  console.log(`Audit:  ${path.relative(root, auditPath)}`);
  console.log(`Queue:  ${path.relative(root, queuePath)}`);
  for (const r of replies) console.log(`  - [${r.classification}] ${r.fromName} <${r.from}>: ${r.snippet.slice(0, 90)}`);
}

// ---- create-drafts mode ------------------------------------------------------

function buildRawMessage({ from, to, subject, inReplyTo, references, body }) {
  const lines = [
    `From: ${SENDER_NAME} <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
  ];
  if (inReplyTo) lines.push(`In-Reply-To: ${inReplyTo}`);
  if (references) lines.push(`References: ${references}`);
  lines.push('', body);
  return b64urlEncode(lines.join('\r\n'));
}

async function createDrafts() {
  const queueFileArg = args.find(a => !a.startsWith('--'));
  const queuePath = queueFileArg
    ? path.resolve(queueFileArg)
    : path.join(dataDir, `outreach-reply-queue-${today()}.json`);
  if (!fs.existsSync(queuePath)) {
    console.error(`Queue file not found: ${queuePath}. Run the fetch mode first.`);
    process.exit(1);
  }
  const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
  const items = (queue.items || []).filter(it => (it.draftBody || '').trim());
  console.log(`${items.length} draft(s) to create from ${path.relative(root, queuePath)}${DRY_RUN ? ' (dry-run)' : ''}.`);

  const token = DRY_RUN ? null : await getAccessToken();
  const results = [];
  for (const it of items) {
    const raw = buildRawMessage({
      from: ACCOUNT,
      to: it.to,
      subject: it.subject,
      inReplyTo: it.inReplyTo,
      references: it.references,
      body: it.draftBody,
    });
    if (DRY_RUN) {
      results.push({ to: it.to, classification: it.classification, status: 'dry-run' });
      console.log(`  [dry-run] would draft -> ${it.to} (${it.classification})`);
      continue;
    }
    try {
      const draft = await gmail(token, '/drafts', { method: 'POST', body: { message: { threadId: it.threadId, raw } } });
      results.push({ to: it.to, classification: it.classification, status: 'created', draftId: draft.id });
      console.log(`  created draft -> ${it.to} (${it.classification})`);
    } catch (err) {
      results.push({ to: it.to, classification: it.classification, status: 'error', error: err.message });
      console.error(`  FAILED -> ${it.to}: ${err.message}`);
    }
  }
  console.log(`Done. ${results.filter(r => r.status === 'created').length} draft(s) created. Review and send from Gmail.`);
}

// ---- entrypoint --------------------------------------------------------------

(async () => {
  requireEnv();
  try {
    if (MODE_CREATE_DRAFTS) await createDrafts();
    else await fetchReplies();
  } catch (err) {
    console.error(`outreach reply handler failed: ${err.message}`);
    process.exit(1);
  }
})();
