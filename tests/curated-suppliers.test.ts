import assert from 'node:assert/strict';
import test from 'node:test';
import { CURATED, RETIRED } from '../scripts/curated-suppliers';
import cgmp from '../app/data/cgmp-firms.json';

// These rows carry a 'GloSource Verified' badge to buyers, so the bar is evidence, not plausibility.
// Each rule below is a way we could quietly start lying to a buyer about a factory. The registry
// cross-checks themselves live in scripts/verify-curated.ts and run at seed time, which needs a
// database; what is asserted here is everything that can be checked without one.

const BIZRNO = /biz reg (\d{3}-\d{2}-\d{5})/;
const CGMP_SET = new Set((cgmp.bizrnos as string[]).map(b => b.replace(/\D/g, '')));

const BEAUTY = CURATED.filter(s => s.category === 'K-Beauty');
const FOOD = CURATED.filter(s => s.category === 'K-Food');
const FASHION = CURATED.filter(s => s.category === 'K-Fashion');

test('a business number always says where it came from', () => {
  // A number from a government registry outranks one a company published about itself. Storing the
  // number without its provenance would flatten that difference and hide which rows are weaker.
  const seen = new Set<string>();
  for (const s of CURATED) {
    if (!s.bizrno) {
      assert.equal(s.bizrnoSource, undefined, `${s.nameEn}: a source with no number is meaningless`);
      continue;
    }
    assert.match(s.bizrno, /^\d{10}$/, `${s.nameEn}: business numbers are 10 digits, unpunctuated`);
    assert.ok(
      s.bizrnoSource === 'mfds-registry' || s.bizrnoSource === 'company-site',
      `${s.nameEn}: unknown provenance "${s.bizrnoSource}"`,
    );
    assert.ok(!seen.has(s.bizrno), `${s.nameEn}: ${s.bizrno} is already used by another supplier — one of them is wrong`);
    seen.add(s.bizrno);
  }
});

test('every cosmetics row carries the number from the MFDS registry', () => {
  // Cosmetics is the one category where a registry maps company name to number authoritatively,
  // so there is no excuse for a K-Beauty row to be matched by name.
  for (const s of BEAUTY) {
    assert.equal(s.bizrnoSource, 'mfds-registry', `${s.nameEn}: must take its number from the registry, not a website`);
    const inNotes = BIZRNO.exec(s.notes ?? '')![1].replace(/\D/g, '');
    assert.equal(s.bizrno, inNotes, `${s.nameEn}: the stored number and the number shown to the buyer disagree`);
  }
});

test('cosmetics rows cite the MFDS manufacturing licence that backs the badge', () => {
  assert.ok(BEAUTY.length > 0);
  for (const s of BEAUTY) {
    assert.ok(BIZRNO.exec(s.notes ?? ''), `${s.nameEn}: no business-registration number — nothing proves this is a licensed factory`);
    assert.match(s.notes ?? '', /MFDS-licensed manufacturer/, `${s.nameEn}: notes must state the registry check`);
  }
});

test('a CGMP claim matches the government CGMP list, by business-registration number', () => {
  for (const s of BEAUTY) {
    const biz = BIZRNO.exec(s.notes ?? '')![1].replace(/\D/g, '');
    const claims = (s.certifications ?? '').includes('CGMP');
    assert.equal(claims, CGMP_SET.has(biz), `${s.nameEn}: certifications say CGMP=${claims} but the MFDS list says ${CGMP_SET.has(biz)}`);
  }
});

test('food rows claim HACCP and say where the certificate comes from', () => {
  assert.ok(FOOD.length > 0);
  for (const s of FOOD) {
    assert.match(s.certifications ?? '', /HACCP/, `${s.nameEn}: a badged food supplier with no HACCP claim`);
    assert.match(s.notes ?? '', /food-safety registry/, `${s.nameEn}: the HACCP claim must name the registry it was matched against`);
  }
});

test('apparel rows admit that nothing can verify them', () => {
  // Korea publishes no registry of apparel manufacturers. The badge cannot mean here what it means
  // for cosmetics or food, so every fashion row has to say so where the buyer reads it.
  assert.ok(FASHION.length > 0);
  for (const s of FASHION) {
    assert.match(
      s.notes ?? '',
      /no government registry of apparel manufacturers/,
      `${s.nameEn}: must disclose that manufacturer-vs-trader status is unconfirmed`,
    );
    assert.equal(s.certifications, null, `${s.nameEn}: no registry can back a certificate claim for apparel`);
  }
});

test('"NTS-verified" is never listed as a certification', () => {
  // It only means the business registration is active — sitting next to HACCP and CGMP it reads as
  // a quality certificate, which is how the first autonomous seed dressed up a nothing-check.
  for (const s of CURATED) {
    assert.doesNotMatch(s.certifications ?? '', /NTS/i, `${s.nameEn}: NTS status is not a certification`);
  }
});

test('a published MOQ names its source; an unknown MOQ stays null', () => {
  for (const s of CURATED) {
    if (s.moqMin === null || s.moqMin === undefined) {
      assert.match(
        s.notes ?? '',
        /publishes no MOQ|No public MOQ|no MOQ figure|No published MOQ/i,
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
  // The first autonomous seed scored every supplier 78 / 82 / 88 — a formula over which certificates
  // it found, presented to buyers as if someone had audited the factory.
  for (const s of CURATED) {
    assert.equal(s.trustScore, null, `${s.nameEn}: trustScore must stay null until a real audit produces one`);
  }
});

test('the rejected middlemen never reappear as verified suppliers', () => {
  const REJECTED = ['laonhase', 'factosquare', 'selfcos', 'smallcosmetic', 'oemkorea', 'coskorea', 'crescentseoul', 'mayk-factory', 'sourcing-lab', 'kprivatelabel'];
  for (const s of CURATED) {
    const host = new URL(s.url!).hostname.toLowerCase();
    for (const bad of REJECTED) {
      assert.ok(!host.includes(bad), `${s.nameEn}: ${host} was rejected during curation — it is not a verifiable factory`);
    }
  }
});

test('a retired supplier cannot be curated again', () => {
  // OSOI is a bag-and-shoe brand — a factory's customer, not a supplier. It was badged once.
  assert.ok(RETIRED.length > 0);
  const retired = new Set(RETIRED.map(r => r.name));
  for (const s of CURATED) {
    assert.ok(!retired.has(s.name), `${s.nameEn} was retired from the badge and must not come back`);
  }
});

test('the low-MOQ tier the ICP needs actually exists in the list', () => {
  const affordable = CURATED.filter(s => (s.moqMin ?? Infinity) <= 1000);
  assert.ok(affordable.length >= 2, 'a low-MOQ indie brand needs more than one option they can actually order from');
});
