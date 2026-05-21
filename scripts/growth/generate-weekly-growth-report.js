/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { root, reportDir, ensureDir, today } = require('./_utils');

ensureDir(reportDir);

const reportDate = today();
const reports = fs.existsSync(reportDir)
  ? fs.readdirSync(reportDir).filter(file => file.endsWith('.json')).sort()
  : [];

const latestByPrefix = {};
for (const file of reports) {
  const match = file.match(/^(.*)-(\d{4}-\d{2}-\d{2})\.json$/);
  if (!match) continue;
  const [, prefix, date] = match;
  latestByPrefix[prefix] = { file, date };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(reportDir, file), 'utf8'));
}

function staleLabel(date) {
  return date === reportDate ? 'fresh' : `stale: ${date}`;
}

function collectBlockedActions(data) {
  if (Array.isArray(data.blockedActions)) return data.blockedActions;
  if (Array.isArray(data.results)) {
    return [...new Set(data.results.flatMap(result => Array.isArray(result.blocks) ? result.blocks : []))].sort();
  }
  return [];
}

function countResultStatuses(items = []) {
  const counts = {};
  for (const item of items) {
    const status = item.status || item.post?.status || (item.ok ? 'ok' : 'unknown');
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

const lines = [
  `# GloSource AI Weekly Growth Report`,
  '',
  `Date: ${reportDate}`,
  '',
  '## Automation Health',
  '',
];

const allBlockedActions = new Set();
for (const [prefix, meta] of Object.entries(latestByPrefix).sort()) {
  const data = readJson(meta.file);
  lines.push(`- ${prefix}: ${data.status || 'unknown'} (${meta.file}; ${staleLabel(meta.date)})`);
  for (const action of collectBlockedActions(data)) allBlockedActions.add(action);
  if (Array.isArray(data.criticals) && data.criticals.length) {
    for (const issue of data.criticals.slice(0, 5)) lines.push(`  - Critical: ${issue.message}`);
  }
  if (Array.isArray(data.warnings) && data.warnings.length) {
    for (const issue of data.warnings.slice(0, 3)) lines.push(`  - Warning: ${issue.message}`);
  }
}

lines.push('', '## Automatic Evidence Summary', '');

const daily = latestByPrefix['daily-growth-run'] ? readJson(latestByPrefix['daily-growth-run'].file) : null;
if (daily) {
  lines.push(`- Daily run: ${daily.status}; failed jobs: ${(daily.failedJobs || []).join(', ') || 'none'}.`);
}

const cases = latestByPrefix['case-study-candidates'] ? readJson(latestByPrefix['case-study-candidates'].file) : null;
if (cases) {
  lines.push(`- Case-study candidates extracted: ${Number(cases.count || 0)}.`);
}

const social = latestByPrefix['social-dry-run'] ? readJson(latestByPrefix['social-dry-run'].file) : null;
if (social) {
  lines.push(`- Social dry-run: ${social.status}; failed channels: ${(social.failedChannels || []).join(', ') || 'none'}.`);
}

const buffer = latestByPrefix['buffer-launch'] ? readJson(latestByPrefix['buffer-launch'].file) : null;
if (buffer?.results) {
  const twitter = countResultStatuses(buffer.results.twitter);
  const threads = countResultStatuses(buffer.results.threads);
  const instagram = countResultStatuses(buffer.results.instagram);
  lines.push(`- Last Buffer launch: Twitter/X ${JSON.stringify(twitter)}, Threads ${JSON.stringify(threads)}, Instagram ${JSON.stringify(instagram)}.`);
}

if (allBlockedActions.size > 0) {
  lines.push('', '## Blocked Actions', '');
  for (const action of [...allBlockedActions].sort()) lines.push(`- ${action}`);
}

lines.push('', '## Operating Decision', '');

if (allBlockedActions.has('paid_ads') || allBlockedActions.has('product_hunt_launch')) {
  lines.push('- Do not run paid ads, Product Hunt launch, or high-volume outbound until payment health passes.');
}

if (social?.status === 'pass') {
  lines.push('- Social copy is previewable, but live posting should stay deliberate; rerun `npm run growth:social:dry-run` immediately before any Buffer launch.');
} else if (social) {
  lines.push('- Do not run live social launches until the social dry-run passes.');
}

if (Number(cases?.count || 0) === 0) {
  lines.push('- Do not publish testimonials, case studies, or proof claims from this run; no approved evidence candidates were found.');
}

const envPreflight = latestByPrefix['growth-env-preflight'] ? readJson(latestByPrefix['growth-env-preflight'].file) : null;
if (envPreflight?.instagramAssetMode === 'default-logo-fallback') {
  lines.push('- Instagram can post with the public logo fallback, but branded/generated image hosting still needs `GITHUB_TOKEN`/`GITHUB_OWNER` or `INSTAGRAM_IMAGE_URL`.');
}

if (latestByPrefix['buffer-launch']?.date !== reportDate) {
  lines.push('- Last live Buffer launch is not from today; treat it as historical evidence, not proof that today has been published.');
}

lines.push(
  '',
  '## Required Manual Updates',
  '',
  '- Add visits, free searches, signups, checkout clicks, paid conversions, and MRR from analytics.',
  '- Add top acquisition source and top failed queries.',
  '- Decide next experiment based on highest conversion bottleneck.',
);

const output = path.join(reportDir, `weekly-growth-report-${reportDate}.md`);
fs.writeFileSync(output, lines.join('\n'));
console.log(`Weekly report written: ${path.relative(root, output)}`);
