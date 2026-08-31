/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');
const { loadEnvLocal, writeJsonReport, failIfCritical } = require('./_utils');

const env = { ...loadEnvLocal(), ...process.env };
const criticals = [];
const warnings = [];

const checkoutKeys = [
  'NEXT_PUBLIC_POLAR_STARTER_LINK',
  'NEXT_PUBLIC_POLAR_PRO_LINK',
  'NEXT_PUBLIC_POLAR_AGENCY_LINK',
];
const productKeys = [
  'POLAR_STARTER_PRODUCT_ID',
  'POLAR_PRO_PRODUCT_ID',
  'POLAR_AGENCY_PRODUCT_ID',
];
const expectedProducts = {
  POLAR_STARTER_PRODUCT_ID: {
    name: 'GloSource Starter',
    monthlyAmount: 3900,
    description: '40 supplier shortlist searches per month.\nKorean manufacturer research with registry evidence and English RFQ drafts.',
  },
  POLAR_PRO_PRODUCT_ID: {
    name: 'GloSource Pro',
    monthlyAmount: 9900,
    description: '100 supplier shortlist searches per month.\nFull PDF reports, saved comparisons, and priority support.',
  },
  POLAR_AGENCY_PRODUCT_ID: {
    name: 'GloSource Business',
    monthlyAmount: 24900,
    description: '300 supplier shortlist searches per month.\nHigh-volume sourcing with CSV/PDF export and project history.',
  },
};

function requestHead(url) {
  return new Promise(resolve => {
    const req = https.request(url, { method: 'HEAD', timeout: 15000 }, res => {
      res.resume();
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, location: res.headers.location || '' });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 0, error: 'timeout' });
    });
    req.on('error', error => resolve({ ok: false, status: 0, error: error.message }));
    req.end();
  });
}

function requestPolarProduct(id, token) {
  return new Promise(resolve => {
    const req = https.request(`https://api.polar.sh/v1/products/${id}`, {
      method: 'GET',
      timeout: 15000,
      headers: { Authorization: `Bearer ${token}` },
    }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body }));
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 0, error: 'timeout' });
    });
    req.on('error', error => resolve({ ok: false, status: 0, error: error.message }));
    req.end();
  });
}

function summarizePolarProduct(result) {
  if (!result.body) return null;
  try {
    const product = JSON.parse(result.body);
    const prices = Array.isArray(product.prices)
      ? product.prices.map(price => ({
        amountType: price.amount_type,
        amount: price.price_amount,
        currency: price.price_currency,
        interval: price.recurring_interval,
        archived: Boolean(price.is_archived),
      }))
      : [];
    return {
      name: product.name,
      description: product.description || '',
      archived: Boolean(product.is_archived),
      prices,
    };
  } catch {
    return null;
  }
}

function validatePolarProduct(key, summary) {
  const expected = expectedProducts[key];
  if (!expected || !summary) return [`${key} returned an unreadable product payload.`];

  const errors = [];
  if (summary.name !== expected.name) {
    errors.push(`${key} is named "${summary.name}", expected "${expected.name}".`);
  }
  if (summary.description !== expected.description) {
    errors.push(`${key} description does not match the live plan quota and trust contract.`);
  }
  if (summary.archived) {
    errors.push(`${key} points to an archived product.`);
  }

  const matchingPrice = summary.prices.find(price => (
    !price.archived
    && price.amountType === 'fixed'
    && price.amount === expected.monthlyAmount
    && String(price.currency).toLowerCase() === 'usd'
    && price.interval === 'month'
  ));
  if (!matchingPrice) {
    errors.push(`${key} has no active monthly USD price matching $${expected.monthlyAmount / 100}.`);
  }
  return errors;
}

function describePolarError(result) {
  if (!result.body) return '';
  try {
    const parsed = JSON.parse(result.body);
    const code = parsed.error ? ` Polar error: ${parsed.error}.` : '';
    const description = parsed.error_description ? ` ${parsed.error_description}` : '';
    return `${code}${description}`.trim();
  } catch {
    return ` Polar response: ${result.body}`;
  }
}

(async () => {
  const checkoutResults = [];
  for (const key of checkoutKeys) {
    const value = env[key];
    if (!value) {
      criticals.push({ file: '.env.local', message: `${key} is missing.` });
      continue;
    }
    let parsed;
    try {
      parsed = new URL(value);
    } catch {
      criticals.push({ file: '.env.local', message: `${key} is not a valid URL.` });
      continue;
    }
    if (!['buy.polar.sh', 'polar.sh'].includes(parsed.hostname)) {
      warnings.push({ file: '.env.local', message: `${key} host is ${parsed.hostname}, expected Polar checkout host.` });
    }
    const result = await requestHead(value);
    checkoutResults.push({ key, host: parsed.hostname, ...result });
    if (!result.ok) {
      criticals.push({ file: '.env.local', message: `${key} checkout URL is not reachable. Status: ${result.status || result.error}` });
    }
  }

  for (const key of productKeys) {
    if (!env[key]) criticals.push({ file: '.env.local', message: `${key} is missing.` });
  }
  if (!env.POLAR_WEBHOOK_SECRET) criticals.push({ file: '.env.local', message: 'POLAR_WEBHOOK_SECRET is missing.' });
  if (!env.POLAR_ACCESS_TOKEN) criticals.push({ file: '.env.local', message: 'POLAR_ACCESS_TOKEN is missing.' });

  const productResults = [];
  if (env.POLAR_ACCESS_TOKEN) {
    for (const key of productKeys) {
      if (!env[key]) continue;
      const result = await requestPolarProduct(env[key], env.POLAR_ACCESS_TOKEN);
      const summary = result.ok ? summarizePolarProduct(result) : null;
      const contractErrors = result.ok ? validatePolarProduct(key, summary) : [];
      productResults.push({
        key,
        ok: result.ok && contractErrors.length === 0,
        status: result.status,
        product: summary || undefined,
        contractErrors,
        error: result.ok ? undefined : (describePolarError(result) || undefined),
      });
      if (!result.ok) {
        const error = describePolarError(result);
        const hint = result.status === 403
          ? ' Check that POLAR_ACCESS_TOKEN is an Organization Access Token for the same Polar organization and includes products:read or products:write scope. If Polar returns insufficient_scope, create a new organization token with products:read and update .env.local.'
          : '';
        criticals.push({ file: '.env.local', message: `${key} cannot be read with POLAR_ACCESS_TOKEN. Status: ${result.status || result.error}.${error ? ` ${error}` : ''}${hint}` });
      }
      for (const message of contractErrors) {
        criticals.push({ file: '.env.local', message });
      }
    }
  }

  const reportPath = writeJsonReport('payment-health', {
    status: criticals.length ? 'fail' : 'pass',
    checkoutResults,
    productResults,
    criticals,
    warnings,
  });

  failIfCritical(reportPath, criticals);
})();
