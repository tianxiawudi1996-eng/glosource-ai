import assert from 'node:assert/strict';
import test from 'node:test';
import { founderPersonSchema, founderSameAs, initials, type FounderProfile } from '../app/lib/founder';

const base: FounderProfile = {
  name: 'John Kim',
  jobTitle: 'Founder & operator',
  location: 'Korea · UTC+9',
  photo: null,
  linkedin: null,
  email: 'hello@glosourceai.com',
};

test('initials take first+last, fall back for single names and empty input', () => {
  assert.equal(initials('John Kim'), 'JK');
  assert.equal(initials('  jane  q  doe '), 'JD');
  assert.equal(initials('Madonna'), 'MA');
  assert.equal(initials(''), '?');
});

test('sameAs and founder schema omit LinkedIn until it is confirmed', () => {
  assert.deepEqual(founderSameAs(base), []);
  assert.deepEqual(founderPersonSchema(base), {
    '@type': 'Person',
    name: 'John Kim',
    jobTitle: 'Founder & operator',
  });
});

test('sameAs and founder schema include a confirmed LinkedIn URL', () => {
  const withLinkedIn = { ...base, linkedin: 'https://www.linkedin.com/in/example' };
  assert.deepEqual(founderSameAs(withLinkedIn), ['https://www.linkedin.com/in/example']);
  assert.deepEqual(founderPersonSchema(withLinkedIn).sameAs, ['https://www.linkedin.com/in/example']);
});
