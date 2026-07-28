const baseUrl = (process.env.GLOSOURCE_BASE_URL || 'https://glosourceai.com').replace(/\/$/, '');

const checks = [
  { path: '/', markers: ['5회 무료 체험'] },
  { path: '/auth/register', markers: ['회원가입'] },
  { path: '/auth/login', markers: ['로그인'] },
  { path: '/en', markers: ['3 searches/month', 'search preview only'] },
  { path: '/en/register', markers: ['Get 3 free searches per month', 'Create account'] },
  { path: '/en/login', markers: ['Sign in'] },
  { path: '/en/case-studies', markers: ['3 free searches per month'] },
];

function visibleText(html) {
  return html
    .replace(/<!--.*?-->/gs, '')
    .replace(/<script\b[^>]*>.*?<\/script>/gis, ' ')
    .replace(/<style\b[^>]*>.*?<\/style>/gis, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&apos;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  let failures = 0;

  for (const check of checks) {
    const url = `${baseUrl}${check.path}`;
    try {
      const response = await fetch(url, {
        redirect: 'manual',
        headers: { 'user-agent': 'GloSource-Contract-Audit/1.0' },
      });
      const body = visibleText(await response.text());
      const missing = check.markers.filter(marker => !body.includes(marker));

      if (response.status !== 200 || missing.length > 0) {
        failures += 1;
        console.error(
          `FAIL ${check.path} status=${response.status}`
          + (missing.length ? ` missing=${JSON.stringify(missing)}` : ''),
        );
        continue;
      }

      console.log(`PASS ${check.path}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${check.path} ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures > 0) {
    console.error(`Product contract audit failed: ${failures}/${checks.length} routes.`);
    process.exitCode = 1;
  } else {
    console.log(`Product contract audit passed: ${checks.length}/${checks.length} routes at ${baseUrl}.`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
