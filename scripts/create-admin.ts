/**
 * Create (or reset) the GloSource admin account.
 * Admin = an app account whose email is in ADMIN_EMAIL/ADMIN_EMAILS. There is no separate
 * "admin password" system — this just provisions that account with a bcrypt password + verified email.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/create-admin.ts "YourStrongPassword"
 *   node --env-file=.env.local --import tsx scripts/create-admin.ts            (generates a password)
 *   node --env-file=.env.local --import tsx scripts/create-admin.ts "pw" other@email.com
 */
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { randomUUID, randomBytes } from 'crypto';

async function main(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL as string);
  const email = (process.argv[3] || (process.env.ADMIN_EMAIL ?? '').split(',')[0]).trim();
  if (!email) { console.error('No email: set ADMIN_EMAIL or pass as 2nd arg.'); process.exit(1); }

  let password = process.argv[2];
  let generated = false;
  if (!password) {
    password = randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    generated = true;
  }
  if (password.length < 8) { console.error('Password must be at least 8 characters.'); process.exit(1); }

  const hash = await bcrypt.hash(password, 12);
  const [existing] = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing) {
    await sql`UPDATE users SET password_hash = ${hash}, email_verified = now(), password_set_at = now() WHERE email = ${email}`;
    console.log(`✓ Updated existing account as admin: ${email}`);
  } else {
    await sql`INSERT INTO users (id, email, name, password_hash, email_verified, password_set_at)
              VALUES (${randomUUID()}, ${email}, 'GloSource Admin', ${hash}, now(), now())`;
    console.log(`✓ Created admin account: ${email}`);
  }

  console.log('\n=========== ADMIN LOGIN ===========');
  console.log('URL:      https://glosourceai.com/admin/login');
  console.log('Email:    ' + email);
  console.log('Password: ' + password + (generated ? '   ← GENERATED (change after first login)' : ''));
  console.log('===================================');
  console.log('\nNote: this email must be in ADMIN_EMAIL/ADMIN_EMAILS (Vercel env) for /admin access.');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
