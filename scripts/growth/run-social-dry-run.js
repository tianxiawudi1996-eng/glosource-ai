/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync } = require('child_process');
const { writeJsonReport } = require('./_utils');

const jobs = [
  {
    id: 'twitter',
    command: ['node', ['scripts/growth/twitter-launch.js', '--dry-run']],
  },
  {
    id: 'threads',
    command: ['node', ['scripts/growth/threads-launch.js', '--dry-run']],
  },
  {
    id: 'instagram',
    command: ['node', ['scripts/growth/instagram-launch.js', '--dry-run']],
  },
];

function runJob(job) {
  let [cmd, args] = job.command;
  if (process.platform === 'win32' && cmd === 'npm') cmd = 'npm.cmd';
  const startedAt = new Date().toISOString();
  const result = spawnSync(cmd, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  return {
    id: job.id,
    command: [cmd, ...args].join(' '),
    startedAt,
    finishedAt: new Date().toISOString(),
    status: result.status === 0 ? 'pass' : 'fail',
    exitCode: result.status,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

const results = jobs.map(runJob);
const failed = results.filter(result => result.status === 'fail');
const reportPath = writeJsonReport('social-dry-run', {
  status: failed.length ? 'partial_or_failed' : 'pass',
  failedChannels: failed.map(result => result.id),
  results,
});

for (const result of results) {
  const marker = result.status === 'pass' ? 'PASS' : 'FAIL';
  console.log(`[${marker}] ${result.id}`);
  if (result.stdout) console.log(result.stdout);
  if (result.stderr) console.error(result.stderr);
}

console.log(`Social dry-run report: ${reportPath}`);

if (failed.length > 0) {
  console.error(`Social dry-run completed with ${failed.length} failed channel(s).`);
  process.exit(1);
}
