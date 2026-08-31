/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');
const { loadEnvLocal } = require('./_utils');

const env = { ...loadEnvLocal(), ...process.env };
const apply = process.argv.includes('--apply');
const products = [
  {
    envKey: 'POLAR_STARTER_PRODUCT_ID',
    description: '40 supplier shortlist searches per month.\nKorean manufacturer research with registry evidence and English RFQ drafts.',
  },
  {
    envKey: 'POLAR_PRO_PRODUCT_ID',
    description: '100 supplier shortlist searches per month.\nFull PDF reports, saved comparisons, and priority support.',
  },
  {
    envKey: 'POLAR_AGENCY_PRODUCT_ID',
    description: '300 supplier shortlist searches per month.\nHigh-volume sourcing with CSV/PDF export and project history.',
  },
];

function updateDescription(productId, description, token) {
  return new Promise(resolve => {
    const body = JSON.stringify({ description });
    const req = https.request(`https://api.polar.sh/v1/products/${productId}`, {
      method: 'PATCH',
      timeout: 15000,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => resolve({
        ok: res.statusCode >= 200 && res.statusCode < 300,
        status: res.statusCode,
        responseBody,
      }));
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 0, responseBody: 'timeout' });
    });
    req.on('error', error => resolve({ ok: false, status: 0, responseBody: error.message }));
    req.write(body);
    req.end();
  });
}

function safeError(responseBody) {
  try {
    const parsed = JSON.parse(responseBody);
    return parsed.detail || parsed.error_description || parsed.error || 'Polar rejected the update.';
  } catch {
    return 'Polar rejected the update.';
  }
}

(async () => {
  const missing = [
    ...products.filter(product => !env[product.envKey]).map(product => product.envKey),
    ...(!env.POLAR_ACCESS_TOKEN ? ['POLAR_ACCESS_TOKEN'] : []),
  ];
  if (missing.length) {
    throw new Error(`Missing required environment values: ${missing.join(', ')}`);
  }

  if (!apply) {
    console.log('Dry run: 3 Polar product descriptions are ready to sync. Re-run with --apply to update them.');
    return;
  }

  for (const product of products) {
    const result = await updateDescription(
      env[product.envKey],
      product.description,
      env.POLAR_ACCESS_TOKEN,
    );
    if (!result.ok) {
      throw new Error(`${product.envKey} update failed (${result.status}): ${safeError(result.responseBody)}`);
    }
    console.log(`${product.envKey}: updated`);
  }
})();
