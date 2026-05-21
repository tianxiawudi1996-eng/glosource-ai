/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const reportDir = path.join(root, 'reports', 'growth');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function walk(dir, predicate = () => true) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const full = path.join(abs, entry.name);
    const rel = path.relative(root, full).replace(/\\/g, '/');
    if (entry.isDirectory()) out.push(...walk(rel, predicate));
    else if (predicate(rel)) out.push(rel);
  }
  return out;
}

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
  }
  return env;
}

function writeJsonReport(name, data) {
  ensureDir(reportDir);
  const file = path.join(reportDir, `${name}-${today()}.json`);
  fs.writeFileSync(file, JSON.stringify({ generatedAt: new Date().toISOString(), ...data }, null, 2));
  return path.relative(root, file);
}

function failIfCritical(reportPath, criticals) {
  if (criticals.length > 0) {
    console.error(`Growth audit failed: ${criticals.length} critical issue(s). See ${reportPath}`);
    for (const issue of criticals) console.error(`- ${issue.file || 'global'}: ${issue.message}`);
    process.exit(1);
  }
  console.log(`Growth audit passed. Report: ${reportPath}`);
}

module.exports = {
  root,
  reportDir,
  ensureDir,
  today,
  readText,
  walk,
  loadEnvLocal,
  writeJsonReport,
  failIfCritical,
};
