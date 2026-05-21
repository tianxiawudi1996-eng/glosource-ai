/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { root } = require('./_utils');

const schedulePath = path.join(root, 'data', 'growth', 'automation-schedule.json');
const schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: schedule.timezone,
  weekday: 'long',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const todayParts = formatter.formatToParts(new Date());
const todayDay = todayParts.find(part => part.type === 'weekday').value;

function isDueToday(item) {
  if (item.cadence === 'daily') return true;
  if (item.cadence === 'weekly') return item.dayOfWeek === todayDay;
  return false;
}

function printItem(item) {
  const when = [item.dayOfWeek, item.time].filter(Boolean).join(' ');
  console.log(`\n${item.id}: ${item.title}`);
  console.log(`Cadence: ${item.cadence}${when ? ` (${when})` : ''}`);
  console.log('Commands:');
  for (const command of item.commands) console.log(`  - ${command}`);
  if (item.blocks.length) {
    console.log('Blocks when failing:');
    for (const block of item.blocks) console.log(`  - ${block}`);
  }
  console.log(`Human review: ${item.humanReview}`);
}

console.log(`GloSource AI automation schedule (${schedule.timezone})`);
console.log(`Today: ${todayDay}`);

const dueToday = schedule.cadences.filter(isDueToday);
console.log(`\nDue today: ${dueToday.length}`);
for (const item of dueToday) printItem(item);

const manual = schedule.cadences.filter(item => item.cadence === 'manual');
if (manual.length) {
  console.log('\nManual gates:');
  for (const item of manual) printItem(item);
}
