import { processSupportMessage } from '../app/lib/support/agent';

const TO = 'glosourceai@gmail.com';

async function main(): Promise<void> {
  console.log('— Test: clear FAQ (no results) → full templated auto-reply expected');
  const r = await processSupportMessage({
    name: 'Test Buyer',
    email: TO,
    subject: 'No suppliers found',
    message: 'I searched for a vegan facial serum supplier but got zero results — nothing came up. What am I doing wrong?',
    source: 'email',
  });
  console.log('  result:', JSON.stringify(r));
  console.log('\nDONE — check inbox at', TO);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
