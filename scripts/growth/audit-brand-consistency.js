/* eslint-disable @typescript-eslint/no-require-imports */
const { walk, readText, writeJsonReport, failIfCritical } = require('./_utils');

const files = walk('app', file => /\.(tsx|ts)$/.test(file));
const criticals = [];
const warnings = [];
const domainEmail = 'hello@glosource.ai';
const legacyEmail = 'like2buyglobal@gmail.com';

for (const file of files) {
  const text = readText(file);
  if (file.startsWith('app/en') && text.includes(legacyEmail)) {
    criticals.push({ file, message: `EN surface still exposes legacy Gmail (${legacyEmail}). Use ${domainEmail}.` });
  }
  if (file.startsWith('app/en') && /testimonial|What buyers say|Average user rating|Searches completed/i.test(text)) {
    if (!/Demo|demo|approved|real user|permission/i.test(text)) {
      warnings.push({ file, message: 'Potential social proof section found; verify claims are real or explicitly labeled demo.' });
    }
  }
}

const enPage = readText('app/en/page.tsx');
if (!enPage.includes(domainEmail)) {
  criticals.push({ file: 'app/en/page.tsx', message: `EN landing page must expose ${domainEmail}.` });
}
if (!/https:\/\/twitter\.com\/glosourceai|https:\/\/x\.com\/glosourceai/.test(enPage)) {
  warnings.push({ file: 'app/en/page.tsx', message: 'No X/Twitter profile link found.' });
}
if (!/linkedin\.com\/company\/glosource|linkedin\.com\/in\//i.test(enPage)) {
  warnings.push({ file: 'app/en/page.tsx', message: 'No LinkedIn profile/company link found.' });
}

const reportPath = writeJsonReport('brand-consistency', {
  status: criticals.length ? 'fail' : 'pass',
  domainEmail,
  legacyEmail,
  criticals,
  warnings,
});

failIfCritical(reportPath, criticals);
