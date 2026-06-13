/* eslint-disable @typescript-eslint/no-require-imports */
const { loadEnvLocal, writeJsonReport, failIfCritical } = require('./_utils');

const env = { ...loadEnvLocal(), ...process.env };
const criticals = [];
const warnings = [];

const checks = [
  { key: 'GEMINI_API_KEY', required: true, category: 'ai' },
  { key: 'BUFFER_API_KEY', required: true, category: 'buffer' },
  { key: 'BUFFER_CHANNEL_TWITTER', required: true, category: 'buffer' },
  { key: 'BUFFER_CHANNEL_THREADS', required: true, category: 'buffer' },
  { key: 'BUFFER_CHANNEL_INSTAGRAM', required: true, category: 'buffer' },
  { key: 'POLAR_ACCESS_TOKEN', required: true, category: 'payments', prefix: 'polar_oat_' },
  { key: 'POLAR_WEBHOOK_SECRET', required: true, category: 'payments', prefix: 'polar_whs_' },
  { key: 'POLAR_STARTER_PRODUCT_ID', required: true, category: 'payments', uuid: true },
  { key: 'POLAR_PRO_PRODUCT_ID', required: true, category: 'payments', uuid: true },
  { key: 'POLAR_AGENCY_PRODUCT_ID', required: true, category: 'payments', uuid: true },
  { key: 'NEXT_PUBLIC_POLAR_STARTER_LINK', required: true, category: 'payments', urlHost: ['buy.polar.sh', 'polar.sh'] },
  { key: 'NEXT_PUBLIC_POLAR_PRO_LINK', required: true, category: 'payments', urlHost: ['buy.polar.sh', 'polar.sh'] },
  { key: 'NEXT_PUBLIC_POLAR_AGENCY_LINK', required: true, category: 'payments', urlHost: ['buy.polar.sh', 'polar.sh'] },
  { key: 'CRON_SECRET', required: true, category: 'cron' },
  { key: 'RESEND_API_KEY', required: false, category: 'alerts' },
  { key: 'ADMIN_EMAIL', required: false, category: 'alerts' },
  { key: 'GITHUB_TOKEN', required: false, category: 'instagram-assets' },
  { key: 'GITHUB_OWNER', required: false, category: 'instagram-assets' },
  { key: 'INSTAGRAM_IMAGE_URL', required: false, category: 'instagram-assets', urlHost: null },
  { key: 'GMAIL_OAUTH_CLIENT_ID', required: false, category: 'outreach-replies' },
  { key: 'GMAIL_OAUTH_CLIENT_SECRET', required: false, category: 'outreach-replies' },
  { key: 'GMAIL_OAUTH_REFRESH_TOKEN', required: false, category: 'outreach-replies' },
  { key: 'GMAIL_ACCOUNT', required: false, category: 'outreach-replies' },
];

function maskStatus(key, value) {
  return {
    key,
    present: Boolean(value),
    length: value ? String(value).length : 0,
  };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function validateUrl(key, value, allowedHosts) {
  try {
    const parsed = new URL(value);
    if (allowedHosts && !allowedHosts.includes(parsed.hostname)) {
      warnings.push({ file: '.env.local', message: `${key} host is ${parsed.hostname}; expected one of ${allowedHosts.join(', ')}.` });
    }
    return parsed.hostname;
  } catch {
    criticals.push({ file: '.env.local', message: `${key} is not a valid URL.` });
    return null;
  }
}

const results = checks.map(check => {
  const raw = env[check.key];
  const value = raw ? String(raw).replace(/^"|"$/g, '') : '';
  if (check.required && !value) {
    criticals.push({ file: '.env.local', message: `${check.key} is missing.` });
  }
  if (value && check.prefix && !value.startsWith(check.prefix)) {
    warnings.push({ file: '.env.local', message: `${check.key} does not use expected prefix ${check.prefix}.` });
  }
  if (value && check.uuid && !isUuid(value)) {
    warnings.push({ file: '.env.local', message: `${check.key} is not UUID-shaped.` });
  }

  let host;
  if (value && Object.prototype.hasOwnProperty.call(check, 'urlHost')) {
    host = validateUrl(check.key, value, check.urlHost);
  }

  return {
    ...maskStatus(check.key, value),
    category: check.category,
    host,
  };
});

const hasGithubAssetUpload = Boolean(env.GITHUB_TOKEN && env.GITHUB_OWNER);
if (!hasGithubAssetUpload && !env.INSTAGRAM_IMAGE_URL) {
  warnings.push({
    file: '.env.local',
    message: 'Instagram launch will use the default public logo fallback because GITHUB_TOKEN/GITHUB_OWNER and INSTAGRAM_IMAGE_URL are not configured.',
  });
}

const reportPath = writeJsonReport('growth-env-preflight', {
  status: criticals.length ? 'fail' : 'pass',
  results,
  instagramAssetMode: hasGithubAssetUpload ? 'github-upload' : (env.INSTAGRAM_IMAGE_URL ? 'custom-url' : 'default-logo-fallback'),
  criticals,
  warnings,
});

failIfCritical(reportPath, criticals);
