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
      `# SEO + GEO Editorial Brief: ${keyword}`,
      '',
      `Cluster: ${cluster.cluster}`,
      `Primary intent: ${cluster.intent}`,
      `Target URL: /en/blog/${slug}`,
      '',
      '## SEO + GEO buyer-first article outline',
      '- Descriptive H1 and metadata title matched to the buyer question (avoid keyword stuffing).',
      '- In the first paragraph, answer the main buyer question accurately in plain English.',
      '- Buyer problem and who this guidance is for (importer, brand owner, procurement manager).',
      '- Korean sourcing channels to check, with official source links where available.',
      '- OEM versus ODM, MOQ and RFQ requirements: define terms and show practical steps.',
      '- Certification or trust signals: clearly separate registry-confirmed facts, curated information, URL matches, and AI estimates.',
      '- Practical comparison table, only if the facts and methodology can be substantiated.',
      '- A short FAQ with direct, accurate answers to genuine buyer questions.',
      '- RFQ checklist and common supplier-vetting red flags.',
      '- Original useful detail (e.g. buyer checklist or independently substantiated comparison) beyond generic AI summaries.',
      '- Internal link to related sourcing articles and a relevant non-deceptive product CTA.',
      '',
      '## Technical SEO checks',
      '- Use a single canonical URL at the GloSource AI /en/blog/{slug} article.',
      '- Check indexability, crawlable HTML, internal links and inclusion in the published-blog sitemap.',
      '- Keep title, description, headings, body, and BlogPosting structured data consistent.',
      '- Verify dates, author/publisher information and links; update publication dates only when justified.',
      '',
      '## GEO / AI-answer discoverability checks',
      '- Write concise factual answers supported by visible evidence, not fabricated facts or keyword variants.',
      '- Link to primary sources for regulations, certifications and claims; provide source URLs in the article.',
      '- Explain entities and business terminology unambiguously in normal, accessible HTML.',
      '- Check robots.txt and CDN rules: public articles must be crawlable for search; independently review OAI-SearchBot access if targeting ChatGPT search.',
      '- No special GEO schema or llms.txt is required for Google AI search; do not promise AI mentions or citation rankings.',
      '- Do not publish mass-produced near-duplicates or unsupported claims.',
      '',
      '## Cross-channel distribution — draft only',
      '- GloSource AI original article remains the canonical, authoritative source.',
      '- Draft a distinctly useful Blogger summary with a linked source attribution and UTM-tagged URL; do not repost the full article by default.',
      '- Draft a LinkedIn post adapted for founders and purchasing managers; include a clearly labeled original URL.',
      '- Never auto-publish, auto-DM, connect third-party accounts or pay without human approval.',
      '',
      '## Evidence and release gates',
      '- Cite market numbers and sensitive factual claims with source URLs and access dates.',
      '- Do not claim suppliers or certificates are verified without corresponding provenance; URL match alone is not factory verification.',
      '- Label simulations, AI estimates, demos and unknown MOQ explicitly.',
      '- Review English factual accuracy and usefulness before publication.',
      '- Inspect actual Search Console/Bing Webmaster indexing and AI citations over time; zero citations does not prove technical failure.',
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
