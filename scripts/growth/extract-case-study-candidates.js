/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { root, ensureDir, writeJsonReport } = require('./_utils');

const inputPath = path.join(root, 'data', 'growth', 'history-export.json');
const outputPath = path.join(root, 'data', 'growth', 'case-study-candidates.json');

ensureDir(path.dirname(outputPath));

const examples = fs.existsSync(inputPath)
  ? JSON.parse(fs.readFileSync(inputPath, 'utf8'))
  : [];

const candidates = examples
  .filter(entry => entry?.raw?.qualityGate?.acceptedCount > 0 || entry?.raw?.suppliers?.some(s => s.verificationStatus === 'grounding_confirmed' && s.url))
  .map((entry, index) => {
    const raw = entry.raw || {};
    const suppliers = raw.suppliers || [];
    const product = entry.query?.product || entry.query?.productDescription || entry.query?.keyword || 'Unknown product';
    const verifiedCount = raw.qualityGate?.acceptedCount ?? suppliers.filter(s => s.verificationStatus === 'grounding_confirmed' && s.url).length;
    return {
      id: `case-candidate-${String(index + 1).padStart(3, '0')}`,
      status: 'draft',
      product,
      source: entry.source || 'unknown',
      buyerType: 'unknown',
      market: 'unknown',
      verifiedSupplierCount: verifiedCount,
      platforms: [...new Set(suppliers.map(s => s.platform).filter(Boolean))],
      hasRfq: Boolean(raw.rfqEmail?.en),
      limitations: [
        'GloSource AI did not audit the suppliers.',
        'Buyer must confirm certificates, samples, pricing, and compliance directly.',
      ],
      evidencePolicy: 'Only publish after human approval; label as demo unless real user permission exists.',
    };
  });

fs.writeFileSync(outputPath, JSON.stringify(candidates, null, 2));
const reportPath = writeJsonReport('case-study-candidates', {
  status: 'pass',
  input: path.relative(root, inputPath),
  output: path.relative(root, outputPath),
  count: candidates.length,
});

console.log(`Extracted ${candidates.length} case-study candidate(s). Report: ${reportPath}`);
