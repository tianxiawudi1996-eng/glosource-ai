/* eslint-disable @typescript-eslint/no-require-imports */
const { walk, readText, writeJsonReport, failIfCritical } = require('./_utils');

const enFiles = walk('app/en', file => /\.(tsx|ts)$/.test(file));
const criticals = [];
const warnings = [];

const forbiddenRoutePatterns = [
  { re: /href=["']\/auth\/(login|register|signup|reset-password)/g, message: 'EN surface links to Korean auth route.' },
  { re: /href=["']\/billing(\/|["'#?])/g, message: 'EN surface links to Korean billing route.' },
  { re: /href=["']\/dashboard(\/|["'#?])/g, message: 'EN surface links to Korean dashboard route.' },
  { re: /redirect\(["']\/auth\//g, message: 'EN surface redirects to Korean auth route.' },
  { re: /callbackUrl=\/(billing|dashboard|auth)/g, message: 'EN callbackUrl points to Korean route.' },
];

const requiredFiles = [
  'app/en/page.tsx',
  'app/en/login/page.tsx',
  'app/en/register/page.tsx',
  'app/en/billing/page.tsx',
  'app/en/dashboard/page.tsx',
  'app/en/blog/page.tsx',
];

for (const file of requiredFiles) {
  if (!enFiles.includes(file)) {
    criticals.push({ file, message: 'Required EN funnel route file is missing.' });
  }
}

for (const file of enFiles) {
  const text = readText(file);
  for (const pattern of forbiddenRoutePatterns) {
    const matches = [...text.matchAll(pattern.re)];
    for (const match of matches) {
      criticals.push({ file, message: `${pattern.message} Match: ${match[0]}` });
    }
  }
  if (/회원가입|로그인|결제|구독|비밀번호/.test(text)) {
    warnings.push({ file, message: 'Korean UI copy appears in EN route; verify it is intentional.' });
  }
}

const enPage = enFiles.includes('app/en/page.tsx') ? readText('app/en/page.tsx') : '';
if (!/href=["']\/en\/register["']/.test(enPage)) {
  criticals.push({ file: 'app/en/page.tsx', message: 'Top-level EN page must link directly to /en/register.' });
}
if (!/href=["']\/en\/login["']/.test(enPage)) {
  criticals.push({ file: 'app/en/page.tsx', message: 'Top-level EN page must link directly to /en/login.' });
}
if (!/href=["']\/en\/blog["']/.test(enPage)) {
  warnings.push({ file: 'app/en/page.tsx', message: 'EN page does not expose /en/blog in navigation.' });
}

const reportPath = writeJsonReport('locale-route-audit', {
  status: criticals.length ? 'fail' : 'pass',
  checkedFiles: enFiles,
  criticals,
  warnings,
});

failIfCritical(reportPath, criticals);
