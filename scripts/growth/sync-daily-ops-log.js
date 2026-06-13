/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { root, reportDir, ensureDir, today, loadEnvLocal, writeJsonReport, failIfCritical } = require('./_utils');

ensureDir(reportDir);

const env = { ...process.env, ...loadEnvLocal() };
const reportDate = process.argv[2] || today();
const criticals = [];
const warnings = [];

function readJsonReport(prefix) {
  const file = path.join(reportDir, `${prefix}-${reportDate}.json`);
  if (!fs.existsSync(file)) return null;
  return {
    file: path.relative(root, file).replace(/\\/g, '/'),
    data: JSON.parse(fs.readFileSync(file, 'utf8')),
  };
}

function readMarkdownReport(prefix) {
  const file = path.join(reportDir, `${prefix}-${reportDate}.md`);
  if (!fs.existsSync(file)) return null;
  return {
    file: path.relative(root, file).replace(/\\/g, '/'),
    text: fs.readFileSync(file, 'utf8'),
  };
}

function countStatuses(posts = []) {
  const counts = {};
  for (const post of posts) {
    const status = post.status || post.post?.status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

function statusLine(label, report) {
  if (!report) return `- ${label}: missing`;
  return `- ${label}: ${report.data.status || 'unknown'} (${report.file})`;
}

function buyerLine(report) {
  if (!report) return '- Buyer activity: missing';
  const summary = report.data.summary || {};
  return [
    '- Buyer activity:',
    `users 24h ${summary.users_24h ?? 'n/a'}`,
    `searches 24h ${summary.searches_24h ?? 'n/a'}`,
    `payments 24h ${summary.payments_24h ?? 'n/a'}`,
    `active subscriptions ${summary.active_subscriptions ?? 'n/a'}`,
    `(${report.file})`,
  ].join(' ');
}

function bufferLine(report) {
  if (!report) return '- Buffer launch audit: missing';
  const posts = Array.isArray(report.data.posts) ? report.data.posts : [];
  const byChannel = {};
  for (const post of posts) {
    if (!byChannel[post.channel]) byChannel[post.channel] = [];
    byChannel[post.channel].push(post);
  }
  const chunks = Object.entries(byChannel).map(([channel, channelPosts]) => (
    `${channel} ${JSON.stringify(countStatuses(channelPosts))}`
  ));
  return `- Buffer launch audit: ${report.data.status || 'unknown'}; ${chunks.join(', ') || 'no posts'} (${report.file})`;
}

function collectIssues(...reports) {
  const issues = [];
  for (const report of reports.filter(Boolean)) {
    for (const issue of report.data.criticals || []) issues.push(`Critical: ${issue.message}`);
    for (const issue of report.data.warnings || []) issues.push(`Warning: ${issue.message}`);
  }
  return issues;
}

const scheduled = readJsonReport('scheduled-growth-run');
const daily = readJsonReport('daily-growth-run');
const buyer = readJsonReport('buyer-activity');
const payment = readJsonReport('payment-health');
const dummyPayment = readJsonReport('polar-webhook-dummy-test');
const acquisition = readJsonReport('acquisition-readiness');
const bufferAudit = readJsonReport('buffer-launch-audit');
const weekly = readMarkdownReport('weekly-growth-report');

const issueLines = collectIssues(scheduled, daily, payment, dummyPayment, acquisition, bufferAudit);
const lines = [
  `# GloSource AI Daily Ops Log - ${reportDate}`,
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Summary',
  '',
  statusLine('Scheduled growth run', scheduled),
  statusLine('Daily funnel/payment gate', daily),
  statusLine('Payment health', payment),
  statusLine('Polar dummy webhook', dummyPayment),
  statusLine('Acquisition readiness', acquisition),
  buyerLine(buyer),
  bufferLine(bufferAudit),
  weekly ? `- Weekly report: ${weekly.file}` : '- Weekly report: missing',
  '',
  '## Issues To Watch',
  '',
  ...(issueLines.length ? issueLines.map(line => `- ${line}`) : ['- None from collected reports.']),
  '',
  '## Manual Follow-Up',
  '',
  '- Check analytics for visits, free searches, signups, checkout clicks, paid conversions, and MRR.',
  '- Post LinkedIn manually when Buffer LinkedIn requires an upgrade.',
  '- Do not publish testimonials or case studies without approved real evidence.',
  '',
];

const markdownPath = path.join(reportDir, `daily-ops-log-${reportDate}.md`);
fs.writeFileSync(markdownPath, lines.join('\n'));

const outboxRoot = path.join(reportDir, 'outbox');
const slackOutboxDir = path.join(outboxRoot, 'slack');
const notionOutboxDir = path.join(outboxRoot, 'notion');
const defaultObsidianDir = path.join(root, 'ops', 'obsidian', 'GloSource AI', 'Daily Ops');

const synced = {
  localMarkdown: path.relative(root, markdownPath).replace(/\\/g, '/'),
  obsidian: null,
  slack: null,
  notion: {
    status: 'pending',
    source: path.relative(root, markdownPath).replace(/\\/g, '/'),
  },
};

const obsidianDir = env.OBSIDIAN_GLOSOURCE_LOG_DIR || env.OBSIDIAN_VAULT_GLOSOURCE_DIR || defaultObsidianDir;
try {
  ensureDir(obsidianDir);
  const obsidianPath = path.join(obsidianDir, `GloSource AI Daily Ops ${reportDate}.md`);
  fs.copyFileSync(markdownPath, obsidianPath);
  synced.obsidian = {
    status: 'pass',
    path: obsidianPath,
    mode: obsidianDir === defaultObsidianDir ? 'default_workspace_vault' : 'configured_vault',
  };
} catch (error) {
  criticals.push({ file: 'OBSIDIAN_GLOSOURCE_LOG_DIR', message: error.message });
  synced.obsidian = { status: 'fail', error: error.message };
}

async function postSlack() {
  const webhookUrl = env.SLACK_GLOSOURCE_WEBHOOK_URL || env.SLACK_WEBHOOK_URL;
  const text = [
    `GloSource AI daily ops log - ${reportDate}`,
    statusLine('Scheduled growth run', scheduled).replace(/^- /, ''),
    buyerLine(buyer).replace(/^- /, ''),
    bufferLine(bufferAudit).replace(/^- /, ''),
    `Report: ${synced.localMarkdown}`,
  ].join('\n');

  if (!webhookUrl) {
    ensureDir(slackOutboxDir);
    const outboxPath = path.join(slackOutboxDir, `glosource-daily-ops-${reportDate}.json`);
    fs.writeFileSync(outboxPath, JSON.stringify({
      channel: 'glosource-growth',
      text,
      createdAt: new Date().toISOString(),
      reason: 'SLACK_GLOSOURCE_WEBHOOK_URL is not configured.',
    }, null, 2));
    synced.slack = {
      status: 'outbox_created',
      path: path.relative(root, outboxPath).replace(/\\/g, '/'),
    };
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error(`Slack webhook returned ${response.status}`);
    synced.slack = { status: 'pass' };
  } catch (error) {
    criticals.push({ file: 'SLACK_GLOSOURCE_WEBHOOK_URL', message: error.message });
    synced.slack = { status: 'fail', error: error.message };
  }
}

postSlack().finally(() => {
  ensureDir(notionOutboxDir);
  const notionOutboxPath = path.join(notionOutboxDir, `glosource-daily-ops-${reportDate}.md`);
  fs.copyFileSync(markdownPath, notionOutboxPath);
  synced.notion = {
    status: 'outbox_created',
    path: path.relative(root, notionOutboxPath).replace(/\\/g, '/'),
    note: 'Create or update the Notion page from this Markdown when connector/API credentials are available.',
  };

  const reportPath = writeJsonReport('daily-ops-sync', {
    status: criticals.length ? 'fail' : 'pass',
    reportDate,
    synced,
    warnings,
    criticals,
  });

  console.log(`Daily ops log written: ${synced.localMarkdown}`);
  if (synced.obsidian?.path) console.log(`Obsidian copy written: ${synced.obsidian.path}`);
  if (synced.slack?.status === 'pass') console.log('Slack sync sent.');
  failIfCritical(reportPath, criticals);
});
