/* eslint-disable @typescript-eslint/no-require-imports */
//
// Outreach preflight gate (run BEFORE sending any cold email).
//
//   node scripts/growth/preflight-outreach.js
//
// Reads a staging list of targets and fails if any target is unsafe to send:
//   - missing or malformed contact email
//   - missing contactSource (provenance: WHERE the email was found) -> hard fail
//   - company URL domain != contact email domain WITHOUT a contactSourceNote
//     explaining the relationship (this is exactly the BLIFE USA -> missykayusa.com case)
//   - already contacted (found in a previous reports/growth/outreach-sent-*.md log)
//
// The point: every send must be auditable. No more ad-hoc contacts with no trail.
// This gate does NOT send anything — sending stays a reviewed, manual/draft step.
//
// Input:  data/growth/outreach-targets.json   (array of target objects, schema in the seed file)
// Output: reports/growth/outreach-preflight-YYYY-MM-DD.json
// Exit:   non-zero if any critical issue (so it can gate a send pipeline).

const fs = require('fs');
const path = require('path');
const { root, reportDir, writeJsonReport, failIfCritical } = require('./_utils');

const targetsPath = path.join(root, 'data', 'growth', 'outreach-targets.json');

function registrableDomain(host) {
  const labels = String(host).toLowerCase().replace(/^www\./, '').split('.');
  return labels.slice(-2).join('.');
}

function domainOfUrl(url) {
  try {
    return registrableDomain(new URL(url).hostname);
  } catch {
    return '';
  }
}

function domainOfEmail(email) {
  const at = String(email).indexOf('@');
  return at === -1 ? '' : registrableDomain(email.slice(at + 1));
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

// Collect every address we have already emailed, from the sent-log history.
function previouslyContacted() {
  const sent = new Set();
  if (!fs.existsSync(reportDir)) return sent;
  for (const file of fs.readdirSync(reportDir)) {
    if (!/^outreach-sent-.*\.md$/.test(file)) continue;
    const text = fs.readFileSync(path.join(reportDir, file), 'utf8');
    for (const m of text.matchAll(/^\s*-?\s*To:\s*([^\s<]+@[^\s>]+)/gim)) {
      sent.add(m[1].toLowerCase());
    }
  }
  return sent;
}

(function main() {
  if (!fs.existsSync(targetsPath)) {
    console.error(`No staging list found at ${path.relative(root, targetsPath)}.`);
    console.error('Create it (see the seeded example) before running the outreach preflight.');
    process.exit(1);
  }

  let targets;
  try {
    targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
  } catch (err) {
    console.error(`outreach-targets.json is not valid JSON: ${err.message}`);
    process.exit(1);
  }
  if (!Array.isArray(targets)) {
    console.error('outreach-targets.json must be a JSON array of target objects.');
    process.exit(1);
  }

  const sent = previouslyContacted();
  const criticals = [];
  const warnings = [];
  const checked = [];

  const seenInBatch = new Set();
  for (const t of targets) {
    const label = t.company || t.contact || 'unknown target';
    const flags = [];

    if (!isEmail(t.contact)) {
      criticals.push({ file: label, message: `contact is missing or not a valid email: "${t.contact ?? ''}".` });
      flags.push('bad_contact');
    }
    if (!t.contactSource || !String(t.contactSource).trim()) {
      criticals.push({ file: label, message: 'contactSource is required (where did this email come from?). Provenance is mandatory.' });
      flags.push('no_provenance');
    }

    const urlDomain = domainOfUrl(t.url);
    const emailDomain = domainOfEmail(t.contact);
    if (isEmail(t.contact) && urlDomain && emailDomain && urlDomain !== emailDomain) {
      if (!t.contactSourceNote || !String(t.contactSourceNote).trim()) {
        criticals.push({
          file: label,
          message: `domain mismatch: company URL is ${urlDomain} but email is @${emailDomain}. Add a contactSourceNote explaining the relationship, or fix the contact. (This is the BLIFE USA -> missykayusa.com pattern.)`,
        });
        flags.push('domain_mismatch_unexplained');
      } else {
        warnings.push({ file: label, message: `domain mismatch (${urlDomain} vs ${emailDomain}) explained by note: "${t.contactSourceNote}".` });
        flags.push('domain_mismatch_explained');
      }
    }

    if (isEmail(t.contact)) {
      const addr = t.contact.toLowerCase();
      if (sent.has(addr)) { warnings.push({ file: label, message: `already contacted ${addr} in a prior sent log. Skip or follow up, do not re-cold-email.` }); flags.push('already_contacted'); }
      if (seenInBatch.has(addr)) { criticals.push({ file: label, message: `duplicate ${addr} within this batch.` }); flags.push('duplicate_in_batch'); }
      seenInBatch.add(addr);
    }

    const criticalFlags = new Set(['bad_contact', 'no_provenance', 'domain_mismatch_unexplained', 'duplicate_in_batch']);
    const sendable = !flags.some(f => criticalFlags.has(f));
    checked.push({ company: t.company, contact: t.contact, urlDomain, emailDomain, sendable, flags });
  }

  const sendable = checked.filter(c => c.sendable);
  const reportPath = writeJsonReport('outreach-preflight', {
    status: criticals.length ? 'fail' : 'pass',
    targets: targets.length,
    sendable: sendable.length,
    checked,
    criticals,
    warnings,
  });

  console.log(`Outreach preflight: ${targets.length} target(s), ${sendable.length} sendable, ${criticals.length} blocked, ${warnings.length} warning(s).`);
  for (const c of checked) {
    const tag = c.sendable ? 'OK ' : 'BLOCK';
    console.log(`  [${tag}] ${c.company || c.contact}${c.flags.length ? ` (${c.flags.join(', ')})` : ''}`);
  }
  for (const w of warnings) console.log(`  warn: ${w.file}: ${w.message}`);

  failIfCritical(reportPath, criticals);
})();
