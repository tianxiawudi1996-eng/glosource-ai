import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { freeCountStorageKey } from '../app/components/EnSourcingTool';

test('EN free counter keeps one monthly bucket across day boundaries', () => {
  const marchFirst = freeCountStorageKey(3, new Date('2026-03-01T00:01:00.000Z'));
  const marchLast = freeCountStorageKey(3, new Date('2026-03-31T23:59:00.000Z'));
  const aprilFirst = freeCountStorageKey(3, new Date('2026-04-01T00:01:00.000Z'));

  assert.equal(marchFirst, 'glosource_en_free_count:2026-03:3');
  assert.equal(marchFirst, marchLast);
  assert.notEqual(marchLast, aprilFirst);
});

test('EN assistant contract exposes Korea-only sourcing actions', () => {
  const assistant = readFileSync('app/en/assistant/AssistantExperience.tsx', 'utf8');
  const chatHandler = readFileSync('app/api/chat/handler.ts', 'utf8');

  assert.match(assistant, /countryPreference: 'korea'/);
  assert.match(assistant, /action\.country === 'korea'/);
  assert.match(chatHandler, /enum: \['korea'\]/);
  assert.match(chatHandler, /requestedCountry !== 'korea'/);
  assert.doesNotMatch(chatHandler, /country: a\.country === 'china' \? 'china' : 'korea'/);
});
