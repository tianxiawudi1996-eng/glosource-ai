/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { root, ensureDir, writeJsonReport, today } = require('./_utils');

const inputPath = path.join(root, 'data', 'growth', 'lead-sources.json');
const outputPath = path.join(root, 'data', 'growth', `outreach-leads-${today()}.csv`);
ensureDir(path.dirname(outputPath));

const leads = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// ICP question the score answers: "Does this entity NEED to find Korean suppliers?"
// A buyer exploring Korea = strong fit. An established distributor/exporter that already
// sources Korea directly = weak fit (they already solved the problem GloSource solves).
// This is the BLIFE USA lesson: being in the K-beauty space != needing supplier discovery.
function scoreLead(lead) {
  let score = 0;
  const notes = [];

  // Intent / fit signals (positive)
  if (lead.exploringKoreanSuppliers) { score += 35; notes.push('actively exploring Korean suppliers'); }
  if (lead.isBuyerOrReseller) { score += 15; notes.push('buyer/reseller, not an operator'); }
  if (lead.sellsKoreanProducts) { score += 20; notes.push('sells Korean products'); }
  if (lead.recentLaunch) { score += 15; notes.push('recent launch (supply not locked)'); }
  if (lead.hasWholesaleLanguage) { score += 10; notes.push('wholesale/import language'); }
  if (lead.usesMarketplace) { score += 10; notes.push('uses marketplace'); }
  if (lead.contactVisible) { score += 15; notes.push('contact visible'); }
  else { score -= 25; notes.push('no contact path'); }

  // Anti-fit signals (negative) — the targeting fix
  if (lead.alreadySourcesKoreaDirect) { score -= 45; notes.push('ALREADY sources Korea directly (weak fit)'); }
  if (lead.isSourcingOperatorOrExporter) { score -= 35; notes.push('sourcing operator/exporter (peer, not customer)'); }

  const poorFit = Boolean(lead.alreadySourcesKoreaDirect || lead.isSourcingOperatorOrExporter);
  const fitTier = poorFit ? 'poor' : score >= 60 ? 'strong' : score >= 30 ? 'maybe' : 'weak';
  return { score, fitTier, poorFit, notes: notes.join('; ') };
}

const rows = leads
  .map(lead => ({ ...lead, ...scoreLead(lead) }))
  // Poor-fit always sinks to the bottom regardless of raw points; then by score desc.
  .sort((a, b) => (a.poorFit - b.poorFit) || (b.score - a.score));

const headers = ['score', 'fitTier', 'company', 'category', 'country', 'url', 'contact', 'notes'];
const csv = [
  headers.join(','),
  ...rows.map(row => headers.map(header => JSON.stringify(String(row[header] ?? ''))).join(',')),
].join('\n');

fs.writeFileSync(outputPath, csv);

const tierCounts = rows.reduce((acc, row) => { acc[row.fitTier] = (acc[row.fitTier] || 0) + 1; return acc; }, {});
const reportPath = writeJsonReport('outreach-leads', {
  status: 'pass',
  output: path.relative(root, outputPath),
  count: rows.length,
  topScore: rows[0]?.score ?? 0,
  tierCounts,
  poorFitExcluded: rows.filter(r => r.poorFit).map(r => r.company),
});

console.log(`Scored ${rows.length} lead(s). Tiers: ${JSON.stringify(tierCounts)}. Report: ${reportPath}`);
for (const row of rows) console.log(`  [${row.fitTier}] ${row.score} ${row.company}`);
