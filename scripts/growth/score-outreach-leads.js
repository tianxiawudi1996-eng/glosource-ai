/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { root, ensureDir, writeJsonReport, today } = require('./_utils');

const inputPath = path.join(root, 'data', 'growth', 'lead-sources.json');
const outputPath = path.join(root, 'data', 'growth', `outreach-leads-${today()}.csv`);
ensureDir(path.dirname(outputPath));

const leads = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

function scoreLead(lead) {
  let score = 0;
  const notes = [];
  if (lead.sellsKoreanProducts) { score += 30; notes.push('sells Korean products'); }
  if (lead.hasWholesaleLanguage) { score += 20; notes.push('wholesale/import language'); }
  if (lead.contactVisible) { score += 20; notes.push('contact visible'); }
  if (lead.recentLaunch) { score += 15; notes.push('recent launch'); }
  if (lead.usesMarketplace) { score += 10; notes.push('uses marketplace'); }
  if (!lead.contactVisible) { score -= 30; notes.push('no contact path'); }
  return { score, notes: notes.join('; ') };
}

const rows = leads
  .map(lead => ({ ...lead, ...scoreLead(lead) }))
  .sort((a, b) => b.score - a.score);

const headers = ['score', 'company', 'category', 'country', 'url', 'contact', 'notes'];
const csv = [
  headers.join(','),
  ...rows.map(row => headers.map(header => JSON.stringify(String(row[header] ?? ''))).join(',')),
].join('\n');

fs.writeFileSync(outputPath, csv);
const reportPath = writeJsonReport('outreach-leads', {
  status: 'pass',
  output: path.relative(root, outputPath),
  count: rows.length,
  topScore: rows[0]?.score ?? 0,
});

console.log(`Scored ${rows.length} lead(s). Report: ${reportPath}`);
