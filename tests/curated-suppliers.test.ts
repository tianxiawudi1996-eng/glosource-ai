import assert from 'node:assert/strict';
import test from 'node:test';
import { CURATED } from '../scripts/curated-suppliers';
import cgmp from '../app/data/cgmp-firms.json';

// These rows carry a 'GloSource Verified' badge to buyers, so the bar is evidence, not plausibility.
// Each rule below is a way we could quietly start lying to an indie brand about a factory.

const BIZRNO = /biz reg (\d{3}-\d{2}-\d{5})/;
const CGMP_SET = new Set((cgmp.bizrnos as string[]).map(b => b.replace(/\D/g, '')));

test('every curated supplier cites the MFDS manufacturing licence that backs its badge', () => {
  for (const s of CURATED) {
    const m = BIZRNO.exec(s.notes ?? '');
    assert.ok(m, `${s.nameEn}: no business-registration number in notes — nothing proves this is a licensed factory`);
    assert.match(s.notes ?? '', /MFDS-licensed manufacturer/, `${s.nameEn}: notes must state the registry check`);
  }
});

test('a CGMP claim matches the government CGMP list, by business-registration number', () => {
  for (const s of CURATED) {
    const biz = BIZRNO.exec(s.notes ?? '')![1].replace(/\D/g, '');
    const claimsCgmp = (s.certifications ?? '').includes('CGMP');
    assert.equal(
      claimsCgmp,
      CGMP_SET.has(biz),
      `${s.nameEn}: certifications say CGMP=${claimsCgmp} but the MFDS CGMP list says ${CGMP_SET.has(biz)}`,
    );
  }
});

test('a published MOQ names its source; an unknown MOQ stays null', () => {
  for (const s of CURATED) {
    if (s.moqMin === null || s.moqMin === undefined) {
      assert.match(
        s.notes ?? '',
        /publishes no MOQ|No public MOQ|publishes no MOQ figure|no MOQ figure/i,
        `${s.nameEn}: MOQ is null, so the notes must tell the buyer it is unknown rather than stay silent`,
      );
      continue;
    }
    assert.ok(s.moqMin > 0, `${s.nameEn}: MOQ must be a real quantity`);
    assert.match(
      s.notes ?? '',
      /publicly states|publicly runs|advertises/,
      `${s.nameEn}: an MOQ number must be attributed to the company's own public claim, never to us`,
    );
  }
});

test('trust scores are never invented', () => {
  for (const s of CURATED) {
    assert.equal(s.trustScore, null, `${s.nameEn}: trustScore must stay null until a real audit produces one`);
  }
});

test('the rejected middlemen never reappear as verified suppliers', () => {
  // Each of these outranks real factories for "Korean low-MOQ manufacturer" but is an agency,
  // a brand owner, or has no MFDS manufacturing record at all. Badging one would make GloSource
  // the middleman problem it sells against.
  const REJECTED = ['laonhase', 'factosquare', 'selfcos', 'smallcosmetic', 'oemkorea', 'coskorea', 'crescentseoul', 'mayk-factory', 'sourcing-lab', 'kprivatelabel'];
  for (const s of CURATED) {
    const host = new URL(s.url!).hostname.toLowerCase();
    for (const bad of REJECTED) {
      assert.ok(!host.includes(bad), `${s.nameEn}: ${host} was rejected during curation — it is not a verifiable factory`);
    }
  }
});

test('the low-MOQ tier the ICP needs actually exists in the list', () => {
  // The whole point of the curation: an indie brand must find at least one badged factory that
  // publishes a minimum it can afford. If this fails, the badge is decoration.
  const affordable = CURATED.filter(s => (s.moqMin ?? Infinity) <= 1000);
  assert.ok(affordable.length >= 2, 'a low-MOQ indie brand needs more than one option they can actually order from');
});
