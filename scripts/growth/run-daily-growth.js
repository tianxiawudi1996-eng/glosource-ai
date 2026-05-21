/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync } = require('child_process');
const { writeJsonReport } = require('./_utils');

const jobs = [
  {
    id: 'growth:audit',
    title: 'English funnel and brand audit',
    command: ['npm', ['run', 'growth:audit']],
    blocks: ['paid_ads', 'product_hunt_launch', 'high_volume_outbound'],
  },
  {
    id: 'growth:payments',
    title: 'Payment health',
    command: ['npm', ['run', 'growth:payments']],
    blocks: ['paid_ads', 'product_hunt_launch', 'high_volume_outbound'],
  },
  {
    id: 'growth:cases',
    title: 'Case-study evidence extraction',
    command: ['npm', ['run', 'growth:cases']],
    blocks: ['case_study_publication', 'testimonial_like_claims'],
  },
];

function runJob(job) {
  const [cmd, args] = job.command;
  const startedAt = new Date().toISOString();
  const result = spawnSync(cmd, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  return {
    id: job.id,
    title: job.title,
    command: [cmd, ...args].join(' '),
    startedAt,
    finishedAt: new Date().toISOString(),
    status: result.status === 0 ? 'pass' : 'fail',
    exitCode: result.status,
    blocks: result.status === 0 ? [] : job.blocks,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

const results = jobs.map(runJob);
const failed = results.filter(job => job.status === 'fail');
const blockedActions = [...new Set(failed.flatMap(job => job.blocks))].sort();
const reportPath = writeJsonReport('daily-growth-run', {
  status: failed.length ? 'partial_or_failed' : 'pass',
  failedJobs: failed.map(job => job.id),
  blockedActions,
  results,
});

for (const result of results) {
  const marker = result.status === 'pass' ? 'PASS' : 'FAIL';
  console.log(`[${marker}] ${result.id}`);
  if (result.stdout) console.log(result.stdout);
  if (result.stderr) console.error(result.stderr);
}

console.log(`Daily growth report: ${reportPath}`);

if (failed.length > 0) {
  console.error(`Daily growth run completed with ${failed.length} failed job(s).`);
  process.exit(1);
}
