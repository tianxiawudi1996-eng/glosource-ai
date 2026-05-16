/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { root, reportDir, ensureDir, today } = require('./_utils');

ensureDir(reportDir);

const reports = fs.existsSync(reportDir)
  ? fs.readdirSync(reportDir).filter(file => file.endsWith('.json')).sort()
  : [];

const latestByPrefix = {};
for (const file of reports) {
  const prefix = file.replace(/-\d{4}-\d{2}-\d{2}\.json$/, '');
  latestByPrefix[prefix] = file;
}

const lines = [
  `# GloSource AI Weekly Growth Report`,
  '',
  `Date: ${today()}`,
  '',
  '## Automation Health',
  '',
];

for (const [prefix, file] of Object.entries(latestByPrefix).sort()) {
  const data = JSON.parse(fs.readFileSync(path.join(reportDir, file), 'utf8'));
  lines.push(`- ${prefix}: ${data.status || 'unknown'} (${file})`);
  if (Array.isArray(data.criticals) && data.criticals.length) {
    for (const issue of data.criticals.slice(0, 5)) lines.push(`  - Critical: ${issue.message}`);
  }
  if (Array.isArray(data.warnings) && data.warnings.length) {
    for (const issue of data.warnings.slice(0, 3)) lines.push(`  - Warning: ${issue.message}`);
  }
}

lines.push(
  '',
  '## Required Manual Updates',
  '',
  '- Add visits, free searches, signups, checkout clicks, paid conversions, and MRR from analytics.',
  '- Add top acquisition source and top failed queries.',
  '- Decide next experiment based on highest conversion bottleneck.',
);

const output = path.join(reportDir, `weekly-growth-report-${today()}.md`);
fs.writeFileSync(output, lines.join('\n'));
console.log(`Weekly report written: ${path.relative(root, output)}`);
