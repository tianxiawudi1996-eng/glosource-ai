/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { root, ensureDir, writeJsonReport } = require('./_utils');

const inputPath = path.join(root, 'data', 'growth', 'seo-keywords.json');
const outputDir = path.join(root, 'reports', 'growth', 'seo-briefs');
ensureDir(outputDir);

const clusters = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const generated = [];

for (const cluster of clusters) {
  for (const keyword of cluster.keywords) {
    const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const brief = [
      `# SEO Brief: ${keyword}`,
      '',
      `Cluster: ${cluster.cluster}`,
      `Primary intent: ${cluster.intent}`,
      `Target URL: /en/blog/${slug}`,
      '',
      '## Required Sections',
      '- Buyer problem and why it matters',
      '- Korean sourcing channels to check',
      '- Certification or trust signals',
      '- RFQ checklist',
      '- Common red flags',
      '- CTA: Run a free GloSource AI supplier search',
      '',
      '## Evidence Rules',
      '- Cite market numbers with source URLs.',
      '- Do not claim suppliers are verified unless a source URL passed the quality gate.',
      '- Label demos clearly.',
    ].join('\n');
    const file = path.join(outputDir, `${slug}.md`);
    fs.writeFileSync(file, brief);
    generated.push(path.relative(root, file));
  }
}

const reportPath = writeJsonReport('seo-briefs', {
  status: 'pass',
  generatedCount: generated.length,
  generated,
});

console.log(`Generated ${generated.length} SEO brief(s). Report: ${reportPath}`);
