import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const launchers = [
  'scripts/growth/reddit-launch.js',
  'scripts/growth/instagram-launch.js',
  'scripts/growth/linkedin-launch-handler.js',
  'scripts/growth/discord-launch.js',
  'scripts/growth/twitter-launch.js',
  'scripts/growth/threads-launch-handler.js',
];

const copyByFile = new Map(
  launchers.map((file) => [file, readFileSync(file, 'utf8')]),
);

test('active EN launchers use the current account-based free contract', () => {
  for (const [file, copy] of copyByFile) {
    assert.match(copy, /3 free searches/i, `${file} must state the current free allowance`);
    assert.match(copy, /account|sign(?:up| in)/i, `${file} must state that free access is account-based`);
  }
});

test('retired EN quota and price claims cannot return to active launchers', () => {
  const activeCopy = [...copyByFile.values()].join('\n');
  assert.doesNotMatch(activeCopy, /5 free(?: anonymous)? searches/i);
  assert.doesNotMatch(activeCopy, /10 searches\/month/i);
  assert.doesNotMatch(activeCopy, /from \$19|\$19\/mo/i);
});

test('paid copy uses the current entry plan and launchers avoid guarantees', () => {
  assert.match(copyByFile.get('scripts/growth/discord-launch.js') ?? '', /\$39\/mo[^\n]*40 searches/i);
  const activeCopy = [...copyByFile.values()].join('\n');
  assert.doesNotMatch(
    activeCopy,
    /100% verified suppliers|guaranteed (?:supplier|quality|savings)|ready-to-send|AI-ranked with trust scores|finds? Korean suppliers[^\n]*in \d+ seconds/i,
  );
});
