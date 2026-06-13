/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { root, writeJsonReport } = require('./_utils');

const schedulePath = path.join(root, 'data', 'growth', 'automation-schedule.json');
const schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));

const args = new Set(process.argv.slice(2));
const includeManual = args.has('--include-manual');
const includeWeekly = args.has('--include-weekly');
const skipOpsSync = args.has('--skip-ops-sync');

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: schedule.timezone,
  weekday: 'long',
});
const todayDay = formatter.format(new Date());

function isDueToday(item) {
  if (item.cadence === 'daily') return true;
  if (item.cadence === 'weekly') return includeWeekly || item.dayOfWeek === todayDay;
  if (item.cadence === 'manual') return includeManual;
  return false;
}

function runCommand(command) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, {
    cwd: root,
    encoding: 'utf8',
    shell: true,
  });
  const stdout = result.stdout ? result.stdout.trim() : '';
  const stderr = [
    result.stderr ? result.stderr.trim() : '',
    result.error ? result.error.message : '',
  ].filter(Boolean).join('\n');

  return {
    command,
    startedAt,
    finishedAt: new Date().toISOString(),
    status: result.status === 0 ? 'pass' : 'fail',
    exitCode: result.status,
    stdout,
    stderr,
  };
}

const dueItems = schedule.cadences.filter(isDueToday);
const itemResults = [];

console.log(`GloSource AI scheduled growth run (${schedule.timezone})`);
console.log(`Today: ${todayDay}`);
console.log(`Due items: ${dueItems.length}`);

for (const item of dueItems) {
  console.log(`\n== ${item.id}: ${item.title} ==`);
  const commandResults = [];
  for (const command of item.commands) {
    console.log(`$ ${command}`);
    const result = runCommand(command);
    commandResults.push(result);
    console.log(`[${result.status.toUpperCase()}] ${command}`);
    if (result.stdout) console.log(result.stdout);
    if (result.stderr) console.error(result.stderr);
  }

  const failedCommands = commandResults.filter(result => result.status === 'fail');
  itemResults.push({
    id: item.id,
    title: item.title,
    cadence: item.cadence,
    dayOfWeek: item.dayOfWeek || null,
    humanReview: item.humanReview,
    status: failedCommands.length ? 'fail' : 'pass',
    blocks: failedCommands.length ? item.blocks : [],
    commands: commandResults,
  });
}

const failedItems = itemResults.filter(item => item.status === 'fail');
const blockedActions = [...new Set(failedItems.flatMap(item => item.blocks))].sort();
const reportPath = writeJsonReport('scheduled-growth-run', {
  status: failedItems.length ? 'partial_or_failed' : 'pass',
  timezone: schedule.timezone,
  todayDay,
  includeManual,
  includeWeekly,
  skipOpsSync,
  failedItems: failedItems.map(item => item.id),
  blockedActions,
  results: itemResults,
});

console.log(`\nScheduled growth report: ${reportPath}`);

const shouldSyncOpsLog = !skipOpsSync && dueItems.some(item => item.id === 'daily-ops-log-sync');
if (shouldSyncOpsLog) {
  console.log('\n== post-run: Daily ops log sync ==');
  const syncResult = runCommand('npm run growth:ops:sync');
  console.log(`[${syncResult.status.toUpperCase()}] npm run growth:ops:sync`);
  if (syncResult.stdout) console.log(syncResult.stdout);
  if (syncResult.stderr) console.error(syncResult.stderr);
  if (syncResult.status === 'fail') {
    console.error('Post-run daily ops log sync failed.');
    process.exit(1);
  }
}

if (failedItems.length > 0) {
  console.error(`Scheduled growth run completed with ${failedItems.length} failed item(s).`);
  process.exit(1);
}
