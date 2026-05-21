/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { reportDir, today, writeJsonReport, failIfCritical } = require('./_utils');

const reportDate = today();
const criticals = [];
const warnings = [];

function readReport(name) {
  const file = `${name}-${reportDate}.json`;
  const fullPath = path.join(reportDir, file);
  if (!fs.existsSync(fullPath)) return null;
  return { file, data: JSON.parse(fs.readFileSync(fullPath, 'utf8')) };
}

const daily = readReport('daily-growth-run');
const payment = readReport('payment-health');
const social = readReport('social-dry-run');
const cases = readReport('case-study-candidates');

if (!daily) {
  criticals.push({ file: 'reports/growth', message: `daily-growth-run-${reportDate}.json is missing. Run npm run growth:daily first.` });
}

if (!payment) {
  criticals.push({ file: 'reports/growth', message: `payment-health-${reportDate}.json is missing. Run npm run growth:payments first.` });
}

if (!social) {
  warnings.push({ file: 'reports/growth', message: `social-dry-run-${reportDate}.json is missing. Run npm run growth:social:dry-run before any live Buffer launch.` });
}

const blockedActions = new Set(daily?.data?.blockedActions || []);
if (payment?.data?.status !== 'pass') {
  blockedActions.add('paid_ads');
  blockedActions.add('product_hunt_launch');
  blockedActions.add('high_volume_outbound');
}

if (social?.data?.status !== 'pass') {
  blockedActions.add('live_social_launch');
}

if (Number(cases?.data?.count || 0) === 0) {
  blockedActions.add('case_study_publication');
  blockedActions.add('testimonial_like_claims');
}

for (const action of ['paid_ads', 'product_hunt_launch', 'high_volume_outbound']) {
  if (blockedActions.has(action)) {
    criticals.push({ file: daily?.file || payment?.file || 'reports/growth', message: `${action} is blocked by current growth evidence.` });
  }
}

if (blockedActions.has('live_social_launch')) {
  warnings.push({ file: social?.file || 'reports/growth', message: 'Live social launch is blocked until today social dry-run passes.' });
}

if (blockedActions.has('case_study_publication')) {
  warnings.push({ file: cases?.file || 'reports/growth', message: 'Case-study publication is blocked until approved evidence candidates exist.' });
}

const reportPath = writeJsonReport('acquisition-readiness', {
  status: criticals.length ? 'fail' : 'pass',
  reportDate,
  inputs: {
    dailyGrowthRun: daily?.file || null,
    paymentHealth: payment?.file || null,
    socialDryRun: social?.file || null,
    caseStudyCandidates: cases?.file || null,
  },
  blockedActions: [...blockedActions].sort(),
  criticals,
  warnings,
});

failIfCritical(reportPath, criticals);
