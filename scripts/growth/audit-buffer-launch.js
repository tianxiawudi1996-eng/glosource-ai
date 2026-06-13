/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { reportDir, today, writeJsonReport, failIfCritical } = require('./_utils');

function readReport(prefix, date) {
  const file = path.join(reportDir, `${prefix}-${date}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function collectPosts(report, channel) {
  if (!report) return [];
  if (Array.isArray(report.results)) {
    return report.results.map(result => ({
      channel,
      id: result.post?.id || result.id || null,
      status: result.post?.status || result.status || 'unknown',
      index: result.index || null,
    }));
  }
  if (report.results?.[channel]) {
    return report.results[channel].map((post, index) => ({
      channel,
      id: post?.id || null,
      status: post?.status || 'unknown',
      index: index + 1,
    }));
  }
  return [];
}

const reportDate = process.argv[2] || today();
const criticals = [];
const warnings = [];

const twitter = readReport('buffer-twitter-launch', reportDate);
const threads = readReport('buffer-threads-launch', reportDate);
const instagram = readReport('buffer-instagram-launch', reportDate);
const linkedin = readReport('buffer-linkedin-launch', reportDate);
const combined = readReport('buffer-launch', reportDate);

const posts = [
  ...collectPosts(twitter, 'twitter'),
  ...collectPosts(threads, 'threads'),
  ...collectPosts(instagram, 'instagram'),
  ...collectPosts(linkedin, 'linkedin'),
];

if (posts.length === 0) {
  criticals.push({ file: 'reports/growth', message: `No Buffer live launch report found for ${reportDate}.` });
}

for (const post of posts) {
  if (!post.id) {
    criticals.push({ file: 'reports/growth', message: `${post.channel} post ${post.index || ''} has no Buffer post id.` });
    continue;
  }
  if (post.status === 'error' || post.status === 'not_published' || post.status === 'failed') {
    criticals.push({ file: 'reports/growth', message: `${post.channel} post ${post.id} is ${post.status}. Reconnect the channel in Buffer and repost manually.` });
  } else if (!['sent', 'scheduled', 'sending', 'published'].includes(post.status)) {
    warnings.push({ file: 'reports/growth', message: `${post.channel} post ${post.id} has unrecognized Buffer status: ${post.status}. Check Buffer UI.` });
  } else if (post.status === 'scheduled') {
    warnings.push({ file: 'reports/growth', message: `${post.channel} post ${post.id} is queued, not yet live.` });
  }
}

if (combined?.summary?.instagram?.usedFallbackImage) {
  warnings.push({
    file: `buffer-launch-${reportDate}.json`,
    message: 'Instagram used fallback logo image; connect GITHUB_TOKEN/GITHUB_OWNER or INSTAGRAM_IMAGE_URL for branded creatives.',
  });
}

const reportPath = writeJsonReport('buffer-launch-audit', {
  status: criticals.length ? 'fail' : 'pass',
  reportDate,
  posts,
  criticals,
  warnings,
});

failIfCritical(reportPath, criticals);
