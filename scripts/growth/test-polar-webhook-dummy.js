/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const { spawnSync } = require('child_process');
const { neon } = require('@neondatabase/serverless');
const { root, writeJsonReport } = require('./_utils');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (!match) continue;
    env[match[1]] = match[2].replace(/^"(.*)"$/, '$1').trim();
  }
  return env;
}

function required(env, key) {
  if (!env[key]) throw new Error(`${key} is missing`);
  return env[key];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer(port, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/en`, { redirect: 'manual' });
      if (res.status >= 200 && res.status < 500) return;
    } catch {
      // Server is still booting.
    }
    await sleep(1000);
  }
  throw new Error(`Next dev server did not become ready on port ${port}`);
}

function signPayload(secret, body) {
  const msgId = `msg_dummy_${Date.now()}`;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signedContent = `${msgId}.${timestamp}.${body}`;
  const secretBytes = Buffer.from(secret.startsWith('whsec_') ? secret.slice(6) : secret, 'base64');
  const signature = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');
  return {
    'content-type': 'application/json',
    'webhook-id': msgId,
    'webhook-timestamp': timestamp,
    'webhook-signature': `v1,${signature}`,
  };
}

function postJson(port, body, headers) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/api/polar/webhook',
      method: 'POST',
      headers: {
        ...headers,
        'content-length': Buffer.byteLength(body),
      },
    }, res => {
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: responseBody }));
    });
    req.setTimeout(60000, () => {
      req.destroy(new Error('webhook request timed out after 60000ms'));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function stopServer(server) {
  if (!server.pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' });
    return;
  }
  server.kill('SIGTERM');
}

async function cleanup(sql, email, subscriptionId, invoiceId) {
  await sql`delete from payments where polar_payment_id = ${invoiceId}`;
  await sql`delete from subscriptions where polar_subscription_id = ${subscriptionId}`;
  await sql`delete from verification_tokens where identifier = ${`pw-reset:${email}`}`;
  await sql`delete from users where email = ${email}`;
}

(async () => {
  const env = loadEnvLocal();
  const port = Number(process.env.POLAR_DUMMY_PORT || 3107);
  const suffix = Date.now();
  const email = `polar-dummy-${suffix}@example.invalid`;
  const subscriptionId = `sub_dummy_${suffix}`;
  const invoiceId = `inv_dummy_${suffix}`;
  const customerId = `cus_dummy_${suffix}`;
  const productId = required(env, 'POLAR_STARTER_PRODUCT_ID');
  const webhookSecret = required(env, 'POLAR_WEBHOOK_SECRET');
  const sql = neon(required(env, 'DATABASE_URL'));

  await cleanup(sql, email, subscriptionId, invoiceId);

  const server = spawn(
    `npm run dev -- --port ${port} --hostname 127.0.0.1`,
    {
      cwd: root,
      env: {
        ...process.env,
        ...env,
        RESEND_API_KEY: '',
        AUTH_URL: `http://127.0.0.1:${port}`,
      },
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let output = '';
  server.stdout.on('data', chunk => { output += chunk.toString(); });
  server.stderr.on('data', chunk => { output += chunk.toString(); });

  try {
    await waitForServer(port);

    const body = JSON.stringify({
      type: 'subscription.active',
      data: {
        id: subscriptionId,
        status: 'active',
        customer_id: customerId,
        product_id: productId,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        canceled_at: null,
        customer: {
          id: customerId,
          email,
          name: 'Polar Dummy Buyer',
        },
        amount: 1900,
        currency: 'usd',
        invoice: { id: invoiceId },
      },
    });

    const response = await postJson(port, body, signPayload(webhookSecret, body));
    const users = await sql`select id, email from users where email = ${email}`;
    const subscriptions = await sql`select id, plan, status, polar_subscription_id, polar_product_id from subscriptions where polar_subscription_id = ${subscriptionId}`;
    const payments = await sql`select id, amount, currency, status, polar_payment_id from payments where polar_payment_id = ${invoiceId}`;

    const checks = [
      { name: 'webhook returned 200', pass: response.status === 200 },
      { name: 'dummy user created', pass: users.length === 1 },
      { name: 'starter subscription active', pass: subscriptions.length === 1 && subscriptions[0].plan === 'starter' && subscriptions[0].status === 'active' },
      { name: 'dummy payment recorded', pass: payments.length === 1 && payments[0].amount === 1900 && payments[0].status === 'done' },
    ];
    const failed = checks.filter(check => !check.pass);

    await cleanup(sql, email, subscriptionId, invoiceId);

    const reportPath = writeJsonReport('polar-webhook-dummy-test', {
      status: failed.length ? 'fail' : 'pass',
      port,
      webhookStatus: response.status,
      webhookBody: response.body,
      checks,
      serverOutput: failed.length ? output.slice(-4000) : undefined,
      cleanedUp: true,
    });

    console.log(`Polar dummy webhook test report: ${reportPath}`);
    for (const check of checks) console.log(`[${check.pass ? 'PASS' : 'FAIL'}] ${check.name}`);

    if (failed.length) process.exit(1);
  } catch (error) {
    await cleanup(sql, email, subscriptionId, invoiceId).catch(() => {});
    const reportPath = writeJsonReport('polar-webhook-dummy-test', {
      status: 'fail',
      port,
      error: error instanceof Error ? error.message : String(error),
      serverOutput: output.slice(-4000),
      cleanedUp: true,
    });
    console.error(`Polar dummy webhook test failed. Report: ${reportPath}`);
    console.error(error);
    process.exit(1);
  } finally {
    stopServer(server);
  }
})();
