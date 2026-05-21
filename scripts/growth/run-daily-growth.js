/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync } = require('child_process');
const { writeJsonReport } = require('./_utils');

const jobs = [
  {
    id: 'growth:env',
    title: 'Growth environment preflight',
    command: ['node', ['scripts/growth/check-growth-env.js']],
    blocks: ['paid_ads', 'product_hunt_launch', 'high_volume_outbound', 'social_publishing'],
  },
  {
    id: 'growth:audit',
    title: 'English funnel and brand audit',
    command: ['node', ['scripts/growth/audit-en-funnel.js']],
    followUpCommand: ['node', ['scripts/growth/audit-brand-consistency.js']],
    blocks: ['paid_ads', 'product_hunt_launch', 'high_volume_outbound'],
  },
  {
    id: 'growth:payments',
    title: 'Payment health',
    command: ['node', ['scripts/growth/audit-polar-health.js']],
    blocks: ['paid_ads', 'product_hunt_launch', 'high_volume_outbound'],
  },
  {
    id: 'growth:cases',
    title: 'Case-study evidence extraction',
    command: ['node', ['scripts/growth/extract-case-study-candidates.js']],
    blocks: ['case_study_publication', 'testimonial_like_claims'],
  },
];

function spawnCommand(command) {
  const [cmd, args] = command;
  const result = spawnSync(cmd, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  const stdout = result.stdout ? result.stdout.trim() : '';
  const stderr = [
    result.stderr ? result.stderr.trim() : '',
    result.error ? result.error.message : '',
  ].filter(Boolean).join('\n');
  return {
    command: [cmd, ...args].join(' '),
    status: result.status,
    stdout,
    stderr,
  };
}

function runJob(job) {
  const startedAt = new Date().toISOString();
  const primary = spawnCommand(job.command);
  const followUp = primary.status === 0 && job.followUpCommand
    ? spawnCommand(job.followUpCommand)
    : null;
  const status = followUp ? followUp.status : primary.status;
  return {
    id: job.id,
    title: job.title,
    command: [primary.command, followUp?.command].filter(Boolean).join(' && '),
    startedAt,
    finishedAt: new Date().toISOString(),
    status: status === 0 ? 'pass' : 'fail',
    exitCode: status,
    blocks: status === 0 ? [] : job.blocks,
    stdout: [primary.stdout, followUp?.stdout].filter(Boolean).join('\n'),
    stderr: [primary.stderr, followUp?.stderr].filter(Boolean).join('\n'),
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
