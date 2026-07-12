#!/usr/bin/env node
/**
 * Render a Claude Code session transcript as readable Markdown, so past conversations can be
 * re-read inside the repo instead of squinting at raw .jsonl.
 *
 *   node scripts/export-session.mjs              # the current / most recent session
 *   node scripts/export-session.mjs --all        # every session for this project
 *   node scripts/export-session.mjs --list       # just list what is available
 *   node scripts/export-session.mjs --session 8877278d --thinking
 *
 * Output goes to docs/sessions/ (gitignored — transcripts carry whatever the tools printed, which
 * is not something to push by reflex). Secrets are redacted anyway: the terms in
 * .harness-blocklist.local plus connection strings and token-shaped values.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

const PROJECT_DIR = path.join(homedir(), '.claude', 'projects', 'C--Users-ddedi-safedoc-ai');
const OUT_DIR = 'docs/sessions';
const MAX_RESULT_CHARS = 1200;

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const valueOf = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };

// ── redaction ────────────────────────────────────────────────────────────────
const blocklist = existsSync('.harness-blocklist.local')
  ? readFileSync('.harness-blocklist.local', 'utf8').split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#'))
  : [];

const PATTERNS = [
  [/postgres(?:ql)?:\/\/[^\s"'`]+/gi, 'postgres://[REDACTED]'],
  // Key prefixes separated by EITHER a hyphen or an underscore. The first version of this only
  // matched `sk-…` and let a live `sk_live_…` key through into an export — the check caught it.
  [/\b(?:sk|pk|rk|ak)[_-][A-Za-z0-9_-]{16,}/gi, '[REDACTED-KEY]'],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}/g, '[REDACTED-TOKEN]'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/g, '[REDACTED-TOKEN]'],
  [/\bpolar_[a-z]+_[A-Za-z0-9_-]{16,}/g, '[REDACTED-TOKEN]'],
  [/\bre_[A-Za-z0-9_-]{16,}/g, '[REDACTED-TOKEN]'],
  [/\bAIza[A-Za-z0-9_-]{20,}/g, '[REDACTED-KEY]'],
  [/\bBearer\s+[A-Za-z0-9._-]{20,}/gi, 'Bearer [REDACTED]'],
  [/\b(?:api[_-]?key|secret|token|password)["'\s:=]+[A-Za-z0-9_\-./+]{16,}/gi, '[REDACTED-SECRET]'],
];

function redact(text) {
  let s = String(text ?? '');
  for (const term of blocklist) if (term.length >= 6) s = s.split(term).join('[REDACTED]');
  for (const [re, to] of PATTERNS) s = s.replace(re, to);
  return s;
}

// ── transcript reading ───────────────────────────────────────────────────────
function sessions() {
  if (!existsSync(PROJECT_DIR)) return [];
  return readdirSync(PROJECT_DIR)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => ({ id: f.replace(/\.jsonl$/, ''), file: path.join(PROJECT_DIR, f), mtime: statSync(path.join(PROJECT_DIR, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime);
}

function readEntries(file) {
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

// The harness injects these into the conversation; they are not something the user said.
const NOISE = /^<(system-reminder|local-command|command-name|command-message|command-args)/;

function textOf(content) {
  if (typeof content === 'string') return NOISE.test(content.trim()) ? '' : content;
  if (!Array.isArray(content)) return '';
  return content.filter(c => c.type === 'text').map(c => c.text).filter(t => !NOISE.test(t.trim())).join('\n\n');
}

function summarizeToolInput(name, input) {
  if (!input) return '';
  if (typeof input.command === 'string') return input.command;
  if (typeof input.file_path === 'string') return input.file_path + (input.old_string ? ' (edit)' : '');
  if (typeof input.pattern === 'string') return input.pattern;
  if (typeof input.query === 'string') return input.query;
  if (typeof input.prompt === 'string') return input.prompt.slice(0, 200);
  return JSON.stringify(input).slice(0, 200);
}

function resultText(entry) {
  const c = entry.message?.content;
  if (!Array.isArray(c)) return '';
  const parts = [];
  for (const b of c) {
    if (b.type !== 'tool_result') continue;
    const inner = b.content;
    if (typeof inner === 'string') parts.push(inner);
    else if (Array.isArray(inner)) parts.push(inner.filter(x => x.type === 'text').map(x => x.text).join('\n'));
  }
  return parts.join('\n');
}

function truncate(s, n = MAX_RESULT_CHARS) {
  const t = s.trim();
  return t.length <= n ? t : t.slice(0, n) + `\n… (${t.length - n} more characters)`;
}

// ── rendering ────────────────────────────────────────────────────────────────
function render(id, entries, { thinking }) {
  const out = [];
  const first = entries.find(e => e.timestamp);
  const last = [...entries].reverse().find(e => e.timestamp);
  const branch = entries.find(e => e.gitBranch)?.gitBranch ?? '—';

  out.push(`# Session ${id.slice(0, 8)}`);
  out.push('');
  out.push(`- Started: ${first?.timestamp ?? '—'}`);
  out.push(`- Last activity: ${last?.timestamp ?? '—'}`);
  out.push(`- Branch: \`${branch}\``);
  out.push('');
  out.push('> Rendered from the Claude Code transcript. Tool calls are collapsed; internal reasoning is omitted unless `--thinking` was passed. Secrets are redacted.');
  out.push('');
  out.push('---');
  out.push('');

  for (const e of entries) {
    if (e.type === 'user') {
      const t = textOf(e.message?.content);
      if (t.trim()) {
        out.push(`## 👤 김무빈 차장님`);
        out.push('');
        out.push(redact(t.trim()));
        out.push('');
        continue;
      }
      const r = resultText(e);
      if (r.trim()) {
        out.push('<details><summary>↩︎ tool result</summary>');
        out.push('');
        out.push('```');
        out.push(redact(truncate(r)));
        out.push('```');
        out.push('');
        out.push('</details>');
        out.push('');
      }
      continue;
    }

    if (e.type !== 'assistant') continue;
    const content = e.message?.content;
    if (!Array.isArray(content)) continue;

    for (const b of content) {
      if (b.type === 'thinking' && thinking) {
        out.push('<details><summary>💭 thinking</summary>');
        out.push('');
        out.push(redact(truncate(b.thinking ?? '', 2000)));
        out.push('');
        out.push('</details>');
        out.push('');
      }
      if (b.type === 'text' && b.text?.trim()) {
        out.push('## 🤖 Claude');
        out.push('');
        out.push(redact(b.text.trim()));
        out.push('');
      }
      if (b.type === 'tool_use') {
        const summary = redact(summarizeToolInput(b.name, b.input));
        out.push(`<details><summary>🔧 <code>${b.name}</code> — ${summary.split('\n')[0].slice(0, 90).replace(/</g, '&lt;')}</summary>`);
        out.push('');
        out.push('```');
        out.push(truncate(summary, 800));
        out.push('```');
        out.push('');
        out.push('</details>');
        out.push('');
      }
    }
  }
  return out.join('\n');
}

// ── main ─────────────────────────────────────────────────────────────────────
const all = sessions();
if (!all.length) {
  console.error(`no transcripts found in ${PROJECT_DIR}`);
  process.exit(1);
}

if (has('--list')) {
  console.log(`${all.length} session(s) for this project:\n`);
  for (const s of all) {
    const entries = readEntries(s.file);
    const firstUser = entries.find(e => e.type === 'user' && typeof e.message?.content === 'string' && !NOISE.test(e.message.content));
    const opener = (firstUser?.message?.content ?? '').replace(/\s+/g, ' ').slice(0, 60);
    console.log(`  ${s.id.slice(0, 8)}  ${s.mtime.toISOString().slice(0, 16).replace('T', ' ')}  ${opener}`);
  }
  process.exit(0);
}

const wanted = valueOf('--session');
const targets = has('--all') ? all : wanted ? all.filter(s => s.id.startsWith(wanted)) : [all[0]];
if (!targets.length) {
  console.error(`no session matching "${wanted}"`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const s of targets) {
  const entries = readEntries(s.file);
  const md = render(s.id, entries, { thinking: has('--thinking') });
  const day = (entries.find(e => e.timestamp)?.timestamp ?? new Date().toISOString()).slice(0, 10);
  const out = path.join(OUT_DIR, `${day}-${s.id.slice(0, 8)}.md`);
  writeFileSync(out, md, 'utf8');
  console.log(`${out}  (${entries.length} entries, ${(md.length / 1024).toFixed(0)} KB)`);
}

writeIndex();

// A folder of hex-named files is not "readable". The index says what each conversation was about,
// so a past discussion can be found without opening a 5 MB file to check.
function writeIndex() {
  const rows = [];
  for (const s of all) {
    const file = readdirSync(OUT_DIR).find(f => f.endsWith(`${s.id.slice(0, 8)}.md`));
    if (!file) continue;
    const entries = readEntries(s.file);
    const openers = entries
      .filter(e => e.type === 'user' && typeof e.message?.content === 'string' && !NOISE.test(e.message.content.trim()))
      .map(e => e.message.content.replace(/\s+/g, ' ').trim())
      .filter(t => t.length > 4);
    const topic = redact((openers[0] ?? '(no prompt)').slice(0, 70));
    const size = (statSync(path.join(OUT_DIR, file)).size / 1024).toFixed(0);
    rows.push(`| ${file.slice(0, 10)} | [${file}](./${file}) | ${openers.length} | ${size} KB | ${topic.replace(/\|/g, '/')} |`);
  }
  const md = [
    '# Conversation history',
    '',
    'Readable exports of the Claude Code sessions for this project. Regenerate with `npm run sessions:all`',
    '(or `npm run sessions` for the current one). The `.jsonl` originals live under `~/.claude/projects/`.',
    '',
    'Secrets are redacted on export. These files are **not committed** — they carry whatever the tools',
    'printed (database rows, supplier records, API responses).',
    '',
    '| Date | File | Prompts | Size | Opened with |',
    '|---|---|---|---|---|',
    ...rows,
    '',
  ].join('\n');
  writeFileSync(path.join(OUT_DIR, 'INDEX.md'), md, 'utf8');
  console.log(`\n${path.join(OUT_DIR, 'INDEX.md')}  ← start here`);
}
